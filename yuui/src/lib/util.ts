import type { Client } from '$lib/api2'
import { client } from '$lib/api2'

async function permCheck(client: Client, withParams: boolean) {
	if (window.location.pathname == '/login') {
		throw new Error('cannot use loginCheck in /login')
	}
	if (!(await client.loggedIn())) {
		const params = new URLSearchParams({
			selfnext: window.location.pathname,
			...(withParams ? { selfargs: window.location.search } : {})
		})
		window.location.replace(`/login?${params}`)
	}
}

enum AttemptResultStatus {
	Success,
	Fail,
	Error
}

function getNext(sp: URLSearchParams): string | null {
	// eh, even if argsRaw is malicious it shouldn't do much?
	const nextRel = sp.get('next')
	if (nextRel !== null) {
		const argsRaw = sp.get('args') || ''
		return nextRel !== null ? new URL(nextRel, client.baseUrl).toString() + '?' + argsRaw : null
	}
	const selfnextRel = sp.get('selfnext')
	if (selfnextRel !== null) {
		const argsRaw = sp.get('selfargs') || ''
		console.log(selfnextRel)
		return selfnextRel !== null ? selfnextRel + '?' + argsRaw : null
	}
	return null
}

export { permCheck, AttemptResultStatus, getNext }
