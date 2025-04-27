import os
import easyocr
import tempfile
import fitz  # PyMuPDF
from pdf2image import convert_from_path
import numpy as np
from werkzeug.utils import secure_filename

reader = None

def get_ocr_reader():
    """Initialize and return the EasyOCR reader."""
    global reader
    if reader is None:
        reader = easyocr.Reader(['en'])
    return reader

def process_image(image_path):
    """Extract text from an image file."""
    reader = get_ocr_reader()
    result = reader.readtext(image_path)
    extracted_text = "\n".join([text[1] for text in result])
    return extracted_text

def process_pdf(pdf_path):
    """Extract text from a PDF file using OCR."""
    extracted_text = ""
    
    # First try to extract text directly if the PDF has text layers
    doc = fitz.open(pdf_path)
    direct_text = ""
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        direct_text += page.get_text()
    
    # If we got text directly, return it
    if direct_text.strip():
        return direct_text
    
    # Otherwise, convert PDF to images and use OCR
    reader = get_ocr_reader()
    with tempfile.TemporaryDirectory() as temp_dir:
        images = convert_from_path(pdf_path)
        for i, image in enumerate(images):
            image_path = os.path.join(temp_dir, f'page_{i}.png')
            image.save(image_path, 'PNG')
            result = reader.readtext(image_path)
            page_text = "\n".join([text[1] for text in result])
            extracted_text += f"\n--- Page {i+1} ---\n{page_text}\n"
    
    return extracted_text

def allowed_file(filename, allowed_extensions):
    """Check if a file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def process_file(file_path):
    """Process a file and extract text using OCR."""
    file_extension = file_path.rsplit('.', 1)[1].lower()
    
    if file_extension == 'pdf':
        return process_pdf(file_path)
    else:  # Assume it's an image
        return process_image(file_path) 