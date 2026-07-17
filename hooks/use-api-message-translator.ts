"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import {
  translateApiFieldErrors,
  translateApiMessage,
  type ApiMessageKey,
} from "@/lib/i18n/api-messages";

export function useApiMessageTranslator() {
  const t = useTranslations("api");

  const translateMessage = useCallback(
    (message: string | undefined | null) =>
      translateApiMessage(message, t as (key: ApiMessageKey) => string),
    [t],
  );

  const translateErrors = useCallback(
    (errors: Record<string, string[]>) =>
      translateApiFieldErrors(errors, t as (key: ApiMessageKey) => string),
    [t],
  );

  return { translateMessage, translateErrors };
}
