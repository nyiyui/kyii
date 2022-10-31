import { c as create_ssr_component, a as subscribe, b as add_attribute, v as validate_component, e as escape, d as add_classes } from "../../chunks/index-f5dba6f6.js";
import { I as Icon } from "../../chunks/Icon-7665d048.js";
import { Y, c as currentUlid, u as ulos, k, i as ie } from "../../chunks/api2-d3db0bec.js";
import { U as User } from "../../chunks/User-df754202.js";
import { p as page } from "../../chunks/stores-c7a7782c.js";
import { d as debugMode, a as devOauth } from "../../chunks/store-875eeb2f.js";
import { s as start } from "../../chunks/i18n-7a05e473.js";
import "../../chunks/functions-60a079cb.js";
import "tslib";
import "bops";
/* empty css                                                        */var app = "";
var logo = "/_app/assets/favicon-9da68e56.svg";
var Logo_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: "#logo.svelte-u69j1q{width:2em;height:2em}",
  map: null
};
const Logo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  $$result.css.add(css$3);
  $$unsubscribe__();
  return `<a sveltekit:prefetch href="${"/"}"><img id="${"logo"}"${add_attribute("src", logo, 0)}${add_attribute("alt", $_("header.home"), 0)} class="${"svelte-u69j1q"}">
</a>`;
});
const User_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_currentUlid;
  let $$unsubscribe_ulos;
  $$unsubscribe_currentUlid = subscribe(currentUlid, (value) => value);
  $$unsubscribe_ulos = subscribe(ulos, (value) => value);
  let uid = void 0;
  let name;
  let slug;
  $$unsubscribe_currentUlid();
  $$unsubscribe_ulos();
  return `${validate_component(User, "User").$$render($$result, { uid, name, slug, iconOnly: true }, {}, {})}`;
});
var Header_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: "nav.svelte-1dp6k6u.svelte-1dp6k6u{padding:4px}.iori.svelte-1dp6k6u.svelte-1dp6k6u{float:right}.active.svelte-1dp6k6u a.svelte-1dp6k6u{color:var(--color-fg)}",
  map: null
};
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $debugMode, $$unsubscribe_debugMode;
  let $page, $$unsubscribe_page;
  let $_, $$unsubscribe__;
  let $$unsubscribe_devOauth;
  $$unsubscribe_debugMode = subscribe(debugMode, (value) => $debugMode = value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  $$unsubscribe_devOauth = subscribe(devOauth, (value) => value);
  (async () => {
  })();
  $$result.css.add(css$2);
  $$unsubscribe_debugMode();
  $$unsubscribe_page();
  $$unsubscribe__();
  $$unsubscribe_devOauth();
  return `<nav id="${"nav"}" class="${"svelte-1dp6k6u"}"><ul><li>${validate_component(Logo, "Logo").$$render($$result, {}, {}, {})}
			${$debugMode ? `<a href="${"/config#debug"}">(debug mode)</a>` : ``}</li>
		${$debugMode ? `<li class="${["svelte-1dp6k6u", $page.url.pathname === "/ui/" ? "active" : ""].join(" ").trim()}"><a sveltekit:prefetch href="${"/ui"}" class="${"svelte-1dp6k6u"}">${escape($_("header.ui"))}</a></li>
			<li><a sveltekit:prefetch${add_attribute("href", "http://localhost:8080".toString(), 0)}>Airy </a></li>` : ``}
		${`<li><span role="${"status"}">${escape($_("header.loading"))}</span></li>`}
		<li class="${["svelte-1dp6k6u", $page.url.pathname === "/config/" ? "active" : ""].join(" ").trim()}"><a sveltekit:prefetch href="${"/config"}" class="${"svelte-1dp6k6u"}">${validate_component(Icon, "Icon").$$render($$result, { icon: "mdi:cog" }, {}, {})} ${escape($_("header.config"))}</a></li>
		<li class="${["iori svelte-1dp6k6u", $page.url.pathname === "/iori/" ? "active" : ""].join(" ").trim()}"><a sveltekit:prefetch href="${"/iori"}" class="${"svelte-1dp6k6u"}">${validate_component(User_1, "User").$$render($$result, {}, {}, {})}</a></li></ul>
</nav>`;
});
var GlobalBar_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "nav.svelte-zkgtju{padding:4px}",
  map: null
};
const GlobalBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $_, $$unsubscribe__;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  $$result.css.add(css$1);
  $$unsubscribe_page();
  $$unsubscribe__();
  return `<nav id="${"global-bar"}" class="${"svelte-zkgtju"}"><ul><li${add_classes(($page.url.pathname === "/" ? "active" : "").trim())}><a sveltekit:prefetch href="${"/"}">${escape($_("global_bar.self"))}</a></li>
		<li><a href="${"https://kiki2.nyiyui.ca"}">${escape($_("global_bar.kiki"))}</a></li>
		<li><a href="${"https://nona.nyiyui.ca"}">Nona</a></li>
		<li><a href="${"https://makura.nyiyui.ca"}">Inaba</a></li></ul>
</nav>`;
});
var __layout_svelte_svelte_type_style_lang = "";
const css = {
  code: "header.svelte-1xpmwaw{display:flex;flex-direction:column;background-color:var(--color-bg);border-bottom:1px solid var(--color-neutral);position:sticky;top:0;width:100%}main.svelte-1xpmwaw{flex:1;display:flex;flex-direction:column;padding:1rem;width:100%;margin:0 auto;box-sizing:border-box}footer.svelte-1xpmwaw{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px}@media(min-width: 480px){footer.svelte-1xpmwaw{padding:40px 0}}",
  map: null
};
const _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isLoading, $$unsubscribe_isLoading;
  let $_, $$unsubscribe__;
  $$unsubscribe_isLoading = subscribe(k, (value) => $isLoading = value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  async function preload() {
    return ie();
  }
  start();
  if ($$props.preload === void 0 && $$bindings.preload && preload !== void 0)
    $$bindings.preload(preload);
  $$result.css.add(css);
  $$unsubscribe_isLoading();
  $$unsubscribe__();
  return `${$$result.head += `${$isLoading ? `${$$result.title = `<title>Kyii Yuui / \u3086\u3046\u3044</title>`, ""}` : `${$$result.title = `<title>${escape($_("header.home"))}</title>`, ""}`}`, ""}

${$isLoading ? `<p>Loading\u2026 \u8AAD\u8FBC\u4E2D\u2026</p>` : `<header class="${"svelte-1xpmwaw"}">${validate_component(GlobalBar, "GlobalBar").$$render($$result, {}, {}, {})}
		${validate_component(Header, "Header").$$render($$result, {}, {}, {})}</header>

	<main class="${"svelte-1xpmwaw"}">${slots.default ? slots.default({}) : ``}</main>

	<footer class="${"svelte-1xpmwaw"}"></footer>`}`;
});
export { _layout as default };
