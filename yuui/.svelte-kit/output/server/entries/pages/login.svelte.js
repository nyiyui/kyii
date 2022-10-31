import { c as create_ssr_component, a as subscribe, e as escape, b as add_attribute, v as validate_component } from "../../chunks/index-f5dba6f6.js";
import { u as ulos, Y } from "../../chunks/api2-d3db0bec.js";
import { p as page } from "../../chunks/stores-c7a7782c.js";
import { e as allowMULPU } from "../../chunks/store-875eeb2f.js";
import { I as Icon } from "../../chunks/Icon-7665d048.js";
import "qrcode";
/* empty css                                                               *//* empty css                                                          */import "tslib";
import "bops";
import "../../chunks/functions-60a079cb.js";
var login_svelte_svelte_type_style_lang = "";
const css = {
  code: ".flex.svelte-1tlmfap{display:flex;flex-wrap:wrap}.afs.svelte-1tlmfap{flex-grow:1}#login-status.svelte-1tlmfap{text-align:right}",
  map: null
};
const Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_allowMULPU;
  let $$unsubscribe_ulos;
  let $$unsubscribe_page;
  let $_, $$unsubscribe__;
  $$unsubscribe_allowMULPU = subscribe(allowMULPU, (value) => value);
  $$unsubscribe_ulos = subscribe(ulos, (value) => value);
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let slug;
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `${$$result.title = `<title>${escape($_("header.login"))}</title>`, ""}`, ""}

<main class="${"login-start"}"><form id="${"login"}"><div id="${"login-top"}"><div id="${"login-u"}"><label>${escape($_("login.username"))}
					<input id="${"username"}" type="${"username"}" autocomplete="${"username"}"${add_attribute("value", slug, 0)}></label>
				<input type="${"button"}"${add_attribute("value", $_("login.next"), 0)}>
				${`${`${``}`}`}</div></div>
		${``}
		<div id="${"login-bottom"}"><div id="${"login-status"}" class="${"svelte-1tlmfap"}">${`${validate_component(Icon, "Icon").$$render($$result, {
      icon: "mdi:checkbox-blank-circle-outline",
      style: "color: #ccc;"
    }, {}, {})}
					${escape($_("login.pending"))}`}</div></div></form>
</main>`;
  } while (!$$settled);
  $$unsubscribe_allowMULPU();
  $$unsubscribe_ulos();
  $$unsubscribe_page();
  $$unsubscribe__();
  return $$rendered;
});
export { Login as default };
