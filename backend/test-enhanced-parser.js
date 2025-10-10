/**
 * Test script for enhanced resume parser
 */

const enhancedResumeParser = require('./services/enhancedResumeParser');

// Test education parsing with sample data
const testEducationText = `DeLaSalleLipa,BachelorofScienceinComputerScience 2022-Present
SecondHonorAwardee(GPA:3.53),3rdYear-FirstSemester,AY2024-2025
SanPabloColleges,SeniorHighSchool 2020-2022
Strand:Science,Technology,Engineering,andMathematics(STEM)
GraduatedwithHonor(GeneralAverage:93.75)`;

console.log('🧪 Testing enhanced parser education parsing...');
const result = enhancedResumeParser.parseEducationRules(testEducationText);
console.log('🎓 Test result:', result);

// Test personal info parsing
const testPersonalText = `Hannah Nicole L. Comia
UX DESIGNER
San Pablo City, Laguna | 09610720526 | hannahnicolecomia16@gmail.com
LinkedIn: www.linkedin.com/in/hannah-nicole-comia | GitHub: github.com/xaviaa`;

console.log('\n👤 Testing personal info parsing...');
const personalResult = enhancedResumeParser.parsePersonalInfoRules(testPersonalText);
console.log('👤 Personal info result:', personalResult);
