import { browser } from '$app/env'
import { writable, get } from 'svelte/store'
import type { Writable } from 'svelte/store'

// Some code by Spenhouet <https://stackoverflow.com/users/2230045/spenhouet> on https://stackoverflow.com/a/68785061/12070265.

const storage = <T>(
	key: string,
	initValue: T,
	marshal = JSON.stringify,
	unmarshal = JSON.parse
): Writable<T> => {
	const store = writable(initValue)
	if (!browser) return store

	const storedValueStr = localStorage.getItem(key)
	if (storedValueStr != null) store.set(unmarshal(storedValueStr))

	store.subscribe((val) => {
		if ([null, undefined].includes(val)) {
			localStorage.removeItem(key)
		} else {
			localStorage.setItem(key, marshal(val))
		}
	})

	window.addEventListener('storage', () => {
		const storedValueStr = localStorage.getItem(key)
		if (storedValueStr == null) return

		const localValue: T = unmarshal(storedValueStr)
		if (localValue !== get(store)) store.set(localValue)
	})

	return store
}

const defaultDebugMode = import.meta.env.NODE_ENV === 'development'

export const debugMode = storage('debugMode', defaultDebugMode)

export const allowAnonymous = storage('allowAnonymous', defaultDebugMode)

export const allowMULPU = storage('allowMULPU', defaultDebugMode)

export const devOauth = storage('devOauth', defaultDebugMode)

export type Lang = null | string

export const lang = storage<Lang>('lang', null)

export function reset() {
	debugMode.set(defaultDebugMode)
	allowAnonymous.set(defaultDebugMode)
	allowMULPU.set(defaultDebugMode)
}

export { storage }
