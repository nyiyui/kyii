import { c as create_ssr_component, a as subscribe, e as escape, v as validate_component, b as add_attribute } from "../../chunks/index-f5dba6f6.js";
import { Y } from "../../chunks/api2-d3db0bec.js";
import { B as Box } from "../../chunks/Box-abf00c5f.js";
import { p as page } from "../../chunks/stores-c7a7782c.js";
import "../../chunks/store-875eeb2f.js";
import "tslib";
import "bops";
import "../../chunks/Icon-7665d048.js";
import "../../chunks/functions-60a079cb.js";
const Remote_decide = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  let $_, $$unsubscribe__;
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let token = "";
  $$unsubscribe_page();
  $$unsubscribe__();
  return `${$$result.head += `${$$result.title = `<title>${escape($_("remote-decide.title"))}</title>`, ""}`, ""}

<main><h1>${escape($_("remote-decide.title"))}</h1>
	${validate_component(Box, "Box").$$render($$result, { level: "warn" }, {}, {
    default: () => {
      return `${escape($_("remote-decide.warn"))}`;
    }
  })}
	<form><label>${escape($_("remote-decide.token_label"))}
			<input type="${"text"}" inputmode="${"numeric"}" autocomplete="${"one-time-code"}"${add_attribute("pattern", "[0-9]{6}", 0)}${add_attribute("value", token, 0)}></label>
		<input class="${"warn"}" type="${"button"}"${add_attribute("value", $_("remote-decide.button_value"), 0)}></form></main>`;
});
export { Remote_decide as default };
