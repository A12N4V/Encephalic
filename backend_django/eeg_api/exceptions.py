"""Custom exception handlers for EEG API"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that logs errors and returns structured responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Log the error
        logger.error(
            f"API Error: {exc.__class__.__name__}: {str(exc)}",
            exc_info=True,
            extra={'context': context}
        )
        return response

    # Handle unexpected errors
    logger.error(
        f"Unhandled API Error: {exc.__class__.__name__}: {str(exc)}",
        exc_info=True,
        extra={'context': context}
    )

    return Response(
        {
            'error': str(exc),
            'type': exc.__class__.__name__
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
