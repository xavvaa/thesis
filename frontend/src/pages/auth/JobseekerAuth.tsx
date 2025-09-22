"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import styles from "./AuthPage.module.css"
import RoleAgreementModal, { type UserRole } from "../../components/RoleAgreementModal"
import TermsModal from "../../components/TermsModal"
import SuccessModal from '../../components/SuccessModal'
import ResumeEditModal from '../../components/ResumeEditModal/ResumeEditModal'
import { FormErrors, JobseekerFormData } from "./shared/authTypes"
import { validateEmail, validatePassword, validateName, validateConfirmPassword } from "./shared/authValidation"
import firebaseAuthService from "../../services/firebaseAuthService"
import { apiService } from "../../services/apiService"


const JobseekerAuth: React.FC = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showAgreement, setShowAgreement] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loginErrors, setLoginErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [fieldTouched, setFieldTouched] = useState<{ [key: string]: boolean }>({})
  const [realTimeErrors, setRealTimeErrors] = useState<FormErrors>({})
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showResumeEditModal, setShowResumeEditModal] = useState(false)
  const [parsedResumeData, setParsedResumeData] = useState(null)

  const [formData, setFormData] = useState<JobseekerFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    middleName: "",
  })

  useEffect(() => {
    // No need to load Google OAuth script as Firebase handles this
  }, [])

  const handleGoogleSignIn = async (role: string, isLogin: boolean) => {
    setIsUploading(true)
    try {
      // For registration, we need to handle the fact that Google OAuth will create a Firebase account
      // even if the email already exists with email/password provider
      if (!isLogin) {
        const response = await firebaseAuthService.signInWithGoogle("jobseeker")
        
        if (response.success && response.user) {
          // Check if this email is already registered in our backend
          const emailCheck = await apiService.checkEmailExists(response.user.email!, 'jobseeker')
          
          // If account exists in backend, this means user previously registered with email/password
          if (emailCheck.data?.exists) {
            // Delete the newly created Google provider account from Firebase
            try {
              await response.user.delete()
            } catch (deleteError) {
              console.error('Failed to delete Google account:', deleteError)
              // If we can't delete, at least sign out
              await firebaseAuthService.signOut()
            }
            
            if (emailCheck.data.crossRoleConflict) {
              setErrors(prev => ({ 
                ...prev, 
                general: `This email is already registered as an ${emailCheck.data.user.role}. Each email can only be used for one role. Please use a different email or login with the existing ${emailCheck.data.user.role} account.` 
              }))
              return
            }
            
            const userData = emailCheck.data?.user || emailCheck.data
            if (userData?.emailVerified) {
              setErrors(prev => ({ 
                ...prev, 
                general: "An account with this email already exists. Please login with your email and password instead." 
              }))
            } else {
              setErrors(prev => ({ 
                ...prev, 
                general: "An account with this email exists but is not verified. Please check your email for the verification link or try logging in with your email and password." 
              }))
            }
            return
          }
          
          // Create user profile in backend for new Google account
          const profileResponse = await apiService.createUserProfile({
            uid: response.user.uid,
            email: response.user.email!,
            role: "jobseeker",
            firstName: response.user.displayName?.split(' ')[0] || '',
            lastName: response.user.displayName?.split(' ').slice(1).join(' ') || '',
            emailVerified: response.user.emailVerified
          })
          
          if (!profileResponse.success) {
            // Delete the Firebase account if backend profile creation fails
            try {
              await response.user.delete()
            } catch (deleteError) {
              await firebaseAuthService.signOut()
            }
            throw new Error(profileResponse.error || "Failed to create user profile")
          }
          
          // Redirect to email verification page if not verified, otherwise to dashboard
          if (!response.user.emailVerified) {
            navigate(`/auth/verify-email?email=${encodeURIComponent(response.user.email!)}&role=jobseeker`)
          } else {
            navigate('/jobseeker/dashboard')
          }
        } else {
          throw new Error(response.error || "Failed to sign up with Google")
        }
      } else {
        // For login, check role conflicts first
        const tempResponse = await firebaseAuthService.signInWithGoogle("jobseeker")
        
        if (tempResponse.success && tempResponse.user) {
          // Check if this email has role conflicts
          const emailCheck = await apiService.checkEmailExists(tempResponse.user.email!, 'jobseeker')
          
          if (emailCheck.success && emailCheck.data.exists && emailCheck.data.crossRoleConflict) {
            await firebaseAuthService.signOut()
            setErrors(prev => ({ 
              ...prev, 
              general: `This Google email is registered as an ${emailCheck.data.user.role}. Please use the ${emailCheck.data.user.role} login page or use a different email.` 
            }))
            return
          }
          
          // Check if user is verified and redirect accordingly
          if (!tempResponse.user.emailVerified) {
            // Don't sign out, redirect to email verification page
            navigate(`/auth/verify-email?email=${encodeURIComponent(tempResponse.user.email!)}&role=jobseeker`)
            return
          }
          
          // Navigate to dashboard
          navigate("/jobseeker/dashboard")
        } else {
          setErrors(prev => ({ 
            ...prev, 
            general: tempResponse.error || "Google sign-in failed. Please try again." 
          }))
        }
      }
    } catch (error: any) {
      console.error("Google authentication error:", error)
      setErrors(prev => ({ ...prev, general: error.message || "Google authentication failed. Please try again." }))
    } finally {
      setIsUploading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else {
      const emailError = validateEmail(formData.email)
      if (emailError) {
        newErrors.email = emailError
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else {
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        newErrors.password = passwordError
      }
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = "First name is required"
      } else {
        const firstNameError = validateName(formData.firstName)
        if (firstNameError) {
          newErrors.firstName = firstNameError
        }
      }

      if (!formData.lastName) {
        newErrors.lastName = "Last name is required"
      } else {
        const lastNameError = validateName(formData.lastName)
        if (lastNameError) {
          newErrors.lastName = lastNameError
        }
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }

      // Resume is now optional - no validation required

      if (!termsAccepted) {
        newErrors.terms = "You must accept the terms and conditions"
      }

      if (!privacyAccepted) {
        newErrors.privacy = "You must accept the privacy policy"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateField = (fieldName: string, value: string) => {
    const newRealTimeErrors = { ...realTimeErrors }
    
    switch (fieldName) {
      case 'email':
        const emailError = validateEmail(value)
        if (emailError) {
          newRealTimeErrors.email = emailError
        } else {
          delete newRealTimeErrors.email
        }
        break
      case 'password':
        const passwordError = validatePassword(value)
        if (passwordError) {
          newRealTimeErrors.password = passwordError
        } else {
          delete newRealTimeErrors.password
        }
        break
      case 'firstName':
        const firstNameError = validateName(value)
        if (firstNameError) {
          newRealTimeErrors.firstName = firstNameError
        } else {
          delete newRealTimeErrors.firstName
        }
        break
      case 'lastName':
        const lastNameError = validateName(value)
        if (lastNameError) {
          newRealTimeErrors.lastName = lastNameError
        } else {
          delete newRealTimeErrors.lastName
        }
        break
      case 'confirmPassword':
        const confirmPasswordError = validateConfirmPassword(formData.password, value)
        if (confirmPasswordError) {
          newRealTimeErrors.confirmPassword = confirmPasswordError
        } else {
          delete newRealTimeErrors.confirmPassword
        }
        break
    }
    
    setRealTimeErrors(newRealTimeErrors)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Clear real-time errors when user starts typing
    if (realTimeErrors[name as keyof FormErrors]) {
      setRealTimeErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Real-time validation while typing
    setFieldTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFieldTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, resume: "Please upload only PDF files." }))
        e.target.value = ""
        return
      }

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setErrors(prev => ({ ...prev, resume: "Please upload only PDF files." }))
        e.target.value = ""
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, resume: "File size must be less than 10MB for optimal OCR processing." }))
        e.target.value = ""
        return
      }

      setResumeFile(file)
      setErrors(prev => ({ ...prev, resume: undefined }))
      setSuccessMessage("Resume uploaded successfully!")
    }
  }

  const handleFileUpload = async () => {
    if (!resumeFile) return

    setIsUploading(true)
    try {
      console.log("Uploading resume to backend:", resumeFile.name)

      const response = await apiService.uploadResume(resumeFile)
      
      if (response.success) {
        console.log("Resume uploaded successfully:", response.data)
        
        // If resume data was parsed, show edit modal
        if (response.data.resumeData) {
          setParsedResumeData(response.data.resumeData)
          setShowResumeEditModal(true)
          setSuccessMessage("Resume uploaded! Please review the extracted information.")
        } else {
          setSuccessMessage("Resume uploaded successfully!")
        }
        
        return response.data // Return the upload result for use in registration
      } else {
        throw new Error(response.error || "Failed to upload resume")
      }
    } catch (error: any) {
      console.error("Resume upload failed:", error)
      setErrors(prev => ({ ...prev, resume: error.message || "Failed to upload resume. Please try again." }))
      throw error // Re-throw to handle in registration flow
    } finally {
      setIsUploading(false)
    }
  }

  const validateLoginForm = () => {
    const newErrors: FormErrors = {}
    
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else {
      const emailError = validateEmail(formData.email)
      if (emailError) {
        newErrors.email = emailError
      }
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLoginForm()) return
    
    setIsUploading(true)
    try {
      // Check if email exists and validate role before attempting login
      const emailCheck = await apiService.checkEmailExists(formData.email, 'jobseeker')
      
      if (emailCheck.success && emailCheck.data.exists) {
        if (emailCheck.data.crossRoleConflict) {
          setErrors(prev => ({ 
            ...prev, 
            general: `This email is registered as an ${emailCheck.data.user.role}. Please use the ${emailCheck.data.user.role} login page or use a different email.` 
          }))
          return
        }
      }
      
      const response = await firebaseAuthService.signInWithEmailPassword(
        formData.email, 
        formData.password
      )
      
      if (response.success && response.user) {
        // Check if user is verified before allowing login
        if (!response.user.emailVerified) {
          await firebaseAuthService.signOut()
          setErrors(prev => ({ 
            ...prev, 
            general: "Please verify your email before logging in. Check your inbox for the verification link." 
          }))
          return
        }
        
        // Navigate to dashboard
        navigate("/jobseeker/dashboard")
      } else {
        setErrors(prev => ({ 
          ...prev, 
          general: response.error || "Login failed. Please try again." 
        }))
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setErrors(prev => ({ 
        ...prev, 
        general: error.message || "Login failed. Please try again." 
      }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleLoginSuccessModalClose = () => {
    setShowSuccessModal(false)
    navigate("/jobseeker/dashboard")
  }

  const handleBasicRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsUploading(true)
    try {
      // Check if email already exists (with role-based conflict detection)
      const emailCheck = await apiService.checkEmailExists(formData.email, 'jobseeker')
      
      if (emailCheck.success && emailCheck.data.exists) {
        if (emailCheck.data.crossRoleConflict) {
          throw new Error(`This email is already registered as an ${emailCheck.data.user.role}. Each email can only be used for one role. Please use a different email or login with the existing ${emailCheck.data.user.role} account.`)
        }
        
        if (emailCheck.data.emailVerified) {
          throw new Error("An account with this email already exists. Please login instead.")
        } else {
          throw new Error("An account with this email exists but is not verified. Please check your email for verification link or try logging in.")
        }
      }

      // Create Firebase user only if email doesn't exist
      const firebaseResponse = await firebaseAuthService.registerWithEmailPassword(
        formData.email, 
        formData.password,
        {
          role: 'jobseeker',
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          emailVerified: false
        }
      )
      
      if (!firebaseResponse.success || !firebaseResponse.user) {
        throw new Error(firebaseResponse.error || "Failed to create account")
      }

      // Create user profile in backend
      const profileResponse = await apiService.createUserProfile({
        uid: firebaseResponse.user.uid,
        email: formData.email,
        role: "jobseeker",
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        emailVerified: false
      })
      
      if (!profileResponse.success) {
        throw new Error(profileResponse.error || "Failed to create user profile")
      }

      // Upload resume if provided (optional) - now that user is authenticated
      if (resumeFile) {
        try {
          await handleFileUpload()
          console.log("Resume uploaded successfully during registration")
        } catch (resumeError) {
          // Don't fail registration if resume upload fails - user can upload later
          console.warn("Resume upload failed during registration:", resumeError)
          setSuccessMessage("Account created successfully! Resume upload failed, but you can upload it later from your dashboard.")
        }
      }
      
      // Redirect to email verification page
      navigate(`/auth/verify-email?email=${encodeURIComponent(formData.email)}&role=jobseeker`)
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // If Firebase throws "email already in use" error, show a more helpful message
      let errorMessage = error.message || 'Registration failed. Please try again.'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please login instead or use a different email address.'
      }
      
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
    } finally {
      setIsUploading(false);
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    navigate("/jobseeker/dashboard")
  }

  const handleResumeEditSave = async (editedResumeData: any) => {
    try {
      // Save the edited resume data to backend
      const response = await apiService.post('/jobseekers/resume-data', {
        resumeData: editedResumeData
      })
      
      if (response.success) {
        setShowResumeEditModal(false)
        setSuccessMessage("Resume data saved successfully!")
        setParsedResumeData(editedResumeData)
      } else {
        throw new Error(response.error || "Failed to save resume data")
      }
    } catch (error: any) {
      console.error("Failed to save resume data:", error)
      setErrors(prev => ({ ...prev, resume: error.message || "Failed to save resume data. Please try again." }))
    }
  }

  const handleResumeEditClose = () => {
    setShowResumeEditModal(false)
    // Keep the original parsed data if user cancels
  }

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.leftPanel}>
          <div className={styles.visualContent}>
            <div className={styles.logoContainer}>
              <img src="/peso-logo.png" alt="PESO Logo" className={styles.pesoLogo} />
            </div>
            <div className={styles.journeyText}>
              <h2>Start Your Journey with Us</h2>
              <p>Upload your PDF resume for AI-powered job matching with OCR technology</p>
            </div>
            <div className={styles.decorativeCircle1}></div>
            <div className={styles.decorativeCircle2}></div>
            <div className={styles.decorativeCircle3}></div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {errors.general && (
              <div className={styles.errorMessage}>
                <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </div>
            )}

            {successMessage && (
              <div className={styles.successMessage}>
                <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </div>
            )}

            <div className={styles.roleIndicator}>
              <div className={styles.roleInfo}>
                <div className={styles.roleIcon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className={styles.roleText}>
                  <span className={styles.roleLabel}>Signing up as</span>
                  <span className={styles.roleName}>Job Seeker</span>
                </div>
              </div>
              <button type="button" className={styles.changeRoleButton} onClick={() => window.location.href = "/"}>
                Change Role
              </button>
            </div>




            {isLogin ? (
              <form onSubmit={handleLogin} className={styles.form}>
                <h1 className={styles.formTitle}>Welcome Back</h1>
                <p className={styles.formSubtitle}>Welcome back! Please enter your details.</p>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${errors.email ? styles.error : ""}`}
                      placeholder="Enter your email"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.emailIcon}`}>📧</span>
                  </div>
                  {(errors.email || realTimeErrors.email) && (
                    <div className={styles.inputError}>
                      {errors.email || realTimeErrors.email}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Password</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${styles.hasEyeButton} ${errors.password ? styles.error : ""}`}
                      placeholder="Enter your password"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.passwordIcon}`}>🔒</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.eyeButton}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {(errors.password || realTimeErrors.password) && (
                    <div className={styles.inputError}>
                      {errors.password || realTimeErrors.password}
                    </div>
                  )}
                  {isLogin && (
                    <div className={styles.forgotPasswordContainer}>
                      <Link to="/auth/forgot-password" className={styles.forgotPasswordLink}>
                        Forgot Password?
                      </Link>
                    </div>
                  )}
                </div>

                <button type="submit" className={styles.primaryButton} disabled={isUploading}>
                  {isUploading ? "Signing In..." : "Sign In"}
                </button>

                <button type="button" onClick={() => handleGoogleSignIn("jobseeker", true)} className={styles.googleButton}>
                  Sign in with Google
                </button>

                <div className={styles.authToggle}>
                  <span>Don't have an account? </span>
                  <button type="button" onClick={() => {
                    setIsLogin(false)
                    setErrors({})
                    setRealTimeErrors({})
                  }} className={styles.toggleLink}>
                    Sign up
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBasicRegistration} className={styles.form}>
                <h1 className={styles.formTitle}>Get Started Now</h1>
                <p className={styles.formSubtitle}>
                  Upload your PDF resume and let our OCR technology extract your skills for personalized job matching.
                </p>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Last Name</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${errors.lastName ? styles.error : ""}`}
                      placeholder="Enter your last name"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.nameIcon}`}>👤</span>
                  </div>
                  {(errors.lastName || realTimeErrors.lastName) && (
                    <div className={styles.inputError}>
                      {errors.lastName || realTimeErrors.lastName}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>First Name</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${errors.firstName ? styles.error : ""}`}
                      placeholder="Enter your first name"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.nameIcon}`}>👤</span>
                  </div>
                  {(errors.firstName || realTimeErrors.firstName) && (
                    <div className={styles.inputError}>
                      {errors.firstName || realTimeErrors.firstName}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Middle Name</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${errors.middleName ? styles.error : ""}`}
                      placeholder="Enter your middle name (optional)"
                    />
                    <span className={`${styles.inputIcon} ${styles.nameIcon}`}>👤</span>
                  </div>
                  {(errors.middleName || realTimeErrors.middleName) && (
                    <div className={styles.inputError}>
                      {errors.middleName || realTimeErrors.middleName}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${errors.email ? styles.error : ""}`}
                      placeholder="Enter your email"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.emailIcon}`}>📧</span>
                  </div>
                  {(errors.email || realTimeErrors.email) && (
                    <div className={styles.inputError}>
                      {errors.email || realTimeErrors.email}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Password</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${styles.hasEyeButton} ${errors.password ? styles.error : ""}`}
                      placeholder="Enter your password"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.passwordIcon}`}>🔒</span>
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {(errors.password || realTimeErrors.password) && (
                    <div className={styles.inputError}>
                      {errors.password || realTimeErrors.password}
                    </div>
                  )}
                  {isLogin && (
                    <div className={styles.forgotPasswordContainer}>
                      <Link to="/auth/forgot-password" className={styles.forgotPasswordLink}>
                        Forgot Password?
                      </Link>
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Confirm Password</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${styles.hasEyeButton} ${errors.confirmPassword ? styles.error : ""}`}
                      placeholder="Confirm your password"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.passwordIcon}`}>🔒</span>
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {(errors.confirmPassword || realTimeErrors.confirmPassword) && (
                    <div className={styles.inputError}>
                      {errors.confirmPassword || realTimeErrors.confirmPassword}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Upload Resume (PDF Only) - Optional</label>
                  <p className={styles.documentDescription}>
                    Optionally upload your PDF resume for OCR processing and AI-powered job matching. You can skip this step and add your resume later in your dashboard.
                  </p>
                  <label className={styles.uploadLabel}>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                    <div className={`${styles.uploadArea} ${resumeFile ? styles.success : ""} ${errors.resume ? styles.error : ""}`}>
                      <div className={styles.uploadIcon}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                        </svg>
                      </div>
                      <div className={styles.uploadText}>
                        <span className={styles.uploadMainText}>
                          {resumeFile ? resumeFile.name : "Choose PDF Resume"}
                        </span>
                        <span className={styles.uploadHint}>PDF files only - OCR will extract your information</span>
                      </div>
                    </div>
                  </label>
                  {errors.resume && <div className={styles.inputError}>{errors.resume}</div>}
                </div>

                <div className={styles.termsSection}>
                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <label htmlFor="termsAccepted" className={styles.checkboxLabel}>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className={styles.linkButton}
                      >
                        Terms and Conditions
                      </button>
                    </label>
                  </div>
                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="privacyAccepted"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <label htmlFor="privacyAccepted" className={styles.checkboxLabel}>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className={styles.linkButton}
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles.primaryButton} 
                  disabled={isUploading}
                >
                  {isUploading && <div className={styles.loadingSpinner}></div>}
                  {isUploading ? "Creating Account..." : "Create Account"}
                </button>

                <button type="button" onClick={() => handleGoogleSignIn("jobseeker", false)} className={styles.googleButton}>
                  Sign up with Google
                </button>

                <div className={styles.authToggle}>
                  <span>Already have an account? </span>
                  <button type="button" onClick={() => {
                    setIsLogin(true)
                    setErrors({})
                    setRealTimeErrors({})
                  }} className={styles.toggleLink}>
                    Sign in
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>


      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setTermsAccepted(true)
          setShowTermsModal(false)
        }}
        type="terms"
        userRole="jobseeker"
      />

      <TermsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => {
          setPrivacyAccepted(true)
          setShowPrivacyModal(false)
        }}
        type="privacy"
        userRole="jobseeker"
      />
    </div>
  )
}

export default JobseekerAuth
