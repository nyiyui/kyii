import { c as create_ssr_component, a as subscribe, e as escape, b as add_attribute, p as each, v as validate_component } from "../../chunks/index-f5dba6f6.js";
import { Y } from "../../chunks/api2-d3db0bec.js";
import { B as BoxError } from "../../chunks/BoxError-72b3eba1.js";
import { L as Loading } from "../../chunks/Loading-959b154e.js";
import { B as Box } from "../../chunks/Box-abf00c5f.js";
/* empty css                                                               */import { p as page } from "../../chunks/stores-c7a7782c.js";
import "../../chunks/store-875eeb2f.js";
import "tslib";
import "bops";
import "../../chunks/Icon-7665d048.js";
import "../../chunks/functions-60a079cb.js";
const css = {
  code: ".oclient.svelte-5fdpp0 .left.svelte-5fdpp0{flex-grow:1;display:flex;flex-direction:column}.links.svelte-5fdpp0.svelte-5fdpp0{display:flex;flex-direction:column}",
  map: null
};
const OClientView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let { ocl } = $$props;
  let { name } = $$props;
  let { userId } = $$props;
  let { userName } = $$props;
  if ($$props.ocl === void 0 && $$bindings.ocl && ocl !== void 0)
    $$bindings.ocl(ocl);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.userId === void 0 && $$bindings.userId && userId !== void 0)
    $$bindings.userId(userId);
  if ($$props.userName === void 0 && $$bindings.userName && userName !== void 0)
    $$bindings.userName(userName);
  $$result.css.add(css);
  $$unsubscribe__();
  return `<h2>${escape($_({
    id: "oclient.title",
    values: { name: ocl.name || name }
  }))}</h2>
<div class="${"oclient flex svelte-5fdpp0"}"><div class="${"left svelte-5fdpp0"}"><img${add_attribute("alt", $_("oclient.logo"), 0)} class="${"user-img"}"${add_attribute("src", ocl.logo_uri, 0)}>
		<div>${escape($_("oclient.author"))}
			<a${add_attribute("href", `/user?uid=${ocl.user_id || userId}`, 0)}>${escape(ocl.user_name || userName)}</a></div>
		<div>${escape($_("oclient.contacts"))}
			<ul>${each(ocl.contacts, (contact) => {
    return `<li>${escape(contact)}</li>`;
  })}</ul></div></div>
	<div class="${"links flex-in svelte-5fdpp0"}"><h3>${escape($_("oclient.links"))}</h3>
		<a${add_attribute("href", ocl.policy_uri, 0)}>${escape($_("oclient.policy_uri"))}</a>
		<a${add_attribute("href", ocl.tos_uri, 0)}>${escape($_("oclient.tos_uri"))}</a>
		<a${add_attribute("href", ocl.uri, 0)}>${escape($_("oclient.client_uri"))}</a></div></div>
${validate_component(Box, "Box").$$render($$result, { level: "debug" }, {}, {
    default: () => {
      return `${escape(JSON.stringify(ocl))}`;
    }
  })}`;
});
const Oclient = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  let $$unsubscribe__;
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe__ = subscribe(Y, (value) => value);
  var State;
  (function(State2) {
    State2[State2["Loading"] = 0] = "Loading";
    State2[State2["LoadingError"] = 1] = "LoadingError";
    State2[State2["Loaded"] = 2] = "Loaded";
  })(State || (State = {}));
  let state;
  let ocl;
  let error;
  $$unsubscribe_page();
  $$unsubscribe__();
  return `${$$result.head += `${``}`, ""}

<main>${state === State.Loading ? `${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}` : `${state === State.LoadingError ? `${validate_component(BoxError, "BoxError").$$render($$result, { msg: error, passive: true }, {}, {})}` : `${state === State.Loaded ? `${validate_component(OClientView, "OClientView").$$render($$result, { ocl }, {}, {})}` : ``}`}`}</main>`;
});
export { Oclient as default };
