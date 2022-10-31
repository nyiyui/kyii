import { c as create_ssr_component, a as subscribe, i as createEventDispatcher, v as validate_component, e as escape, b as add_attribute, p as each } from "../../chunks/index-f5dba6f6.js";
import { c as currentUlid, u as ulos, Y } from "../../chunks/api2-d3db0bec.js";
import { L as Loading } from "../../chunks/Loading-959b154e.js";
import "../../chunks/functions-60a079cb.js";
/* empty css                                                               *//* empty css                                                          */import { B as BoxError } from "../../chunks/BoxError-72b3eba1.js";
import "../../chunks/store-875eeb2f.js";
import "tslib";
import "bops";
import "../../chunks/Box-abf00c5f.js";
import "../../chunks/Icon-7665d048.js";
var ListInput_svelte_svelte_type_style_lang = "";
var OClient_svelte_svelte_type_style_lang = "";
const css = {
  code: ".ocl.svelte-1e3d45k div.svelte-1e3d45k{display:flex;flex-direction:column}.meta.svelte-1e3d45k>h2.svelte-1e3d45k{flex-grow:1}.meta.svelte-1e3d45k>.action.svelte-1e3d45k{align-self:flex-end}.prop.svelte-1e3d45k.svelte-1e3d45k{display:flex;flex-direction:column}",
  map: null
};
const OClient = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentUlid, $$unsubscribe_currentUlid;
  let $ulos, $$unsubscribe_ulos;
  let $$unsubscribe__;
  $$unsubscribe_currentUlid = subscribe(currentUlid, (value) => $currentUlid = value);
  $$unsubscribe_ulos = subscribe(ulos, (value) => $ulos = value);
  $$unsubscribe__ = subscribe(Y, (value) => value);
  $ulos.get($currentUlid);
  createEventDispatcher();
  let { oclient } = $$props;
  let newName = oclient.client_name || null;
  let token_endpoint_auth_method = {
    value: oclient.token_endpoint_auth_method,
    label: oclient.token_endpoint_auth_method
  };
  let response_types = {};
  for (const rt of oclient.response_types) {
    response_types[rt] = true;
  }
  let grant_types = {};
  for (const gt of oclient.grant_types) {
    grant_types[gt] = true;
  }
  if ($$props.oclient === void 0 && $$bindings.oclient && oclient !== void 0)
    $$bindings.oclient(oclient);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    oclient.token_endpoint_auth_method = token_endpoint_auth_method.value;
    oclient.response_types = Object.entries(response_types).map((pair) => pair[0]);
    oclient.grant_types = Object.entries(grant_types).map((pair) => pair[0]);
    (oclient.client_name || "") !== (newName || "");
    ({ ...oclient, client_name: newName });
    $$rendered = `${`${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}`}`;
  } while (!$$settled);
  $$unsubscribe_currentUlid();
  $$unsubscribe_ulos();
  $$unsubscribe__();
  return $$rendered;
});
const Oclients = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let oclients;
  let error = "";
  var State;
  (function(State2) {
    State2[State2["Loading"] = 0] = "Loading";
    State2[State2["LoadingError"] = 1] = "LoadingError";
    State2[State2["Loaded"] = 2] = "Loaded";
  })(State || (State = {}));
  let state;
  $$unsubscribe__();
  return `${$$result.head += `${$$result.title = `<title>${escape($_("header.oclients"))}</title>`, ""}`, ""}

<main class="${"oclients"}"><input type="${"button"}"${add_attribute("value", $_("oclients.reload"), 0)} ${state === State.Loading ? "disabled" : ""}>
	<input class="${"new"}" type="${"button"}"${add_attribute("value", $_("oclients.new"), 0)} ${state === State.Loading ? "disabled" : ""}>
	${state === State.Loading ? `${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}` : `${state === State.LoadingError ? `${validate_component(BoxError, "BoxError").$$render($$result, { msg: error, passive: true }, {}, {})}` : `${state === State.Loaded ? `${escape($_("oclients.count", { values: { count: oclients.length } }))}
		${each(oclients, (oclient) => {
    return `${validate_component(OClient, "OClientView").$$render($$result, { oclient }, {}, {})}`;
  })}` : ``}`}`}</main>`;
});
export { Oclients as default };
