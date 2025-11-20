"""
EEG Processing Service Layer
Handles all MNE-Python operations with caching and optimization
"""
import matplotlib
matplotlib.use('Agg')

import mne
import numpy as np
import matplotlib.pyplot as plt
import io
import os
import logging
from functools import lru_cache
from django.core.cache import cache
from django.conf import settings
import hashlib

logger = logging.getLogger(__name__)


class EEGService:
    """Service class for EEG data processing using MNE-Python"""

    def __init__(self):
        self.data_path = mne.datasets.sample.data_path()
        self.subjects_dir = os.path.join(self.data_path, "subjects")
        logger.info(f"EEG Service initialized with data path: {self.data_path}")

    @lru_cache(maxsize=1)
    def get_raw_data(self):
        """
        Load and cache raw EEG data
        Uses LRU cache for in-memory caching
        """
        logger.info("Loading raw EEG data")
        raw = mne.io.read_raw_fif(
            os.path.join(self.data_path, 'MEG', 'sample', 'sample_audvis_raw.fif'),
            preload=True,
            verbose=False
        )
        raw.pick_types(eeg=True)
        logger.info(f"Raw data loaded: {len(raw.ch_names)} channels, {raw.times[-1]:.2f}s duration")
        return raw

    def get_info(self):
        """Get EEG metadata"""
        cache_key = 'eeg_info'
        cached_info = cache.get(cache_key)

        if cached_info:
            logger.debug("Returning cached EEG info")
            return cached_info

        raw = self.get_raw_data()
        info = {
            "n_channels": len(raw.ch_names),
            "channel_names": raw.ch_names,
            "sampling_freq": raw.info['sfreq'],
            "duration": float(raw.times[-1]),
            "n_samples": len(raw.times)
        }

        cache.set(cache_key, info, timeout=getattr(settings, 'EEG_CACHE_TIMEOUT', 3600))
        logger.info(f"EEG info cached: {info['n_channels']} channels")
        return info

    def get_data(self, tmin=0, tmax=10):
        """
        Get EEG signal data for a specific time window
        Implements time-window fetching to reduce payload size
        """
        cache_key = f'eeg_data_tmin_{tmin}_tmax_{tmax}'
        cached_data = cache.get(cache_key)

        if cached_data:
            logger.debug(f"Returning cached EEG data for window {tmin}-{tmax}s")
            return cached_data

        raw = self.get_raw_data()

        # Validate time range
        tmin = max(0, float(tmin))
        tmax = min(raw.times[-1], float(tmax))

        # Crop to requested window
        raw_cropped = raw.copy().crop(tmin=tmin, tmax=tmax)
        data = raw_cropped.get_data()

        result = {
            "labels": raw_cropped.ch_names,
            "data": data.tolist(),
            "times": raw_cropped.times.tolist(),
            "sfreq": float(raw.info['sfreq'])
        }

        # Cache for 5 minutes (data windows change frequently)
        cache.set(cache_key, result, timeout=300)
        logger.info(f"EEG data cached: {len(result['labels'])} channels, {len(result['times'])} points")
        return result

    def generate_topomap(self, time_point):
        """
        Generate topographic brain map at specific time point
        Implements aggressive caching since topomaps are expensive to generate
        """
        # Round to 2 decimal places for cache key
        time_rounded = round(float(time_point), 2)
        cache_key = f'topomap_{time_rounded}'

        cached_image = cache.get(cache_key)
        if cached_image:
            logger.debug(f"Returning cached topomap for t={time_rounded}s")
            return cached_image

        raw = self.get_raw_data()
        times = raw.times

        # Find closest time index
        closest_time_index = (np.abs(times - time_point)).argmin()
        actual_time = times[closest_time_index]

        # Average over a small window (±0.5 seconds)
        window_samples = int(0.5 * raw.info['sfreq'])
        start_index = max(0, closest_time_index - window_samples)
        stop_index = min(len(times), closest_time_index + window_samples)

        data_at_time = raw.get_data(start=start_index, stop=stop_index).mean(axis=1)

        # Create topographic plot with optimized settings
        fig, ax = plt.subplots(figsize=(6, 5), facecolor='#000000', dpi=100)
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
            f'Topographic Map at {actual_time:.2f}s',
            color='white',
            fontsize=12,
            pad=15
        )

        # Customize colorbar
        cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
        cbar.ax.yaxis.set_tick_params(color='white')
        cbar.ax.tick_params(labelcolor='white')
        cbar.set_label('Amplitude (µV)', color='white', fontsize=10)
        cbar.outline.set_edgecolor('white')

        # Save to bytes buffer
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', facecolor='#000000', bbox_inches='tight', dpi=100)
        img_buffer.seek(0)
        image_data = img_buffer.read()
        plt.close(fig)

        # Cache for 5 minutes
        timeout = getattr(settings, 'TOPOMAP_CACHE_TIMEOUT', 300)
        cache.set(cache_key, image_data, timeout=timeout)

        logger.info(f"Topomap generated and cached for t={actual_time:.2f}s")
        return image_data

    def get_psd(self):
        """
        Compute Power Spectral Density
        Cached to avoid redundant computations
        """
        cache_key = 'eeg_psd'
        cached_psd = cache.get(cache_key)

        if cached_psd:
            logger.debug("Returning cached PSD data")
            return cached_psd

        raw = self.get_raw_data()

        # Compute PSD
        logger.debug("Computing power spectral density...")
        spectrum = raw.compute_psd(fmax=50, verbose=False)
        psds, freqs = spectrum.get_data(return_freqs=True)

        # Average across channels
        psd_mean = psds.mean(axis=0)

        result = {
            "frequencies": freqs.tolist(),
            "psd": psd_mean.tolist(),
            "channel_psds": psds.tolist(),
            "channel_names": raw.ch_names
        }

        # Cache for 10 minutes
        timeout = getattr(settings, 'PSD_CACHE_TIMEOUT', 600)
        cache.set(cache_key, result, timeout=timeout)

        logger.info(f"PSD computed and cached: {len(freqs)} frequency bins")
        return result

    def get_frequency_bands(self):
        """
        Get power in different frequency bands
        Reuses cached PSD computation
        """
        cache_key = 'eeg_frequency_bands'
        cached_bands = cache.get(cache_key)

        if cached_bands:
            logger.debug("Returning cached frequency bands")
            return cached_bands

        # Reuse PSD computation
        psd_data = self.get_psd()
        freqs = np.array(psd_data['frequencies'])
        psds = np.array(psd_data['channel_psds'])

        # Define frequency bands
        bands = {
            'delta': (0.5, 4),
            'theta': (4, 8),
            'alpha': (8, 13),
            'beta': (13, 30),
            'gamma': (30, 50)
        }

        band_powers = {}
        for band_name, (fmin, fmax) in bands.items():
            freq_mask = (freqs >= fmin) & (freqs < fmax)
            # Average across both channels and frequencies
            band_power = psds[:, freq_mask].mean()
            band_powers[band_name] = float(band_power)

        # Cache for 10 minutes
        timeout = getattr(settings, 'PSD_CACHE_TIMEOUT', 600)
        cache.set(cache_key, band_powers, timeout=timeout)

        logger.info(f"Frequency bands computed and cached: {list(band_powers.keys())}")
        return band_powers


# Singleton instance
eeg_service = EEGService()
