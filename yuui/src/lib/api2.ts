import { browser } from "$app/env";
import type { UUID } from "uuid";
import { get } from 'svelte/store';
import { storage } from '$lib/store';

type Ulos = Map<UUID, ULO>;
type Ulid = UUID | "anonymous";

function marshalMap(u: Ulos): string {
	return JSON.stringify(Array.from(u.entries()));
}
function unmarshalMap(s: string): Ulos {
	return new Map(JSON.parse(s));
}
const ulos = storage<Ulos>('user-login-options', new Map(), marshalMap, unmarshalMap);
const currentUlid = storage<Ulid>('current-user-login-id', "anonymous");

const prefix = "/api/v2/";

class Response<T> {
	data: T;
	errors: Array<ResponseError>;

	constructor(raw) {
		this.data = raw.data;
		this.errors = raw.errors ? raw.errors.map(e => new ResponseError(e)) : [];
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
	
	constructor(raw) {
		this.code = raw.code;
		this.message = raw.message;
		this.data = raw.data;
	}

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
	msg?: string,
	uid?: UUID,
	ulid?: UUID,
	slug?: string,
	name?: string,
	token?: string,
}

type TAF = {
	tafid: UUID,
	feedback,
}

type Client = {
	user_id: string,
	name: string,
	uri: string,
}

type Grant = {
	id: string,
	args,
	client: Client,
	request: {
		scope: string,
		issued_at: number,
		expires_at: number,
		token_type: string,
		has_refresh_token: boolean,
	},
};

type UserLogin = {
	uuid: string,
	name: string,
	extra,
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

type ULO = {
	uid: string,
	ulid: string,
	slug: string,
	name: string,
	token: string,
};

type LooseULO = ULO | "anonymous";

type User = {
	uid: string,
	name: string,
	slug: string,
}

class BaseClient {
	public baseUrl: URL;
	protected currentToken?: string;
	public currentUid?: UUID;
	public currentUlid?: UUID;
	private disabled: boolean;

	constructor(baseUrl: string) {
		//if (!browser) throw new TypeError("can only use in a browser");
		this.disabled = !browser;
		this.baseUrl = new URL(baseUrl);
		if (browser) this.loadCurrent();
	}

	get currentUlo(): ULO {
		if (this.currentUlid === undefined) {
			return "anonymous";
		}
		return get(ulos).get(this.currentUlid);
	}

	toString(): string {
		return `[BaseClient ${this.baseUrl} ${this.currentToken}]`;
	}

	uloWith(ulid: UUID): BaseClient {
		const this2 = new BaseClient(this.baseUrl.toString());
		this2.uloUse(ulid);
		return this2;
	}

	public uloDel(ulid: UUID) {
		const ulos2 = get(ulos);
		ulos2.delete(ulid);
		ulos.set(ulos2);
	}

	public uloUse(ulid: UUID) {
		console.log(ulos);
		console.log(get(ulos));
		const ulo = get(ulos).get(ulid);
		if (ulo === undefined)
			throw new Error(`No such ULO: ${ulid}`);
		if (ulo === "anonymous")
			throw new TypeError("cannot use anonymous user");
		console.log(`use ulo with ulid ${ulid}: ${JSON.stringify(ulo)}`);
		this.currentToken = ulo.token;
		this.currentUid = ulo.uid;
		this.currentUlid = ulid;
		currentUlid.set(ulid);
	}

	protected uloAdd(ulo: ULO) {
		if (ulo === "anonymous")
			throw new TypeError("cannot add anonymous user");
		const ulos2 = get(ulos);
		ulos2.set(ulo.ulid, ulo);
		ulos.set(ulos2);
	}

	private loadCurrent() {
		const c = get(currentUlid);
		if (c === "anonymous") {
			this.uloReset();
		} else if (c) {
			this.uloUse(c);
		}
	}

	public uloReset() {
		this.currentToken = null;
		this.currentUid = null;
		this.currentUlid = null;
		currentUlid.set("anonymous");
	}

	async getCsrfToken(): Promise<string> {
		const r = await this.fetch<{csrf_token: string}>(`csrf_token`, {
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
				...this.currentToken ? {'X-Airy-Token': this.currentToken} : {},
				...headers,
			},
		};
	}

	protected assertNoErrors<T>(res: Response<T>) {
		if (res.hasErrors()) {
			if (res.errors.length === 1) {
				throw res.errors[0].toError();
			} else {
				const errors = res.errors.map(e => e.toError());
				throw new ManyErrors(errors);
			}
		}
	}

	protected async fetch<T>(url: string, opts): Promise<Response<T>> {
		if (this.disabled) throw new TypeError("can only fetch in a browser");
		const prefix2 = new URL(prefix, this.baseUrl);
		console.log(`fetch ${url} with token ${this.currentToken}`);
		const r = await fetch(new URL(url, prefix2.href).href, {
			...opts,
			...(await this.commonOpts(opts.method, opts.headers)),
		});
		if (r.status !== 200) {
			throw new TypeError(`unexpected status ${r.status}`);
		}
		const r2 = new Response<T>(await r.json());
		console.log(r2);
		return r2;
	}
}

class Client extends BaseClient {
	// ================================
	// Miscellaenous
	// ================================
	
	uloWith(ulid: UUID): Client {
		const this2 = new Client(this.baseUrl.toString());
		this2.uloUse(ulid);
		return this2;
	}

	async userExists(slug: string): Promise<boolean> {
		const r = await this.fetch<{exists: boolean}>(`user/exists?slug=${encodeURIComponent(slug)}`, {
			method: 'GET',
		})
		this.assertNoErrors(r);
		return r.data.exists;
	}

	// ================================
	// Login/Logout
	// ================================

	async synchedLogin(): Promise<User|null> {
		const r = await this.fetch<{user: User|null}>(`login/sync`, {
			method: 'GET',
		})
		this.assertNoErrors(r);
		return r.data.user;
	}

	async syncLogin(): Promise<void> {
		const r = await this.fetch<null>(`login/sync`, {
			method: 'POST',
		})
		this.assertNoErrors(r);
		console.log(`synched login with token ${this.currentToken}`);
	}

	async loggedIn(): Promise<boolean> {
		return !!this.currentToken;
		// lazy
		//const r = await this.fetch<{logged_in: boolean}>(`logged_in`, {
		//	method: 'GET',
		//})
		//this.assertNoErrors(r);
		//return r.data.logged_in;
	}

	async status(): Promise<Status> {
		const r = await this.fetch<Status>(`status`, {
			method: 'GET',
		})
		if (r.errors.length === 1 && r.errors[0].code === 'not_logged_in') {
			throw new TypeError("not logged in");
		} else {
			this.assertNoErrors(r);
			return r.data;
		}
	}

	async loginStop(): Promise<void> {
		const r = await this.fetch<void>(`login/stop`, {
			method: 'POST',
		});
		this.assertNoErrors(r);
	}

	async loginStart(slug: string): Promise<{aps: Array<Ap>}> {
		const r = await this.fetch<{aps: Array<Ap>}>(`login/start`, {
			method: 'POST',
			body: new URLSearchParams({ slug }),
		})
		if (r.errors.length === 1 && r.errors[0].code === 'user_not_found') {
			return null;
		} else {
			this.assertNoErrors(r);
			return r.data;
		}
	}

	async loginChoose(apid: UUID): Promise<{afs: Array<Af>}> {
		const r = await this.fetch<{afs: Array<Af>}>(`login/choose`, {
			method: 'POST',
			body: new URLSearchParams({ apid }),
		})
		this.assertNoErrors(r);
		return r.data;
	}

	async loginAttempt(afid: string, attempt: string, setToken = true): Promise<LoginAttemptResp> {
		const r = await this.fetch<LoginAttemptResp>(`login/attempt`, {
			method: 'POST',
			body: new URLSearchParams({ afid, attempt }),
		})
		if (r.errors.length === 1 && r.errors[0].code === 'verification_failed') {
			return {
				success: false,
				done: false,
				msg: r.errors[0].data,
			};
		} else {
			this.assertNoErrors(r);
			if (r.data.done && setToken) {
				this.uloAdd({
					uid: r.data.uid,
					ulid: r.data.ulid,
					slug: r.data.slug,
					name: r.data.name,
					token: r.data.token,
				});
				this.uloUse(r.data.ulid);
			}
			return {
				success: true,
				...r.data,
			};
		}
	}

	async logout(setToken = true): Promise<void> {
		const r = await this.fetch<void>(`logout`, {
			method: 'POST',
		});
		this.assertNoErrors(r);
		if (setToken) {
			this.currentToken = null;
			this.currentUid = null;
		}
		return r.data;
	}

	async signup(): Promise<{token: string}> {
		const r = await this.fetch<{token: string}>(`signup`, {
			method: 'POST',
		});
		this.assertNoErrors(r);
		return r.data;
	}

	// ================================
	// Config: Authentication
	// ================================

	async getAx(): Promise<Ax> {
		const r = await this.fetch<Ax>(`config/ax`, {
			method: 'GET',
		})
		return new Ax(r.data.aps, r.data.afs);
	}

	async submitAx(req: AxInput): Promise<void> {
		await this.fetch(`config/ax`, {
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
		const r = await this.fetch<{tafid: UUID}>('config/ax/taf/alloc', {
			method: 'POST',
		})
		this.assertNoErrors(r);
		return r.data.tafid;
	}

	async deallocTaf(tafid: UUID): Promise<void> {
		const r = await this.fetch<void>(`config/ax/taf/dealloc?tafid=${encodeURIComponent(tafid)}`, {
			method: 'POST',
			body: new URLSearchParams({ tafid }),
		})
		this.assertNoErrors(r);
	}

	async setTaf(tafid: string, af: AfInput): Promise<TAF> {
		const r = await this.fetch<{taf: TAF}>(`config/ax/taf/set`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ tafid, name: af.name, verifier: af.verifier, gen_params: af.params }),
		});
		return r.data.taf;
	}

	async attemptTaf(tafid: UUID, attempt: string): Promise<{success: boolean, msg?: string}> {
		const r = await this.fetch(`config/ax/taf/attempt`, {
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
		const r = await this.fetch<{user: Id}>(`config/id`, {
			method: 'GET',
		})
		console.warn('getId', r);
		return r.data.user;
	}

	async submitId(req: IdInput): Promise<void> {
		await this.fetch<null>(`config/id`, {
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
		const r = await this.fetch<{uls: Array<UserLogin>}>('uls', {
			method: 'GET',
		})
		this.assertNoErrors(r);
		return r.data.uls;
	}

	private async actionUl(action: string, ulid: string, name?: string): Promise<void> {
		await this.fetch<null>(`uls/${action}`, {
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

	async grantsList(): Promise<Array<Grant>> {
		const r = await this.fetch<{grants: Array<Grant>}>('oauth/grants', {
			method: 'GET',
		})
		this.assertNoErrors(r);
		return r.data.grants;
	}

	async grantsRevoke(grantId: string): Promise<boolean> {
		const r = await this.fetch<{grants: Array<null>}>('oauth/grants/revoke', {
			method: 'POST',
			body: new URLSearchParams({ grant_id: grantId }),
		})
		if (r.errors.length === 1 && r.errors[0].code === 'no_grants') {
			return false
		} else {
			this.assertNoErrors(r);
			return true;
		}
	}

	async getAzrq(azrqid: UUID): Promise<Grant | null> {
		const r = await this.fetch<{azrq: Grant | null}>(`oauth/azrq?azrqid=${encodeURIComponent(azrqid)}`, {
			method: 'GET',
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
		const r = await this.fetch<null>(`email/verify/start`, {
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
		const r = await this.fetch<{email: string}>(`email/info?token=${encodeURIComponent(token)}`, {
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
		const r = await this.fetch<null>(`email/verify`, {
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


const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

if (!baseUrl) {
	throw new Error(`invalid API Base URL: ${baseUrl}`);
}

const client = new Client(baseUrl);

export { client, ulos };
export { Ap, Af, Client, verifiers };
export type { Status, ApInput, AfInput, Id, AxInput, UserLogin, Grant, User };
export type { ULO, LooseULO };
export { MissingPermsError, ManyErrors };
