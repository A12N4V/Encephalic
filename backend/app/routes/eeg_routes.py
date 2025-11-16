from flask import Blueprint, jsonify, send_file
from app.services.eeg_service import EEGService

bp = Blueprint('eeg', __name__, url_prefix='/api')

# Initialize EEG service
eeg_service = EEGService()

@bp.route('/eeg-data', methods=['GET'])
def get_eeg_data():
    """
    Get EEG signal data for plotting
    Returns: JSON with labels and data arrays
    """
    try:
        result = eeg_service.get_eeg_data()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@bp.route('/eeg-heatmap/<float:time_point>', methods=['GET'])
def generate_heatmap(time_point):
    """
    Generate topographic heatmap at specific time point
    Args:
        time_point: Time in seconds
    Returns: PNG image
    """
    try:
        img = eeg_service.generate_heatmap(time_point)
        return send_file(img, mimetype='image/png')
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@bp.route('/eeg-3d/<float:time>', methods=['GET'])
def generate_3d(time):
    """
    Generate 3D brain visualization
    Args:
        time: Time in seconds
    Returns: PNG image
    """
    try:
        img = eeg_service.generate_3d_map(time)
        return send_file(img, mimetype='image/png')
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "EEG Backend API"}), 200
