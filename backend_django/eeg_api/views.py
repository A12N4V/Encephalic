"""
EEG API Views
RESTful endpoints for EEG data access
"""
import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from .services import eeg_service

logger = logging.getLogger(__name__)


@api_view(['GET'])
def health_check(request):
    """Health check endpoint"""
    logger.info("Health check requested")
    return Response({
        "status": "healthy",
        "service": "Encephalic Django Backend",
        "version": "2.0"
    })


@api_view(['GET'])
def get_eeg_info(request):
    """
    Get EEG metadata

    Response:
    {
        "n_channels": int,
        "channel_names": list[str],
        "sampling_freq": float,
        "duration": float,
        "n_samples": int
    }
    """
    try:
        logger.info("EEG info requested")
        info = eeg_service.get_info()
        return Response(info)
    except Exception as e:
        logger.error(f"Error in get_eeg_info: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_eeg_data(request):
    """
    Get EEG signal data for a time window

    Query Parameters:
    - tmin: float (default: 0) - Start time in seconds
    - tmax: float (default: 10) - End time in seconds

    Response:
    {
        "labels": list[str],
        "data": list[list[float]],
        "times": list[float],
        "sfreq": float
    }
    """
    try:
        tmin = float(request.GET.get('tmin', 0))
        tmax = float(request.GET.get('tmax', 10))
        logger.info(f"EEG data requested for window {tmin}-{tmax}s")

        data = eeg_service.get_data(tmin=tmin, tmax=tmax)
        return Response(data)
    except ValueError as e:
        logger.error(f"Invalid parameters: {str(e)}")
        return Response(
            {"error": f"Invalid parameters: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error in get_eeg_data: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def generate_topomap(request, time_point):
    """
    Generate topographic brain map at specific time point

    Path Parameter:
    - time_point: float - Time in seconds

    Returns: PNG image
    """
    try:
        logger.info(f"Topomap requested for time {time_point}s")
        image_data = eeg_service.generate_topomap(time_point)

        return HttpResponse(
            image_data,
            content_type='image/png',
            headers={
                'Cache-Control': 'public, max-age=300',  # Cache for 5 minutes
            }
        )
    except ValueError as e:
        logger.error(f"Invalid time point: {str(e)}")
        return Response(
            {"error": f"Invalid time point: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error in generate_topomap: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_psd(request):
    """
    Get Power Spectral Density

    Response:
    {
        "frequencies": list[float],
        "psd": list[float],
        "channel_psds": list[list[float]],
        "channel_names": list[str]
    }
    """
    try:
        logger.info("PSD data requested")
        psd_data = eeg_service.get_psd()
        return Response(psd_data)
    except Exception as e:
        logger.error(f"Error in get_psd: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_frequency_bands(request):
    """
    Get power in different frequency bands

    Response:
    {
        "delta": float,
        "theta": float,
        "alpha": float,
        "beta": float,
        "gamma": float
    }
    """
    try:
        logger.info("Frequency bands requested")
        bands = eeg_service.get_frequency_bands()
        return Response(bands)
    except Exception as e:
        logger.error(f"Error in get_frequency_bands: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
