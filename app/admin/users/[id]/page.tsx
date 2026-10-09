import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UserDetail } from "@/components/admin/user-detail";
import { pageShellClass } from "@/lib/layout";

export const metadata: Metadata = {
  title: "User",
  robots: { index: false, follow: false },
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("adminUsers");

  return (
    <main className={pageShellClass("shell", "py-10")}>
      <h1 className="font-display text-3xl font-semibold text-foreground">
        {t("detailTitle")}
      </h1>
      <div className="mt-8">
        <UserDetail params={params} />
      </div>
    </main>
  );
}
