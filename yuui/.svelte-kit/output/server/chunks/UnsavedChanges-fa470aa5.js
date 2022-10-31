import { c as create_ssr_component, v as validate_component } from "./index-f5dba6f6.js";
import { I as Icon } from "./Icon-7665d048.js";
const UnsavedChanges = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Icon, "Icon").$$render($$result, {
    icon: "mdi:content-save-alert-outline",
    "aria-label": "unsaved changes",
    title: "unsaved changes"
  }, {}, {})}`;
});
export { UnsavedChanges as U };
