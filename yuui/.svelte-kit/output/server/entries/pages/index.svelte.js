import { c as create_ssr_component, a as subscribe, v as validate_component, e as escape } from "../../chunks/index-f5dba6f6.js";
import { c as currentUlid, u as ulos, Y } from "../../chunks/api2-d3db0bec.js";
import { B as Box } from "../../chunks/Box-abf00c5f.js";
import { U as User } from "../../chunks/User-df754202.js";
import "../../chunks/store-875eeb2f.js";
import "tslib";
import "bops";
import "../../chunks/Icon-7665d048.js";
import "../../chunks/functions-60a079cb.js";
/* empty css                                                        */const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentUlid, $$unsubscribe_currentUlid;
  let $ulosStore, $$unsubscribe_ulosStore;
  let $_, $$unsubscribe__;
  $$unsubscribe_currentUlid = subscribe(currentUlid, (value) => $currentUlid = value);
  $$unsubscribe_ulosStore = subscribe(ulos, (value) => $ulosStore = value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let ulo = $ulosStore.get($currentUlid);
  $$unsubscribe_currentUlid();
  $$unsubscribe_ulosStore();
  $$unsubscribe__();
  return `<main>${$currentUlid === "anonymous" ? `${validate_component(Box, "Box").$$render($$result, { level: "info" }, {}, {
    default: () => {
      return `<!-- HTML_TAG_START -->${$_("index.login_pls")}<!-- HTML_TAG_END -->`;
    }
  })}` : `${escape($_("index.logged_in_as"))}
		${ulo ? `${validate_component(User, "User").$$render($$result, {
    uid: ulo.uid,
    name: ulo.name,
    slug: ulo.slug
  }, {}, {})}` : ``}`}</main>`;
});
export { Routes as default };
