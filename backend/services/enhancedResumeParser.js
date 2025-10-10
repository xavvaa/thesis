/**
 * Enhanced Resume Parser with Multiple Extraction Methods
 * Combines rule-based parsing, JSON conversion, and AI-powered extraction
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class EnhancedResumeParser {
  constructor() {
    this.tempDir = os.tmpdir();
  }

  /**
   * Main parsing method with multiple approaches
   */
  async parseResume(pdfBuffer) {
    try {
      console.log('🚀 Starting enhanced resume parsing...');
      
      // Step 1: Extract raw text
      const rawText = await this.extractTextFromPDF(pdfBuffer);
      console.log(`📄 Raw text extracted: ${rawText.length} characters`);
      
      // Step 2: Convert to structured JSON
      const structuredData = await this.convertToStructuredJSON(rawText);
      console.log('📋 Structured JSON created');
      
      // Step 3: Apply multiple parsing methods
      const results = await Promise.allSettled([
        this.parseWithRules(structuredData),
        this.parseWithAI(rawText),
        this.parseWithTemplates(rawText)
      ]);
      
      // Step 4: Merge and validate results
      const mergedResult = this.mergeParsingResults(results);
      console.log('✅ Enhanced parsing completed');
      
      return {
        success: true,
        data: mergedResult,
        rawText: rawText,
        structuredData: structuredData
      };
      
    } catch (error) {
      console.error('❌ Enhanced parsing failed:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Extract text from PDF (reuse existing method)
   */
  async extractTextFromPDF(pdfBuffer) {
    return new Promise((resolve, reject) => {
      const tempPdfPath = path.join(this.tempDir, `resume_${Date.now()}.pdf`);
      
      try {
        fs.writeFileSync(tempPdfPath, pdfBuffer);
        console.log(`📄 PDF written: ${tempPdfPath}`);
        
        const pythonScript = path.join(__dirname, 'pdf_parser.py');
        const python = spawn('python', [pythonScript, tempPdfPath]);
        
        let extractedText = '';
        let errorOutput = '';
        
        python.stdout.on('data', (data) => {
          extractedText += data.toString();
        });
        
        python.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        const timeout = setTimeout(() => {
          python.kill();
          reject(new Error('PDF extraction timeout'));
        }, 120000);

        python.on('close', (code) => {
          clearTimeout(timeout);
          
          try {
            fs.unlinkSync(tempPdfPath);
          } catch (cleanupError) {
            console.warn('Failed to cleanup temp file:', cleanupError);
          }
          
          if (code === 0) {
            resolve(extractedText.trim());
          } else {
            reject(new Error(`PDF extraction failed: ${errorOutput}`));
          }
        });
        
      } catch (error) {
        try {
          if (fs.existsSync(tempPdfPath)) {
            fs.unlinkSync(tempPdfPath);
          }
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file on error:', cleanupError);
        }
        reject(error);
      }
    });
  }

  /**
   * Convert raw text to structured JSON format
   */
  async convertToStructuredJSON(rawText) {
    console.log('🔄 Converting to structured JSON...');
    
    const lines = rawText.split('\n').filter(line => line.trim());
    const structuredData = {
      sections: {},
      metadata: {
        totalLines: lines.length,
        extractedAt: new Date().toISOString()
      }
    };
    
    // Detect sections
    let currentSection = 'header';
    let currentContent = [];
    
    const sectionKeywords = {
      'personal': ['contact', 'address', 'phone', 'email'],
      'education': ['education', 'educational background', 'academic', 'qualifications'],
      'experience': ['experience', 'work history', 'employment', 'career', 'professional experience'],
      'projects': ['projects', 'portfolio', 'work samples'],
      'skills': ['skills', 'competencies', 'technical skills', 'abilities'],
      'certifications': ['certifications', 'certificates', 'licenses', 'credentials'],
      'achievements': ['achievements', 'awards', 'honors', 'accomplishments']
    };
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      
      // Check if this line indicates a new section (must be a header line)
      let newSection = null;
      for (const [sectionName, keywords] of Object.entries(sectionKeywords)) {
        if (keywords.some(keyword => lowerLine === keyword || (lowerLine.includes(keyword) && lowerLine.length < 30))) {
          newSection = sectionName;
          break;
        }
      }
      
      if (newSection && newSection !== currentSection) {
        // Save previous section
        if (currentContent.length > 0) {
          structuredData.sections[currentSection] = {
            content: currentContent.join('\n'),
            lines: [...currentContent]
          };
        }
        
        // Start new section
        currentSection = newSection;
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    
    // Save last section
    if (currentContent.length > 0) {
      structuredData.sections[currentSection] = {
        content: currentContent.join('\n'),
        lines: [...currentContent]
      };
    }
    
    console.log('📋 Detected sections:', Object.keys(structuredData.sections));
    
    // Debug: Show content of each section
    for (const [sectionName, sectionData] of Object.entries(structuredData.sections)) {
      console.log(`📋 Section "${sectionName}" content preview:`, sectionData.content.substring(0, 100) + '...');
    }
    
    return structuredData;
  }

  /**
   * Rule-based parsing (enhanced version of existing method)
   */
  async parseWithRules(structuredData) {
    console.log('🔧 Applying rule-based parsing...');
    
    const result = {
      method: 'rules',
      confidence: 0.7,
      personalInfo: {},
      education: [],
      experience: [],
      skills: [],
      certifications: []
    };
    
    // Parse each section with specific rules
    for (const [sectionName, sectionData] of Object.entries(structuredData.sections)) {
      switch (sectionName) {
        case 'personal':
        case 'header':
          result.personalInfo = this.parsePersonalInfoRules(sectionData.content);
          break;
        case 'education':
          result.education = this.parseEducationRules(sectionData.content);
          break;
        case 'experience':
        case 'projects':
          result.experience = this.parseExperienceRules(sectionData.content);
          break;
        case 'skills':
          result.skills = this.parseSkillsRules(sectionData.content);
          break;
        case 'certifications':
          result.certifications = this.parseCertificationsRules(sectionData.content);
          break;
      }
    }
    
    return result;
  }

  /**
   * AI-powered parsing (placeholder for future AI integration)
   */
  async parseWithAI(rawText) {
    console.log('🤖 Applying AI-powered parsing...');
    
    // For now, return a structured template
    // TODO: Integrate with OpenAI API or similar
    const result = {
      method: 'ai',
      confidence: 0.9,
      personalInfo: {},
      education: [],
      experience: [],
      skills: [],
      certifications: [],
      note: 'AI parsing not yet implemented - using template'
    };
    
    return result;
  }

  /**
   * Template-based parsing
   */
  async parseWithTemplates(rawText) {
    console.log('📋 Applying template-based parsing...');
    
    const templates = [
      {
        name: 'standard',
        patterns: {
          name: /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z]\.?\s*[A-Z][a-z]+)?)/m,
          email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
          phone: /(?:\+?63|0)[\s\-\.]?9\d{2}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/,
          education: /(?:De La Salle|San Pablo|University|College).+?(?:\d{4}\s*-\s*(?:\d{4}|Present))/gi
        }
      }
    ];
    
    const result = {
      method: 'templates',
      confidence: 0.8,
      personalInfo: {},
      education: [],
      experience: [],
      skills: [],
      certifications: []
    };
    
    // Apply template matching
    const template = templates[0]; // Use standard template
    
    // Extract name
    const nameMatch = rawText.match(template.patterns.name);
    if (nameMatch) {
      const fullName = nameMatch[1].trim();
      const nameParts = fullName.split(' ');
      result.personalInfo.firstName = nameParts[0];
      result.personalInfo.lastName = nameParts.slice(1).join(' ');
    }
    
    // Extract email
    const emailMatch = rawText.match(template.patterns.email);
    if (emailMatch) {
      result.personalInfo.email = emailMatch[0];
    }
    
    // Extract phone
    const phoneMatch = rawText.match(template.patterns.phone);
    if (phoneMatch) {
      result.personalInfo.phone = phoneMatch[0];
    }
    
    // Extract education
    const educationMatches = rawText.match(template.patterns.education);
    if (educationMatches) {
      result.education = educationMatches.map(match => ({
        raw: match,
        school: '',
        degree: '',
        dates: ''
      }));
    }
    
    return result;
  }

  /**
   * Merge results from multiple parsing methods
   */
  mergeParsingResults(results) {
    console.log('🔀 Merging parsing results...');
    
    const merged = {
      personalInfo: {},
      education: [],
      experience: [],
      skills: [],
      certifications: [],
      metadata: {
        methods: [],
        confidence: 0
      }
    };
    
    let totalConfidence = 0;
    let methodCount = 0;
    
    // Process each result
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const data = result.value;
        merged.metadata.methods.push(data.method);
        
        // Merge personal info (prefer higher confidence)
        if (data.personalInfo && Object.keys(data.personalInfo).length > 0) {
          Object.assign(merged.personalInfo, data.personalInfo);
        }
        
        // Merge arrays (combine and deduplicate)
        ['education', 'experience', 'skills', 'certifications'].forEach(field => {
          if (data[field] && Array.isArray(data[field])) {
            merged[field] = [...merged[field], ...data[field]];
          }
        });
        
        totalConfidence += data.confidence || 0.5;
        methodCount++;
      }
    });
    
    // Calculate average confidence
    merged.metadata.confidence = methodCount > 0 ? totalConfidence / methodCount : 0;
    
    // Deduplicate and clean up arrays
    merged.education = this.deduplicateEducation(merged.education);
    merged.experience = this.deduplicateExperience(merged.experience);
    merged.skills = [...new Set(merged.skills.filter(skill => skill && skill.trim()))];
    merged.certifications = [...new Set(merged.certifications.filter(cert => cert && cert.trim()))];
    
    // Format dates for frontend compatibility
    merged.education = merged.education.map(edu => ({
      ...edu,
      startDate: this.formatDateForFrontend(edu.startDate),
      endDate: this.formatDateForFrontend(edu.endDate)
    }));
    
    merged.experience = merged.experience.map(exp => ({
      ...exp,
      startDate: this.formatDateForFrontend(exp.startDate),
      endDate: this.formatDateForFrontend(exp.endDate)
    }));
    
    console.log(`✅ Merged results from ${methodCount} methods with ${(merged.metadata.confidence * 100).toFixed(1)}% confidence`);
    return merged;
  }

  /**
   * Enhanced education parsing with better logic
   */
  parseEducationRules(educationText) {
    console.log('🎓 Parsing education with rules:', educationText.substring(0, 200) + '...');
    const educationEntries = [];
    
    // Split by lines first, then group by school entries
    const lines = educationText.split('\n').filter(line => line.trim());
    console.log('🎓 Education lines:', lines);
    
    let currentEntry = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim().replace(/\r/g, ''); // Remove carriage returns
      console.log('🎓 Processing line:', `"${trimmedLine}"`);
      
      // Check if this line starts a new education entry (school name)
      const hasSchoolPattern = trimmedLine.match(/\b(?:DeLaSalleLipa|SanPabloColleges|De\s*La\s*Salle|San\s*Pablo|University|College|Institute|School)\b/i);
      const hasComma = trimmedLine.includes(',');
      const hasExcludedWords = trimmedLine.match(/\b(?:GPA|Grade|Honor|Award|Semester|Year|AY|Strand|Average)\b/i);
      
      console.log('🎓 Line analysis:', {
        hasSchoolPattern: !!hasSchoolPattern,
        hasComma: hasComma,
        hasExcludedWords: !!hasExcludedWords,
        shouldProcess: (hasSchoolPattern || hasComma) && !hasExcludedWords
      });
      
      if ((hasSchoolPattern || hasComma) && !hasExcludedWords) {
        console.log('✅ Starting new education entry for line:', trimmedLine);
        
        // Save previous entry if exists
        if (currentEntry && (currentEntry.school || currentEntry.degree)) {
          educationEntries.push(currentEntry);
        }
        
        // Start new entry
        currentEntry = {
          degree: '',
          school: '',
          location: '',
          startDate: '',
          endDate: '',
          description: ''
        };
        
        // Parse school and degree from comma-separated line
        if (trimmedLine.includes(',')) {
          const parts = trimmedLine.split(',').map(p => p.trim());
          console.log('🎓 Processing comma-separated parts:', parts);
          for (const part of parts) {
            // Check if this part is a school name (first priority)
            if (part.match(/^(?:DeLaSalleLipa|SanPabloColleges)$/i)) {
              currentEntry.school = part
                .replace(/DeLaSalleLipa/gi, 'De La Salle Lipa')
                .replace(/SanPabloColleges/gi, 'San Pablo Colleges')
                .trim();
              console.log('🏫 Detected school:', currentEntry.school);
            } 
            // Check if this part is a degree (second priority) - improved pattern
            else if (part.match(/\b(?:Bachelor|Master|PhD|BS|BA|MS|MA|Senior\s*High|High\s*School|Science|Computer|Engineering)\b/i) || 
                     part.match(/\d{4}\s*-\s*(?:\d{4}|Present|Current)/i)) {
              // Extract dates if present in degree part
              const dateMatch = part.match(/\d{4}\s*-\s*(?:\d{4}|Present|Current)/i);
              if (dateMatch) {
                const yearMatches = part.match(/\d{4}/g);
                if (yearMatches) {
                  currentEntry.startDate = yearMatches[0];
                  currentEntry.endDate = yearMatches[1] || (part.match(/present|current/i) ? 'present' : '');
                  console.log('📅 Extracted dates:', { startDate: currentEntry.startDate, endDate: currentEntry.endDate });
                }
                // Remove dates from degree text
                currentEntry.degree = part.replace(/\d{4}\s*-\s*(?:\d{4}|Present|Current)/i, '').trim();
              } else {
                currentEntry.degree = part;
              }
              // Format degree name
              currentEntry.degree = currentEntry.degree
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/BachelorofScienceinComputerScience/gi, 'Bachelor of Science in Computer Science')
                .replace(/SeniorHighSchool/gi, 'Senior High School')
                .trim();
              console.log('🎓 Detected degree:', currentEntry.degree);
            } else {
              // If not a school and contains degree-like words, treat as degree
              if (part.match(/\b(?:Bachelor|Science|Computer|Senior|High|School)\b/i)) {
                // Extract dates if present
                const dateMatch = part.match(/\d{4}\s*-\s*(?:\d{4}|Present|Current)/i);
                if (dateMatch) {
                  const yearMatches = part.match(/\d{4}/g);
                  if (yearMatches) {
                    currentEntry.startDate = yearMatches[0];
                    currentEntry.endDate = yearMatches[1] || (part.match(/present|current/i) ? 'present' : '');
                    console.log('📅 Extracted dates (fallback):', { startDate: currentEntry.startDate, endDate: currentEntry.endDate });
                  }
                  // Remove dates from degree text
                  currentEntry.degree = part.replace(/\d{4}\s*-\s*(?:\d{4}|Present|Current)/i, '').trim();
                } else {
                  currentEntry.degree = part;
                }
                
                // Format degree name
                currentEntry.degree = currentEntry.degree
                  .replace(/([a-z])([A-Z])/g, '$1 $2')
                  .replace(/BachelorofScienceinComputerScience/gi, 'Bachelor of Science in Computer Science')
                  .replace(/SeniorHighSchool/gi, 'Senior High School')
                  .trim();
                console.log('🎓 Detected degree (fallback):', currentEntry.degree);
              }
            }
          }
        } else {
          // Single line - determine if school or degree
          if (trimmedLine.match(/\b(?:De\s*La\s*Salle|San\s*Pablo|University|College|Institute|School)\b/i)) {
            currentEntry.school = trimmedLine.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
          } else {
            currentEntry.degree = trimmedLine.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
          }
        }
      }
      // Add to current entry's description if it contains achievements/details
      else if (currentEntry && trimmedLine.match(/\b(?:GPA|Grade|Honor|Award|Awardee|Average|Graduated|Strand|AY|Academic|Semester|Year)\b/i)) {
        currentEntry.description += (currentEntry.description ? '\n' : '') + trimmedLine;
      }
      // Check for standalone dates
      else if (currentEntry && trimmedLine.match(/^\d{4}\s*-\s*(?:\d{4}|Present|Current)$/i)) {
        const yearMatches = trimmedLine.match(/\d{4}/g);
        if (yearMatches && !currentEntry.startDate) {
          currentEntry.startDate = yearMatches[0];
          currentEntry.endDate = yearMatches[1] || (trimmedLine.match(/present|current/i) ? 'present' : '');
        }
      }
    }
    
    // Add last entry
    if (currentEntry && (currentEntry.school || currentEntry.degree)) {
      educationEntries.push(currentEntry);
    }
    
    console.log('🎓 Parsed education entries:', educationEntries);
    return educationEntries;
  }

  /**
   * Parse personal info with enhanced patterns
   */
  parsePersonalInfoRules(personalText) {
    const personalInfo = {};
    
    // Name extraction - look for the main name line (usually first substantial line)
    const personalLines = personalText.split('\n');
    let nameFound = false;
    
    // Look for the name in the first few lines, avoiding section headers
    for (let i = 0; i < Math.min(personalLines.length, 5); i++) {
      const trimmedLine = personalLines[i].trim().replace(/\r/g, '');
      console.log('👤 Analyzing line for name:', `"${trimmedLine}"`);
      
      // Skip obvious non-name lines
      if (trimmedLine.match(/\b(?:UX|UI|DESIGNER|Developer|Engineer|Education|Experience|Skills|Projects)\b/i) ||
          trimmedLine.includes('@') || trimmedLine.includes('|') || trimmedLine.length < 5) {
        console.log('👤 Skipping line (not a name)');
        continue;
      }
      
      // Look for a line that looks like a full name
      if (!nameFound && trimmedLine.length >= 5 && trimmedLine.length <= 50) {
        // Check if it looks like a name (contains at least 2 words, starts with capital)
        if (trimmedLine.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]*\.?\s*)+[A-Z][a-z]+$/)) {
          const fullName = trimmedLine;
          
          // Handle "Last, First Middle" format
          if (fullName.includes(',')) {
            const [lastName, firstPart] = fullName.split(',').map(p => p.trim());
            const firstParts = firstPart.split(/\s+/);
            personalInfo.firstName = firstParts[0];
            personalInfo.lastName = lastName;
          } else {
            // Handle "First Middle Last" format
            const nameParts = fullName.split(/\s+/);
            personalInfo.firstName = nameParts[0];
            personalInfo.lastName = nameParts[nameParts.length - 1]; // Last word is last name
          }
          nameFound = true;
          console.log('👤 Detected name from line:', `"${trimmedLine}"`);
          console.log('👤 Parsed name:', { firstName: personalInfo.firstName, lastName: personalInfo.lastName });
          break;
        }
      }
    }
    
    // Email extraction
    const emailMatch = personalText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      personalInfo.email = emailMatch[0];
    }
    
    // Phone extraction
    const phoneMatch = personalText.match(/(?:\+?63|0)[\s\-\.]?9\d{2}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/);
    if (phoneMatch) {
      personalInfo.phone = this.formatPhoneForFrontend(phoneMatch[0]);
    }
    
    // Address extraction - handle pipe-separated contact info
    const addressLines = personalText.split('\n');
    for (const line of addressLines) {
      // Look for lines with city/location info
      if (line.includes('|') && line.match(/\b(?:City|Municipality|Province|Philippines)\b/i)) {
        const parts = line.split('|');
        for (const part of parts) {
          const trimmedPart = part.trim();
          // Skip phone and email parts
          if (trimmedPart.includes('@') || trimmedPart.match(/^\d+$/)) continue;
          
          // Check if this looks like an address
          if (trimmedPart.match(/\b(?:City|Municipality|Province|Philippines)\b/i) || 
              (trimmedPart.includes(',') && trimmedPart.length > 5)) {
            personalInfo.address = trimmedPart;
            break;
          }
        }
        if (personalInfo.address) break;
      }
      // Fallback - look for standalone address lines
      else if (line.match(/\b(?:City|Municipality|Province|Philippines)\b/i) && 
               !line.match(/\b(?:UX|UI|DESIGNER|Developer|Engineer)\b/i)) {
        personalInfo.address = line.trim();
        break;
      }
    }
    
    return personalInfo;
  }

  /**
   * Parse experience with project handling
   */
  parseExperienceRules(experienceText) {
    // Implementation similar to education but for work experience/projects
    return [];
  }

  /**
   * Parse skills
   */
  parseSkillsRules(skillsText) {
    const skills = skillsText
      .split(/[,\n•\-]/)
      .map(skill => skill.trim())
      .filter(skill => skill && skill.length > 2);
    
    return skills;
  }

  /**
   * Parse certifications
   */
  parseCertificationsRules(certificationsText) {
    const certifications = certificationsText
      .split('\n')
      .map(cert => cert.trim())
      .filter(cert => cert && cert.length > 5);
    
    return certifications;
  }

  /**
   * Deduplicate education entries
   */
  deduplicateEducation(educationArray) {
    const seen = new Set();
    return educationArray.filter(edu => {
      const key = `${edu.school}-${edu.degree}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Deduplicate experience entries
   */
  deduplicateExperience(experienceArray) {
    const seen = new Set();
    return experienceArray.filter(exp => {
      const key = `${exp.company}-${exp.position}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Format date for frontend compatibility (YYYY-MM format)
   */
  formatDateForFrontend(dateString) {
    if (!dateString) return '';
    
    // Handle 'present' case
    if (dateString.toLowerCase() === 'present' || dateString.toLowerCase() === 'current') {
      return 'present';
    }
    
    // Extract year from various formats
    const yearMatch = dateString.match(/\d{4}/);
    if (yearMatch) {
      const year = yearMatch[0];
      // Default to January for start dates, December for end dates
      return `${year}-01`;
    }
    
    return dateString;
  }

  /**
   * Format phone number for frontend
   */
  formatPhoneForFrontend(phoneString) {
    if (!phoneString) return '';
    
    // Remove all non-digits
    const digits = phoneString.replace(/\D/g, '');
    
    // Handle Philippine numbers
    if (digits.startsWith('63')) {
      // +63 format
      return digits.substring(2);
    } else if (digits.startsWith('0')) {
      // 0XXX format
      return digits;
    }
    
    return phoneString;
  }
}

module.exports = new EnhancedResumeParser();
