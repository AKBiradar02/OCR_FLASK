import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from flask_migrate import Migrate
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()
login.login_view = 'auth.login'
login.login_message = 'Please log in to access this page.'
login.login_message_category = 'info'


def create_app(config_class=Config):
    app = Flask(
        __name__,
        static_folder=None,   # Disable default static folder
        template_folder=None  # Disable default template folder
    )

    # Load config
    app.config.from_object(config_class)

    # CORS setup
    app.config['CORS_ORIGINS'] = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000").split(",")
    app.config['CORS_SUPPORTS_CREDENTIALS'] = True
    app.config['CORS_ALLOW_HEADERS'] = ['Content-Type', 'Authorization']
    app.config['CORS_METHODS'] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    from app.controllers.main import main_bp
    from app.controllers.auth import auth_bp
    from app.controllers.api import api_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    # Import models so Alembic knows them
    from app.models import user

    # Healthcheck / test API
    @app.route('/api/test', methods=['GET'])
    def test_api():
        return jsonify({'message': 'API is working!'}), 200

    # Root API entrypoint
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Flask API server is running!',
            'status': 'ok',
            'ui_url': os.getenv("FRONTEND_URL", "http://localhost:3000")
        })

    # Unauthorized handler (returns JSON instead of HTML)
    @login.unauthorized_handler
    def unauthorized():
        return jsonify({'error': 'Unauthorized access, please login'}), 401

    return app
