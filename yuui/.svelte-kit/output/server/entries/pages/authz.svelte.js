import { c as create_ssr_component, a as subscribe, e as escape, v as validate_component } from "../../chunks/index-f5dba6f6.js";
import { c as currentUlid, u as ulos, Y } from "../../chunks/api2-d3db0bec.js";
import { p as page } from "../../chunks/stores-c7a7782c.js";
import { L as Loading } from "../../chunks/Loading-959b154e.js";
import "../../chunks/functions-60a079cb.js";
import "../../chunks/store-875eeb2f.js";
import "tslib";
import "bops";
import "../../chunks/Box-abf00c5f.js";
import "../../chunks/Icon-7665d048.js";
const Authz = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  let $currentUlid, $$unsubscribe_currentUlid;
  let $ulos, $$unsubscribe_ulos;
  let $_, $$unsubscribe__;
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe_currentUlid = subscribe(currentUlid, (value) => $currentUlid = value);
  $$unsubscribe_ulos = subscribe(ulos, (value) => $ulos = value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  $ulos.get($currentUlid);
  $$unsubscribe_page();
  $$unsubscribe_currentUlid();
  $$unsubscribe_ulos();
  $$unsubscribe__();
  return `

${$$result.head += `${$$result.title = `<title>${escape($_("authz.title"))}</title>`, ""}`, ""}

<main><h1>${escape($_("authz.title"))}</h1>
	${`${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}`}</main>`;
});
export { Authz as default };
