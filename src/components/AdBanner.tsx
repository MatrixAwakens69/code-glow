"use client";

import { useEffect } from "react";
import { adsense, getAdSlot } from "@/lib/ads";

type AdBannerProps = {
  label?: string;
  className?: string;
  slot?: string;
  format?: string;
};

export function AdBanner({
  label = "Advertisement",
  className = "",
  slot,
  format = "auto",
}: AdBannerProps) {
  const adsenseClientId = adsense.clientId;
  const resolvedSlot = slot || getAdSlot("default");
  const isAdsEnabled = Boolean(adsenseClientId && resolvedSlot);

  useEffect(() => {
    if (!isAdsEnabled) return;

    try {
      const adsbygoogle = (window as Window & { adsbygoogle?: Array<Record<string, unknown>> }).adsbygoogle || [];
      (window as Window & { adsbygoogle?: Array<Record<string, unknown>> }).adsbygoogle = adsbygoogle;
      (window as Window & { adsbygoogle?: Array<Record<string, unknown>> }).adsbygoogle?.push({});
    } catch {
      // No-op: AdSense will not run until the script is available.
    }
  }, [isAdsEnabled]);

  if (!isAdsEnabled) {
    return (
      <div
        aria-label="Advertisement"
        className={`ad-banner flex min-h-[90px] w-full items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_rgba(15,23,42,0.85)_42%,_rgba(3,7,18,0.92)_100%)] text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-300 ${className}`}
      >
        {label}
      </div>
    );
  }

  return (
    <div
      aria-label="Advertisement"
      className={`ad-banner flex min-h-[90px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_rgba(15,23,42,0.85)_42%,_rgba(3,7,18,0.92)_100%)] ${className}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: "90px" }}
        data-ad-client={adsenseClientId}
        data-ad-slot={resolvedSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
