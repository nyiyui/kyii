# Password

`pw` is a normal password authentication thingy.

## Internals

It can also be initally set to use hashes compatible with Django (with `params.compat = 'django_pbkdf2_sha256'`);
the hashes are re-hashed using [`nacl.pwhash.str`](https://pynacl.readthedocs.io/en/latest/api/pwhash/) every time the hash is correctly answered.
This keeps the hash up-to-date (in terms of hashing algorithms, parameters, etc) and avoids storing the password itself in the database.
