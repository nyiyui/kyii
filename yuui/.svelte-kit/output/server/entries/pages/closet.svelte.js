import { c as create_ssr_component, a as subscribe, e as escape, v as validate_component } from "../../chunks/index-f5dba6f6.js";
import { Y } from "../../chunks/api2-d3db0bec.js";
import { B as Box } from "../../chunks/Box-abf00c5f.js";
import "../../chunks/functions-60a079cb.js";
/* empty css                                                        *//* empty css                                                            */import { p as page } from "../../chunks/stores-c7a7782c.js";
import "../../chunks/store-875eeb2f.js";
import "tslib";
import "bops";
import "../../chunks/Icon-7665d048.js";
const Closet = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  let $_, $$unsubscribe__;
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  $$unsubscribe_page();
  $$unsubscribe__();
  return `${$$result.head += `${$$result.title = `<title>${escape($_("closet.title"))}</title>`, ""}`, ""}

<main><h1>${escape($_("closet.title"))}</h1>
	${`${validate_component(Box, "Box").$$render($$result, { level: "error" }, {}, {
    default: () => {
      return `${escape($_("closet.no_next"))}`;
    }
  })}`}
	${``}</main>`;
});
export { Closet as default };
