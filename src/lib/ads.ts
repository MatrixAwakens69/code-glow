export const adsense = {
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
  slots: {
    default: process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT || "",
    home: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME || process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT || "",
    svg: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SVG || process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT || "",
    redactor: process.env.NEXT_PUBLIC_ADSENSE_SLOT_REDACTOR || process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT || "",
    tailwind: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TAILWIND || process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT || "",
  },
} as const;

export function getAdSlot(page: keyof typeof adsense.slots) {
  return adsense.slots[page] || adsense.slots.default;
}
