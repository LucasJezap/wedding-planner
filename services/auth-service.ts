import { createHash, randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";

import { getRepository } from "@/db/repositories";
import type { UserRole } from "@/lib/planner-domain";
import { accountActivationSchema } from "@/features/access/types/access";
import { sendAccountInvitationEmail } from "@/services/email-service";
import { getActivationUrl } from "@/lib/invitation";

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<{
  id: string;
  weddingId: string;
  name: string;
  email: string;
  role: UserRole;
} | null> => {
  const repository = getRepository();
  const user = await repository.getUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    weddingId: user.weddingId,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const listAccounts = async () => {
  const repository = getRepository();
  return repository.listUsers();
};

export const listAccountInvitations = async () => {
  const repository = getRepository();
  return (await repository.listUserInvitations()).filter(
    (invitation) => !invitation.acceptedAt,
  );
};

const buildInvitationToken = (email: string, role: UserRole) =>
  createHash("sha256").update(`${email}:${role}:${randomUUID()}`).digest("hex");

export const createAccountInvitation = async (input: {
  weddingId: string;
  email: string;
  role: UserRole;
  activationOrigin: string;
  coupleNames: string;
}) => {
  const repository = getRepository();
  const existingUser = await repository.getUserByEmail(input.email);
  if (existingUser) {
    throw new Error("Account already exists");
  }

  const invitation = await repository.createUserInvitation({
    weddingId: input.weddingId,
    email: input.email,
    role: input.role,
    token: buildInvitationToken(input.email, input.role),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    acceptedAt: undefined,
  });

  await sendAccountInvitationEmail({
    email: invitation.email,
    role: invitation.role,
    activationUrl: getActivationUrl(input.activationOrigin, invitation.token),
    coupleNames: input.coupleNames,
    expiresAt: invitation.expiresAt,
  });

  return invitation;
};

export const updateAccountRole = async (userId: string, role: UserRole) => {
  const repository = getRepository();
  return repository.updateUser(userId, { role });
};

export const getInvitationByToken = async (token: string) => {
  const repository = getRepository();
  return repository.getUserInvitationByToken(token);
};

export const acceptInvitation = async (input: {
  token: string;
  name: string;
  password: string;
  confirmPassword: string;
}) => {
  const repository = getRepository();
  const data = accountActivationSchema.parse(input);
  const invitation = await repository.getUserInvitationByToken(data.token);
  if (!invitation) {
    throw new Error("Invitation not found");
  }
  if (invitation.acceptedAt) {
    throw new Error("Invitation already accepted");
  }
  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    throw new Error("Invitation expired");
  }

  const user = await repository.createUser({
    weddingId: invitation.weddingId,
    name: data.name,
    email: invitation.email,
    role: invitation.role,
    passwordHash: await hash(data.password, 8),
  });
  await repository.markUserInvitationAccepted(invitation.id);
  return user;
};
