# Config

## Identity

Currently, configuring emails, groups, and their perms are not possible.

Note: UUID of Users are immutable.

## Authentication

You always cannot view an AF's state or params.
To reconfigure an AF, you must regenerate it.
Regenerating an AF may have side effects. E.g. regenerating an `otp_totp` should generate a new secret and feedback the secret.

### VAFs
New AFs generated are always _virtual_ (VAF), meaning they do not have a corresponding TAF on Airy (when they do, AFs are called TAFs).
Allocating a TAF creates an API session-backed AF. Therefore, TAFs are not available across different sessions, and switching to another session may result in data loss. Also, since the config page doesn't store TAF data persistently, TAFs are lost on the Yuui side as well when reloaded.

Note: VAFs may not be selected as requirements by APs, as they do not have a UUID tracked by Airy.
