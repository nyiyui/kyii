import { c as create_ssr_component, v as validate_component, e as escape } from "./index-f5dba6f6.js";
import { B as Box } from "./Box-abf00c5f.js";
const BoxError = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { msg } = $$props;
  let { passive = false } = $$props;
  if ($$props.msg === void 0 && $$bindings.msg && msg !== void 0)
    $$bindings.msg(msg);
  if ($$props.passive === void 0 && $$bindings.passive && passive !== void 0)
    $$bindings.passive(passive);
  return `${msg ? `${validate_component(Box, "Box").$$render($$result, { level: "error" }, {}, {
    default: () => {
      return `${escape(msg)}`;
    }
  })}` : `${!passive ? `${validate_component(Box, "Box").$$render($$result, { level: "ok" }, {}, {})}` : ``}`}`;
});
export { BoxError as B };
