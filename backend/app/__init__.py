from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)

    # Enable CORS for all routes
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://frontend:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type"]
        }
    })

    # Register blueprints
    from app.routes import eeg_routes
    app.register_blueprint(eeg_routes.bp)

    return app
