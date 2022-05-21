import type { Client } from "./api";

async function permCheck(client: Client, withParams: boolean) {
	if (window.location.pathname == '/login') {
		throw new Error('cannot use loginCheck in /login');
	}
	if (!await client.loggedIn()) {
		const params = new URLSearchParams({
			selfnext: window.location.pathname,
			...(withParams ? {selfargs: window.location.search} : {}),
		});
		window.location.replace(`/login?${params}`);
	}
}

enum AttemptResultStatus {
	Success,
	Fail,
	Error,
}

export { permCheck, AttemptResultStatus };
