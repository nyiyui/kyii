import { writable } from 'svelte/store';
import { persist, localStorage } from "@macfja/svelte-persistent-store"

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

if (!baseUrl) {
	throw new Error(`invalid API Base URL: ${baseUrl}`);
}

export const apiBaseUrl = persist(writable(baseUrl), localStorage(), 'apiBaseUrl');

export const debugMode = persist(writable(false), localStorage(), 'debugMode');
