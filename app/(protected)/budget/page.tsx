import { PageShell } from "@/components/page-shell";
import { BudgetManager } from "@/features/budget/components/budget-manager";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";
import { getBudgetOverview } from "@/services/budget-service";
import { listVendors } from "@/services/vendor-service";

export default async function BudgetPage() {
  await requirePageAccess("budget");
  const budget = await getBudgetOverview();
  const { messages } = await getRequestMessages();

  return (
    <PageShell
      eyebrow={messages.pages.budget.eyebrow}
      title={messages.pages.budget.title}
      description={messages.pages.budget.description}
    >
      <BudgetManager
        initialCategories={budget.categories}
        initialExpenses={budget.expenses}
        vendors={await listVendors()}
      />
    </PageShell>
  );
}
