import { c as create_ssr_component, i as createEventDispatcher, o as onDestroy, e as escape, b as add_attribute, a as subscribe, v as validate_component } from "../../chunks/index-f5dba6f6.js";
import { u as ulos, c as currentUlid, Y } from "../../chunks/api2-d3db0bec.js";
import "../../chunks/functions-60a079cb.js";
import { __awaiter, __generator, __spread } from "tslib";
/* empty css                                                           */import { I as Icon } from "../../chunks/Icon-7665d048.js";
import { L as Loading } from "../../chunks/Loading-959b154e.js";
import { B as BoxError } from "../../chunks/BoxError-72b3eba1.js";
import { B as Box } from "../../chunks/Box-abf00c5f.js";
import { d as debugMode } from "../../chunks/store-875eeb2f.js";
import { U as UnsavedChanges } from "../../chunks/UnsavedChanges-fa470aa5.js";
import { p as page } from "../../chunks/stores-c7a7782c.js";
import "bops";
var COMMON_MIME_TYPES = /* @__PURE__ */ new Map([
  ["avi", "video/avi"],
  ["gif", "image/gif"],
  ["ico", "image/x-icon"],
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["mkv", "video/x-matroska"],
  ["mov", "video/quicktime"],
  ["mp4", "video/mp4"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["zip", "application/zip"],
  ["doc", "application/msword"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
]);
function toFileWithPath(file, path) {
  var f = withMimeType(file);
  if (typeof f.path !== "string") {
    var webkitRelativePath = file.webkitRelativePath;
    Object.defineProperty(f, "path", {
      value: typeof path === "string" ? path : typeof webkitRelativePath === "string" && webkitRelativePath.length > 0 ? webkitRelativePath : file.name,
      writable: false,
      configurable: false,
      enumerable: true
    });
  }
  return f;
}
function withMimeType(file) {
  var name = file.name;
  var hasExtension = name && name.lastIndexOf(".") !== -1;
  if (hasExtension && !file.type) {
    var ext = name.split(".").pop().toLowerCase();
    var type = COMMON_MIME_TYPES.get(ext);
    if (type) {
      Object.defineProperty(file, "type", {
        value: type,
        writable: false,
        configurable: false,
        enumerable: true
      });
    }
  }
  return file;
}
var FILES_TO_IGNORE = [
  ".DS_Store",
  "Thumbs.db"
];
function fromEvent(evt) {
  return __awaiter(this, void 0, void 0, function() {
    return __generator(this, function(_a) {
      return [2, isDragEvt(evt) && evt.dataTransfer ? getDataTransferFiles(evt.dataTransfer, evt.type) : getInputFiles(evt)];
    });
  });
}
function isDragEvt(value) {
  return !!value.dataTransfer;
}
function getInputFiles(evt) {
  var files = isInput(evt.target) ? evt.target.files ? fromList(evt.target.files) : [] : [];
  return files.map(function(file) {
    return toFileWithPath(file);
  });
}
function isInput(value) {
  return value !== null;
}
function getDataTransferFiles(dt, type) {
  return __awaiter(this, void 0, void 0, function() {
    var items, files;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          if (!dt.items)
            return [3, 2];
          items = fromList(dt.items).filter(function(item) {
            return item.kind === "file";
          });
          if (type !== "drop") {
            return [2, items];
          }
          return [4, Promise.all(items.map(toFilePromises))];
        case 1:
          files = _a.sent();
          return [2, noIgnoredFiles(flatten(files))];
        case 2:
          return [2, noIgnoredFiles(fromList(dt.files).map(function(file) {
            return toFileWithPath(file);
          }))];
      }
    });
  });
}
function noIgnoredFiles(files) {
  return files.filter(function(file) {
    return FILES_TO_IGNORE.indexOf(file.name) === -1;
  });
}
function fromList(items) {
  var files = [];
  for (var i = 0; i < items.length; i++) {
    var file = items[i];
    files.push(file);
  }
  return files;
}
function toFilePromises(item) {
  if (typeof item.webkitGetAsEntry !== "function") {
    return fromDataTransferItem(item);
  }
  var entry = item.webkitGetAsEntry();
  if (entry && entry.isDirectory) {
    return fromDirEntry(entry);
  }
  return fromDataTransferItem(item);
}
function flatten(items) {
  return items.reduce(function(acc, files) {
    return __spread(acc, Array.isArray(files) ? flatten(files) : [files]);
  }, []);
}
function fromDataTransferItem(item) {
  var file = item.getAsFile();
  if (!file) {
    return Promise.reject(item + " is not a File");
  }
  var fwp = toFileWithPath(file);
  return Promise.resolve(fwp);
}
function fromEntry(entry) {
  return __awaiter(this, void 0, void 0, function() {
    return __generator(this, function(_a) {
      return [2, entry.isDirectory ? fromDirEntry(entry) : fromFileEntry(entry)];
    });
  });
}
function fromDirEntry(entry) {
  var reader = entry.createReader();
  return new Promise(function(resolve, reject) {
    var entries = [];
    function readEntries() {
      var _this = this;
      reader.readEntries(function(batch) {
        return __awaiter(_this, void 0, void 0, function() {
          var files, err_1, items;
          return __generator(this, function(_a) {
            switch (_a.label) {
              case 0:
                if (!!batch.length)
                  return [3, 5];
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, Promise.all(entries)];
              case 2:
                files = _a.sent();
                resolve(files);
                return [3, 4];
              case 3:
                err_1 = _a.sent();
                reject(err_1);
                return [3, 4];
              case 4:
                return [3, 6];
              case 5:
                items = Promise.all(batch.map(fromEntry));
                entries.push(items);
                readEntries();
                _a.label = 6;
              case 6:
                return [2];
            }
          });
        });
      }, function(err) {
        reject(err);
      });
    }
    readEntries();
  });
}
function fromFileEntry(entry) {
  return __awaiter(this, void 0, void 0, function() {
    return __generator(this, function(_a) {
      return [2, new Promise(function(resolve, reject) {
        entry.file(function(file) {
          var fwp = toFileWithPath(file, entry.fullPath);
          resolve(fwp);
        }, function(err) {
          reject(err);
        });
      })];
    });
  });
}
const css$1 = {
  code: ".dropzone.svelte-817dg2{flex:1;display:flex;flex-direction:column;align-items:center;padding:20px;border-width:2px;border-radius:2px;border-color:#eeeeee;border-style:dashed;background-color:#fafafa;color:#bdbdbd;outline:none;transition:border 0.24s ease-in-out}.dropzone.svelte-817dg2:focus{border-color:#2196f3}",
  map: null
};
const Dropzone = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { accept } = $$props;
  let { disabled = false } = $$props;
  let { getFilesFromEvent = fromEvent } = $$props;
  let { maxSize = Infinity } = $$props;
  let { minSize = 0 } = $$props;
  let { multiple = true } = $$props;
  let { preventDropOnDocument = true } = $$props;
  let { noClick = false } = $$props;
  let { noKeyboard = false } = $$props;
  let { noDrag = false } = $$props;
  let { noDragEventsBubbling = false } = $$props;
  let { containerClasses = "" } = $$props;
  let { containerStyles = "" } = $$props;
  let { disableDefaultStyles = false } = $$props;
  createEventDispatcher();
  let rootRef;
  onDestroy(() => {
  });
  if ($$props.accept === void 0 && $$bindings.accept && accept !== void 0)
    $$bindings.accept(accept);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.getFilesFromEvent === void 0 && $$bindings.getFilesFromEvent && getFilesFromEvent !== void 0)
    $$bindings.getFilesFromEvent(getFilesFromEvent);
  if ($$props.maxSize === void 0 && $$bindings.maxSize && maxSize !== void 0)
    $$bindings.maxSize(maxSize);
  if ($$props.minSize === void 0 && $$bindings.minSize && minSize !== void 0)
    $$bindings.minSize(minSize);
  if ($$props.multiple === void 0 && $$bindings.multiple && multiple !== void 0)
    $$bindings.multiple(multiple);
  if ($$props.preventDropOnDocument === void 0 && $$bindings.preventDropOnDocument && preventDropOnDocument !== void 0)
    $$bindings.preventDropOnDocument(preventDropOnDocument);
  if ($$props.noClick === void 0 && $$bindings.noClick && noClick !== void 0)
    $$bindings.noClick(noClick);
  if ($$props.noKeyboard === void 0 && $$bindings.noKeyboard && noKeyboard !== void 0)
    $$bindings.noKeyboard(noKeyboard);
  if ($$props.noDrag === void 0 && $$bindings.noDrag && noDrag !== void 0)
    $$bindings.noDrag(noDrag);
  if ($$props.noDragEventsBubbling === void 0 && $$bindings.noDragEventsBubbling && noDragEventsBubbling !== void 0)
    $$bindings.noDragEventsBubbling(noDragEventsBubbling);
  if ($$props.containerClasses === void 0 && $$bindings.containerClasses && containerClasses !== void 0)
    $$bindings.containerClasses(containerClasses);
  if ($$props.containerStyles === void 0 && $$bindings.containerStyles && containerStyles !== void 0)
    $$bindings.containerStyles(containerStyles);
  if ($$props.disableDefaultStyles === void 0 && $$bindings.disableDefaultStyles && disableDefaultStyles !== void 0)
    $$bindings.disableDefaultStyles(disableDefaultStyles);
  $$result.css.add(css$1);
  return `<div tabindex="${"0"}" class="${escape(disableDefaultStyles ? "" : "dropzone", true) + " " + escape(containerClasses, true) + " svelte-817dg2"}"${add_attribute("style", containerStyles, 0)}${add_attribute("this", rootRef, 0)}><input${add_attribute("accept", accept, 0)} ${multiple ? "multiple" : ""} type="${"file"}" autocomplete="${"off"}" tabindex="${"-1"}" style="${"display: none;"}">
  ${slots.default ? slots.default({}) : `
    <p>Drag &#39;n&#39; drop some files here, or click to select files</p>
  `}
</div>`;
});
const css = {
  code: ".flex-in.svelte-vmpbfb.svelte-vmpbfb{flex:50%}label.svelte-vmpbfb.svelte-vmpbfb{display:flex}.img.svelte-vmpbfb.svelte-vmpbfb{display:flex}.img.svelte-vmpbfb .dropzone.svelte-vmpbfb{flex-grow:1}.identity.svelte-vmpbfb.svelte-vmpbfb{display:flex;flex-direction:column}.identity.svelte-vmpbfb .label.svelte-vmpbfb{flex-grow:1}.identity.svelte-vmpbfb input.svelte-vmpbfb{flex-grow:1}.identity.svelte-vmpbfb .status.svelte-vmpbfb{flex-grow:1;align-self:flex-end}.identity.svelte-vmpbfb .commit.svelte-vmpbfb{flex-grow:1;align-self:flex-end}.img.svelte-vmpbfb.svelte-vmpbfb{display:flex;flex-wrap:wrap}.img.svelte-vmpbfb>.svelte-vmpbfb{margin:8px}",
  map: null
};
const IdInput = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_ulos;
  let $$unsubscribe_currentUlid;
  let $_, $$unsubscribe__;
  let $debugMode, $$unsubscribe_debugMode;
  $$unsubscribe_ulos = subscribe(ulos, (value) => value);
  $$unsubscribe_currentUlid = subscribe(currentUlid, (value) => value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  $$unsubscribe_debugMode = subscribe(debugMode, (value) => $debugMode = value);
  let slug;
  let name;
  let { idUnsavedChanges = false } = $$props;
  let submitIdError;
  if ($$props.idUnsavedChanges === void 0 && $$bindings.idUnsavedChanges && idUnsavedChanges !== void 0)
    $$bindings.idUnsavedChanges(idUnsavedChanges);
  $$result.css.add(css);
  $$unsubscribe_ulos();
  $$unsubscribe_currentUlid();
  $$unsubscribe__();
  $$unsubscribe_debugMode();
  return `<div class="${"flex"}"><div class="${"flex-in svelte-vmpbfb"}"><h2>Personal
			${idUnsavedChanges ? `${validate_component(UnsavedChanges, "UnsavedChanges").$$render($$result, {}, {}, {})}` : ``}</h2>
		<form class="${"identity svelte-vmpbfb"}"><div class="${"img svelte-vmpbfb"}"><div class="${"dropzone svelte-vmpbfb"}">${validate_component(Dropzone, "Dropzone").$$render($$result, { multiple: false, accept: "image/*" }, {}, {
    default: () => {
      return `${escape($_("config.id.img.dropzone"))}`;
    }
  })}</div>
				${``}</div>
			<label class="${"svelte-vmpbfb"}"><span class="${"label svelte-vmpbfb"}">${escape($_("config.id.uid"))}</span>
				<input type="${"text"}"${add_attribute("value", "", 0)} disabled class="${"svelte-vmpbfb"}"></label>
			<span class="${"status svelte-vmpbfb"}" role="${"status"}">${validate_component(Box, "Box").$$render($$result, { level: "info" }, {}, {
    default: () => {
      return `${escape($_("config.id.uid_help"))}`;
    }
  })}</span>
			<br>
			<label class="${"svelte-vmpbfb"}"><span class="${"label svelte-vmpbfb"}">${escape($_("config.id.slug"))}</span>
				<input id="${"slug"}" type="${"text"}" autocomplete="${"username"}" class="${"svelte-vmpbfb"}"${add_attribute("value", slug, 0)}></label>
			<span class="${"status svelte-vmpbfb"}" role="${"status"}">${`${`${`${`${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}`}`}`}`}</span>
			<br>
			<label class="${"svelte-vmpbfb"}"><span class="${"label svelte-vmpbfb"}">${escape($_("config.id.name"))}</span>
				<input id="${"name"}" type="${"name"}" autocomplete="${"name"}" class="${"svelte-vmpbfb"}"${add_attribute("value", name, 0)}></label>
			<span class="${"status svelte-vmpbfb"}" role="${"status"}">${`${`${validate_component(Icon, "Icon").$$render($$result, {
    icon: "mdi:check",
    style: "color: var(--color-ok);"
  }, {}, {})}`}`}</span>
			<br>
			<div class="${"commit svelte-vmpbfb"}"><input class="${"update svelte-vmpbfb"}" type="${"button"}"${add_attribute("value", $_("config.update"), 0)} ${""}>
				${validate_component(BoxError, "BoxError").$$render($$result, { msg: submitIdError, passive: true }, {}, {})}</div></form></div>
	${$debugMode ? `<div class="${"flex-in svelte-vmpbfb"}"><h2>Groups</h2>
			${``}</div>
		<div class="${"flex-in svelte-vmpbfb"}"><h2>Perms</h2>
			${``}</div>` : ``}
</div>`;
});
const Signup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_currentUlid;
  let $$unsubscribe_ulos;
  let $$unsubscribe_page;
  let $_, $$unsubscribe__;
  $$unsubscribe_currentUlid = subscribe(currentUlid, (value) => value);
  $$unsubscribe_ulos = subscribe(ulos, (value) => value);
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe__ = subscribe(Y, (value) => $_ = value);
  var State;
  (function(State2) {
    State2[State2["Init"] = 0] = "Init";
    State2[State2["SignedUp"] = 1] = "SignedUp";
    State2[State2["MissingPerms"] = 2] = "MissingPerms";
  })(State || (State = {}));
  State.Init;
  $$unsubscribe_currentUlid();
  $$unsubscribe_ulos();
  $$unsubscribe_page();
  $$unsubscribe__();
  return `${$$result.head += `${$$result.title = `<title>${escape($_("header.signup"))}</title>`, ""}`, ""}

<main>${`${validate_component(IdInput, "IdInput").$$render($$result, {}, {}, {})}`}</main>`;
});
export { Signup as default };
