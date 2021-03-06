import bops from 'bops'
import { browser } from '$app/env'
import type { UUID } from 'uuid'
import { get } from 'svelte/store'
import { storage } from '$lib/store'
import { goto } from '$app/navigation'

type Ulos = Map<UUID, ULO>
type Ulid = UUID | 'anonymous'

function marshalMap(u: Ulos): string {
	return JSON.stringify(Array.from(u.entries()))
}
function unmarshalMap(s: string): Ulos {
	return new Map(JSON.parse(s))
}
const ulos = storage<Ulos>('user-login-options', new Map(), marshalMap, unmarshalMap)
const currentUlid = storage<Ulid>('current-user-login-id', 'anonymous')

export function reset() {
	ulos.set(new Map())
	currentUlid.set('anonymous')
}

const prefix = '/api/v2/'

class Response<T> {
	data: T
	errors: Array<ResponseError>

	constructor(raw) {
		this.data = raw.data
		this.errors = raw.errors ? raw.errors.map((e) => new ResponseError(e)) : []
	}

	hasErrors() {
		return this.errors.length > 0
	}

	toString() {
		return `Response: ${this.data} ${this.errors}`
	}
}

class ResponseError {
	code: string
	message: string
	data

	constructor(raw) {
		this.code = raw.code
		this.message = raw.message
		this.data = raw.data
	}

	toString(): string {
		return `${this.code}: ${this.message}`
	}

	toError(): Error {
		if (this.code === 'missing_perms') {
			return new MissingPermsError(this.data.missing_perms, this.data.reason)
		}
		return new TypeError(`${this.code}: ${this.message} (${JSON.stringify(this.data)})`)
	}
}

type Perm = string

class MissingPermsError extends TypeError {
	missingPerms: Array<Perm>
	reason: string

	constructor(missingPerms: Array<Perm>, reason: string) {
		super(`Missing permissions: ${missingPerms.join(', ')} (${reason})`)
		this.name = 'MissingPerms'
		this.missingPerms = missingPerms
		this.reason = reason
	}
}

class EnhanceYourCalmError extends TypeError {
	limit: string

	constructor(limit: string) {
		super(`Enhance your calm: ${limit}`)
		this.name = 'EnhanceYourCalm'
		this.limit = limit
	}
}

class UnauthenticatedError extends TypeError {
	constructor() {
		super('Unauthenticated')
		this.name = 'Unauthenticated'
	}
}

class ManyErrors extends Error {
	errors: Array<Error>

	constructor(errors: Array<Error>) {
		super(`${errors.length} errors: ${errors.map((e) => e.toString()).join(', ')}`)
		this.name = 'ManyErrors'
		this.errors = errors
	}
}

type LoginAttemptResp = {
	success: boolean
	cur_done: boolean
	all_done: boolean
	feedback?
	msg?: string
	uid?: UUID
	ulid?: UUID
	slug?: string
	name?: string
	token?: string
}

type TAF = {
	tafid: UUID
	feedback
	done: boolean
}

type OClient = {
	user_id: string
	user_name: string
	name: string
	uri: string
	logo_uri: string
	tos_uri: string
	policy_uri: string
}

type OClient2 = {
	id?: string
	redirect_uris: Array<string>
	token_endpoint_auth_method: string
	grant_types: Array<string>
	response_types: Array<string>
	client_name: string
	client_uri: string
	logo_uri: string
	scope: string
	contacts: Array<string>
	tos_uri: string
	policy_uri: string
	jwks_uri: string
	jwks: Array<string>
	software_id: string
	software_version: string

	client_id: string
	client_secret: string
	client_id_issued_at: number
	client_secret_expires_at: number
}

type OClient2Input = {
	name: string
	uri: string
	grant_types: Array<string>
	redirect_uris: Array<string>
	response_types: Array<string>
	scope: string
	token_endpoint_auth_method: string
}

type Grant = {
	id: string
	args
	client: OClient
	request: {
		scope: string
		issued_at: number
		expires_at: number
		token_type: string
		has_refresh_token: boolean
	}
}

type UserLogin = {
	uuid: string
	name: string
	extra
	against: { uuid: string; name: string }
	start: Date
	last?: Date
	end?: Date
	reason?: string
	current: boolean
	invalid?: boolean
}

class Ax {
	aps: Array<Ap>
	afs: Array<Af>

	constructor(raw) {
		this.aps = raw.aps.map((a) => new Ap(a))
		this.afs = raw.afs.map((a) => new Af(a))
		console.log('axc-done', this.aps, raw.aps)
	}
}

class Ap {
	uuid: string
	name: string
	reqs: Array<UUID>

	constructor(ap) {
		console.log('apc', ap)
		this.uuid = ap.uuid
		this.name = ap.name
		this.reqs = ap.reqs
		console.log('apc2', this)
	}

	toInput(): ApInput {
		return {
			uuid: this.uuid,
			name: this.name,
			reqs: this.reqs
		}
	}
}

type AfPublic = {
	uuid: UUID
	name: string
	verifier: string
	public_params: unknown
}

class Af {
	uuid: string
	name: string
	verifier: string
	params
	public_params: unknown

	constructor(af) {
		this.uuid = af.uuid
		this.name = af.name
		this.verifier = af.verifier
		this.params = af.params
		this.public_params = af.public_params
	}

	toInput(): AfInput {
		return {
			uuid: this.uuid,
			name: this.name,
			verifier: this.verifier,
			params: this.params
		}
	}
}

class Status {
	user: { username: string; uuid: string }
	user_session: { uuid: string; name: string; against: string }
}

class Signup {
	token: string
	uid: string
	ulid: string
}

type IdInput = {
	slug: string
	name: string
	emails?: {
		add: Array<string>
		edit: Array<{ id: UUID; email: string }>
		delete: Array<UUID>
	}
}

class Id {
	slug: string
	name: string
	emails: Array<string>
	perms: Array<string>
	default_perms: Array<string>
	primary_group: Group
	groups: Array<Group>

	constructor(id) {
		this.slug = id.slug
		this.name = id.name
		this.emails = id.emails
		this.perms = id.perms
		this.default_perms = id.default_perms
		this.primary_group = id.primary_group
		this.groups = id.groups
	}

	toInput(): IdInput {
		return {
			slug: this.slug,
			name: this.name,
			emails: {
				add: [],
				edit: [],
				delete: []
			}
		}
	}
}

type Group = {
	id: string
	slug: string
	name: string
	emails: Array<Email>
	perms: Array<string>
}

type Email = {
	id: string
	email: string
	is_verified: boolean
}

type AxInput = {
	aps: Array<ApInput>
	del_aps: Array<string>
	del_afs: Array<string>
}

type ApInput = {
	uuid: string
	name: string
	reqs: Array<UUID>
}

type AfInput = {
	uuid: string
	name: string
	verifier: string | null
	params
}

type ULO = {
	uid: string
	ulid: string
	slug: string
	name: string
	token: string
	invalid?: boolean
}

type LooseULO = ULO | 'anonymous'

class User {
	uid: string
	name: string
	slug: string
}

export type LogEntry = {
	id: string
	created: Date
	renderer: string
	ssid2: string
	data: string
}

export enum Direction {
	Prev = 'p',
	Next = 'n'
}

export class Handler<R, V> {
	private client: BaseClient
	private name_: string
	// private cache: Map<R, { time: Date; v: V }>

	get name() {
		return this.name_
	}

	constructor(client: BaseClient, name: string) {
		this.client = client
		this.name_ = encodeURI(name)
	}

	private assertNoErrors<T>(res: Response<T>) {
		this.client._assertNoErrors(res)
	}

	private key(ref: R): string {
		return `generic_handler_${this.name_}_${ref.toString()}`
	}

	private cGet(ref: R): { time: Date; v: V } {
		return JSON.parse(window.localStorage.getItem(this.key(ref)))
	}

	private cSet(ref: R, v: V) {
		window.localStorage.setItem(this.key(ref), JSON.stringify({ time: new Date(), v }))
	}

	private cDel(ref: R) {
		window.localStorage.setItem(this.key(ref), undefined)
	}

	async deref(ref: R): Promise<V> {
		const cached = this.cGet(ref)
		if (cached) {
			// TODO: check expiry
			return cached.v
		}
		const r = await this.client._fetch<{ single: V }>(
			`generic/deref/${this.name}?ref=${encodeURIComponent(ref.toString())}`,
			{
				method: 'GET'
			}
		)
		this.assertNoErrors(r)
		const v = r.data.single
		this.cSet(ref, v)
		return v
	}

	async assign(ref: R, v: V): Promise<void> {
		const r = await this.client._fetch<null>(
			`generic/assign/${this.name}?ref=${encodeURIComponent(ref.toString())}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ v })
			}
		)
		this.assertNoErrors(r)
		// this.cache.set(ref, { time: new Date(), v })
		this.cSet(ref, v)
	}

	async del(ref: R): Promise<void> {
		const r = await this.client._fetch<null>(
			`generic/assign/${this.name}?ref=${encodeURIComponent(ref.toString())}`,
			{
				method: 'DELETE'
			}
		)
		this.assertNoErrors(r)
		// this.cache.set(ref, { time: new Date(), v })
		this.cDel(ref)
	}

	// private get cached(): Map<R, Date> {
	// 	const r = new Map()
	// 	for (const [k, v] of this.cache.entries()) {
	// 		r.set(k, v.time)
	// 	}
	// 	return r
	// }

	// async list(page: number, perPage: number): Promise<Map<R, V>> {
	// 	const r = await this.client._fetch<{ refs: R[]; values: [R, V][] }>(
	// 		`generic/list/${this.name}?page=${page}&per=${perPage}`,
	// 		{
	// 			method: 'GET',
	// 			headers: {
	// 				'Content-Type': 'application/json'
	// 			},
	// 			body: JSON.stringify({ cached: this.cached })
	// 		}
	// 	)
	// 	this.assertNoErrors(r)
	// 	const m = new Map<R, V>()
	// 	for (const r of r.data.refs) {
	// 		m.set(r, this.cache.get(r).v)
	// 	}
	// 	for (const [r, v] of r.data.values) {
	// 		this.cache.set(r, v)
	// 		m.set(r, v)
	// 	}
	// 	return m
	// }

	async seek(direction: Direction, offset: number, length: number): Promise<R[]> {
		offset = offset === null ? 0 : offset
		const r = await this.client._fetch<{ refs: R[] }>(
			`generic/seek/${this.name}?${new URLSearchParams({
				direction,
				offset,
				length: length.toString()
			})}`,
			{
				method: 'GET'
			}
		)
		this.assertNoErrors(r)
		return r.data.refs
	}

	async anchor(direction: Direction): Promise<R> {
		const r = await this.client._fetch<{ anchor: R }>(
			`generic/anchor/${this.name}?${new URLSearchParams({ direction })}`,
			{
				method: 'GET'
			}
		)
		this.assertNoErrors(r)
		return r.data.anchor
	}

	async total(): Promise<number> {
		const r = await this.client._fetch<{ total: number }>(`generic/total/${this.name}`, {
			method: 'GET'
		})
		this.assertNoErrors(r)
		return r.data.total
	}
}

class BaseClient {
	public baseUrl: URL
	protected currentToken?: string
	public currentUid?: UUID
	private disabled: boolean
	public log: Handler<string, LogEntry>

	constructor(baseUrl: string) {
		//if (!browser) throw new TypeError("can only use in a browser");
		this.disabled = !browser
		this.baseUrl = new URL(baseUrl)
		if (browser) this.loadCurrent()
		this.log = new Handler(this, 'log')
	}

	get currentUlo(): LooseULO {
		if (get(currentUlid) === undefined) {
			return 'anonymous'
		}
		return get(ulos).get(currentUlid)
	}

	toString(): string {
		return `[BaseClient ${this.baseUrl} ${this.currentToken}]`
	}

	uloWith(ulid: UUID): BaseClient {
		const this2 = new BaseClient(this.baseUrl.toString())
		this2.uloUse(ulid)
		return this2
	}

	public uloDel(ulid: UUID) {
		const ulos2 = get(ulos)
		ulos2.delete(ulid)
		ulos.set(ulos2)
	}

	public uloUse(ulid: UUID) {
		const ulo = get(ulos).get(ulid)
		if (ulo === undefined) throw new Error(`No such ULO: ${ulid}`)
		console.log(`use ulo with ulid ${ulid}: ${JSON.stringify(ulo)}`)
		this.currentToken = ulo.token
		this.currentUid = ulo.uid
		currentUlid.set(ulid)
	}

	protected uloAdd(ulo: ULO) {
		const ulos2 = get(ulos)
		ulos2.set(ulo.ulid, ulo)
		ulos.set(ulos2)
	}

	private loadCurrent() {
		const c = get(currentUlid)
		if (c === 'anonymous') {
			this.uloReset()
		} else if (c) {
			try {
				this.uloUse(c)
			} catch (e) {
				if (e.message.includes('No such ULO')) {
					console.log(`no such ULO (${e}), so reset`)
					this.uloReset()
				} else {
					throw e
				}
			}
		}
	}

	public uloReset() {
		this.currentToken = null
		this.currentUid = null
		currentUlid.set('anonymous')
	}

	async getCsrfToken(): Promise<string> {
		const r = await this.fetch<{ csrf_token: string }>(`csrf_token`, {
			method: 'GET'
		})
		this.assertNoErrors(r)
		return r.data.csrf_token
	}

	private async commonOpts(
		method: 'GET' | 'POST',
		headers?
	): Promise<{
		method: string
		credentials: string
		headers: Record<string, string>
	}> {
		return {
			method,
			credentials: 'include',
			headers: {
				...(method !== 'GET' ? { 'X-CSRFToken': await this.getCsrfToken() } : {}),
				...(this.currentToken ? { 'X-Airy-Token': this.currentToken } : {}),
				...headers
			}
		}
	}

	public _assertNoErrors<T>(res: Response<T>) {
		this.assertNoErrors(res)
	}

	protected assertNoErrors<T>(res: Response<T>) {
		if (res.hasErrors()) {
			if (res.errors.length === 1) {
				throw res.errors[0].toError()
			} else {
				const errors = res.errors.map((e) => e.toError())
				throw new ManyErrors(errors)
			}
		}
	}

	public _fetch<T>(url: string, opts): Promise<Response<T>> {
		return this.fetch(url, opts)
	}

	protected async fetch<T>(url: string, opts): Promise<Response<T>> {
		if (this.disabled) throw new TypeError('can only fetch in a browser')
		const prefix2 = new URL(prefix, this.baseUrl)
		console.log(`fetch ${url} with token ${this.currentToken}`)
		try {
			const r = await fetch(new URL(url, prefix2.href).href, {
				...opts,
				...(await this.commonOpts(opts.method, opts.headers))
			})
			switch (r.status) {
				case 200:
					break
				case 401:
					throw new UnauthenticatedError()
					return
				case 429:
					{
						const limit = (await r.json()).errors[0].data
						throw new EnhanceYourCalmError(limit)
					}
					return
				case 430:
					throw new TypeError('CSRF token not found')
					return
				default:
					throw new TypeError(`unexpected status ${r.status}`)
			}
			const raw = await r.json()
			console.log('raw', raw)
			const r2 = new Response<T>(raw)
			console.log('r2', r2)
			return r2
		} catch (e) {
			console.error(e)
			throw e
		}
	}
}

class Client extends BaseClient {
	// ================================
	// Miscellaenous
	// ================================

	uloWith(ulid: UUID): Client {
		const this2 = new Client(this.baseUrl.toString())
		this2.uloUse(ulid)
		return this2
	}

	async userExists(slug: string): Promise<boolean> {
		const r = await this.fetch<{ exists: boolean }>(
			`user/exists?slug=${encodeURIComponent(slug)}`,
			{
				method: 'GET'
			}
		)
		this.assertNoErrors(r)
		return r.data.exists
	}

	// ================================
	// Login/Logout
	// ================================

	async synchedLogin(): Promise<User | null> {
		const r = await this.fetch<{ user: User | null }>(`login/sync`, {
			method: 'GET'
		})
		this.assertNoErrors(r)
		return r.data.user
	}

	async loginSync(): Promise<void> {
		const r = await this.fetch<null>(`login/sync`, {
			method: 'POST'
		})
		this.assertNoErrors(r)
		console.log(`synched login with token ${this.currentToken}`)
	}

	async loggedIn(): Promise<boolean> {
		return !!this.currentToken
	}

	async checkLoggedIn(): Promise<boolean> {
		const r = await this.fetch<{ logged_in: boolean }>(`logged_in`, {
			method: 'GET'
		})
		this.assertNoErrors(r)
		return r.data.logged_in
	}

	async status(): Promise<Status> {
		const r = await this.fetch<Status>(`status`, {
			method: 'GET'
		})
		if (r.errors.length === 1 && r.errors[0].code === 'not_logged_in') {
			throw new TypeError('not logged in')
		} else {
			this.assertNoErrors(r)
			return r.data
		}
	}

	async loginStop(): Promise<void> {
		const r = await this.fetch<void>(`login/stop`, {
			method: 'POST'
		})
		this.assertNoErrors(r)
	}

	async loginStart(slug: string): Promise<{ uid: string; aps: Array<Ap> }> {
		const r = await this.fetch<{ uid: string; aps: Array<Ap> }>(`login/start`, {
			method: 'POST',
			body: new URLSearchParams({ slug })
		})
		if (r.errors.length === 1 && r.errors[0].code === 'user_not_found') {
			return null
		} else {
			this.assertNoErrors(r)
			return r.data
		}
	}

	async loginChoose(apid: UUID): Promise<{ afs: Array<AfPublic> }> {
		const r = await this.fetch<{ afs: Array<AfPublic> }>(`login/choose`, {
			method: 'POST',
			body: new URLSearchParams({ apid })
		})
		this.assertNoErrors(r)
		return r.data
	}

	async loginAttempt(afid: string, attempt: string, setToken = true): Promise<LoginAttemptResp> {
		const r = await this.fetch<LoginAttemptResp>(`login/attempt`, {
			method: 'POST',
			body: new URLSearchParams({ afid, attempt })
		})
		if (r.errors.length === 1 && r.errors[0].code === 'verification_failed') {
			return {
				success: false,
				cur_done: false,
				all_done: false,
				msg: r.errors[0].data
			}
		} else {
			this.assertNoErrors(r)
			if (r.data.all_done && setToken) {
				this.uloAdd({
					uid: r.data.uid,
					ulid: r.data.ulid,
					slug: r.data.slug,
					name: r.data.name,
					token: r.data.token
				})
				this.uloUse(r.data.ulid)
			}
			return {
				success: true,
				...r.data
			}
		}
	}

	async logout(setToken = true): Promise<void> {
		const r = await this.fetch<void>(`logout`, {
			method: 'POST'
		})
		this.assertNoErrors(r)
		if (setToken) {
			this.currentToken = null
			this.currentUid = null
		}
		return r.data
	}

	async signup(setToken = true): Promise<Signup> {
		const r = await this.fetch<Signup>(`signup`, {
			method: 'POST'
		})
		this.assertNoErrors(r)
		if (setToken) {
			this.uloAdd({
				uid: r.data.uid,
				ulid: r.data.ulid,
				slug: null,
				name: null,
				token: r.data.token
			})
			this.uloUse(r.data.ulid)
		}
		return r.data
	}

	async remoteDecide(token: string): Promise<void> {
		const r = await this.fetch<null>(`remote/decide`, {
			method: 'POST',
			body: new URLSearchParams({ token })
		})
		this.assertNoErrors(r)
	}

	remoteWait(uid: string, token: string): Promise<null> {
		return new Promise((resolve, reject) => {
			const prefix2 = new URL(prefix, this.baseUrl)
			const es = new EventSource(
				new URL(`remote/wait?uid=${uid}&token=${token}`, prefix2.href).href
			)
			es.addEventListener('decided', () => {
				es.close()
				resolve(null)
			})
			es.addEventListener('timeout', () => {
				es.close()
				reject(new TypeError('timeout'))
			})
		})
	}

	// ================================
	// Config: Authentication
	// ================================

	async getAx(): Promise<Ax> {
		const r = await this.fetch<Ax>(`config/ax`, {
			method: 'GET'
		})
		console.log('getAx1', r.data)
		console.log('getAx3', new Ax(r.data))
		return new Ax(r.data)
	}

	async submitAx(req: AxInput): Promise<{ tafids; warnings }> {
		const r = await this.fetch<{ tafids; warnings }>(`config/ax`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(req)
		})
		this.assertNoErrors(r)
		return r.data
	}

	// ================================
	// User: Public
	// ================================

	async user(uid: string): Promise<User | null> {
		const r = await this.fetch<User>(`user/${uid}`, {
			method: 'GET'
		})
		if (r.errors.length === 1 && r.errors[0].code === 'user_not_found') {
			return null
		} else {
			this.assertNoErrors(r)
			return r.data
		}
	}

	// ================
	// TAF
	// ================

	async clearTafs(): Promise<void> {
		const r = await this.fetch<null>('config/ax/taf/clear', {
			method: 'POST'
		})
		this.assertNoErrors(r)
	}

	async allocTaf(): Promise<UUID> {
		const r = await this.fetch<{ tafid: UUID }>('config/ax/taf/alloc', {
			method: 'POST'
		})
		this.assertNoErrors(r)
		return r.data.tafid
	}

	async deallocTaf(tafid: UUID): Promise<void> {
		const r = await this.fetch<void>(`config/ax/taf/dealloc?tafid=${encodeURIComponent(tafid)}`, {
			method: 'POST',
			body: new URLSearchParams({ tafid })
		})
		this.assertNoErrors(r)
	}

	async genTaf(tafid: string, af: AfInput, cont = false): Promise<TAF> {
		const r = await this.fetch<{ taf: TAF }>(`config/ax/taf/gen`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				cont,
				tafid,
				name: af.name,
				verifier: af.verifier,
				gen_params: af.params
			})
		})
		return r.data.taf
	}

	async verifyTaf(
		tafid: UUID,
		attempt: string
	): Promise<{ success: boolean; done: boolean; feedback?; msg?: string }> {
		const r = await this.fetch<{ done: boolean; feedback? }>(`config/ax/taf/verify`, {
			method: 'POST',
			body: new URLSearchParams({ tafid, attempt })
		})
		if (r.errors.length === 1 && r.errors[0].code === 'verification_failed') {
			return { success: false, done: false, msg: r.errors[0].data }
		} else {
			this.assertNoErrors(r)
			return { success: true, done: r.data.done, feedback: r.data.feedback }
		}
	}

	// ================================
	// Config: Identity
	// ================================

	async getId(): Promise<Id> {
		const r = await this.fetch<{ user: Id }>(`config/id`, {
			method: 'GET'
		})
		console.warn('getId', r)
		return r.data.user
	}

	async submitId(req: IdInput): Promise<void> {
		const r = await this.fetch<null>(`config/id`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(req)
		})
		this.assertNoErrors(r)
	}

	async submitImg(img): Promise<void> {
		const formData = new FormData()
		formData.append('img', img)
		const r = await this.fetch<null>(`config/id/img`, {
			method: 'POST',
			body: formData
		})
		this.assertNoErrors(r)
	}

	// ================================
	// User Logins
	// ================================

	async ulsList(): Promise<Array<UserLogin>> {
		const r = await this.fetch<{ uls: Array<UserLogin> }>('uls', {
			method: 'GET'
		})
		this.assertNoErrors(r)
		return r.data.uls.map((ul) => {
			return {
				...ul,
				start: new Date(ul.start),
				last: ul.last ? new Date(ul.last) : null,
				end: ul.end ? new Date(ul.end) : null
			}
		})
	}

	private async actionUl(action: string, ulid: string, name?: string): Promise<void> {
		const r = await this.fetch<null>(`uls/${action}`, {
			method: 'POST',
			body: new URLSearchParams({ ulid, ...(name ? { name } : {}) })
		})
		this.assertNoErrors(r)
	}

	async revokeUl(ulid: string): Promise<void> {
		await this.actionUl('revoke', ulid)
	}

	async deleteUl(ulid: string): Promise<void> {
		await this.actionUl('delete', ulid)
	}

	async editUl(ulid: string, name: string): Promise<void> {
		await this.actionUl('edit', ulid, name)
	}

	// ================================
	// OAuth
	// ================================

	async grantsList(): Promise<Array<Grant>> {
		const r = await this.fetch<{ grants: Array<Grant> }>('oauth/grants', {
			method: 'GET'
		})
		this.assertNoErrors(r)
		return r.data.grants
	}

	async grantsRevoke(grantId: string): Promise<void> {
		const r = await this.fetch<null>('oauth/grants/revoke', {
			method: 'POST',
			body: new URLSearchParams({ grant_id: grantId })
		})
		this.assertNoErrors(r)
	}

	private async getAzrq(azrqid: UUID): Promise<Record<string, string> | null> {
		const r = await this.fetch<{ args: Record<string, string> }>(
			`oauth/azrq?azrqid=${encodeURIComponent(azrqid)}`,
			{
				method: 'GET'
			}
		)
		if (r.errors.length === 1 && r.errors[0].code === 'azrq_not_found') {
			return null
		} else {
			this.assertNoErrors(r)
			return r.data.args
		}
	}

	async stepAzrq(azrqid: UUID): Promise<Grant | null> {
		const args = await this.getAzrq(azrqid)
		if (args == null) {
			return null
		}
		args.azrqid = azrqid
		const r = await this.fetch<{ grant: Grant }>(`oauth/az/step?${new URLSearchParams(args)}`, {
			method: 'POST'
		})
		this.assertNoErrors(r)
		return r.data.grant
	}

	async oclient(oclid: string): Promise<OClient2> {
		const r = await this.fetch<{ oclient: OClient2 }>(
			`oauth/oclient?oclid=${encodeURIComponent(oclid)}`,
			{
				method: 'GET'
			}
		)
		this.assertNoErrors(r)
		return r.data.oclient
	}

	async oclientsList(): Promise<Array<OClient2>> {
		const r = await this.fetch<{ oclients: Array<OClient2> }>('oauth/oclients', {
			method: 'GET'
		})
		this.assertNoErrors(r)
		return r.data.oclients.map((oclient) => ({
			...oclient,
			contacts: oclient.contacts ? oclient.contacts : [],
			jwks: oclient.jwks ? oclient.jwks : []
		}))
	}

	private async oclientAction(
		action: string,
		oclid: string | null,
		ocl?: OClient2Input
	): Promise<void> {
		const r = await this.fetch<null>(`oauth/oclients/${action}`, {
			method: 'POST',
			body: JSON.stringify({
				...(oclid ? { oclid } : {}),
				...(ocl ? { ocl } : {})
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		this.assertNoErrors(r)
	}

	async oclientDelete(oclid: string): Promise<void> {
		await this.oclientAction('delete', oclid)
	}

	async oclientEdit(oclid: string | null, ocl: OClient2Input): Promise<void> {
		await this.oclientAction('edit', oclid, ocl)
	}

	// ================================
	// Logs
	// ================================

	async logList(): Promise<Array<LogEntry>> {
		const r = await this.fetch<{ logs: Array<LogEntry> }>('logs', {
			method: 'GET'
		})
		this.assertNoErrors(r)
		return r.data.logs.map((log) => ({
			...log,
			created: new Date(log.created)
		}))
	}

	// ================================
	// Email Verification
	// ================================

	async emailVerifyStart(emailId: number): Promise<void> {
		const r = await this.fetch<null>(`email/verify/start`, {
			method: 'POST',
			body: new URLSearchParams({ email_id: emailId.toString() })
		})
		if (r.errors.length === 1 && r.errors[0].code === 'not_yours') {
			throw new Error(r.errors[0].message)
		} else {
			this.assertNoErrors(r)
		}
	}

	async emailInfo(token: string): Promise<string> {
		const r = await this.fetch<{ email: string }>(`email/info?token=${encodeURIComponent(token)}`, {
			method: 'GET'
		})
		if (r.errors.length === 1 && r.errors[0].code === 'token_not_found') {
			throw new Error(r.errors[0].message)
		} else {
			this.assertNoErrors(r)
			return r.data.email
		}
	}

	async emailVerify(token: string): Promise<void> {
		const r = await this.fetch<null>(`email/verify`, {
			method: 'POST',
			body: new URLSearchParams({ token })
		})
		if (r.errors.length === 1 && r.errors[0].code === 'email_mismatch') {
			throw new Error(r.errors[0].message)
		} else if (r.errors.length === 1 && r.errors[0].code === 'token_invalid') {
			throw new Error(r.errors[0].message)
		} else {
			this.assertNoErrors(r)
		}
	}
}

const verifiers = ['pw', 'otp_totp', 'ctrl_email']

const baseUrl = import.meta.env.VITE_API_BASE_URL as string

if (!baseUrl) {
	throw new Error(`invalid API Base URL: ${baseUrl}`)
}

const client = new Client(baseUrl)

export const autoSubmitVerifiers = ['limited'] // TODO: consider making Airy do this

export { client, ulos, currentUlid }
export { Ap, Af, Client, User, verifiers }
export type { Status, ApInput, AfPublic, AfInput, Id, AxInput, UserLogin, Grant, OClient, OClient2 }
export type { ULO, LooseULO }
export { MissingPermsError, UnauthenticatedError, ManyErrors }

function doc(path: string) {
	return new URL(path, import.meta.env.VITE_PAIMON_BASE_URL as string).href
}

export { doc }

function fixBase64(s: string): string {
	while (s.length % 4 !== 0) {
		s += '='
	}
	return s
}

function encodeBase64(a: ArrayBuffer): string {
	return bops.to(new Uint8Array(a), 'base64')
}

function decodeBase64(s: string): Uint8Array {
	return bops.from(fixBase64(s), 'base64')
}

export { encodeBase64, decodeBase64 }

async function forceLogin() {
	if (!(await client.loggedIn())) {
		goto('/closet')
	}
}

export { forceLogin }
