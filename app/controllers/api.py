import os
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app.models.user import OCRResult
from app import db
from app.utils.ocr_utils import process_file

api_bp = Blueprint('api', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
MAX_FILE_SIZE_MB = 5  # prevent huge uploads on Render free tier

# ✅ Load EasyOCR reader via utils
# reader handled in ocr_utils.py


def allowed_file(filename, allowed_exts):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_exts


@api_bp.route('/user', methods=['GET'])
@login_required
def get_current_user():
    """Return current user information."""
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email
    })


@api_bp.route('/ocr', methods=['POST'])
@login_required
def ocr_process():
    """API endpoint for OCR processing."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename, ALLOWED_EXTENSIONS):
        return jsonify({'error': 'File type not allowed'}), 400

    # ✅ File size check
    file.seek(0, os.SEEK_END)
    file_size_mb = file.tell() / (1024 * 1024)
    file.seek(0)
    if file_size_mb > MAX_FILE_SIZE_MB:
        return jsonify({'error': f'File too large (>{MAX_FILE_SIZE_MB} MB)'}), 400

    # Save file
    filename = secure_filename(file.filename)
    os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        # ✅ OCR with shared utility (supports PDF & Image)
        extracted_text = process_file(file_path)

        # Save in DB
        ocr_result = OCRResult(
            filename=filename,
            file_path=file_path,
            text_content=extracted_text,
            user=current_user
        )
        db.session.add(ocr_result)
        db.session.commit()

        return jsonify({
            'success': True,
            'filename': filename,
            'text': extracted_text,
            'result_id': ocr_result.id
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'OCR failed: {str(e)}'}), 500


@api_bp.route('/results', methods=['GET'])
@login_required
def get_user_results():
    results = OCRResult.query.filter_by(user_id=current_user.id).order_by(
        OCRResult.timestamp.desc()).all()
    return jsonify({
        'results': [
            {
                'id': r.id,
                'filename': r.filename,
                'timestamp': r.timestamp.isoformat(),
                'text_preview': (r.text_content[:100] + '...') if len(r.text_content) > 100 else r.text_content
            } for r in results
        ]
    })


@api_bp.route('/results/<int:result_id>', methods=['GET'])
@login_required
def get_result(result_id):
    result = OCRResult.query.filter_by(
        id=result_id, user_id=current_user.id).first_or_404()
    return jsonify({
        'id': result.id,
        'filename': result.filename,
        'timestamp': result.timestamp.isoformat(),
        'text': result.text_content
    })


@api_bp.route('/results/<int:result_id>', methods=['DELETE'])
@login_required
def delete_result(result_id):
    result = OCRResult.query.filter_by(
        id=result_id, user_id=current_user.id).first_or_404()
    try:
        if os.path.exists(result.file_path):
            os.remove(result.file_path)
        db.session.delete(result)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
