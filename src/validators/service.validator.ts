export function validateServiceOrderPayload(body: any) {
  const errors: string[] = [];
  if (!body.serviceId && !body.serviceTitle && !body.serviceName) {
    errors.push('Service selection is required');
  }
  if (!body.userEmail && !body.email) {
    errors.push('User email is required');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}
