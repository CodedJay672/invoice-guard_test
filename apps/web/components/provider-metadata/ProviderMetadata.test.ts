import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { hasVisibleProviderValue } from "./ProviderMetadata.js";

void test("hides recursively empty provider values but preserves false and zero", () => {
  assert.equal(hasVisibleProviderValue({ empty: null, blank: "", nested: [] }), false);
  assert.equal(hasVisibleProviderValue({ returned: false }), true);
  assert.equal(hasVisibleProviderValue({ total_results: 0 }), true);
});

void test("metadata disclosure is accessible, collapsed, and semantic-token only", () => {
  const source = readFileSync(new URL("./ProviderMetadata.tsx", import.meta.url), "utf8");
  assert.match(source, /<details/);
  assert.match(source, /<summary/);
  assert.match(source, /Provider metadata/);
  assert.doesNotMatch(source, /#[\da-f]{3,8}|text-(red|green|blue|gray)-/i);
});
