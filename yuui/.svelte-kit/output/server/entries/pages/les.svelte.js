import { c as create_ssr_component, a as subscribe, v as validate_component, e as escape, b as add_attribute, p as each, m as missing_component } from "../../chunks/index-f5dba6f6.js";
import { e as ee, Y, H as Handler, a as client } from "../../chunks/api2-d3db0bec.js";
import { B as Box } from "../../chunks/Box-abf00c5f.js";
import { L as Loading } from "../../chunks/Loading-959b154e.js";
import { B as BoxError } from "../../chunks/BoxError-72b3eba1.js";
import "../../chunks/store-875eeb2f.js";
import "tslib";
import "bops";
import "../../chunks/Icon-7665d048.js";
import "../../chunks/functions-60a079cb.js";
const timeOpts = {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZoneName: "short"
};
var LogEntryView_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".log-entry.svelte-n9bdmq .left.svelte-n9bdmq{flex-grow:1;display:flex;flex-direction:row}",
  map: null
};
function getLevel(le) {
  if (["login"].includes(le.renderer)) {
    return "warn";
  }
  return "info";
}
const LogEntryView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $time, $$unsubscribe_time;
  let $_, $$unsubscribe__;
  $$unsubscribe_time = subscribe(ee, (value) => $time = value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let { r } = $$props;
  let { handler } = $$props;
  let le;
  let level;
  if ($$props.r === void 0 && $$bindings.r && r !== void 0)
    $$bindings.r(r);
  if ($$props.handler === void 0 && $$bindings.handler && handler !== void 0)
    $$bindings.handler(handler);
  $$result.css.add(css$1);
  {
    handler.deref(r).then((v) => le = v);
  }
  level = le ? getLevel(le) : void 0;
  $$unsubscribe_time();
  $$unsubscribe__();
  return `<div class="${"log-entry flex svelte-n9bdmq"}">${le ? `<div class="${"left svelte-n9bdmq"}">${validate_component(Box, "Box").$$render($$result, { level }, {}, {
    default: () => {
      return `${escape($time(new Date(le.created), timeOpts))}`;
    }
  })}</div>
		<div class="${"right"}">${le.renderer === "login" ? `${escape($_({
    id: "le.login.desc",
    values: { ulid: le.data.ul }
  }))}` : `${le.renderer === "login_start" ? `${escape($_({
    id: "le.login_start.desc",
    values: le.data.extra
  }))}` : `${le.renderer === "login_attempt" ? `${validate_component(Box, "Box").$$render($$result, { level: le.data.cur_done ? "ok" : "error" }, {}, {
    default: () => {
      return `${escape($_({
        id: "le.login_attempt." + le.data.cur_done,
        values: le.data
      }))}`;
    }
  })}` : `${le.renderer === "login_choose" ? `${escape($_({
    id: "le.login_choose.desc",
    values: le.data
  }))}` : `${le.renderer === "remote" ? `${escape($_({ id: "le.remote.desc", values: le.data }))}` : `<code>${escape(JSON.stringify(le))}</code>`}`}`}`}`}</div>
		${validate_component(Box, "Box").$$render($$result, { level: "debug" }, {}, {
    default: () => {
      return `${escape(JSON.stringify(le))}`;
    }
  })}` : ``}
</div>`;
});
var List_svelte_svelte_type_style_lang = "";
const css = {
  code: "nav.svelte-wbnew9.svelte-wbnew9{display:flex}nav.svelte-wbnew9 .count.svelte-wbnew9{flex-grow:1}",
  map: null
};
const List = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let { handler } = $$props;
  let { renderer } = $$props;
  let { offset = 0 } = $$props;
  let { seekLength = 10 } = $$props;
  let { seekInterval = 10 } = $$props;
  let { total } = $$props;
  let rCache;
  let error = "";
  var State;
  (function(State2) {
    State2[State2["Loading"] = 0] = "Loading";
    State2[State2["Oops"] = 1] = "Oops";
    State2[State2["Ready"] = 2] = "Ready";
  })(State || (State = {}));
  let state = State.Loading;
  if ($$props.handler === void 0 && $$bindings.handler && handler !== void 0)
    $$bindings.handler(handler);
  if ($$props.renderer === void 0 && $$bindings.renderer && renderer !== void 0)
    $$bindings.renderer(renderer);
  if ($$props.offset === void 0 && $$bindings.offset && offset !== void 0)
    $$bindings.offset(offset);
  if ($$props.seekLength === void 0 && $$bindings.seekLength && seekLength !== void 0)
    $$bindings.seekLength(seekLength);
  if ($$props.seekInterval === void 0 && $$bindings.seekInterval && seekInterval !== void 0)
    $$bindings.seekInterval(seekInterval);
  if ($$props.total === void 0 && $$bindings.total && total !== void 0)
    $$bindings.total(total);
  $$result.css.add(css);
  $$unsubscribe__();
  return `<div class="${"generic-list"}">${state === State.Loading ? `${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}` : `${state === State.Oops ? `${validate_component(BoxError, "BoxError").$$render($$result, { msg: error, passive: true }, {}, {})}` : `${state === State.Ready ? `<nav class="${"svelte-wbnew9"}"><div class="${"count svelte-wbnew9"}">${escape($_(`generics.${handler.name}.seeked`, { values: { seekLength, total } }))}</div>
			<div class="${"page"}">${escape($_("generic.page", {
    values: { page: offset / seekInterval + 1 }
  }))}</div>
			<input type="${"button"}"${add_attribute("value", $_("generic.prev"), 0)} ${offset === 0 ? "disabled" : ""}>
			<input type="${"button"}"${add_attribute("value", $_("generic.next"), 0)} ${offset + seekInterval > total ? "disabled" : ""}>
			<input type="${"button"}"${add_attribute("value", $_("generic.reload"), 0)}></nav>
		<div>${each(rCache, (r) => {
    return `${validate_component(renderer || missing_component, "svelte:component").$$render($$result, { handler, r }, {}, {})}`;
  })}</div>` : ``}`}`}
</div>`;
});
const Les = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  let handler;
  handler = new Handler(client, "le");
  $$unsubscribe__();
  return `${$$result.head += `${$$result.title = `<title>${escape($_("header.les"))}</title>`, ""}`, ""}

<main class="${"les"}">${validate_component(List, "List").$$render($$result, { handler, renderer: LogEntryView }, {}, {})}</main>`;
});
export { Les as default };
