# app/__init__.py
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
        static_folder=None,    # no built-in static serving
        template_folder=None   # API-only
    )

    # Load configuration
    app.config.from_object(config_class)

    # ---- Session/Cookie settings for cross-site auth (frontend on different domain)
    # You can override via Render env vars.
    app.config.setdefault("SESSION_COOKIE_SAMESITE",
                          os.getenv("SESSION_COOKIE_SAMESITE", "None"))
    app.config.setdefault("SESSION_COOKIE_SECURE", os.getenv(
        "SESSION_COOKIE_SECURE", "True") == "True")

    # ---- CORS (allow your frontend origins & send cookies)
    origins = [o.strip() for o in os.getenv(
        "CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
    CORS(
        app,
        origins=origins,
        supports_credentials=True
    )

    # ---- Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login.init_app(app)

    # ---- Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # ---- Blueprints
    from app.controllers.main import main_bp
    from app.controllers.auth import auth_bp
    from app.controllers.api import api_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    # ---- Import models so Alembic sees them
    from app.models import user  # noqa: F401

    # ---- Health check / diagnostics
    @app.route('/api/test', methods=['GET'])
    def test_api():
        return jsonify({'message': 'API is working!'}), 200

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            'name': 'Flask OCR API',
            'status': 'online',
            'version': '1.0.0',
            'frontend_url': os.getenv("FRONTEND_URL", "http://localhost:3000"),
            'api_docs': {
                'authentication': [
                    {'endpoint': '/api/login',   'method': 'POST',
                        'description': 'Log in a user'},
                    {'endpoint': '/api/logout',  'method': 'POST',
                        'description': 'Log out a user'},
                    {'endpoint': '/api/register', 'method': 'POST',
                        'description': 'Register a new user'},
                    {'endpoint': '/api/user',    'method': 'GET',
                        'description': 'Get current user info'}
                ],
                'ocr': [
                    {'endpoint': '/api/ocr',            'method': 'POST',
                        'description': 'Process file with OCR'},
                    {'endpoint': '/api/results',        'method': 'GET',
                        'description': 'Get all OCR results'},
                    {'endpoint': '/api/results/:id',    'method': 'GET',
                        'description': 'Get specific OCR result'},
                    {'endpoint': '/api/results/:id',    'method': 'DELETE',
                        'description': 'Delete specific OCR result'}
                ]
            }
        }), 200

    # ---- Auth: return JSON (not HTML) on unauthorized
    @login.unauthorized_handler
    def unauthorized():
        return jsonify({'error': 'Unauthorized access, please login'}), 401

    return app
