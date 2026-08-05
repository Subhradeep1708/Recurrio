export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const validateEmail = (value: string) => {
  const email = normalizeEmail(value);

  if (!email) {
    return 'Enter your email address';
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return 'Enter a valid email address';
  }

  return '';
};

export const validatePassword = (value: string) => {
  if (!value) {
    return 'Create a password';
  }

  if (value.length < 8) {
    return 'Use at least 8 characters';
  }

  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Use at least one letter and one number';
  }

  return '';
};

export const validateConfirmationCode = (value: string) => {
  if (!value) {
    return 'Enter the verification code';
  }

  if (!/^\d{6}$/.test(value)) {
    return 'Enter the 6-digit code we sent you';
  }

  return '';
};

export const getAuthErrorMessage = (error: unknown) => {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  if (typeof error === 'object' && error !== null && 'errors' in error) {
    const firstError = (error as { errors?: Array<{ longMessage?: string; message?: string }> }).errors?.[0];

    if (firstError?.longMessage) {
      return firstError.longMessage;
    }

    if (firstError?.message) {
      return firstError.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

export const passwordRequirements = [
  'At least 8 characters',
  'At least one letter',
  'At least one number',
] as const;