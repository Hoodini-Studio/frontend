"use client";

import { useLayoutEffect } from "react";
import { HomeCollectionStories } from "@/components/home/home-collection-stories";
import { HomeHero } from "@/components/home/home-hero";
import { HomePhilosophy } from "@/components/home/home-philosophy";
import { HomeProductStage } from "@/components/home/home-product-stage";
import { NewsletterSignup } from "@/components/newsletter/newsletter-signup";
import { StorefrontPacks } from "@/components/storefront-packs";
import { StorefrontOnly } from "@/components/auth/storefront-only";

function HomeScrollReset() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Avoid browser scroll restoration landing mid sticky-stack on reload.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  return null;
}

export function StorefrontHome() {
  return (
    <StorefrontOnly>
      <HomeScrollReset />
      <div className="home-stack">
        <HomeHero />
        <StorefrontPacks />
        <HomeProductStage />
        <HomeCollectionStories />
      </div>
      {/* Compact closing band — philosophy, newsletter, footer */}
      <div className="relative z-10">
        <HomePhilosophy />
        <NewsletterSignup />
      </div>
    </StorefrontOnly>
  );
}
