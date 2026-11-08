type AdBannerProps = {
  label?: string;
  className?: string;
};

export function AdBanner({ label = "Advertisement", className = "" }: AdBannerProps) {
  return (
    <div
      aria-label="Advertisement"
      className={`ad-banner flex min-h-[90px] w-full items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_rgba(15,23,42,0.85)_42%,_rgba(3,7,18,0.92)_100%)] text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-300 ${className}`}
    >
      {label}
    </div>
  );
}
