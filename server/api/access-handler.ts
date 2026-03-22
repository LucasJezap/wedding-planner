import type {
  AccountActivationInput,
  AccountInput,
  AccountUpdateInput,
} from "@/features/access/types/access";
import {
  acceptInvitation,
  createAccountInvitation,
  getInvitationByToken,
  listAccountInvitations,
  listAccounts,
  updateAccount,
} from "@/services/auth-service";
import { getRepository } from "@/db/repositories";

export const getAccountsHandler = async () => listAccounts();
export const getAccountInvitationsHandler = async () =>
  listAccountInvitations();

export const createAccountHandler = async (
  input: AccountInput & { activationOrigin: string },
) => {
  const wedding = await getRepository().getWedding();
  return createAccountInvitation({
    ...input,
    weddingId: wedding.id,
    coupleNames: `${wedding.coupleOneName} & ${wedding.coupleTwoName}`,
  });
};

export const updateAccountHandler = async (
  userId: string,
  input: AccountUpdateInput,
) => updateAccount(userId, input);

export const getInvitationHandler = async (token: string) =>
  getInvitationByToken(token);
export const acceptInvitationHandler = async (input: AccountActivationInput) =>
  acceptInvitation(input);
