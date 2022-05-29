import { browser } from "$app/env";
import type { UUID } from "@types/uuid";

type TAF = {
	tafid: UUID,
	feedback: any,
}

type Grant = {
	args: any,
	client: {
		user_id: string,
		name: string,
		uri: string,
	},
	request: {
		response_type: string,
		redirect_uri: string,
		scope: string,
		state: string,
	},
};

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
	uuid: string,
	slug: string,
	name: string,
	email: string,
	groups: Array<Group>,
}

type Group = {
	id: string,
	slug: string,
	name: string,
	email: string,
	email_verified: boolean,
	perms: Array<string>,
}

type AxInput = {
	aps: Array<ApInput>,
	del_aps: Array<string>,
	afs: Map<number, AfInput>,
	del_afs: Array<string>,
}

type AxInput2 = {
	aps: Array<ApInput2>,
	del_aps: Array<string>,
	del_afs: Array<string>,
}

type ApInput = {
	uuid: string,
	name: string,
	reqs: Array<number>,
	taf_reqs: Array<UUID>,
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

	async username(slug: string): Promise<{exists: boolean}> {
		const r = await fetch(new URL(`/api/v1/user/exists?slug=${encodeURIComponent(slug)}`, this.baseUrl.href).href, {
			method: 'GET',
		})
		if (r.status === 200) {
			return await r.json();
		}
		throw new Error(`unexpected status ${r.status}`);
	}

	async loginStart(slug: string): Promise<undefined|{aps: Array<Ap>}> {
		const r = await fetch(new URL('/api/v1/login/start', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({ slug }),
		})
		if (r.status === 200) {
			return await r.json();
		}
		if (r.status === 204) {
			return undefined;
		}
		throw new Error(`unexpected status ${r.status}`);
	}

	async loginChoose(apid: string): Promise<{afs: Array<Af>}> {
		const r = await fetch(new URL('/api/v1/login/choose', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({ apid }),
		})
		if (r.status === 404) {
			return undefined;
		}
		return await r.json();
	}

	async loginAttempt(afid: string, attempt: string): Promise<{success: false, msg: string}|{success: true, done: boolean}> {
		const r = await fetch(new URL('/api/v1/login/attempt', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({ afid, attempt }),
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

	async signup(): Promise<UUID|false> {
		const r = await fetch(new URL('/api/v1/signup', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
		})
		const d = await r.json();
		if (d.type === 'missing_perms') {
			return false;
		}
		return d.user_id;
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
			...await this.commonOpts('POST'),
			body: new URLSearchParams(req),
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

	async submitAx(req: AxInput2): Promise<Map<string, any>> {
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
			...await this.commonOpts('POST'),
			body: new URLSearchParams({ ulid }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		return (await r.json()).success;
	}

	async deleteUl(ulid: string): Promise<Array<UserLogin>> {
		const r = await fetch(new URL('/api/v1/uls/delete', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({ ulid }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		return (await r.json()).success;
	}

	async editUl(ulid: string, name: string): Promise<Array<UserLogin>> {
		const r = await fetch(new URL('/api/v1/uls/edit', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({ ulid, name }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		return (await r.json()).success;
	}

	async getAzrq(azrqid: UUID): Promise<Grant | null> {
		const r = await fetch(new URL(`/api/v1/oauth/azrq?azrqid=${encodeURIComponent(azrqid)}`, this.baseUrl.href).href, {
			...await this.commonOpts('GET'),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		const d = await r.json();
		if (d.type === 'azrq_nonexistent') {
			return null;
		}
		if (d.type !== 'ok') {
			throw new Error(`unexpected type ${d.type}`);
		}
		return d.azrq;
	}

	// TAF
	async allocTaf(): Promise<string> {
		const r = await fetch(new URL('/api/v1/config/ax/taf/alloc', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		const d = await r.json();
		if (d.type !== 'ok') {
			throw new Error(`unexpected type ${d.type}`);
		}
		return d.tafid;
	}
	async deallocTaf(tafid: string): Promise<void> {
		const r = await fetch(new URL('/api/v1/config/ax/taf/dealloc', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({ tafid }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		const d = await r.json();
		if (d.type !== 'ok') {
			throw new Error(`unexpected type ${d.type}`);
		}
		return d.taf;
	}
	async setTaf(tafid: string, af: AfInput): Promise<TAF> {
		const r = await fetch(new URL('/api/v1/config/ax/taf/set', this.baseUrl.href).href, {
			...await this.commonOpts('POST', {
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify({ tafid, name: af.name, verifier: af.verifier, gen_params: af.params }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		const d = await r.json();
		if (d.type !== 'ok') {
			throw new Error(`unexpected type ${d.type}`);
		}
		return d.taf;
	}
	async attemptTaf(tafid: UUID, attempt: string): Promise<{success: boolean, msg?: string}> {
		const r = await fetch(new URL('/api/v1/config/ax/taf/attempt', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({ tafid, attempt }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		const d = await r.json();
		if (d.type === 'verification_error') {
			return {success: false, msg: d.msg};
		}
		if (d.type !== 'ok') {
			throw new Error(`unexpected type ${d.type}`);
		}
		return {success: true};
	}

	async emailVerifyStart(emailId: number): Promise<void> {
		const r = await fetch(new URL('/api/v1/email/verify/start', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({ email_id: emailId.toString() }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		const d = await r.json();
		if (d.type === 'not_yours') {
			throw new Error('email is not yours');
		}
		if (d.type !== 'ok') {
			throw new Error(`unexpected type ${d.type}`);
		}
		return;
	}

	async emailInfo(token: string): Promise<void> {
		const r = await fetch(new URL('/api/v1/email/verify', this.baseUrl.href).href, {
			...await this.commonOpts('GET'),
			body: new URLSearchParams({ token }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		const d = await r.json();
		if (d.type === 'not_yours') {
			throw new Error('email is not yours');
		}
		if (d.type !== 'ok') {
			throw new Error(`unexpected type ${d.type}`);
		}
		return;
	}

	async emailVerify(token: string): Promise<void> {
		const r = await fetch(new URL('/api/v1/email/verify', this.baseUrl.href).href, {
			...await this.commonOpts('POST'),
			body: new URLSearchParams({ token }),
		})
		if (r.status !== 200) {
			throw new Error(`unexpected status ${r.status}`);
		}
		const d = await r.json();
		if (d.type === 'not_yours') {
			throw new Error('email is not yours');
		}
		if (d.type !== 'ok') {
			throw new Error(`unexpected type ${d.type}`);
		}
		return;
	}
};

const verifiers = [
	'pw',
	'otp_totp',
	'ctrl_email',
];

export { Ap, Af, Client, verifiers };
export type { Status, ApInput, AfInput, Identity, AxInput, UserLogin, Grant };
