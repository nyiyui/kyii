# TOTP

`otp_totp` uses TOTP (obviously).

TODO: `otp_totp` doesn't work with Google Authenticator (probably wrong default `params`) (it does work with others, such as [KeePassXC](https://keepassxc.org/))

## Internals

This uses [PyOTP](https://pyauth.github.io/pyotp/) to perform the mathy stuff.
Once an OTP is used, it is disallowed from being used again (by storing the latest hash in `state`).
