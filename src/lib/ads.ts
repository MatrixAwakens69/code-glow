const normalize = (value?: string) => (value ?? "").trim();

export const adsense = {
  clientId: normalize(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID),
  slots: {
    default: normalize(process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT),
    home: normalize(process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME) || normalize(process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT),
    svg: normalize(process.env.NEXT_PUBLIC_ADSENSE_SLOT_SVG) || normalize(process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT),
    redactor: normalize(process.env.NEXT_PUBLIC_ADSENSE_SLOT_REDACTOR) || normalize(process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT),
    tailwind: normalize(process.env.NEXT_PUBLIC_ADSENSE_SLOT_TAILWIND) || normalize(process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT),
  },
} as const;

export function isValidAdSenseClientId(value?: string) {
  return /^ca-pub-[0-9]+$/i.test(normalize(value));
}

export function isValidAdSenseSlot(value?: string) {
  const sanitized = normalize(value);
  if (!sanitized || sanitized === "0000000000") return false;
  return /^\d{10,}$/.test(sanitized);
}

export function isValidAdSenseConfig(clientId?: string, slot?: string) {
  return isValidAdSenseClientId(clientId) && isValidAdSenseSlot(slot);
}

export function hasAnyValidAdSenseSlot() {
  return Object.values(adsense.slots).some(isValidAdSenseSlot);
}

export function getAdSlot(page: keyof typeof adsense.slots) {
  const value = adsense.slots[page] || adsense.slots.default;
  return isValidAdSenseSlot(value) ? value : "";
}
