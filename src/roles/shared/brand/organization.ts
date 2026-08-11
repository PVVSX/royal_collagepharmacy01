export const organizationBrand = {
  royalCollege: {
    nameTh: "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
    nameEn: "Royal College of Pharmacists of Thailand",
    assets: {
      ui: "/brand/royal-college/logo-ui.webp",
      full: "/brand/royal-college/logo-full.png",
      watermark: "/brand/royal-college/logo-ui.webp",
      favicon16: "/brand/royal-college/favicon-16.png",
      favicon32: "/brand/royal-college/favicon-32.png",
      favicon: "/brand/royal-college/favicon.ico",
      appleTouchIcon: "/brand/royal-college/apple-touch-icon.png",
      pwa192: "/brand/royal-college/pwa-192.png",
      pwa512: "/brand/royal-college/pwa-512.png",
      pwaMaskable192: "/brand/royal-college/pwa-maskable-192.png",
      pwaMaskable512: "/brand/royal-college/pwa-maskable-512.png",
    },
  },
  pharmacyCouncil: {
    nameTh: "สภาเภสัชกรรม",
    nameEn: "The Pharmacy Council of Thailand",
    assets: {
      ui: "/brand/pharmacy-council/seal.jpg",
      full: "/brand/pharmacy-council/seal.jpg",
      watermark: "/brand/pharmacy-council/watermark.png",
    },
  },
} as const;

export type OrganizationBrand = keyof typeof organizationBrand;
export type OrganizationLogoVariant = "ui" | "full" | "watermark";
