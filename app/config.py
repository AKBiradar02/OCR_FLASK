import os
from dotenv import load_dotenv

# Load .env file if present (local dev only)
load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'hard-to-guess-string')

    # Prefer DATABASE_URL from environment (Render/Heroku will inject this)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 'sqlite:///app.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File upload settings
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
