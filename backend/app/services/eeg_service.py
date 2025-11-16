import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend

import mne
import numpy as np
import matplotlib.pyplot as plt
import io
import os
from app.utils.mne_helper import load_sample_data

class EEGService:
    """Service for EEG data processing and visualization using MNE-Python"""

    def __init__(self):
        """Initialize the EEG service with sample data"""
        self.data_path = mne.datasets.sample.data_path()
        self.subjects_dir = os.path.join(self.data_path, "subjects")
        self.raw_file = os.path.join(self.data_path, 'MEG', 'sample', 'sample_audvis_raw.fif')

    def get_eeg_data(self, duration=10):
        """
        Load and return EEG data for plotting

        Args:
            duration: Duration in seconds to extract

        Returns:
            Dictionary with labels and data arrays
        """
        raw = mne.io.read_raw_fif(self.raw_file, preload=True, verbose=False)
        raw.pick_types(eeg=True)

        if not raw.ch_names:
            raise ValueError("No EEG channels found in the dataset")

        # Crop data to specified duration
        raw.crop(tmin=0, tmax=duration)
        data = raw.get_data()
        signal_labels = raw.ch_names

        return {
            "labels": signal_labels,
            "data": data.tolist(),
            "sampling_rate": raw.info['sfreq'],
            "duration": duration
        }

    def generate_heatmap(self, time_point):
        """
        Generate topographic heatmap at specific time point

        Args:
            time_point: Time in seconds

        Returns:
            BytesIO object containing PNG image
        """
        raw = mne.io.read_raw_fif(self.raw_file, preload=True, verbose=False)
        raw.pick_types(eeg=True)

        times = raw.times
        closest_time_index = (np.abs(times - time_point)).argmin()

        # Average over 1 second window
        start_index = max(0, closest_time_index - int(1 * raw.info['sfreq']))
        stop_index = min(len(times), closest_time_index + int(1 * raw.info['sfreq']))
        data_at_time = raw.get_data(start=start_index, stop=stop_index).mean(axis=1)

        # Create topographic plot with dark theme
        fig, ax = plt.subplots(figsize=(8, 8))
        ax.set_facecolor('#0f172a')
        fig.patch.set_facecolor('#0f172a')

        im, _ = mne.viz.plot_topomap(
            data_at_time,
            raw.info,
            axes=ax,
            show=False,
            cmap='RdBu_r',
            contours=6,
            sensors=True,
            names=raw.ch_names
        )

        ax.set_title(
            f'EEG Topography at {time_point:.2f}s',
            color='white',
            fontsize=14,
            pad=20
        )

        # Customize colorbar
        cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
        cbar.ax.yaxis.set_tick_params(color='white', labelcolor='white')
        cbar.ax.set_ylabel('Amplitude (µV)', color='white', fontsize=10)
        cbar.outline.set_edgecolor('#475569')

        # Save to BytesIO
        img = io.BytesIO()
        plt.savefig(img, format='png', facecolor='#0f172a', edgecolor='none', bbox_inches='tight', dpi=100)
        img.seek(0)
        plt.close(fig)

        return img

    def generate_3d_map(self, time):
        """
        Generate 3D brain visualization

        Args:
            time: Time in seconds

        Returns:
            BytesIO object containing PNG image
        """
        # For now, return a placeholder. In production, this could generate
        # actual 3D brain maps using MNE's 3D visualization capabilities
        try:
            # Try to return the sample image from the project
            sample_image_path = '/home/user/EEGVis/s1.png'
            if os.path.exists(sample_image_path):
                return sample_image_path
            else:
                # Create a placeholder image
                return self._create_placeholder_3d()
        except Exception:
            return self._create_placeholder_3d()

    def _create_placeholder_3d(self):
        """Create a placeholder 3D visualization"""
        fig = plt.figure(figsize=(8, 8))
        ax = fig.add_subplot(111, projection='3d')

        # Create a simple 3D brain-like shape
        u = np.linspace(0, 2 * np.pi, 100)
        v = np.linspace(0, np.pi, 100)
        x = 10 * np.outer(np.cos(u), np.sin(v))
        y = 10 * np.outer(np.sin(u), np.sin(v))
        z = 10 * np.outer(np.ones(np.size(u)), np.cos(v))

        ax.plot_surface(x, y, z, color='#3b82f6', alpha=0.7)
        ax.set_facecolor('#0f172a')
        fig.patch.set_facecolor('#0f172a')

        ax.set_title('3D Brain Model', color='white', fontsize=14)
        ax.grid(False)
        ax.set_xticks([])
        ax.set_yticks([])
        ax.set_zticks([])

        img = io.BytesIO()
        plt.savefig(img, format='png', facecolor='#0f172a', bbox_inches='tight', dpi=100)
        img.seek(0)
        plt.close(fig)

        return img
