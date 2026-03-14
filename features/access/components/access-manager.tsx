"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/locale-provider";
import type { AccountInput } from "@/features/access/types/access";
import { apiClient } from "@/lib/api-client";
import type { UserInvitationRecord, UserRecord } from "@/lib/planner-domain";

type InvitationResponse = UserInvitationRecord & {
  activationUrl: string;
};

export const AccessManager = ({
  initialUsers,
  initialInvitations,
}: {
  initialUsers: UserRecord[];
  initialInvitations: UserInvitationRecord[];
}) => {
  const { messages } = useLocale();
  const [users, setUsers] = useState(initialUsers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [latestActivationUrl, setLatestActivationUrl] = useState("");
  const { register, handleSubmit, reset } = useForm<AccountInput>({
    defaultValues: {
      email: "",
      role: "WITNESS",
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="border-white/70 bg-white/85">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
            {messages.access.addUser}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-[var(--color-muted-copy)]">
            {messages.access.inviteDescription}
          </p>
          <form
            className="space-y-3"
            onSubmit={handleSubmit(async (values) => {
              const created = await apiClient<InvitationResponse>(
                "/api/access",
                {
                  method: "POST",
                  body: JSON.stringify(values),
                },
              );
              setInvitations((current) => {
                const existing = current.findIndex(
                  (candidate) => candidate.email === created.email,
                );
                if (existing === -1) {
                  return [created, ...current];
                }

                return current.map((candidate) =>
                  candidate.email === created.email ? created : candidate,
                );
              });
              setLatestActivationUrl(created.activationUrl);
              reset();
            })}
          >
            <label className="block space-y-2 text-sm text-[var(--color-ink)]">
              <span>{messages.access.email}</span>
              <Input
                placeholder={messages.access.email}
                {...register("email")}
              />
            </label>
            <label className="block space-y-2 text-sm text-[var(--color-ink)]">
              <span>{messages.access.role}</span>
              <select
                className="h-10 w-full rounded-xl border px-3"
                {...register("role")}
              >
                <option value="ADMIN">{messages.shell.roles.ADMIN}</option>
                <option value="WITNESS">{messages.shell.roles.WITNESS}</option>
                <option value="READ_ONLY">
                  {messages.shell.roles.READ_ONLY}
                </option>
              </select>
            </label>
            <Button type="submit" className="rounded-full">
              {messages.access.create}
            </Button>
          </form>
          {latestActivationUrl ? (
            <div className="rounded-[1.25rem] bg-[var(--color-card-tint)]/65 p-4 text-sm text-[var(--color-ink)]">
              <p className="font-medium">{messages.access.latestInvite}</p>
              <p className="mt-2 break-all">{latestActivationUrl}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.access.pendingInvites}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="rounded-[1.5rem] border border-[var(--color-card-tint)] bg-[var(--color-card-tint)]/30 p-4"
              >
                <p className="font-medium text-[var(--color-ink)]">
                  {invitation.email}
                </p>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.shell.roles[invitation.role]}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                  {invitation.acceptedAt
                    ? messages.access.accepted
                    : messages.access.pending}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className="border-white/70 bg-white/85">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-3xl text-[var(--color-ink)]">
                    {user.name}
                  </h3>
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {user.email}
                  </p>
                </div>
                <select
                  className="h-10 rounded-xl border px-3"
                  value={user.role}
                  onChange={async (event) => {
                    const updated = await apiClient<UserRecord>(
                      `/api/access/${user.id}`,
                      {
                        method: "PATCH",
                        body: JSON.stringify({ role: event.target.value }),
                      },
                    );
                    setUsers((current) =>
                      current.map((candidate) =>
                        candidate.id === updated.id ? updated : candidate,
                      ),
                    );
                  }}
                >
                  <option value="ADMIN">{messages.shell.roles.ADMIN}</option>
                  <option value="WITNESS">
                    {messages.shell.roles.WITNESS}
                  </option>
                  <option value="READ_ONLY">
                    {messages.shell.roles.READ_ONLY}
                  </option>
                </select>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
