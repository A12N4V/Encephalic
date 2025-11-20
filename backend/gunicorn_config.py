"""Gunicorn configuration file"""

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Server hooks
def on_starting(server):
    """Called just before the master process is initialized."""
    import logging
    import os
    logger = logging.getLogger(__name__)
    logger.info("Gunicorn server starting...")
    # Set environment variable to trigger initialization
    os.environ['GUNICORN_CMD_ARGS'] = 'true'

def post_fork(server, worker):
    """Called just after a worker has been forked."""
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Worker spawned (pid: {worker.pid})")

def when_ready(server):
    """Called just after the server is started."""
    import logging
    logger = logging.getLogger(__name__)
    logger.info("Server is ready to handle requests")
