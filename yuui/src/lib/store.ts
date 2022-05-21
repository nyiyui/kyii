import { writable } from 'svelte/store';

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

if (!baseUrl) {
	throw new Error(`invalid API Base URL: ${baseUrl}`);
}

export const apiBaseUrl = writable(new URL(baseUrl));

export const debugMode = writable(false);
