import mne
import os

def load_sample_data():
    """
    Load MNE sample dataset

    Returns:
        Tuple of (data_path, subjects_dir, raw_file)
    """
    data_path = mne.datasets.sample.data_path()
    subjects_dir = os.path.join(data_path, "subjects")
    raw_file = os.path.join(data_path, 'MEG', 'sample', 'sample_audvis_raw.fif')

    return data_path, subjects_dir, raw_file

def load_evoked_data():
    """
    Load evoked response data from sample dataset

    Returns:
        Evoked object for 'Right Auditory' condition
    """
    data_path = mne.datasets.sample.data_path()
    evoked_files = mne.read_evokeds(
        os.path.join(data_path, 'MEG', 'sample', 'sample_audvis-ave.fif'),
        verbose=False
    )

    for e in evoked_files:
        if e.comment == "Right Auditory":
            return e

    raise ValueError("No evoked response found for 'Right Auditory'")
