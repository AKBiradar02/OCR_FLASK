from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@main_bp.route('/index')
def index():
    """Root endpoint that returns API information."""
    return jsonify({
        'name': 'Flask OCR API',
        'version': '1.0.0',
        'status': 'online',
        'frontend_url': 'http://localhost:3000',
        'api_docs': {
            'authentication': [
                {'endpoint': '/api/login', 'method': 'POST', 'description': 'Log in a user'},
                {'endpoint': '/api/logout', 'method': 'POST', 'description': 'Log out a user'},
                {'endpoint': '/api/register', 'method': 'POST', 'description': 'Register a new user'},
                {'endpoint': '/api/user', 'method': 'GET', 'description': 'Get current user info'}
            ],
            'ocr': [
                {'endpoint': '/api/ocr', 'method': 'POST', 'description': 'Process file with OCR'},
                {'endpoint': '/api/results', 'method': 'GET', 'description': 'Get all OCR results'},
                {'endpoint': '/api/results/:id', 'method': 'GET', 'description': 'Get specific OCR result'},
                {'endpoint': '/api/results/:id', 'method': 'DELETE', 'description': 'Delete specific OCR result'}
            ]
        }
    }) 