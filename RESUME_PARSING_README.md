# Resume Upload and Auto-Fill Feature

This feature allows job seekers to upload their existing resume (PDF) and automatically extract information to fill out the resume creation form, significantly reducing manual input time.

## Features

- **PDF Text Extraction**: Uses PyPDF2 for text-based PDFs and Tesseract OCR for image-based PDFs
- **Intelligent Parsing**: Extracts personal information, work experience, education, skills, and certifications
- **Auto-Fill Form**: Automatically populates form fields with extracted data
- **User-Friendly UI**: Clean upload interface with progress indicators and success messages
- **Error Handling**: Comprehensive error handling with user feedback

## Architecture

### Backend Components

1. **Resume Parsing Service** (`backend/services/resumeParsingService.js`)
   - Main parsing logic and text extraction
   - NLP-based information extraction using patterns and rules
   - Handles both text-based and image-based PDFs

2. **Python PDF Parser** (`backend/services/pdf_parser.py`)
   - Multi-method PDF text extraction
   - Fallback mechanisms for different PDF types
   - OCR support for scanned documents

3. **API Endpoint** (`backend/routes/resumeRoutes.js`)
   - `/api/resumes/parse` - Upload and parse resume endpoint
   - File validation and authentication
   - Returns structured parsed data

### Frontend Components

4. **Upload UI** (in `CreateResumeTab.tsx`)
   - Upload button and file input
   - Progress indicators and success messages
   - Auto-fill logic for form fields

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
python setup_resume_parsing.py
```

Or manually install:
```bash
pip install -r requirements.txt
```

### 2. Install Tesseract OCR

**Windows:**
- Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Add to PATH environment variable

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

### 3. Verify Setup

Test the PDF parser:
```bash
cd backend/services
python pdf_parser.py path/to/test/resume.pdf
```

## Usage

### For Job Seekers

1. Navigate to the "Create Resume" tab in the dashboard
2. Click "Upload Resume (PDF)" button in the Quick Start section
3. Select a PDF resume file (max 10MB)
4. Wait for parsing to complete
5. Review auto-filled form fields and make any necessary adjustments
6. Save the resume

### API Usage

```javascript
// Upload and parse resume
const formData = new FormData();
formData.append('resume', pdfFile);

const response = await fetch('/api/resumes/parse', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: formData
});

const result = await response.json();
// result.data contains parsed resume information
```

## Parsing Capabilities

### Personal Information
- ✅ Name (first and last)
- ✅ Email address
- ✅ Phone number
- ✅ Address (basic extraction)

### Work Experience
- ✅ Company names
- ✅ Job titles/positions
- ✅ Employment dates
- ✅ Job descriptions
- ✅ Location (when available)

### Education
- ✅ Degree/qualification names
- ✅ School/institution names
- ✅ Education dates
- ✅ Location (when available)

### Skills & Certifications
- ✅ Technical skills
- ✅ Core competencies
- ✅ Certifications and licenses
- ✅ Professional credentials

## Technical Details

### Text Extraction Methods

1. **PyPDF2**: Fast extraction for text-based PDFs
2. **Tesseract OCR**: Handles scanned/image-based PDFs
3. **PyMuPDF**: Alternative PDF processing
4. **pdfplumber**: Fallback extraction method

### Parsing Algorithm

The parsing uses rule-based NLP patterns to identify:
- Email patterns: `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`
- Phone patterns: Various international and local formats
- Date patterns: Multiple date formats and ranges
- Section headers: Experience, Education, Skills, etc.
- Name extraction: First line analysis and context clues

### Data Flow

```
PDF Upload → Text Extraction → Pattern Matching → Data Structuring → Auto-Fill Form
```

## Error Handling

- **File Validation**: PDF type and size limits
- **Parsing Errors**: Graceful fallbacks and user feedback
- **Authentication**: Firebase token validation
- **Network Errors**: Retry mechanisms and error messages

## Security Considerations

- File size limits (10MB max)
- File type validation (PDF only)
- Authentication required for all requests
- Temporary file cleanup
- No permanent storage of uploaded files

## Performance

- **Small PDFs** (< 1MB): ~2-5 seconds
- **Large PDFs** (5-10MB): ~10-30 seconds
- **OCR Processing**: Additional 5-15 seconds for scanned documents

## Limitations

- Works best with standard resume formats
- Complex layouts may affect parsing accuracy
- Requires manual review of auto-filled data
- OCR accuracy depends on document quality
- Some formatting may be lost during extraction

## Future Enhancements

- [ ] Machine learning-based parsing for better accuracy
- [ ] Support for additional file formats (DOC, DOCX)
- [ ] Advanced layout analysis
- [ ] Multi-language support
- [ ] Custom parsing rules configuration
- [ ] Batch processing capabilities

## Troubleshooting

### Common Issues

1. **"Python not found"**
   - Ensure Python is installed and in PATH
   - Use `python3` instead of `python` on some systems

2. **"Tesseract not found"**
   - Install Tesseract OCR and add to PATH
   - Verify with `tesseract --version`

3. **"No text extracted"**
   - PDF may be password protected
   - Try with a different PDF file
   - Check if PDF contains actual text vs images

4. **"Parsing failed"**
   - Check backend logs for detailed error messages
   - Verify all Python dependencies are installed
   - Test with the standalone PDF parser script

### Debug Mode

Enable detailed logging by setting environment variable:
```bash
DEBUG_RESUME_PARSING=true
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs for detailed error messages
3. Test with the standalone PDF parser script
4. Verify all dependencies are properly installed
