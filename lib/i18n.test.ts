import assert from "node:assert/strict";
import { DEFAULT_LOCALE, getMessages, isLocale } from "./i18n-config";

assert.equal(DEFAULT_LOCALE, "fr");
assert.equal(isLocale("fr"), true);
assert.equal(isLocale("en"), true);
assert.equal(isLocale("es"), false);
assert.equal(getMessages("fr").navigation.events, "Evenements");
assert.equal(getMessages("en").navigation.events, "Events");

console.log("All i18n foundation tests passed.");
