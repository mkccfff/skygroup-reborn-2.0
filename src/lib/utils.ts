import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Linear interpolation helper */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Clamp a number between min and max */
export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
