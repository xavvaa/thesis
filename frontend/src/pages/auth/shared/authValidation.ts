export const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return "Please enter a valid email address"
  return undefined
}

export const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters long"
  // Simplified password validation - only require length
  return undefined
}

export const validateName = (name: string): string | undefined => {
  if (!name) return "Name is required"
  if (name.length < 2) return "Name must be at least 2 characters long"
  if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces"
  return undefined
}

export const validateCompanyName = (name: string): string | undefined => {
  if (!name) return "Company name is required"
  if (name.length < 2) return "Company name must be at least 2 characters long"
  return undefined
}

export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) return "Please confirm your password"
  if (password !== confirmPassword) return "Passwords do not match"
  return undefined
}
