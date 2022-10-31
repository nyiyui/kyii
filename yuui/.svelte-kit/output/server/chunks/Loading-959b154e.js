import { c as create_ssr_component, a as subscribe, v as validate_component, e as escape } from "./index-f5dba6f6.js";
import { B as Box } from "./Box-abf00c5f.js";
import { Y } from "./api2-d3db0bec.js";
const Loading = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  $$unsubscribe__();
  return `${validate_component(Box, "Box").$$render($$result, { level: "info" }, {}, {
    default: () => {
      return `${escape($_("loading"))}`;
    }
  })}`;
});
export { Loading as L };
