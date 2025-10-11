# OCR Setup Guide for Resume Parser

This guide helps you set up Optical Character Recognition (OCR) for processing image-based PDF resumes.

## What is OCR?

OCR (Optical Character Recognition) allows the system to extract text from:
- Scanned PDF documents
- Image-based resumes
- PDFs created from photos
- Low-quality or poorly formatted PDFs

## Required Dependencies

### 1. Python Packages
```bash
pip install pytesseract
pip install PyMuPDF
pip install Pillow
```

### 2. Tesseract OCR Engine

#### Windows
1. Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install the executable (typically installs to `C:\Program Files\Tesseract-OCR\`)
3. Add Tesseract to your system PATH, or set the path in Python:
   ```python
   import pytesseract
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```

#### macOS
```bash
brew install tesseract
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install libtesseract-dev
```

## Verification

Run this command to check if OCR is working:
```bash
python services/pdf_parser.py test_resume.pdf
```

You should see output like:
```
Tesseract version: 5.x.x
PyPDF2 extracted X characters
OCR extracted Y characters
```

## Troubleshooting

### Common Issues

1. **"Tesseract binary not found"**
   - Make sure Tesseract is installed and in your PATH
   - On Windows, verify the installation path

2. **"PyMuPDF not available"**
   - Install with: `pip install PyMuPDF`

3. **"PIL/Pillow not available"**
   - Install with: `pip install Pillow`

4. **Poor OCR results**
   - The system automatically enhances images for better OCR
   - Higher resolution PDFs generally work better
   - Clean, high-contrast documents work best

### Performance Notes

- OCR is slower than regular text extraction
- The system tries PyPDF2 first, then falls back to OCR
- For image-based PDFs, OCR is essential
- Processing time increases with page count and image resolution

## How It Works

1. **PyPDF2 First**: Fast extraction for text-based PDFs
2. **OCR Fallback**: When PyPDF2 finds minimal text
3. **Smart Combination**: Uses the best result or combines both
4. **Image Enhancement**: Converts to grayscale, increases resolution
5. **Character Filtering**: Focuses on resume-relevant characters

## Testing

Test with different resume types:
- Text-based PDF: Should use PyPDF2
- Scanned resume: Should use OCR
- Mixed content: May use both methods

The system will automatically choose the best extraction method for each resume.
