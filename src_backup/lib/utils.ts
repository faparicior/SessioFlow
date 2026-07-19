import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 * Tailwind CSS class name merger.
 * Merges multiple class names and resolves conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
