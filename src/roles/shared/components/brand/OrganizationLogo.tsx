import type { ComponentPropsWithoutRef } from "react";
import {
  organizationBrand,
  type OrganizationBrand,
  type OrganizationLogoVariant,
} from "@/roles/shared/brand/organization";

// Brand derivatives are pre-sized and compressed; plain img preserves their
// transparent proportions across UI, watermark, and print contexts.
/* eslint-disable @next/next/no-img-element */

interface OrganizationLogoProps
  extends Omit<ComponentPropsWithoutRef<"img">, "alt" | "src"> {
  organization?: OrganizationBrand;
  variant?: OrganizationLogoVariant;
  decorative?: boolean;
  alt?: string;
}

export function OrganizationLogo({
  organization = "royalCollege",
  variant = "ui",
  decorative = false,
  alt,
  ...props
}: OrganizationLogoProps) {
  const brand = organizationBrand[organization];
  const src = brand.assets[variant];

  return (
    <img
      {...props}
      src={src}
      alt={decorative ? "" : alt ?? `ตราสัญลักษณ์${brand.nameTh}`}
      aria-hidden={decorative || undefined}
    />
  );
}
