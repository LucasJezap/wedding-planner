import { PageShell } from "@/components/page-shell";
import { VendorManager } from "@/features/vendors/components/vendor-manager";
import { canViewVendorPricing } from "@/lib/access-control";
import { getRequestMessages } from "@/lib/i18n-server";
import { requirePageAccess } from "@/lib/require-auth";
import { listVendorCategories, listVendors } from "@/services/vendor-service";

export default async function VendorsPage() {
  const session = await requirePageAccess("vendors");
  const { messages } = await getRequestMessages();
  const canViewPricing = canViewVendorPricing(session.user.role);
  const vendors = await listVendors();

  return (
    <PageShell
      eyebrow={messages.pages.vendors.eyebrow}
      title={messages.pages.vendors.title}
      description={messages.pages.vendors.description}
    >
      <VendorManager
        initialVendors={
          canViewPricing
            ? vendors
            : vendors.map((vendor) => ({
                ...vendor,
                cost: 0,
              }))
        }
        categories={await listVendorCategories()}
        canViewPricing={canViewPricing}
        viewerRole={session.user.role}
      />
    </PageShell>
  );
}
