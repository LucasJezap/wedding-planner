import type {
  AccountActivationInput,
  AccountInput,
  AccountRoleUpdateInput,
} from "@/features/access/types/access";
import {
  acceptInvitation,
  createAccountInvitation,
  getInvitationByToken,
  listAccountInvitations,
  listAccounts,
  updateAccountRole,
} from "@/services/auth-service";
import { getRepository } from "@/db/repositories";

export const getAccountsHandler = async () => listAccounts();
export const getAccountInvitationsHandler = async () =>
  listAccountInvitations();

export const createAccountHandler = async (input: AccountInput) => {
  const wedding = await getRepository().getWedding();
  return createAccountInvitation({ ...input, weddingId: wedding.id });
};

export const updateAccountRoleHandler = async (
  userId: string,
  input: AccountRoleUpdateInput,
) => updateAccountRole(userId, input.role);

export const getInvitationHandler = async (token: string) =>
  getInvitationByToken(token);
export const acceptInvitationHandler = async (input: AccountActivationInput) =>
  acceptInvitation(input);
