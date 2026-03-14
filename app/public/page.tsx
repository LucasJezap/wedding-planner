import { getServerSession } from "next-auth";

import { PublicSite } from "@/features/public/components/public-site";
import { authOptions } from "@/lib/auth";
import { getRequestMessages } from "@/lib/i18n-server";
import { getPublicWeddingView } from "@/services/public-site-service";

export default async function PublicPage() {
  const session = await getServerSession(authOptions);
  const { messages } = await getRequestMessages();

  return (
    <PublicSite
      initialData={await getPublicWeddingView()}
      adminHref={session?.user ? "/dashboard" : "/login"}
      adminLabel={
        session?.user
          ? messages.publicSite.backToAdmin
          : messages.publicSite.adminPanel
      }
    />
  );
}
