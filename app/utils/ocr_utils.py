import os
import tempfile
import sys
import gc

# NOTE: Heavy libraries (easyocr, fitz, torch) are imported lazily inside functions
# to prevent "Out of Memory" errors on Render Free Tier (512MB RAM) during startup.

def get_ocr_reader():
    """Initialize and return the EasyOCR reader. Lazily imports easyocr."""
    import easyocr
    return easyocr.Reader(['en'], gpu=False)

def process_image(image_path):
    """Extract text from an image file."""
    reader = None
    try:
        reader = get_ocr_reader()
        result = reader.readtext(image_path)
        extracted_text = "\n".join([text[1] for text in result])
        return extracted_text
    finally:
        # Aggressive memory cleanup
        if reader:
            del reader
        gc.collect()

def process_pdf(pdf_path):
    """Extract text from a PDF file using OCR."""
    import fitz  # PyMuPDF
    from pdf2image import convert_from_path
    
    extracted_text = ""
    
    # First try to extract text directly if the PDF has text layers
    doc = fitz.open(pdf_path)
    direct_text = ""
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        direct_text += page.get_text()
    
    doc.close()
    
    # If we got text directly, return it
    if direct_text.strip():
        return direct_text
    
    # Otherwise, convert PDF to images and use OCR
    reader = None
    try:
        reader = get_ocr_reader()
        with tempfile.TemporaryDirectory() as temp_dir:
            images = convert_from_path(pdf_path)
            for i, image in enumerate(images):
                image_path = os.path.join(temp_dir, f'page_{i}.png')
                image.save(image_path, 'PNG')
                
                # Process single page
                result = reader.readtext(image_path)
                page_text = "\n".join([text[1] for text in result])
                extracted_text += f"\n--- Page {i+1} ---\n{page_text}\n"
                
                # Helper cleanup per page if needed, but doing it at end is usually better for speed
    except Exception as e:
        # Fallback or error if Poppler is missing
        if "poppler" in str(e).lower() or "not installed" in str(e).lower():
            raise RuntimeError("PDF OCR requires Poppler. Please install it or use images.") from e
        raise e
    finally:
        if reader:
            del reader
        gc.collect()
    
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