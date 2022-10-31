import { c as create_ssr_component, a as subscribe, e as escape, i as createEventDispatcher, v as validate_component, p as each } from "../../chunks/index-f5dba6f6.js";
import { c as currentUlid, u as ulos, Y } from "../../chunks/api2-d3db0bec.js";
import { L as Loading } from "../../chunks/Loading-959b154e.js";
import { B as BoxError } from "../../chunks/BoxError-72b3eba1.js";
import { B as Box } from "../../chunks/Box-abf00c5f.js";
import { d as debugMode } from "../../chunks/store-875eeb2f.js";
import "tslib";
import "bops";
import "../../chunks/Icon-7665d048.js";
import "../../chunks/functions-60a079cb.js";
const Scope = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentUlid, $$unsubscribe_currentUlid;
  let $ulos, $$unsubscribe_ulos;
  let $_, $$unsubscribe__;
  $$unsubscribe_currentUlid = subscribe(currentUlid, (value) => $currentUlid = value);
  $$unsubscribe_ulos = subscribe(ulos, (value) => $ulos = value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let { name } = $$props;
  let ulo = $ulos.get($currentUlid);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  $$unsubscribe_currentUlid();
  $$unsubscribe_ulos();
  $$unsubscribe__();
  return `${name === "openid" ? `<a href="${"https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims"}">${escape($_({
    id: "oauth2.sub",
    values: { uid: ulo.uid }
  }))}</a>` : `${escape($_(`oauth2.scopes.${name}`))}`}
(<code>${escape(name)}</code>)`;
});
const Client = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { client } = $$props;
  if ($$props.client === void 0 && $$bindings.client && client !== void 0)
    $$bindings.client(client);
  return `<a href="${"/oclient?oclid=" + escape(client.client_id, true)}">${escape(client.name)}</a> by
<a href="${"/user?uid=" + escape(client.user_id, true)}">${escape(client.user_name)}</a>`;
});
var Grant_svelte_svelte_type_style_lang = "";
const css = {
  code: ".meta.svelte-1b7sxv4>h2.svelte-1b7sxv4{flex-grow:1}.meta.svelte-1b7sxv4>.action.svelte-1b7sxv4{align-self:flex-end}",
  map: null
};
const Grant = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $debugMode, $$unsubscribe_debugMode;
  $$unsubscribe_debugMode = subscribe(debugMode, (value) => $debugMode = value);
  createEventDispatcher();
  let { grant } = $$props;
  let revoked = grant.request.issued_at === grant.request.expires_at;
  let error;
  if ($$props.grant === void 0 && $$bindings.grant && grant !== void 0)
    $$bindings.grant(grant);
  $$result.css.add(css);
  $$unsubscribe_debugMode();
  return `<section class="${"grant panel flex flex-column"}"><div class="${"meta flex flex-row svelte-1b7sxv4"}"><h2 class="${"svelte-1b7sxv4"}">Grant <code>${escape(grant.id)}</code></h2>
		<div class="${"tags"}">${revoked ? `<span class="${"tag"}">Revoked</span>` : ``}</div>
		<div class="${"action svelte-1b7sxv4"}"><input class="${"delete"}" type="${"button"}" value="${"Revoke (delete)"}" ${revoked ? "disabled" : ""}>
			${$debugMode ? `<input class="${"delete"}" type="${"button"}" value="${"Force revoke"}">` : ``}
			${validate_component(BoxError, "BoxError").$$render($$result, { msg: error, passive: true }, {}, {})}</div></div>
	<div class="${"content"}">To: ${validate_component(Client, "Client").$$render($$result, { client: grant.client }, {}, {})}<br>
		Scopes:
		<ul>${each(grant.request.scope.split(" "), (name) => {
    return `<li>${validate_component(Scope, "Scope").$$render($$result, { name }, {}, {})}</li>`;
  })}</ul>
		Issued at: ${escape(new Date(grant.request.issued_at * 1e3))}<br>
		${validate_component(Box, "Box").$$render($$result, { level: "debug" }, {}, {
    default: () => {
      return `Expires at: ${escape(new Date(grant.request.expires_at * 1e3))}<br>
			Has refresh token: ${escape(grant.request.has_refresh_token ? "yes" : "no")}<br>
			Token type: <code>${escape(grant.request.token_type)}</code><br>
			<code>${escape(JSON.stringify(grant, null, 2))}</code>`;
    }
  })}</div>
</section>`;
});
const Grants = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let grants;
  let error = "";
  var State;
  (function(State2) {
    State2[State2["Loading"] = 0] = "Loading";
    State2[State2["LoadingError"] = 1] = "LoadingError";
    State2[State2["Loaded"] = 2] = "Loaded";
  })(State || (State = {}));
  let state;
  $$unsubscribe__();
  return `<main class="${"grants"}"><input type="${"button"}" value="${"Reload"}" ${state === State.Loading ? "disabled" : ""}>
	${state === State.Loading ? `${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}` : `${state === State.LoadingError ? `${validate_component(BoxError, "BoxError").$$render($$result, { msg: error, passive: true }, {}, {})}` : `${state === State.Loaded ? `${escape($_("grants.count", { values: { count: grants.length } }))}
		${each(grants, (grant) => {
    return `${validate_component(Grant, "GrantView").$$render($$result, { grant }, {}, {})}`;
  })}` : ``}`}`}</main>`;
});
export { Grants as default };
