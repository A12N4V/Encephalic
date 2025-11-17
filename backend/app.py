import matplotlib
matplotlib.use('Agg')

from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import mne
import io
import numpy as np
import matplotlib.pyplot as plt
import os
from functools import lru_cache

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Load MNE sample dataset
data_path = mne.datasets.sample.data_path()
subjects_dir = os.path.join(data_path, "subjects")

@lru_cache(maxsize=1)
def get_raw_data():
    """Cache raw data loading for better performance"""
    raw = mne.io.read_raw_fif(
        os.path.join(data_path, 'MEG', 'sample', 'sample_audvis_raw.fif'),
        preload=True
    )
    raw.pick_types(eeg=True)
    return raw

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Encephalic Backend"}), 200

@app.route('/api/eeg-data', methods=['GET'])
def get_eeg_data():
    """Get EEG signal data"""
    try:
        # Get query parameters for time range
        tmin = float(request.args.get('tmin', 0))
        tmax = float(request.args.get('tmax', 10))

        raw = get_raw_data()

        if not raw.ch_names:
            return jsonify({"error": "No EEG channels found"}), 400

        # Crop data to requested time range
        raw_cropped = raw.copy().crop(tmin=tmin, tmax=tmax)
        data = raw_cropped.get_data()
        signal_labels = raw_cropped.ch_names
        times = raw_cropped.times.tolist()

        return jsonify({
            "labels": signal_labels,
            "data": data.tolist(),
            "times": times,
            "sfreq": raw.info['sfreq']
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/eeg-info', methods=['GET'])
def get_eeg_info():
    """Get EEG metadata"""
    try:
        raw = get_raw_data()

        return jsonify({
            "n_channels": len(raw.ch_names),
            "channel_names": raw.ch_names,
            "sampling_freq": raw.info['sfreq'],
            "duration": raw.times[-1],
            "n_samples": len(raw.times)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/eeg-topomap/<float:time_point>', methods=['GET'])
def generate_topomap(time_point):
    """Generate topographic map at specific time point"""
    try:
        raw = get_raw_data()
        times = raw.times

        # Find closest time index
        closest_time_index = (np.abs(times - time_point)).argmin()

        # Average over a small window (±0.5 seconds)
        window_samples = int(0.5 * raw.info['sfreq'])
        start_index = max(0, closest_time_index - window_samples)
        stop_index = min(len(times), closest_time_index + window_samples)

        data_at_time = raw.get_data(start=start_index, stop=stop_index).mean(axis=1)

        # Create topographic plot
        fig, ax = plt.subplots(figsize=(8, 6), facecolor='#0a0a0a')
        ax.set_facecolor('#0a0a0a')

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
        plt.savefig(img, format='png', facecolor='#0a0a0a', bbox_inches='tight', dpi=150)
        img.seek(0)
        plt.close(fig)

        return send_file(img, mimetype='image/png')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/eeg-psd', methods=['GET'])
def get_power_spectral_density():
    """Get power spectral density data"""
    try:
        raw = get_raw_data()

        # Compute PSD
        spectrum = raw.compute_psd(fmax=50)
        psds, freqs = spectrum.get_data(return_freqs=True)

        # Average across channels
        psd_mean = psds.mean(axis=0)

        return jsonify({
            "frequencies": freqs.tolist(),
            "psd": psd_mean.tolist(),
            "channel_psds": psds.tolist(),
            "channel_names": raw.ch_names
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/eeg-bands', methods=['GET'])
def get_frequency_bands():
    """Get power in different frequency bands"""
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

        spectrum = raw.compute_psd(fmax=50)
        psds, freqs = spectrum.get_data(return_freqs=True)

        band_powers = {}
        for band_name, (fmin, fmax) in bands.items():
            freq_mask = (freqs >= fmin) & (freqs < fmax)
            band_power = psds[:, freq_mask].mean(axis=1)
            band_powers[band_name] = band_power.tolist()

        return jsonify({
            "bands": band_powers,
            "channel_names": raw.ch_names
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
