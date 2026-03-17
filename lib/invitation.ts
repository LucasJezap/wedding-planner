export const getActivationUrl = (origin: string, token: string) =>
  `${origin}/activate?token=${token}`;
