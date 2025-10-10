#!/usr/bin/env python3
"""
Setup script for resume parsing dependencies
This script installs all required Python packages for PDF text extraction
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✓ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError:
        print(f"✗ Failed to install {package}")
        return False

def check_tesseract():
    """Check if Tesseract OCR is installed"""
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ Tesseract OCR is already installed")
            return True
    except FileNotFoundError:
        pass
    
    print("⚠ Tesseract OCR not found. Please install it manually:")
    print("  Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
    print("  macOS: brew install tesseract")
    print("  Ubuntu/Debian: sudo apt-get install tesseract-ocr")
    return False

def main():
    print("Setting up resume parsing dependencies...")
    print("=" * 50)
    
    # Required packages
    packages = [
        "PyPDF2==3.0.1",
        "pytesseract==0.3.10", 
        "Pillow==10.0.1",
        "PyMuPDF==1.23.5",
        "pdfplumber==0.9.0"
    ]
    
    success_count = 0
    
    # Install Python packages
    for package in packages:
        if install_package(package):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"Python packages: {success_count}/{len(packages)} installed successfully")
    
    # Check Tesseract
    tesseract_ok = check_tesseract()
    
    print("\n" + "=" * 50)
    if success_count == len(packages) and tesseract_ok:
        print("✓ Setup completed successfully!")
        print("Resume parsing is ready to use.")
    else:
        print("⚠ Setup completed with warnings.")
        print("Some dependencies may need manual installation.")
    
    print("\nTo test the setup, run:")
    print("python pdf_parser.py <path_to_test_pdf>")

if __name__ == "__main__":
    main()
