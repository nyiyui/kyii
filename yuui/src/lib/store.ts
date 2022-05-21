import { writable } from 'svelte/store';

export const apiBaseUrl = writable(new URL(import.meta.env.VITE_API_BASE_URL as string));

export const debugMode = writable(false);
