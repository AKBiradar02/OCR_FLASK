import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
login = LoginManager()
login.login_view = 'auth.login'
login.login_message = 'Please log in to access this page.'
login.login_message_category = 'info'

def create_app(config_class=Config):
    app = Flask(__name__, 
               static_folder=None,   # Disable static folder
               template_folder=None) # Disable template folder
    
    app.config.from_object(config_class)
    
    # Set CORS options directly in the config
    app.config['CORS_ORIGINS'] = ['http://localhost:3000', 'http://localhost:3001']
    app.config['CORS_SUPPORTS_CREDENTIALS'] = True
    app.config['CORS_ALLOW_HEADERS'] = ['Content-Type', 'Authorization']
    app.config['CORS_METHODS'] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    
    # Initialize extensions
    db.init_app(app)
    login.init_app(app)
    
    # Configure CORS for all routes with the updated config - don't add headers manually
    CORS(app)
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.controllers.main import main_bp
    from app.controllers.auth import auth_bp
    from app.controllers.api import api_bp
    
    # Register blueprints with proper prefixes
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Import models to ensure they are registered with SQLAlchemy
    from app.models import user
    
    # Add a test route to check if the API is working
    @app.route('/api/test', methods=['GET'])
    def test_api():
        return jsonify({'message': 'API is working!'}), 200
    
    # Add a root route redirector to React frontend for browser access
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Flask API server is running!',
            'status': 'ok',
            'ui_url': 'http://localhost:3000'
        })
    
    # Update the login_manager to use JSON responses for unauthorized access
    @login.unauthorized_handler
    def unauthorized():
        return jsonify({'error': 'Unauthorized access, please login'}), 401
    
    return app 