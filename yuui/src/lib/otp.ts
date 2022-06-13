function newUrl(options: {
	issuer: string
	user: string
	key: string
	algorithm: string
	digits: number
	period: number
}): URL {
	const u = new URL(`otpauth://totp/${encodeURI(options.issuer)}:${encodeURI(options.user)}`)
	const p = new URLSearchParams()
	p.set('secret', options.key)
	p.set('algorithm', options.algorithm)
	p.set('digits', options.digits.toString())
	p.set('period', options.period.toString())
	p.set('issuer', options.issuer)
	u.search = p.toString()
	return u
}

export { newUrl }
