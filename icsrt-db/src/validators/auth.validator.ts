export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && re.test(email.trim());
}

export function validatePassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 6;
}

export function validateSignupPayload(body: any) {
  const errors: string[] = [];
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Name is required');
  }
  if (!validateEmail(body.email)) {
    errors.push('A valid email address is required');
  }
  if (!validatePassword(body.password)) {
    errors.push('Password must be at least 6 characters');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}
