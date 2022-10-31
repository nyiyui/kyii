import { c as create_ssr_component, a as subscribe, e as escape, b as add_attribute } from "../../chunks/index-f5dba6f6.js";
import { Y } from "../../chunks/api2-d3db0bec.js";
import "../../chunks/store-875eeb2f.js";
import "tslib";
import "bops";
const Logout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  $$unsubscribe__();
  return `${$$result.head += `${$$result.title = `<title>${escape($_("logout.logout"))}</title>`, ""}`, ""}

<main class="${"logout"}"><input type="${"button"}"${add_attribute("value", $_("logout.logout"), 0)}></main>`;
});
export { Logout as default };
