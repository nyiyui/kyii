const untitled = "Untitled";
const loading = "Loading\u2026";
const global_bar = {
  self: "Kyii Yuui",
  kiki: "Kiki"
};
const header = {
  home: "Kyii Yuui",
  ui: "UI Test",
  loading: "Loading\u2026",
  config: "Config",
  uls: "Sessions",
  oclients: "Clients",
  grants: "Grants",
  login: "Login",
  signup: "Signup",
  iori: "Switch",
  les: "Log"
};
const config = {
  update: "Update",
  "new": "New",
  "delete": "Delete",
  id: {
    title: "Identity",
    img: {
      dropzone: "Drag here or click to select update your profile picture.",
      preview: {
        title: "Preview"
      }
    },
    uid: "User ID",
    uid_help: "This is permanent.",
    slug: "Username / slug",
    name: "Name",
    blank: "Cannot be blank",
    current: "Current",
    available: "Available"
  },
  ax: {
    title: "Authentication",
    login_required: '<a href="/login">Logging in</a> is required to configure authentication.',
    del_taf: "Delete TAF",
    gen_taf: "Generate TAF",
    alloc_taf: "Regenerate AF (allocate TAF)",
    meta: "Meta",
    params: "Params",
    preview: "Preview (temporary AF)",
    preview_state: "State is temporary.",
    feedback: "Feedback"
  },
  client: {
    title: "Other",
    help: "These settings are specific to this client and is not connected to any sessions.",
    etc: "Other",
    api_base_url: "Airy API base URL",
    paimon_base_url: "Paimon Docs base URL",
    debug: "Debug",
    debug_mode: "Debug mode",
    debug_mode_help: "This only shows data already available to Yuui (hidden if Debug Mode is off).",
    allow_anonymous: "Allow anonymous sessions",
    allow_anonymous_help: "Allow anonymous sessions, allowing you to choose an anonymous session voluntarily",
    allow_mulpu: "Allow multiple sessions per user",
    allow_mulpu_help: "Allow multiple sessions to concurrently login on this client for a given user",
    dev_oauth: "OAuth developer mode",
    dev_oauth_help: "Show UIs mainly for OAuth development.",
    reset: "Factory reset",
    reset_help: "Re-initalize all data stored on this client.",
    cs: {
      title: "Colour Scheme",
      light: "Light",
      dark: "Dark",
      help: "To change this, change your User Agent's colour scheme settings."
    },
    commit: {
      title: "Build Commit"
    }
  }
};
const login = {
  username: "Username",
  user_not_found: "User not found",
  user_mulpu: "User already logged in",
  aps: "Authentication Paths",
  afs: "Authentication Factors",
  logged_in: "Logged in",
  next: "Next",
  pending: "Pending"
};
const iori = {
  anonymous: "No session",
  switcher: {
    "switch": "Switch",
    or: 'Or, <a href="/login?selfnext=/iori">login</a>.'
  },
  ulo: {
    choose: "Choose",
    logout: "Logout",
    "delete": "Delete/Forget",
    invalid: "Invalid"
  },
  user: {
    profile: "profile"
  },
  synched: "Synched to chosen session."
};
const ap_select = {
  placeholder: "Choose an AP\u2026"
};
const af_select = {
  placeholder: "Choose an AF\u2026"
};
const af = {
  submit: "Submit",
  pw: {
    label: "Password",
    pw: "Password"
  },
  otp_totp: {
    label: "TOTP",
    challenge: "Challenge",
    qr: "Enrollment QR Code",
    details: "Details",
    secret_key: "Secret key",
    algorithm: "Hash function",
    digits: "Digits",
    period: "Period/interval"
  },
  limited: {
    label: "Counted Limit",
    times: "Times"
  },
  webauthn: {
    label: "WebAuthn",
    req_uv: "Require user verification"
  },
  remote: {
    label: "Remote Verification",
    submit: "Refresh",
    generating: "Generting token\u2026",
    wait: "Approve it within {timeout, plural, one {# second} other {# seconds}}.",
    too_late: "Request expired. Regenerate to continue.",
    "do": "Token: {remoteToken}",
    steps: [
      'From an already-logged-in device, go to "Remote Authorization".',
      "Enter the token below:"
    ],
    or_qr: 'Or, scan the QR code below and click "Allow".',
    resend: "Regenerate token",
    not_yet: "Waiting for authorization by user\u2026",
    expired: "Authorization request expired."
  }
};
const user = {
  no_uid: "Invalid page: no UID supplied",
  error: "Error: {error}"
};
const ul = {
  reason: {
    revoke: "Manual revocation",
    logout: "Controller-side logout"
  },
  tag: {
    you: "You",
    ongoing: "Ongoing",
    revoked: "Revoked",
    logged_out: "Logged out",
    ended: "Ended"
  }
};
const grants = {
  count: "{count, plural, =0 {No grants} one {# grant} other {# grants}}."
};
const oclients = {
  reload: "Reload",
  "new": "New",
  count: "{count, plural, =0 {No clients} one {# client} other {# clients}}."
};
const oclient = {
  title: "App {name}",
  public_link: "Public link",
  public_preview: "Preview of public info",
  links: "Links",
  meta: "Metadata",
  oauth: "OAuth Settings",
  identity: "Identity",
  id: "ID",
  client_id: "OAuth ID",
  client_id_issued_at: "OAuth ID issued At",
  client_secret: "OAuth secret",
  client_secret_expires_at: "OAuth secret expires at",
  redirect_uris: "Redirect URIs",
  token_endpoint_auth_method: "Token endpoint auth method",
  grant_types: "Grant types",
  response_types: "Response types",
  scope: "Scope",
  jwks_uri: "JWKS URI",
  jwks: "JWKS",
  client_name: "Name",
  client_uri: "URI",
  logo: "Logo",
  author: "Author",
  logo_uri: "Logo URI",
  contacts: "Contacts",
  tos_uri: "Terms of service URI",
  policy_uri: "Privacy policy URI",
  software_id: "Software ID",
  software_version: "Software version",
  update: "Save",
  "delete": "Delete"
};
const list_input = {
  "new": "New",
  "delete": "Delete"
};
const oauth2 = {
  sub: "Your User ID (i.e. {uid})",
  scopes: {
    openid: "OpenID Connect",
    profile: "View your profile",
    email: "View your email",
    address: "View your address",
    phone: "View your phone",
    offline_access: "Unattended access"
  }
};
const index = {
  logged_in_as: "You are logged in as:",
  login_pls: 'Please <a href="/login?selfnext=/iori">login</a>.'
};
const langs = {
  label: "UI Language",
  user_agent: "Per User Agent: {label}",
  fallback: "Fallback",
  help: "Please reload to propagate changes.",
  en: "English",
  ja: "Japanese / \u65E5\u672C\u8A9E"
};
const authz = {
  already_used: "Authorization Request already used.",
  retry: "To retry authorizing, a new Authorization Request must be made. Going back may help with that.",
  go_back: "Go back",
  prompt: "The following client is requesting access to {user_name} account:",
  client_lhs: "Client:",
  then: "If you allow, the client will have access to:",
  title: "Authorize",
  allow: "Allow",
  deny: "Deny"
};
const closet = {
  title: "Select a Session",
  move: "Go to the next page when you are happy with your choice.",
  next: "Go to the next page",
  no_next: "Next page not given."
};
const logout = {
  logout: "Logout"
};
const le = {
  login: {
    desc: "New session {ulid} created."
  },
  login_start: {
    desc: "Login attempt started from {remote}"
  },
  login_choose: {
    desc: "AP {apid} was chosen to be authenticated against."
  },
  login_attempt: {
    "true": "Authentication against AF {afid} succeeded.",
    "false": "Authentication against AF {afid} failed."
  },
  remote: {
    desc: "Token {token} authorized."
  }
};
const les = {
  reload: "Reload",
  count: "{count, plural, =0 {No entries} one {# entry} other {# entries}}."
};
const generic = {
  page: "Page {page}",
  prev: "Next",
  next: "Previous",
  reload: "Reload"
};
const generics = {
  le: {
    seeked: "{seekLength} of {total, plural, =0 {0 entries} one {# entry} other {# entries}}."
  }
};
var enCA = {
  untitled,
  loading,
  global_bar,
  header,
  config,
  login,
  iori,
  ap_select,
  af_select,
  af,
  user,
  ul,
  grants,
  oclients,
  oclient,
  list_input,
  oauth2,
  "private": {
    title: "Private"
  },
  "public": {
    title: "Public"
  },
  index,
  langs,
  authz,
  closet,
  logout,
  "remote-decide": {
    title: "Remote Authorization",
    warn: "Allowing a token may grant access to your account (by solving an AF).",
    token_label: "Token",
    button_value: "Allow"
  },
  le,
  les,
  generic,
  generics
};
export { af, af_select, ap_select, authz, closet, config, enCA as default, generic, generics, global_bar, grants, header, index, iori, langs, le, les, list_input, loading, login, logout, oauth2, oclient, oclients, ul, untitled, user };
