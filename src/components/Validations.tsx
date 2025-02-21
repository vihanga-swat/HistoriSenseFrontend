export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };
  
  export const confirmPasswordMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  };
  
  export const validateFullName = (fullName: string): boolean => {
    // Simple validation: Full name should not be empty and should have at least two words
    return fullName.trim().split(' ').length >= 2;
  };
  
  export const validateUserType = (userType: string): boolean => {
    // Assuming userType is not empty and is one of the predefined types
    return !!userType && ['individual', 'museum'].includes(userType);
  };
  
  export const validateTerms = (agreeToTerms: boolean): boolean => {
    return agreeToTerms === true;
  };