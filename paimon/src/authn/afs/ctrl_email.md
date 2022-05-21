# Control of Email Address

TODO: not implemented.

## Internals

1. Yuui attempts with  `attempt.stage = 'init'`
2. Airy sends a message[^msg] to `params.recipient`
3. Yuui attempts again with `attempt = {stage: 'nonce', nonce: nonceFromUser}`
4. Airy verifies the nonce[^sc] and replies
5. Yuui may retry:
  1. without re-sending a message[^msg] (`attempt.stage = 'init'`)
	2. by re-sending a message and invalidating the old nonce (`attempt.stage = 'nonce'`)

[^msg]: an OpenPGP-encrypted email (using `params.pgp_public_key`) with a nonce
[^sc]: remember side-channel attacks
