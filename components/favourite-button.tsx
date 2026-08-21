"use client";

import { useTranslations } from "next-intl";
import { useFavouriteIds, useToggleFavouriteMutation } from "@/hooks/use-favourites";
import { useToast } from "@/providers/toast-provider";

type FavouriteButtonProps = {
  productId: string;
  className?: string;
  stopPropagation?: boolean;
};

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.5 12.572 12 20l-7.5-7.428A5 5 0 1 1 12 6.012a5 5 0 1 1 7.5 6.56Z" />
    </svg>
  );
}

export function FavouriteButton({
  productId,
  className = "",
  stopPropagation = false,
}: FavouriteButtonProps) {
  const t = useTranslations("store");
  const { toast } = useToast();
  const idsQuery = useFavouriteIds();
  const toggle = useToggleFavouriteMutation();
  const isFavourite = (idsQuery.data ?? []).includes(productId);

  const onClick = (event: React.MouseEvent) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (toggle.isPending) {
      return;
    }

    void toggle
      .mutateAsync({ productId, isFavourite })
      .catch(() => {
        toast(t("unableToUpdateFavourites"), { variant: "error" });
      });
  };

  return (
    <button
      type="button"
      aria-pressed={isFavourite}
      aria-label={isFavourite ? t("removeFromFavourites") : t("addToFavourites")}
      disabled={toggle.isPending}
      onClick={onClick}
      className={`inline-flex items-center justify-center border border-white/15 bg-black/55 text-foreground backdrop-blur-sm transition hover:bg-black/75 disabled:opacity-60 ${className}`}
    >
      <HeartIcon filled={isFavourite} className="h-4 w-4" />
    </button>
  );
}
