import { y, F, $ } from "./api2-d3db0bec.js";
import { g as get_store_value } from "./index-f5dba6f6.js";
import { l as lang } from "./store-875eeb2f.js";
y("en", () => import("./en-CA-5e135fc5.js"));
y("ja", () => import("./ja-JP-6b93da50.js"));
const locale = get_store_value(lang) || F();
const langs = ["en", "ja"];
async function start() {
  $({
    fallbackLocale: "ja",
    initialLocale: locale
  });
}
export { langs as l, start as s };
