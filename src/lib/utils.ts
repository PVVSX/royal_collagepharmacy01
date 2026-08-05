import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const mergeTailwindClasses = extendTailwindMerge({
  extend: {
    theme: {
      text: ["micro", "3xs", "2xs", "caption", "12", "15", "17"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return mergeTailwindClasses(clsx(inputs))
}
