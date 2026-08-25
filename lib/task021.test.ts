import assert from "node:assert/strict";

import {
  eventSchema,
  newsSchema,
  opportunitySchema,
  shopSchema,
} from "./task021";

assert.throws(() => newsSchema.parse({ title: "", slug: "", content: "" }), /title|content/i);
assert.throws(() => shopSchema.parse({ name: "", slug: "" }), /name/i);
assert.throws(() => eventSchema.parse({ title: "", slug: "", description: "", startDate: "bad-date", location: "" }), /title|location|startDate/i);
assert.throws(() => opportunitySchema.parse({ title: "", slug: "", description: "", type: "JOB", location: "" }), /title|location/i);

console.log("Task 021 server foundation checks passed.");
