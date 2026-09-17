import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExcerpt(html: string | undefined | null, maxLength: number = 200): string {
  if (!html) return '';
  // Strip HTML tags safely, preserving spaces where block elements might have been, though a simple strip is usually enough here.
  const rawText = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  if (rawText.length <= maxLength) return rawText;
  
  // Truncate at word boundary
  const truncated = rawText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  return truncated + '...';
}
