import { c as create_ssr_component, a as subscribe, b as add_attribute, e as escape } from "./index-f5dba6f6.js";
import { Y, a as client } from "./api2-d3db0bec.js";
import "./functions-60a079cb.js";
/* empty css                                             */const css = {
  code: ".user.svelte-p9sew9.svelte-p9sew9{display:flex}.user.svelte-p9sew9 .non-img.svelte-p9sew9{padding-left:8px}.non-img.svelte-p9sew9.svelte-p9sew9{display:flex;flex-direction:column}",
  map: null
};
const User = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let { uid } = $$props;
  let { name } = $$props;
  let { slug } = $$props;
  let { iconOnly = false } = $$props;
  let anonymous;
  if ($$props.uid === void 0 && $$bindings.uid && uid !== void 0)
    $$bindings.uid(uid);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0)
    $$bindings.slug(slug);
  if ($$props.iconOnly === void 0 && $$bindings.iconOnly && iconOnly !== void 0)
    $$bindings.iconOnly(iconOnly);
  $$result.css.add(css);
  anonymous = uid === "anonymous" || uid === null;
  $$unsubscribe__();
  return `<span class="${"user svelte-p9sew9"}">${`<img${add_attribute("alt", $_("iori.user.profile"), 0)} class="${"user-img"}"${add_attribute("src", new URL(`api/v2/user/${uid}/img`, client.baseUrl).toString(), 0)}>`}
	${!iconOnly ? `<div class="${"non-img svelte-p9sew9"}"><div class="${"name"}">${escape(anonymous ? $_("iori.anonymous") : name)}</div>
			${!anonymous ? `<div class="${"slug"}"><code>${escape(slug)}</code></div>` : ``}</div>` : ``}
</span>`;
});
export { User as U };
