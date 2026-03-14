import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AppShell } from "@/components/app-shell";
import { authOptions } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell
      userName={session.user.name ?? "Planner"}
      userRole={session.user.role}
    >
      {children}
    </AppShell>
  );
}
