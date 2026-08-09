export function validateTicketPayload(body: any) {
  const errors: string[] = [];
  if (!body.subject || !body.subject.trim()) {
    errors.push('Subject is required');
  }
  if (!body.message || !body.message.trim()) {
    errors.push('Message description is required');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}
