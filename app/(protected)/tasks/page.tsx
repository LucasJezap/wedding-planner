import { PageShell } from "@/components/page-shell";
import { TaskManager } from "@/features/tasks/components/task-manager";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";
import { listTasks } from "@/services/task-service";

export default async function TasksPage() {
  const session = await requirePageAccess("tasks");
  const { messages } = await getRequestMessages();

  return (
    <PageShell
      eyebrow={messages.pages.tasks.eyebrow}
      title={messages.pages.tasks.title}
      description={messages.pages.tasks.description}
    >
      <TaskManager
        initialTasks={await listTasks({ viewerRole: session?.user?.role })}
        viewerRole={session?.user?.role ?? "ADMIN"}
      />
    </PageShell>
  );
}
