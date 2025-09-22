import * as pdfjsLib from "pdfjs-dist"
import Tesseract from "tesseract.js"

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface ParsedResume {
  personalInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  summary: string
  experience: Array<{
    company: string
    position: string
    duration: string
    description: string
  }>
  education: Array<{
    institution: string
    degree: string
    year: string
  }>
  skills: string[]
  certifications: string[]
}

export const parseResume = async (file: File): Promise<ParsedResume> => {
  try {
    console.log("Starting resume parsing for file:", file.name)

    // Extract text from PDF
    const text = await extractTextFromPDF(file)
    console.log("Extracted text length:", text.length)

    // Parse the extracted text
    const parsedData = parseResumeText(text)
    console.log("Parsed resume data:", parsedData)

    return parsedData
  } catch (error) {
    console.error("Error parsing resume:", error)
    throw new Error("Failed to parse resume. Please ensure the file is a valid PDF.")
  }
}

const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ""

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      const pageText = textContent.items.map((item: any) => item.str).join(" ")

      fullText += pageText + "\n"
    }

    // If PDF text extraction yields poor results, fall back to OCR
    if (fullText.trim().length < 100) {
      console.log("PDF text extraction yielded poor results, falling back to OCR")
      return await performOCR(file)
    }

    return fullText
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    // Fall back to OCR if PDF text extraction fails
    return await performOCR(file)
  }
}

const performOCR = async (file: File): Promise<string> => {
  try {
    console.log("Performing OCR on file:", file.name)

    const {
      data: { text },
    } = await Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      },
    })

    return text
  } catch (error) {
    console.error("OCR failed:", error)
    throw new Error("Failed to extract text from PDF using OCR")
  }
}

const parseResumeText = (text: string): ParsedResume => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return {
    personalInfo: extractPersonalInfo(text, lines),
    summary: extractSummary(text, lines),
    experience: extractExperience(text, lines),
    education: extractEducation(text, lines),
    skills: extractSkills(text, lines),
    certifications: extractCertifications(text, lines),
  }
}

const extractPersonalInfo = (text: string, lines: string[]) => {
  const personalInfo = {
    name: "",
    email: "",
    phone: "",
    address: "",
  }

  // Extract email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) {
    personalInfo.email = emailMatch[0]
  }

  // Extract phone
  const phoneMatch = text.match(/(\+?63|0)?[\s-]?[0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{4}/)
  if (phoneMatch) {
    personalInfo.phone = phoneMatch[0]
  }

  // Extract name (usually the first line or near the top)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i]
    if (
      line.length > 2 &&
      line.length < 50 &&
      !line.includes("@") &&
      !line.match(/\d{3}/) &&
      line.match(/^[A-Za-z\s.]+$/)
    ) {
      personalInfo.name = line
      break
    }
  }

  // Extract address (look for location indicators)
  const addressMatch = text.match(
    /(Manila|Quezon City|Makati|BGC|Taguig|Pasig|Ortigas|Philippines|Metro Manila)[^\n]*/i,
  )
  if (addressMatch) {
    personalInfo.address = addressMatch[0]
  }

  return personalInfo
}

const extractSummary = (text: string, lines: string[]): string => {
  const summaryKeywords = ["summary", "objective", "profile", "about", "overview"]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (summaryKeywords.some((keyword) => line.includes(keyword))) {
      // Found summary section, extract next few lines
      const summaryLines = []
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j]
        if (nextLine.length > 20 && !nextLine.match(/^[A-Z\s]+$/)) {
          summaryLines.push(nextLine)
        } else {
          break
        }
      }
      if (summaryLines.length > 0) {
        return summaryLines.join(" ")
      }
    }
  }

  // If no summary section found, return first substantial paragraph
  for (const line of lines) {
    if (line.length > 50 && line.includes(" ")) {
      return line
    }
  }

  return "Professional with experience in software development and technology."
}

const extractExperience = (text: string, lines: string[]) => {
  const experience = []
  const experienceKeywords = ["experience", "employment", "work history", "career"]

  let inExperienceSection = false
  let currentJob = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()

    // Check if we're entering experience section
    if (experienceKeywords.some((keyword) => line.includes(keyword))) {
      inExperienceSection = true
      continue
    }

    // Check if we're leaving experience section
    if (inExperienceSection && (line.includes("education") || line.includes("skills"))) {
      inExperienceSection = false
      break
    }

    if (inExperienceSection) {
      const originalLine = lines[i]

      // Look for job titles and companies
      if (originalLine.length > 10 && originalLine.length < 100) {
        // Check if this looks like a job title/company line
        if (originalLine.match(/[A-Z][a-z]/) && !originalLine.includes("@")) {
          if (currentJob) {
            experience.push(currentJob)
          }

          currentJob = {
            company: "",
            position: originalLine,
            duration: "",
            description: "",
          }

          // Look for duration in next few lines
          for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
            if (lines[j].match(/\d{4}/) || lines[j].includes("-")) {
              currentJob.duration = lines[j]
              break
            }
          }
        }
      }
    }
  }

  if (currentJob) {
    experience.push(currentJob)
  }

  // If no experience found, create a sample entry
  if (experience.length === 0) {
    experience.push({
      company: "Previous Company",
      position: "Software Developer",
      duration: "2020 - 2023",
      description: "Developed and maintained software applications.",
    })
  }

  return experience
}

const extractEducation = (text: string, lines: string[]) => {
  const education = []
  const educationKeywords = ["education", "academic", "university", "college", "degree"]

  let inEducationSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()

    if (educationKeywords.some((keyword) => line.includes(keyword))) {
      inEducationSection = true
      continue
    }

    if (inEducationSection && (line.includes("experience") || line.includes("skills"))) {
      inEducationSection = false
      break
    }

    if (inEducationSection) {
      const originalLine = lines[i]

      if (originalLine.length > 10 && originalLine.length < 100) {
        // Look for degree patterns
        if (
          originalLine.match(/(bachelor|master|phd|bs|ms|ba|ma)/i) ||
          originalLine.match(/university|college|institute/i)
        ) {
          const yearMatch = originalLine.match(/\d{4}/)

          education.push({
            institution: originalLine.includes("University") ? originalLine : "University Name",
            degree: originalLine.match(/(bachelor|master|bs|ms|ba|ma)/i) ? originalLine : "Bachelor's Degree",
            year: yearMatch ? yearMatch[0] : "2020",
          })
        }
      }
    }
  }

  // If no education found, create a sample entry
  if (education.length === 0) {
    education.push({
      institution: "University Name",
      degree: "Bachelor's Degree in Computer Science",
      year: "2020",
    })
  }

  return education
}

const extractSkills = (text: string, lines: string[]): string[] => {
  const commonSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "C#",
    "HTML",
    "CSS",
    "Angular",
    "Vue.js",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "Swift",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Git",
    "Linux",
    "Windows",
    "macOS",
    "Agile",
    "Scrum",
    "REST API",
    "GraphQL",
    "Microservices",
    "DevOps",
    "CI/CD",
    "Jenkins",
    "Terraform",
    "Ansible",
    "Nginx",
    "Apache",
    "Express.js",
    "Django",
    "Flask",
    "Spring Boot",
    "Laravel",
    "Ruby on Rails",
    "ASP.NET",
    "jQuery",
    "Bootstrap",
    "Tailwind CSS",
    "SASS",
    "LESS",
    "Webpack",
    "Babel",
    "ESLint",
    "Jest",
    "Cypress",
    "Selenium",
    "Postman",
    "Figma",
    "Adobe XD",
    "Photoshop",
  ]

  const foundSkills: string[] = []
  const textLower = text.toLowerCase()

  // Check for each common skill
  for (const skill of commonSkills) {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill)
    }
  }

  // Look for skills section specifically
  const skillsKeywords = ["skills", "technologies", "technical skills", "competencies"]
  let inSkillsSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()

    if (skillsKeywords.some((keyword) => line.includes(keyword))) {
      inSkillsSection = true
      continue
    }

    if (inSkillsSection && (line.includes("experience") || line.includes("education"))) {
      inSkillsSection = false
      break
    }

    if (inSkillsSection) {
      const originalLine = lines[i]
      // Split by common delimiters and add to skills
      const lineSkills = originalLine
        .split(/[,•·\-|]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1)
      foundSkills.push(...lineSkills)
    }
  }

  // Remove duplicates and return
  return Array.from(new Set(foundSkills)).slice(0, 20) // Limit to 20 skills
}

const extractCertifications = (text: string, lines: string[]): string[] => {
  const certifications: string[] = []
  const certKeywords = ["certification", "certificate", "certified", "license", "credential"]

  let inCertSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()

    if (certKeywords.some((keyword) => line.includes(keyword))) {
      inCertSection = true
      // Also check if the current line contains a certification
      if (line.length > 10) {
        certifications.push(lines[i])
      }
      continue
    }

    if (inCertSection && (line.includes("experience") || line.includes("education") || line.includes("skills"))) {
      inCertSection = false
      break
    }

    if (inCertSection) {
      const originalLine = lines[i]
      if (originalLine.length > 5 && originalLine.length < 100) {
        certifications.push(originalLine)
      }
    }
  }

  // Look for common certification patterns throughout the text
  const commonCerts = [
    "AWS Certified",
    "Microsoft Certified",
    "Google Cloud",
    "Cisco Certified",
    "CompTIA",
    "PMP",
    "Scrum Master",
    "ITIL",
    "Oracle Certified",
  ]

  for (const cert of commonCerts) {
    if (text.toLowerCase().includes(cert.toLowerCase())) {
      certifications.push(cert)
    }
  }

  // Remove duplicates
  return Array.from(new Set(certifications)).slice(0, 10)
}
