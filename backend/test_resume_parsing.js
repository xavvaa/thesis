const resumeParsingService = require('./services/resumeParsingService');
const fs = require('fs');
const path = require('path');

/**
 * Test script for resume parsing functionality
 * Usage: node test_resume_parsing.js [path_to_pdf]
 */

async function testResumeParsing() {
  console.log('🧪 Testing Resume Parsing Service');
  console.log('=' * 50);
  
  // Check if PDF file path is provided
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.log('❌ Please provide a PDF file path');
    console.log('Usage: node test_resume_parsing.js path/to/resume.pdf');
    process.exit(1);
  }
  
  // Check if file exists
  if (!fs.existsSync(pdfPath)) {
    console.log(`❌ File not found: ${pdfPath}`);
    process.exit(1);
  }
  
  try {
    console.log(`📄 Testing with file: ${path.basename(pdfPath)}`);
    console.log('⏳ Reading PDF file...');
    
    // Read PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log(`✅ File read successfully (${pdfBuffer.length} bytes)`);
    
    console.log('🔍 Parsing resume...');
    const startTime = Date.now();
    
    // Parse the resume
    const result = await resumeParsingService.parseResume(pdfBuffer);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`⏱️  Parsing completed in ${duration} seconds`);
    console.log('=' * 50);
    
    if (result.success) {
      console.log('✅ Resume parsed successfully!');
      console.log('\n📋 Extracted Information:');
      console.log('-'.repeat(30));
      
      // Display personal info
      const personalInfo = result.data.personalInfo;
      console.log('\n👤 Personal Information:');
      console.log(`   Name: ${personalInfo.firstName} ${personalInfo.lastName}`);
      console.log(`   Email: ${personalInfo.email || 'Not found'}`);
      console.log(`   Phone: ${personalInfo.phone || 'Not found'}`);
      console.log(`   Address: ${personalInfo.address || 'Not found'}`);
      
      // Display summary
      if (result.data.summary) {
        console.log('\n📝 Summary:');
        console.log(`   ${result.data.summary.substring(0, 200)}${result.data.summary.length > 200 ? '...' : ''}`);
      }
      
      // Display experience
      console.log(`\n💼 Work Experience (${result.data.experience.length} entries):`);
      result.data.experience.forEach((exp, index) => {
        if (exp.company || exp.position) {
          console.log(`   ${index + 1}. ${exp.position || 'Position not found'} at ${exp.company || 'Company not found'}`);
          if (exp.duration) console.log(`      Duration: ${exp.duration}`);
        }
      });
      
      // Display education
      console.log(`\n🎓 Education (${result.data.education.length} entries):`);
      result.data.education.forEach((edu, index) => {
        if (edu.degree || edu.school) {
          console.log(`   ${index + 1}. ${edu.degree || 'Degree not found'} - ${edu.school || 'School not found'}`);
        }
      });
      
      // Display skills
      const validSkills = result.data.skills.filter(skill => skill.trim());
      console.log(`\n🛠️  Skills (${validSkills.length} found):`);
      if (validSkills.length > 0) {
        console.log(`   ${validSkills.slice(0, 10).join(', ')}${validSkills.length > 10 ? '...' : ''}`);
      }
      
      // Display certifications
      const validCerts = result.data.certifications.filter(cert => cert.trim());
      console.log(`\n📜 Certifications (${validCerts.length} found):`);
      if (validCerts.length > 0) {
        validCerts.slice(0, 5).forEach((cert, index) => {
          console.log(`   ${index + 1}. ${cert}`);
        });
      }
      
      // Show raw text sample
      if (result.rawText) {
        console.log('\n📄 Raw Text Sample (first 300 chars):');
        console.log('-'.repeat(30));
        console.log(result.rawText.substring(0, 300) + '...');
      }
      
    } else {
      console.log('❌ Resume parsing failed');
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:');
    console.error(error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Python is installed and in PATH');
    console.log('2. Install required Python packages: pip install -r requirements.txt');
    console.log('3. Install Tesseract OCR if processing scanned PDFs');
    console.log('4. Check that the PDF file is not password protected');
  }
  
  console.log('\n' + '=' * 50);
  console.log('🏁 Test completed');
}

// Run the test
testResumeParsing();
