import os
import tempfile
import gc
import re
from typing import List, Tuple

# NOTE: Heavy libraries (easyocr, fitz, torch) are imported lazily inside functions
# to prevent "Out of Memory" errors on Render Free Tier (512MB RAM) during startup.

_OCR_READER = None


def get_ocr_reader():
    """
    Initialize and return a shared EasyOCR reader.

    Reusing a singleton reader avoids repeated model loading and makes OCR
    results more consistent between requests.
    """
    global _OCR_READER
    if _OCR_READER is None:
        import easyocr
        _OCR_READER = easyocr.Reader(['en'], gpu=False)
    return _OCR_READER


def _normalize_text(text: str) -> str:
    """Normalize OCR text while preserving line breaks."""
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def _prepare_image_variants(image_path: str) -> List[str]:
    """
    Build improved image variants to boost OCR accuracy on low-quality scans.

    Returns a list of image file paths (original first).
    """
    from PIL import Image, ImageOps, ImageFilter

    variants = [image_path]
    temp_paths = []
    try:
        with Image.open(image_path) as img:
            # Normalize orientation from EXIF metadata (mobile photos).
            img = ImageOps.exif_transpose(img)

            # Grayscale + autocontrast usually improves text detection.
            gray = ImageOps.grayscale(img)
            gray = ImageOps.autocontrast(gray)

            # Upscale small images for better character recognition.
            if gray.width < 1300:
                scale = 1300 / max(gray.width, 1)
                new_size = (int(gray.width * scale), int(gray.height * scale))
                gray = gray.resize(new_size, Image.Resampling.LANCZOS)

            # Variant A: sharpened grayscale
            sharpened = gray.filter(ImageFilter.SHARPEN)
            v1 = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
            v1.close()
            sharpened.save(v1.name, format='PNG')
            temp_paths.append(v1.name)

            # Variant B: binary threshold image
            thresholded = gray.point(lambda p: 255 if p > 165 else 0)
            v2 = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
            v2.close()
            thresholded.save(v2.name, format='PNG')
            temp_paths.append(v2.name)

            variants.extend(temp_paths)
    except Exception:
        # If preprocessing fails, continue with the original image only.
        return [image_path]

    return variants


def _score_ocr_result(lines: List[Tuple]) -> float:
    """Score OCR output using confidence and extracted text size."""
    if not lines:
        return 0.0

    confidences = [float(item[2]) for item in lines if len(item) >= 3 and item[2] is not None]
    avg_conf = (sum(confidences) / len(confidences)) if confidences else 0.0
    total_chars = sum(len((item[1] or '').strip()) for item in lines if len(item) >= 2)
    return avg_conf * max(total_chars, 1)


def _read_text_best_effort(image_path: str) -> str:
    """
    Run OCR with multiple strategies and keep the highest scoring output.
    """
    reader = get_ocr_reader()
    variants = _prepare_image_variants(image_path)
    best_score = -1.0
    best_text = ""

    settings = [
        {"detail": 1, "paragraph": False, "decoder": "greedy", "contrast_ths": 0.1, "adjust_contrast": 0.5},
        {"detail": 1, "paragraph": True, "decoder": "beamsearch", "beamWidth": 5, "contrast_ths": 0.05, "adjust_contrast": 0.7},
    ]

    try:
        for path in variants:
            for cfg in settings:
                result = reader.readtext(path, **cfg)
                score = _score_ocr_result(result)
                if score > best_score:
                    best_score = score
                    best_text = "\n".join(
                        text[1].strip() for text in result if len(text) >= 2 and (text[1] or '').strip()
                    )
    finally:
        # Remove temporary preprocessed variants; keep original upload intact.
        for path in variants[1:]:
            if os.path.exists(path):
                os.remove(path)

    return _normalize_text(best_text)


def process_image(image_path):
    """Extract text from an image file."""
    try:
        return _read_text_best_effort(image_path)
    finally:
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
        return _normalize_text(direct_text)

    # Otherwise, convert PDF to images and use OCR
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Higher DPI improves OCR precision for scanned PDFs.
            images = convert_from_path(pdf_path, dpi=300, fmt='png', grayscale=True)
            for i, image in enumerate(images):
                image_path = os.path.join(temp_dir, f'page_{i}.png')
                image.save(image_path, 'PNG')

                # Process single page
                page_text = _read_text_best_effort(image_path)
                extracted_text += f"\n--- Page {i+1} ---\n{page_text}\n"

    except Exception as e:
        # Fallback or error if Poppler is missing
        if "poppler" in str(e).lower() or "not installed" in str(e).lower():
            raise RuntimeError("PDF OCR requires Poppler. Please install it or use images.") from e
        raise e
    finally:
        gc.collect()

    return _normalize_text(extracted_text)


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
