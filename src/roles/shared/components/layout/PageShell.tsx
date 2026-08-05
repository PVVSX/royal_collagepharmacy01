import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pageShellVariants = cva("mx-auto w-full px-4 pt-4 md:px-6 md:pt-6", {
  variants: {
    size: {
      app: "max-w-app",
      wide: "max-w-6xl",
      content: "max-w-5xl",
      form: "max-w-4xl",
      full: "max-w-none",
    },
    bottom: {
      default: "pb-16 md:pb-6",
      roomy: "pb-24",
      none: "pb-0",
    },
  },
  defaultVariants: {
    size: "app",
    bottom: "default",
  },
});

function PageShell({
  className,
  size,
  bottom,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof pageShellVariants>) {
  return (
    <div
      data-slot="page-shell"
      className={cn(pageShellVariants({ size, bottom }), className)}
      {...props}
    />
  );
}

export { PageShell, pageShellVariants };
