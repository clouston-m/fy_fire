import type { FireInputs } from './types';
import { DEFAULT_INPUTS } from './types';

const STORAGE_KEY = 'fy_fire_inputs';

/**
 * Persist FIRE inputs to localStorage.
 * Silently no-ops in non-browser environments (SSR).
 */
export function saveInputs(inputs: FireInputs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    // Ignore storage errors (private browsing, storage full, etc.)
  }
}

/**
 * Load FIRE inputs from localStorage.
 * Returns defaults if nothing is saved or parsing fails.
 * Merges with defaults so new fields added in future versions still appear.
 */
export function loadInputs(): FireInputs {
  if (typeof window === 'undefined') return DEFAULT_INPUTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_INPUTS;
    const parsed = JSON.parse(stored) as Partial<FireInputs>;
    // Merge with defaults so any new fields are populated
    return { ...DEFAULT_INPUTS, ...parsed };
  } catch {
    return DEFAULT_INPUTS;
  }
}

/**
 * Clear saved inputs from localStorage (useful for "reset" functionality).
 */
export function clearInputs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
