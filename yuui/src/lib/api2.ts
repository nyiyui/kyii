import { browser } from "$app/env";
import type { UUID } from "@types/uuid";

class Response<T> {
	data: T;
	errors: Array<ResponseError>;

	constructor(raw) {
		this.data = raw.data;
		this.errors = raw.errors;
	}

	hasErrors() {
		return this.errors.length > 0;
	}

	toString() {
		return `Response: ${this.data} ${this.errors}`;
	}
}

class ResponseError {
	code: string;
	message: string;
	data;

	toString(): string {
		return `${this.code}: ${this.message}`;
	}

	toError(): Error {
		if (this.code === 'missing_perms') {
			return new MissingPermsError(this.data.missing_perms, this.data.reason);
		}
		return new TypeError(this.message);
	}
}

type Perm = string;

class MissingPermsError extends TypeError {
	missingPerms: Array<Perm>;
	reason: string;

	constructor(missingPerms: Array<Perm>, reason: string) {
		super(`Missing permissions: ${missingPerms.join(", ")} (${reason})`);
		this.name = 'MissingPerms';
		this.missingPerms = missingPerms;
		this.reason = reason;
	}
}

class ManyErrors extends Error {
	errors: Array<Error>;

	constructor(errors: Array<Error>) {
		super(`${errors.length} errors: ${errors.map(e => e.toString()).join(", ")}`);
		this.name = 'ManyErrors';
		this.errors = errors;
	}
}

type LoginAttemptResp = {
	success: boolean,
	done: boolean,
	msg: string,
	token: string,
}

type TAF = {
	tafid: UUID,
	feedback,
}

type Grant = {
	args,
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
		for (const iter of this.afs.entries()) {
			const i = iter[0];
			let af = iter[1];
			af = new Af(af);
			res.afs.set(i, af.toInput());
		}
		for (const ap of this.aps) {
			res.aps.push(new Ap(ap).toInput());
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

	toInput(): ApInput {
		return {
			uuid: this.uuid,
			name: this.name,
			reqs: this.reqs,
		}
	}
}

class Af {
	uuid: string;
	name: string;
	verifier: string;
	params;

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

type IdInput = {
	slug: string,
	name: string,
	emails: {
		add: Array<string>,
		edit: Array<{id: UUID, email: string}>,
		delete: Array<UUID>,
	},
}

class Id {
	slug: string;
	name: string;
	emails: Array<string>;
	perms: Array<string>;
	default_perms: Array<string>;
	primary_group: Group;
	groups: Array<Group>;

	constructor(id) {
		this.slug = id.slug;
		this.name = id.name;
		this.emails = id.emails;
		this.perms = id.perms;
		this.default_perms = id.default_perms;
		this.primary_group = id.primary_group;
		this.groups = id.groups;
	}

	toInput(): IdInput {
		return {
			slug: this.slug,
			name: this.name,
			emails: {
				add: [],
				edit: [],
				delete: [],
			},
		}
	}
}

type Group = {
	id: string,
	slug: string,
	name: string,
	emails: Array<Email>,
	perms: Array<string>,
}

type Email = {
	id: string,
	email: string,
	is_verified: boolean,
}

type AxInput = {
	aps: Array<ApInput>,
	del_aps: Array<string>,
	afs: Map<UUID, AfInput>,
	del_afs: Array<string>,
}

type ApInput = {
	uuid: string,
	name: string,
	reqs: Array<UUID>,
}

type AfInput = {
	uuid: string,
	name: string,
	verifier: string|null,
	params,
}

class BaseClient {
	protected baseUrl: URL;
	protected token?: string;

	constructor(baseUrl: string) {
		if (!browser) throw new TypeError("can only use in a browser");
		this.baseUrl = new URL(baseUrl);
	}

	async getCsrfToken(): Promise<string> {
		const r = await this.fetch<{csrf_token: string}>(new URL(`/api/v1/csrf_token`, this.baseUrl.href), {
			method: 'GET',
		})
		this.assertNoErrors(r);
		return r.data.csrf_token;
	}

	private async commonOpts(method: 'GET' | 'POST', headers?): Promise<any> {
		return {
			method,
			credentials: 'include',
			headers: {
				...(method !== 'GET') ? {'X-CSRFToken': await this.getCsrfToken()} : {},
				...(this.token !== null) ? {'X-Airy-Token': this.token} : {},
				...headers,
			},
		};
	}

	protected async assertNoErrors<T>(res: Response<T>) {
		if (res.hasErrors()) {
			const errors = res.errors.map(e => e.toError());
			throw new ManyErrors(errors);
		}
	}

	protected async fetch<T>(url: URL, opts): Promise<Response<T>> {
		const r = await fetch(url.href, {
			...opts,
			...this.commonOpts(opts.method, opts.headers),
		});
		if (r.status !== 200) {
			throw new TypeError(`unexpected status ${r.status}`);
		}
		const r2 = new Response<T>(await r.json());
		return r2;
	}
}

class Client extends BaseClient {
	// ================================
	// Miscellaenous
	// ================================

	async userExists(slug: string): Promise<boolean> {
		const r = await this.fetch<{exists: boolean}>(new URL(`/api/v1/user/exists?slug=${encodeURIComponent(slug)}`, this.baseUrl.href), {
			method: 'GET',
		})
		this.assertNoErrors(r);
		return r.data.exists;
	}

	// ================================
	// Login/Logout
	// ================================

	async loggedIn(): Promise<boolean> {
		const r = await this.fetch<{logged_in: boolean}>(new URL(`/api/v1/logged_in`, this.baseUrl.href), {
			method: 'GET',
		})
		this.assertNoErrors(r);
		return r.data.logged_in;
	}

	async status(): Promise<Status> {
		const r = await this.fetch<Status>(new URL(`/api/v1/status`, this.baseUrl.href), {
			method: 'GET',
		})
		this.assertNoErrors(r);
		return r.data;
	}

	async loginStop(): Promise<void> {
		const r = await this.fetch<void>(new URL(`/api/v1/login_stop`, this.baseUrl.href), {
			method: 'POST',
		});
		this.assertNoErrors(r);
	}

	async loginStart(slug: string): Promise<{aps: Array<Ap>}> {
		const r = await this.fetch<{aps: Array<Ap>}>(new URL(`/api/v1/login_start`, this.baseUrl.href), {
			method: 'POST',
			body: new URLSearchParams({ slug }),
		})
		this.assertNoErrors(r);
		return r.data;
	}

	async loginChoose(apid: UUID): Promise<{afs: Array<Af>}> {
		const r = await this.fetch<{afs: Array<Af>}>(new URL(`/api/v1/login_choose`, this.baseUrl.href), {
			method: 'POST',
			body: new URLSearchParams({ apid }),
		})
		this.assertNoErrors(r);
		return r.data;
	}

	async loginAttempt(afid: string, attempt: string, setToken = true): Promise<LoginAttemptResp> {
		const r = await this.fetch<LoginAttemptResp>(new URL(`/api/v1/login_attempt`, this.baseUrl.href), {
			method: 'POST',
			body: new URLSearchParams({ afid, attempt }),
		})
		this.assertNoErrors(r);
		if (r.data.done && setToken) {
			this.token = r.data.token;
		}
		return r.data;
	}

	async logout(setToken = true): Promise<void> {
		const r = await this.fetch<void>(new URL(`/api/v1/logout`, this.baseUrl.href), {
			method: 'POST',
		});
		this.assertNoErrors(r);
		this.token = null;
		return r.data;
	}

	async signup(): Promise<{token: string}> {
		const r = await this.fetch<{token: string}>(new URL(`/api/v1/signup`, this.baseUrl.href), {
			method: 'POST',
		});
		this.assertNoErrors(r);
		return r.data;
	}

	// ================================
	// Config: Authentication
	// ================================

	async getAx(): Promise<Ax> {
		const r = await this.fetch<Ax>(new URL(`/api/v1/config/ax`, this.baseUrl.href), {
			method: 'GET',
		})
		return new Ax(r.data.aps, r.data.afs);
	}

	async submitAx(req: AxInput): Promise<void> {
		await this.fetch(new URL(`/api/v1/config/ax`, this.baseUrl.href), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req),
		})
	}

	// ================
	// TAF
	// ================

	async allocTaf(): Promise<UUID> {
		const r = await this.fetch<{tafid: UUID}>(new URL('/api/v1/config/ax/taf/alloc', this.baseUrl.href), {
			method: 'POST',
		})
		this.assertNoErrors(r);
		return r.data.tafid;
	}

	async deallocTaf(tafid: UUID): Promise<void> {
		const r = await this.fetch<void>(new URL(`/api/v1/config/ax/taf/dealloc?tafid=${encodeURIComponent(tafid)}`, this.baseUrl.href), {
			method: 'POST',
			body: new URLSearchParams({ tafid }),
		})
		this.assertNoErrors(r);
	}

	async setTaf(tafid: string, af: AfInput): Promise<TAF> {
		const r = await this.fetch<{taf: TAF}>(new URL(`/api/v1/config/ax/taf/set`, this.baseUrl.href), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ tafid, name: af.name, verifier: af.verifier, gen_params: af.params }),
		});
		return r.data.taf;
	}

	async attemptTaf(tafid: UUID, attempt: string): Promise<{success: boolean, msg?: string}> {
		const r = await this.fetch(new URL(`/api/v1/config/ax/taf/attempt`, this.baseUrl.href), {
			method: 'POST',
			body: new URLSearchParams({ tafid, attempt }),
		});
		if (r.errors.length === 1 && r.errors[0].code === 'verification_failed') {
			return { success: false, msg: r.errors[0].data };
		} else {
			this.assertNoErrors(r);
			return { success: true };
		}
	}

	// ================================
	// Config: Identity
	// ================================


	async getId(): Promise<Id> {
		const r = await this.fetch<{user: Id}>(new URL(`/api/v1/config/id`, this.baseUrl.href), {
			method: 'GET',
		})
		return r.data.user;
	}

	async submitId(req: IdInput): Promise<void> {
		await this.fetch<null>(new URL(`/api/v1/config/id`, this.baseUrl.href), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req),
		})
	}

	// ================================
	// User Logins
	// ================================

	async ulsList(): Promise<Array<UserLogin>> {
		const r = await this.fetch<{uls: Array<UserLogin>}>(new URL('/api/v1/uls', this.baseUrl.href), {
			method: 'GET',
		})
		return r.data.uls;
	}

	private async actionUl(action: string, ulid: string, name?: string): Promise<void> {
		await this.fetch<null>(new URL(`/api/v1/uls/${action}`, this.baseUrl.href), {
			method: 'POST',
			body: new URLSearchParams({ ulid, ...(name ? { name } : {}) }),
		})
	}

	async revokeUl(ulid: string): Promise<void> {
		await this.actionUl('revoke', ulid);
	}

	async deleteUl(ulid: string): Promise<void> {
		await this.actionUl('delete', ulid);
	}

	async editUl(ulid: string, name: string): Promise<void> {
		await this.actionUl('edit', ulid, name);
	}

	// ================================
	// OAuth
	// ================================

	async getAzrq(azrqid: UUID): Promise<Grant | null> {
		const r = await this.fetch<{azrq: Grant | null}>(new URL(`/api/v1/azrq`, this.baseUrl.href), {
			method: 'GET',
			body: new URLSearchParams({ azrqid }),
		})
		if (r.errors.length === 1 && r.errors[0].code === 'azrq_not_found') {
			return null;
		} else {
			this.assertNoErrors(r);
			return r.data.azrq;
		}
	}

	// ================================
	// Email Verification
	// ================================

	async emailVerifyStart(emailId: number): Promise<void> {
		const r = await this.fetch<null>(new URL(`/api/v1/email/verify/start`, this.baseUrl.href), {
			method: 'POST',
			body: new URLSearchParams({ email_id: emailId.toString() }),
		})
		if (r.errors.length === 1 && r.errors[0].code === 'not_yours') {
			throw new Error(r.errors[0].message);
		} else {
			this.assertNoErrors(r);
		}
	}

	async emailInfo(token: string): Promise<string> {
		const r = await this.fetch<{email: string}>(new URL(`/api/v1/email/info?token=${encodeURIComponent(token)}`, this.baseUrl.href), {
			method: 'GET',
		})
		if (r.errors.length === 1 && r.errors[0].code === 'token_not_found') {
			throw new Error(r.errors[0].message);
		} else {
			this.assertNoErrors(r);
			return r.data.email;
		}
	}

	async emailVerify(token: string): Promise<void> {
		const r = await this.fetch<null>(new URL(`/api/v1/email/verify`, this.baseUrl.href), {
			method: 'POST',
			body: new URLSearchParams({ token }),
		})
		if (r.errors.length === 1 && r.errors[0].code === 'email_mismatch') {
			throw new Error(r.errors[0].message);
		} else if (r.errors.length === 1 && r.errors[0].code === 'token_invalid') {
			throw new Error(r.errors[0].message);
		} else {
			this.assertNoErrors(r);
		}
	}
};

const verifiers = [
	'pw',
	'otp_totp',
	'ctrl_email',
];

export { Ap, Af, Client, verifiers };
export type { Status, ApInput, AfInput, Identity, AxInput, UserLogin, Grant };
