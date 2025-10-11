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
    print("Warning: PyMuPDF not available, OCR functionality limited", file=sys.stderr)

def check_ocr_setup():
    """Check if OCR dependencies are properly installed"""
    issues = []
    
    if not TESSERACT_AVAILABLE:
        issues.append("Tesseract OCR not available. Install with: pip install pytesseract")
    
    if not PYMUPDF_AVAILABLE:
        issues.append("PyMuPDF not available. Install with: pip install PyMuPDF")
    
    if TESSERACT_AVAILABLE:
        try:
            # Try to get Tesseract version to check if it's properly installed
            import pytesseract
            version = pytesseract.get_tesseract_version()
            print(f"Tesseract version: {version}", file=sys.stderr)
        except Exception as e:
            issues.append(f"Tesseract binary not found. Please install Tesseract OCR: {e}")
    
    if issues:
        print("OCR Setup Issues:", file=sys.stderr)
        for issue in issues:
            print(f"  - {issue}", file=sys.stderr)
        print("  - For Windows: Download Tesseract from https://github.com/UB-Mannheim/tesseract/wiki", file=sys.stderr)
        print("  - For Mac: brew install tesseract", file=sys.stderr)
        print("  - For Linux: sudo apt-get install tesseract-ocr", file=sys.stderr)
    
    return len(issues) == 0


def extract_text_pypdf2(pdf_path):
    """Extract text using PyPDF2 with encoding safety"""
    if not PYPDF2_AVAILABLE:
        return ""
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                try:
                    page_text = page.extract_text()
                    # Clean the text immediately after extraction
                    if page_text:
                        # Replace problematic characters with safe alternatives
                        page_text = page_text.replace('\u2022', '•')  # Bullet points
                        page_text = page_text.replace('\u2013', '-')  # En dash
                        page_text = page_text.replace('\u2014', '-')  # Em dash
                        page_text = page_text.replace('\u2019', "'")  # Right single quotation
                        page_text = page_text.replace('\u201c', '"')  # Left double quotation
                        page_text = page_text.replace('\u201d', '"')  # Right double quotation
                        # Encode and decode to handle any remaining issues
                        page_text = page_text.encode('utf-8', errors='replace').decode('utf-8')
                        text += page_text + "\n"
                except Exception as page_error:
                    print(f"Error extracting page {page_num}: {page_error}", file=sys.stderr)
                    continue
            
            return text.strip()
    except Exception as e:
        print(f"PyPDF2 extraction failed: {e}", file=sys.stderr)
        return ""


def extract_text_ocr(pdf_path):
    """Extract text using OCR (Tesseract) with enhanced image processing"""
    if not TESSERACT_AVAILABLE or not PYMUPDF_AVAILABLE:
        print("OCR dependencies not available", file=sys.stderr)
        return ""
    
    try:
        print(f"Starting OCR extraction for: {pdf_path}", file=sys.stderr)
        # Convert PDF to images using PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        
        for page_num in range(len(doc)):
            print(f"Processing page {page_num + 1}/{len(doc)} with OCR", file=sys.stderr)
            page = doc.load_page(page_num)
            
            # Get pixmap with higher resolution for better OCR
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better quality
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Convert to PIL Image
            image = Image.open(BytesIO(img_data))
            
            # Enhance image for better OCR results
            # Convert to grayscale
            if image.mode != 'L':
                image = image.convert('L')
            
            # Optional: Apply image enhancements
            # from PIL import ImageEnhance
            # enhancer = ImageEnhance.Contrast(image)
            # image = enhancer.enhance(1.5)  # Increase contrast
            
            # Use Tesseract to extract text with custom config
            custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?\'"()[]{}@#$%^&*-_+=|\/<> \t\n'
            
            try:
                page_text = pytesseract.image_to_string(image, lang='eng', config=custom_config)
                if page_text.strip():
                    text += page_text + "\n"
                    print(f"OCR extracted {len(page_text)} characters from page {page_num + 1}", file=sys.stderr)
                else:
                    print(f"No text extracted from page {page_num + 1}", file=sys.stderr)
            except Exception as ocr_error:
                print(f"OCR failed for page {page_num + 1}: {ocr_error}", file=sys.stderr)
                # Try with simpler config
                try:
                    page_text = pytesseract.image_to_string(image, lang='eng')
                    if page_text.strip():
                        text += page_text + "\n"
                        print(f"OCR (fallback) extracted {len(page_text)} characters from page {page_num + 1}", file=sys.stderr)
                except Exception as fallback_error:
                    print(f"OCR fallback also failed for page {page_num + 1}: {fallback_error}", file=sys.stderr)
        
        doc.close()
        print(f"OCR extraction completed. Total text length: {len(text)}", file=sys.stderr)
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
    
    # Check OCR setup
    ocr_ready = check_ocr_setup()
    if not ocr_ready:
        print("OCR not fully configured, will use PyPDF2 only", file=sys.stderr)
    
    extracted_text = ""
    
    # Method 1: Try PyPDF2 first (fastest for text-based PDFs)
    pypdf2_text = ""
    if PYPDF2_AVAILABLE:
        pypdf2_text = extract_text_pypdf2(pdf_path)
        print(f"PyPDF2 extracted {len(pypdf2_text)} characters", file=sys.stderr)
        
        # If PyPDF2 extracted substantial text, use it
        if pypdf2_text and len(pypdf2_text.strip()) > 100:
            try:
                # Ensure we can encode/decode the text properly
                cleaned_text = pypdf2_text.encode('utf-8', errors='replace').decode('utf-8')
                print(cleaned_text)
                return
            except (UnicodeEncodeError, UnicodeDecodeError) as e:
                # Handle special characters more aggressively
                import re
                # Remove problematic characters and replace with safe alternatives
                safe_text = re.sub(r'[^\x00-\x7F]+', ' ', pypdf2_text)  # Remove non-ASCII
                safe_text = re.sub(r'\s+', ' ', safe_text)  # Clean up multiple spaces
                print(safe_text.strip())
                return
        elif pypdf2_text and len(pypdf2_text.strip()) > 20:
            print(f"PyPDF2 extracted minimal text ({len(pypdf2_text)} chars), trying OCR as well", file=sys.stderr)
    
    # Method 2: Try OCR (especially for image-based PDFs or when PyPDF2 failed)
    ocr_text = ""
    if TESSERACT_AVAILABLE and PYMUPDF_AVAILABLE:
        ocr_text = extract_text_ocr(pdf_path)
        print(f"OCR extracted {len(ocr_text)} characters", file=sys.stderr)
        
        # If OCR extracted substantial text, use it
        if ocr_text and len(ocr_text.strip()) > 50:
            try:
                # Clean OCR text for encoding issues
                cleaned_text = ocr_text.encode('utf-8', errors='replace').decode('utf-8')
                print(cleaned_text)
                return
            except (UnicodeEncodeError, UnicodeDecodeError):
                import re
                # Remove problematic characters from OCR text
                safe_text = re.sub(r'[^\x00-\x7F]+', ' ', ocr_text)
                safe_text = re.sub(r'\s+', ' ', safe_text)
                print(safe_text.strip())
                return
    
    # Method 2.5: Combine PyPDF2 and OCR results if both have some text
    if pypdf2_text and ocr_text:
        # Choose the longer result or combine them
        if len(ocr_text) > len(pypdf2_text) * 1.5:  # OCR is significantly longer
            combined_text = ocr_text
            print(f"Using OCR result (longer): {len(ocr_text)} vs {len(pypdf2_text)} chars", file=sys.stderr)
        elif len(pypdf2_text) > len(ocr_text) * 1.5:  # PyPDF2 is significantly longer
            combined_text = pypdf2_text
            print(f"Using PyPDF2 result (longer): {len(pypdf2_text)} vs {len(ocr_text)} chars", file=sys.stderr)
        else:
            # Combine both results
            combined_text = pypdf2_text + "\n\n" + ocr_text
            print(f"Combining both results: PyPDF2({len(pypdf2_text)}) + OCR({len(ocr_text)})", file=sys.stderr)
        
        try:
            cleaned_text = combined_text.encode('utf-8', errors='replace').decode('utf-8')
            print(cleaned_text)
            return
        except (UnicodeEncodeError, UnicodeDecodeError):
            import re
            safe_text = re.sub(r'[^\x00-\x7F]+', ' ', combined_text)
            safe_text = re.sub(r'\s+', ' ', safe_text)
            print(safe_text.strip())
            return
    
    # Method 3: Fallback methods
    extracted_text = extract_text_fallback(pdf_path)
    if extracted_text:
        try:
            # Clean fallback text for encoding issues
            cleaned_text = extracted_text.encode('utf-8', errors='replace').decode('utf-8')
            print(cleaned_text)
        except (UnicodeEncodeError, UnicodeDecodeError):
            import re
            # Remove problematic characters from fallback text
            safe_text = re.sub(r'[^\x00-\x7F]+', ' ', extracted_text)
            safe_text = re.sub(r'\s+', ' ', safe_text)
            print(safe_text.strip())
        return
    
    # If all methods failed, return error
    print("Error: Could not extract text from PDF", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
