import matplotlib
matplotlib.use('Agg')

from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import mne
import io
import numpy as np
import matplotlib.pyplot as plt
import os
import logging
import threading
from functools import lru_cache
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize app
logger.info("Initializing Encephalic Backend")

# Global variable to track initialization status
_initialization_complete = False
_initialization_error = None

def initialize_data():
    """Initialize MNE data during startup to prevent timeout issues"""
    global _initialization_complete, _initialization_error
    try:
        logger.info("Starting data initialization...")
        # Trigger lazy-loaded functions to cache data
        get_data_path()
        get_raw_data()
        _initialization_complete = True
        logger.info("Data initialization completed successfully")
    except Exception as e:
        _initialization_error = str(e)
        logger.error(f"Failed to initialize data: {e}", exc_info=True)

@lru_cache(maxsize=1)
def get_data_path():
    """Lazy-load the MNE sample dataset path"""
    logger.info("Loading MNE sample dataset path")
    data_path = mne.datasets.sample.data_path()
    subjects_dir = os.path.join(data_path, "subjects")
    logger.info(f"Data path: {data_path}")
    logger.info(f"Subjects directory: {subjects_dir}")
    return data_path, subjects_dir

@lru_cache(maxsize=1)
def get_raw_data():
    """Cache raw data loading for better performance"""
    logger.info("Loading raw EEG data from cache or disk")
    data_path, _ = get_data_path()
    raw = mne.io.read_raw_fif(
        os.path.join(data_path, 'MEG', 'sample', 'sample_audvis_raw.fif'),
        preload=True
    )
    raw.pick_types(eeg=True)
    logger.info(f"Raw data loaded: {len(raw.ch_names)} channels, {raw.times[-1]:.2f}s duration")
    return raw

@app.before_request
def check_initialization():
    """Check if data is initialized before processing requests"""
    # Skip check for health endpoint
    if request.path == '/api/health':
        return None

    if _initialization_error:
        return jsonify({"error": "Backend initialization failed", "details": _initialization_error}), 503

    if not _initialization_complete:
        return jsonify({"error": "Backend is still initializing, please wait"}), 503

    return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    status = {
        "status": "healthy" if _initialization_complete else "initializing",
        "service": "Encephalic Backend",
        "data_loaded": _initialization_complete
    }
    if _initialization_error:
        status["status"] = "unhealthy"
        status["error"] = _initialization_error
        return jsonify(status), 503
    return jsonify(status), 200

@app.route('/api/eeg-data', methods=['GET'])
def get_eeg_data():
    """Get EEG signal data"""
    logger.info("EEG data requested")
    try:
        # Get query parameters for time range
        tmin = float(request.args.get('tmin', 0))
        tmax = float(request.args.get('tmax', 10))
        logger.debug(f"Time range: {tmin}s to {tmax}s")

        raw = get_raw_data()

        if not raw.ch_names:
            logger.error("No EEG channels found in raw data")
            return jsonify({"error": "No EEG channels found"}), 400

        # Crop data to requested time range
        raw_cropped = raw.copy().crop(tmin=tmin, tmax=tmax)
        data = raw_cropped.get_data()
        signal_labels = raw_cropped.ch_names
        times = raw_cropped.times.tolist()

        logger.info(f"Returning EEG data: {len(signal_labels)} channels, {len(times)} time points")

        return jsonify({
            "labels": signal_labels,
            "data": data.tolist(),
            "times": times,
            "sfreq": raw.info['sfreq']
        })

    except Exception as e:
        logger.error(f"Error in get_eeg_data: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/eeg-info', methods=['GET'])
def get_eeg_info():
    """Get EEG metadata"""
    logger.info("EEG info requested")
    try:
        raw = get_raw_data()

        info_data = {
            "n_channels": len(raw.ch_names),
            "channel_names": raw.ch_names,
            "sampling_freq": raw.info['sfreq'],
            "duration": raw.times[-1],
            "n_samples": len(raw.times)
        }

        logger.debug(f"EEG info: {info_data['n_channels']} channels, {info_data['sampling_freq']} Hz")

        return jsonify(info_data)

    except Exception as e:
        logger.error(f"Error in get_eeg_info: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/eeg-topomap/<time_point>', methods=['GET'])
def generate_topomap(time_point):
    """Generate topographic map at specific time point"""
    try:
        time_point = float(time_point)
        logger.info(f"Topomap requested for time point: {time_point}s")
        raw = get_raw_data()
        times = raw.times

        # Find closest time index
        closest_time_index = (np.abs(times - time_point)).argmin()
        logger.debug(f"Closest time index: {closest_time_index}, actual time: {times[closest_time_index]:.3f}s")

        # Average over a small window (±0.5 seconds)
        window_samples = int(0.5 * raw.info['sfreq'])
        start_index = max(0, closest_time_index - window_samples)
        stop_index = min(len(times), closest_time_index + window_samples)

        logger.debug(f"Window: {start_index} to {stop_index} ({stop_index - start_index} samples)")

        data_at_time = raw.get_data(start=start_index, stop=stop_index).mean(axis=1)

        # Create topographic plot
        fig, ax = plt.subplots(figsize=(8, 6), facecolor='#000000')
        ax.set_facecolor('#000000')

        im, _ = mne.viz.plot_topomap(
            data_at_time,
            raw.info,
            axes=ax,
            show=False,
            cmap='RdBu_r',
            contours=6
        )

        ax.set_title(
            f'Topographic Map at {time_point:.2f}s',
            color='white',
            fontsize=14,
            pad=20
        )

        # Customize colorbar
        cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
        cbar.ax.yaxis.set_tick_params(color='white')
        cbar.ax.tick_params(labelcolor='white')
        cbar.set_label('Amplitude (µV)', color='white', fontsize=12)
        cbar.outline.set_edgecolor('white')

        # Save to bytes
        img = io.BytesIO()
        plt.savefig(img, format='png', facecolor='#000000', bbox_inches='tight', dpi=150)
        img.seek(0)
        plt.close(fig)

        logger.info(f"Topomap generated successfully for {time_point:.2f}s")
        return send_file(img, mimetype='image/png')

    except Exception as e:
        logger.error(f"Error in generate_topomap: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/eeg-psd', methods=['GET'])
def get_power_spectral_density():
    """Get power spectral density data"""
    logger.info("PSD data requested")
    try:
        raw = get_raw_data()

        # Compute PSD
        logger.debug("Computing power spectral density...")
        spectrum = raw.compute_psd(fmax=50)
        psds, freqs = spectrum.get_data(return_freqs=True)

        # Average across channels
        psd_mean = psds.mean(axis=0)

        logger.info(f"PSD computed: {len(freqs)} frequency bins, {psds.shape[0]} channels")

        return jsonify({
            "frequencies": freqs.tolist(),
            "psd": psd_mean.tolist(),
            "channel_psds": psds.tolist(),
            "channel_names": raw.ch_names
        })

    except Exception as e:
        logger.error(f"Error in get_power_spectral_density: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/eeg-bands', methods=['GET'])
def get_frequency_bands():
    """Get power in different frequency bands"""
    logger.info("Frequency band data requested")
    try:
        raw = get_raw_data()

        # Define frequency bands
        bands = {
            'delta': (0.5, 4),
            'theta': (4, 8),
            'alpha': (8, 13),
            'beta': (13, 30),
            'gamma': (30, 50)
        }

        logger.debug("Computing PSD for frequency bands...")
        spectrum = raw.compute_psd(fmax=50)
        psds, freqs = spectrum.get_data(return_freqs=True)

        band_powers = {}
        for band_name, (fmin, fmax) in bands.items():
            freq_mask = (freqs >= fmin) & (freqs < fmax)
            # Average across both channels and frequencies
            band_power = psds[:, freq_mask].mean()
            band_powers[band_name] = float(band_power)
            logger.debug(f"{band_name} ({fmin}-{fmax} Hz): {band_power:.4f} µV²/Hz")

        logger.info(f"Frequency bands computed: {list(band_powers.keys())}")

        return jsonify(band_powers)

    except Exception as e:
        logger.error(f"Error in get_frequency_bands: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Initialize data when module is loaded (for gunicorn with --preload)
# This runs once in the master process before forking workers
_init_lock = threading.Lock()

def ensure_initialized():
    """Ensure data is initialized exactly once"""
    global _initialization_complete
    if not _initialization_complete:
        with _init_lock:
            if not _initialization_complete:
                initialize_data()

# Initialize immediately when module loads (for production with gunicorn --preload)
if os.environ.get('GUNICORN_CMD_ARGS') or 'gunicorn' in os.environ.get('SERVER_SOFTWARE', ''):
    logger.info("Detected gunicorn environment - initializing data at module load")
    initialize_data()

if __name__ == '__main__':
    # Initialize data before starting the server (for development)
    ensure_initialized()
    app.run(host='0.0.0.0', port=8000, debug=True)
