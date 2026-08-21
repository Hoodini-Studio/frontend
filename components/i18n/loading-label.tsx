"use client";

import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";

export function LoadingLabel() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Spinner size="lg" label={t("loading")} />
    </div>
  );
}
