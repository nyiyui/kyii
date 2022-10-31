import { c as create_ssr_component, a as subscribe, e as escape, v as validate_component } from "./index-f5dba6f6.js";
import { I as Icon } from "./Icon-7665d048.js";
import { d as debugMode } from "./store-875eeb2f.js";
const Box = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $debugMode, $$unsubscribe_debugMode;
  $$unsubscribe_debugMode = subscribe(debugMode, (value) => $debugMode = value);
  let { level } = $$props;
  if ($$props.level === void 0 && $$bindings.level && level !== void 0)
    $$bindings.level(level);
  $$unsubscribe_debugMode();
  return `${level !== "debug" || $debugMode ? `<div class="${"box " + escape(level, true)}">${level === "info" ? `${validate_component(Icon, "Icon").$$render($$result, { icon: "mdi:information-outline" }, {}, {})}` : `${level === "warn" ? `${validate_component(Icon, "Icon").$$render($$result, { icon: "mdi:alert" }, {}, {})}` : `${level === "error" ? `${validate_component(Icon, "Icon").$$render($$result, { icon: "mdi:close-circle-outline" }, {}, {})}` : `${level === "ok" ? `${validate_component(Icon, "Icon").$$render($$result, { icon: "mdi:check" }, {}, {})}` : `${level === "debug" ? `${validate_component(Icon, "Icon").$$render($$result, { icon: "mdi:bug" }, {}, {})}` : ``}`}`}`}`}
		${slots.default ? slots.default({}) : ``}</div>` : ``}`;
});
export { Box as B };
