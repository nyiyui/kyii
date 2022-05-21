import { browser } from "$app/env";
import type { UUID } from "@types/uuid";

type UserLogin = {
	uuid: string,
	name: string,
	extra: any,
	against: { uuid: string, name: string },
	start: Date,
	last: Date,
	end: Date,
	current: boolean,
}

class Ax {
	aps: Array<Ap>;
	afs: Array<Af>;

	constructor(aps, afs) {
		this.aps = aps;
		this.afs = afs;
	}

	toInput(): AxInput {
		const res: AxInput = {
			aps: [],
			del_aps: [],
			afs: new Map(),
			del_afs: [],
		};
		const ids = new Map<UUID, number>();
		for (let [i, af] of this.afs.entries()) {
			af = new Af(af);
			res.afs.set(i, af.toInput());
			ids.set(af.uuid, i);
		}
		for (const ap of this.aps) {
			res.aps.push(new Ap(ap).toInput(ids));
		}
		return res;
	}
}

class Ap {
	uuid: string;
	name: string;
	reqs: Array<UUID>;

	constructor(ap) {
		this.uuid = ap.uuid;
		this.name = ap.name;
		this.reqs = ap.reqs;
	}

	toInput(ids: Map<UUID, number>): ApInput {
		return {
			uuid: this.uuid,
			name: this.name,
			reqs: this.reqs.map(uuid => ids.get(uuid)),
		}
	}
}

class Af {
	uuid: string;
	name: string;
	verifier: string;
	params: any;

	constructor(af) {
		this.uuid = af.uuid;
		this.name = af.name;
		this.verifier = af.verifier;
		this.params = af.params;
	}

	toInput(): AfInput {
		return {
			uuid: this.uuid,
			name: this.name,
			verifier: this.verifier,
			params: this.params,
		}
	}
}

class Status {
	user: {username: string, uuid: string};
	user_session: {uuid: string, name: string, against: string};
}

type Identity = {
	slug: string,
	name: string,
	email: string,
}

type AxInput = {
	aps: Array<ApInput>,
	del_aps: Array<string>,
	afs: Array<{key: number, value: AfInput}>,
	del_afs: Array<string>,
}

type ApInput = {
	uuid: string,
	name: string,
	reqs: Array<number>,
}

type AfInput = {
	uuid: string,
	name: string,
	verifier: string|null,
	params: any,
}

class Client {
	private baseUrl: URL;

	constructor(baseUrl: string) {
		if (!browser) throw new Error("can only use in a browser");
		this.baseUrl = new URL(baseUrl);
	}

	async getCsrfToken(): Promise<string> {
		return fetch(new URL('/api/v1/csrf_token', this.baseUrl.href).href, {
			method: 'GET',
			credentials: 'include',
		})
			.then(r => r.json())
			.then(d => d['csrf_token']);
	}

	private async commonOpts(method: 'GET' | 'POST', headers?: any): Promise<any> {
		return {
			method,
			credentials: 'include',
			headers: {
				...(method !== 'GET') ? {'X-CSRFToken': await this.getCsrfToken()} : {},
				...headers,
			},
		};
	}

	async username(username: string): Promise<{exists: boolean}> {
		const r = await fetch(new URL(`/api/v1/username?username=${encodeURIComponent(username)}`, this.baseUrl.href).href, {
			method: 'GET',
		})
		if (r.status === 200) {
			return await r.json();
		}
		throw new Error(`unexpected status ${r.status}`);
	}

	async loginStart(username: string): Promise<undefined|{aps: Array<Ap>}> {
		const r = await fetch(new URL('/api/v1/login/start', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({
				username,
			}),
		})
		if (r.status === 200) {
			return await r.json();
		}
		if (r.status === 204) {
			return undefined;
		}
		throw new Error(`unexpected status ${r.status}`);
	}

	async loginChoose(apUuid: string): Promise<{afs: Array<Af>}> {
		const r = await fetch(new URL('/api/v1/login/choose', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({
				ap_uuid: apUuid,
			}),
		})
		if (r.status === 404) {
			return undefined;
		}
		return await r.json();
	}

	async loginAttempt(afUuid: string, chalResp: string): Promise<{success: false, msg: string}|{success: true, done: boolean}> {
		const r = await fetch(new URL('/api/v1/login/attempt', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({
				af_uuid: afUuid,
				challenge_response: chalResp,
			}),
		});
		return await r.json();
	}

	async loginStop(): Promise<void> {
		await fetch(new URL('/api/v1/login/stop', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
		});
	}

	async status(): Promise<Status|null> {
		const r = await fetch(new URL('/api/v1/status', this.baseUrl.href).href, {
			...await this.commonOpts('GET'),
		})
		const data = await r.json();
		if (r.status === 403) {
			if (data.type === 'missing_perms') {
				if (data.data.reason ==='anonymous') {
					return null;
				}
				throw new Error(`insufficient perms: ${data.data.missing_perms}`);
			}
			throw new Error('unknown error');
		}
		if (data.user === null) {
			return null;
		}
		return data;
	}

	async loggedIn(): Promise<boolean> {
		const r = await fetch(new URL('/api/v1/logged_in', this.baseUrl.href).href, {
			...await this.commonOpts('GET'),
		})
		const data = await r.json();
		return data.logged_in;
	}

	async logout(): Promise<void> {
		await fetch(new URL('/api/v1/logout', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
		});
	}

	async signup(): Promise<UUID> {
		const r = await fetch(new URL('/api/v1/signup', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
		})
		return (await r.json()).user_id;
	}

	async getId(): Promise<Identity> {
		const r = await fetch(new URL('/api/v1/config/id', this.baseUrl.href).href, {
			...await this.commonOpts('GET'),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		return (await r.json()).user;
	}

	async submitId(req: Identity): Promise<void> {
		const r = await fetch(new URL('/api/v1/config/id', this.baseUrl.href).href, {
			...await this.commonOpts('POST', {
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify(req),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		return;
	}

	async getAx(): Promise<Ax> {
		const r = await fetch(new URL('/api/v1/config/ax', this.baseUrl.href).href, {
			...await this.commonOpts('GET'),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		const data = await r.json();
		return new Ax(data.aps, data.afs);
	}

	async submitAx(req: AxInput): Promise<Map<string, any>> {
		const r = await fetch(new URL('/api/v1/config/ax', this.baseUrl.href).href, {
			...await this.commonOpts('POST', {
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify(req),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		return (await r.json()).feedbacks;
	}

	async listUls(): Promise<Array<UserLogin>> {
		const r = await fetch(new URL('/api/v1/uls', this.baseUrl.href).href, {
			...await this.commonOpts('GET'),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		return (await r.json()).uls;
	}

	async revokeUl(ulid: string): Promise<Array<UserLogin>> {
		const r = await fetch(new URL('/api/v1/uls/revoke', this.baseUrl.href).href, {
			...await this.commonOpts('POST', {
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify({ ulid }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		return (await r.json()).success;
	}

	async deleteUl(ulid: string): Promise<Array<UserLogin>> {
		const r = await fetch(new URL('/api/v1/uls/delete', this.baseUrl.href).href, {
			...await this.commonOpts('POST', {
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify({ ulid }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		return (await r.json()).success;
	}

	async editUl(ulid: string, name: string): Promise<Array<UserLogin>> {
		const r = await fetch(new URL('/api/v1/uls/edit', this.baseUrl.href).href, {
			...await this.commonOpts('POST', {
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify({ ulid, name }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		return (await r.json()).success;
	}
};

const verifiers = [
	'pw',
	'otp_totp',
	'ctrl_email',
];

export { Ap, Af, Client, verifiers };
export type { Status, ApInput, AfInput, Identity, AxInput, UserLogin };
