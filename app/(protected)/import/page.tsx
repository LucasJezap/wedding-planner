import { PageShell } from "@/components/page-shell";
import { ImportWizard } from "@/features/import/components/import-wizard";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";

export default async function ImportPage() {
  await requirePageAccess("import");
  const { messages } = await getRequestMessages();

  return (
    <PageShell
      eyebrow={messages.pages.import.eyebrow}
      title={messages.pages.import.title}
      description={messages.pages.import.description}
    >
      <ImportWizard />
    </PageShell>
  );
}
