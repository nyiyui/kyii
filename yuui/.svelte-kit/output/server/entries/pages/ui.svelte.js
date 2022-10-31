import { c as create_ssr_component, v as validate_component } from "../../chunks/index-f5dba6f6.js";
import { B as Box } from "../../chunks/Box-abf00c5f.js";
import { B as BoxError } from "../../chunks/BoxError-72b3eba1.js";
import { U as UnsavedChanges } from "../../chunks/UnsavedChanges-fa470aa5.js";
import { A as Autosaved } from "../../chunks/Autosaved-282ab437.js";
import { I as Icon } from "../../chunks/Icon-7665d048.js";
import "../../chunks/store-875eeb2f.js";
import "../../chunks/functions-60a079cb.js";
const VerifiedChanges = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { verified } = $$props;
  if ($$props.verified === void 0 && $$bindings.verified && verified !== void 0)
    $$bindings.verified(verified);
  return `${verified ? `${validate_component(Icon, "Icon").$$render($$result, {
    class: "ok",
    icon: "mdi:check-circle",
    "aria-label": "changed unverified",
    title: "changed unverified"
  }, {}, {})}` : `${validate_component(Icon, "Icon").$$render($$result, {
    class: "error",
    icon: "mdi:close-circle",
    "aria-label": "changes verified",
    title: "changes verified"
  }, {}, {})}`}`;
});
const EmailVerified = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Icon, "Icon").$$render($$result, {
    icon: "mdi:email-check-outline",
    "aria-label": "email verified",
    title: "email verified"
  }, {}, {})}`;
});
const Ui = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `${$$result.title = `<title>UI Test</title>`, ""}`, ""}

<main><h2>Box</h2>
	${validate_component(Box, "Box").$$render($$result, { level: "info" }, {}, {
    default: () => {
      return `Info`;
    }
  })}
	${validate_component(Box, "Box").$$render($$result, { level: "warn" }, {}, {
    default: () => {
      return `Warning`;
    }
  })}
	${validate_component(Box, "Box").$$render($$result, { level: "error" }, {}, {
    default: () => {
      return `Error`;
    }
  })}
	${validate_component(Box, "Box").$$render($$result, { level: "ok" }, {}, {
    default: () => {
      return `OK`;
    }
  })}
	${validate_component(Box, "Box").$$render($$result, { level: "debug" }, {}, {
    default: () => {
      return `Debug`;
    }
  })}
	${validate_component(BoxError, "BoxError").$$render($$result, { msg: "message" }, {}, {})}
	${validate_component(BoxError, "BoxError").$$render($$result, { msg: null }, {}, {})}
	<h2>Etc</h2>
	${validate_component(UnsavedChanges, "UnsavedChanges").$$render($$result, {}, {}, {})}
	${validate_component(Autosaved, "Autosaved").$$render($$result, {}, {}, {})}
	${validate_component(VerifiedChanges, "VerifiedChanges").$$render($$result, { verified: true }, {}, {})}
	${validate_component(VerifiedChanges, "VerifiedChanges").$$render($$result, { verified: false }, {}, {})}
	${validate_component(EmailVerified, "EmailVerified").$$render($$result, {}, {}, {})}</main>`;
});
export { Ui as default };
