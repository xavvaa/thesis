#!/usr/bin/env python3
"""
PDF Text Extraction Script using PyPDF2 and Tesseract OCR
This script extracts text from PDF files, first trying PyPDF2 for text-based PDFs,
then falling back to Tesseract OCR for image-based PDFs.
"""

import sys
import os
import tempfile
import subprocess
from io import BytesIO

try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
    print("Warning: PyPDF2 not available, using OCR only", file=sys.stderr)

try:
    from PIL import Image
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("Warning: Tesseract/PIL not available, using PyPDF2 only", file=sys.stderr)

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False


def extract_text_pypdf2(pdf_path):
    """Extract text using PyPDF2"""
    if not PYPDF2_AVAILABLE:
        return ""
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
            
            return text.strip()
    except Exception as e:
        print(f"PyPDF2 extraction failed: {e}", file=sys.stderr)
        return ""


def extract_text_ocr(pdf_path):
    """Extract text using OCR (Tesseract)"""
    if not TESSERACT_AVAILABLE or not PYMUPDF_AVAILABLE:
        return ""
    
    try:
        # Convert PDF to images using PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            pix = page.get_pixmap()
            img_data = pix.tobytes("png")
            
            # Convert to PIL Image
            image = Image.open(BytesIO(img_data))
            
            # Use Tesseract to extract text
            page_text = pytesseract.image_to_string(image, lang='eng')
            text += page_text + "\n"
        
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"OCR extraction failed: {e}", file=sys.stderr)
        return ""


def extract_text_fallback(pdf_path):
    """Fallback method using system tools"""
    try:
        # Try pdftotext if available
        result = subprocess.run(
            ['pdftotext', pdf_path, '-'],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    try:
        # Try pdfplumber as last resort
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
    except ImportError:
        pass
    
    return ""


def main():
    if len(sys.argv) != 2:
        print("Usage: python pdf_parser.py <pdf_file_path>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not os.path.exists(pdf_path):
        print(f"Error: File {pdf_path} not found", file=sys.stderr)
        sys.exit(1)
    
    extracted_text = ""
    
    # Method 1: Try PyPDF2 first (fastest for text-based PDFs)
    if PYPDF2_AVAILABLE:
        extracted_text = extract_text_pypdf2(pdf_path)
        if extracted_text and len(extracted_text.strip()) > 50:
            try:
                print(extracted_text)
            except UnicodeEncodeError:
                # Handle special characters like bullet points
                cleaned_text = extracted_text.encode('utf-8', errors='ignore').decode('utf-8')
                print(cleaned_text)
            return
    
    # Method 2: Try OCR if PyPDF2 failed or returned minimal text
    if TESSERACT_AVAILABLE and PYMUPDF_AVAILABLE:
        extracted_text = extract_text_ocr(pdf_path)
        if extracted_text and len(extracted_text.strip()) > 50:
            try:
                print(extracted_text)
            except UnicodeEncodeError:
                cleaned_text = extracted_text.encode('utf-8', errors='ignore').decode('utf-8')
                print(cleaned_text)
            return
    
    # Method 3: Fallback methods
    extracted_text = extract_text_fallback(pdf_path)
    if extracted_text:
        try:
            print(extracted_text)
        except UnicodeEncodeError:
            cleaned_text = extracted_text.encode('utf-8', errors='ignore').decode('utf-8')
            print(cleaned_text)
        return
    
    # If all methods failed, return error
    print("Error: Could not extract text from PDF", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
