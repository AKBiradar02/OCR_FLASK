import os
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app.utils.ocr_utils import process_file, allowed_file
from app.models.user import OCRResult
from app import db

api_bp = Blueprint('api', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

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
    # Check if a file was included in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Check if file is empty
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if the file is allowed
    if not allowed_file(file.filename, ALLOWED_EXTENSIONS):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Save the file
    filename = secure_filename(file.filename)
    
    # Create uploads directory if it doesn't exist
    if not os.path.exists(current_app.config['UPLOAD_FOLDER']):
        os.makedirs(current_app.config['UPLOAD_FOLDER'])
    
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    try:
        # Process the file with OCR
        extracted_text = process_file(file_path)
        
        # Save the result to the database
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
        return jsonify({'error': str(e)}), 500

@api_bp.route('/results', methods=['GET'])
@login_required
def get_user_results():
    """Retrieve all OCR results for the current user."""
    results = OCRResult.query.filter_by(user_id=current_user.id).order_by(OCRResult.timestamp.desc()).all()
    
    return jsonify({
        'results': [
            {
                'id': result.id,
                'filename': result.filename,
                'timestamp': result.timestamp.isoformat(),
                'text_preview': result.text_content[:100] + '...' if len(result.text_content) > 100 else result.text_content
            } for result in results
        ]
    })

@api_bp.route('/results/<int:result_id>', methods=['GET'])
@login_required
def get_result(result_id):
    """Retrieve a specific OCR result."""
    result = OCRResult.query.filter_by(id=result_id, user_id=current_user.id).first_or_404()
    
    return jsonify({
        'id': result.id,
        'filename': result.filename,
        'timestamp': result.timestamp.isoformat(),
        'text': result.text_content
    })

@api_bp.route('/results/<int:result_id>', methods=['DELETE'])
@login_required
def delete_result(result_id):
    """Delete a specific OCR result."""
    result = OCRResult.query.filter_by(id=result_id, user_id=current_user.id).first_or_404()
    
    try:
        # Delete the file if it exists
        if os.path.exists(result.file_path):
            os.remove(result.file_path)
        
        # Delete the database entry
        db.session.delete(result)
        db.session.commit()
        
        return jsonify({'success': True})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 