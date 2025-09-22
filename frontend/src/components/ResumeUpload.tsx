"use client"

import type React from "react"
import { useState, useRef } from "react"
import styles from "./ResumeUpload.module.css"

interface ResumeUploadProps {
  onUpload: (file: File) => void
  isUploading?: boolean
  uploadProgress?: number
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload, isUploading = false, uploadProgress = 0 }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (file.type !== "application/pdf") {
      return "Please upload a PDF file only."
    }

    // Check file size (5MB limit to match backend)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return "File size must be less than 5MB."
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    onUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={styles.uploadContainer}>
      <div
        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ""} ${isUploading ? styles.uploading : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          className={styles.hiddenInput}
        />

        <div className={styles.uploadContent}>
          {isUploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.spinner}></div>
              <h3>Processing Resume...</h3>
              <p>Extracting text and analyzing content</p>
              {uploadProgress > 0 && (
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <span className={styles.progressText}>{uploadProgress}%</span>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.uploadPrompt}>
              <div className={styles.uploadIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <h3>Upload Your Resume</h3>
              <p>Drag and drop your PDF resume here, or click to browse</p>
              <div className={styles.fileRequirements}>
                <span>• PDF format only</span>
                <span>• Maximum 5MB</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}

export default ResumeUpload
