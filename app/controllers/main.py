import os
from flask import Blueprint, render_template, redirect, url_for, flash, current_app, request
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app.controllers.forms import OCRForm
from app.utils.ocr_utils import process_file, allowed_file
from app.models.user import OCRResult
from app import db

main_bp = Blueprint('main', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

@main_bp.route('/')
@main_bp.route('/index')
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('auth.login'))
    return render_template('index.html', title='Home')

@main_bp.route('/ocr', methods=['GET', 'POST'])
@login_required
def ocr():
    form = OCRForm()
    
    if form.validate_on_submit():
        file = form.file.data
        
        if file and allowed_file(file.filename, ALLOWED_EXTENSIONS):
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
                
                return redirect(url_for('main.result', result_id=ocr_result.id))
                
            except Exception as e:
                db.session.rollback()
                flash(f'Error processing file: {str(e)}', 'danger')
        else:
            flash('File type not allowed. Please upload an image (JPG, PNG) or PDF.', 'warning')
    
    return render_template('ocr.html', title='OCR Processing', form=form)

@main_bp.route('/results')
@login_required
def results():
    page = request.args.get('page', 1, type=int)
    pagination = OCRResult.query.filter_by(user_id=current_user.id).order_by(
        OCRResult.timestamp.desc()
    ).paginate(page=page, per_page=10, error_out=False)
    
    return render_template('results.html', title='OCR Results', pagination=pagination)

@main_bp.route('/result/<int:result_id>')
@login_required
def result(result_id):
    result = OCRResult.query.filter_by(id=result_id, user_id=current_user.id).first_or_404()
    return render_template('result.html', title=f'Result: {result.filename}', result=result)

@main_bp.route('/delete/<int:result_id>', methods=['POST'])
@login_required
def delete_result(result_id):
    result = OCRResult.query.filter_by(id=result_id, user_id=current_user.id).first_or_404()
    
    try:
        # Delete the file if it exists
        if os.path.exists(result.file_path):
            os.remove(result.file_path)
        
        # Delete the database entry
        db.session.delete(result)
        db.session.commit()
        
        flash('Result deleted successfully.', 'success')
        return redirect(url_for('main.results'))
        
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting result: {str(e)}', 'danger')
        return redirect(url_for('main.result', result_id=result_id)) 