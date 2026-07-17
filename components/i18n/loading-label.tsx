"use client";

import { useTranslations } from "next-intl";

export function LoadingLabel() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted">
      {t("loading")}
    </div>
  );
}
