import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const experience = readFileSync(new URL("./CompanySearchExperience.tsx", import.meta.url), "utf8");
const results = readFileSync(new URL("./DisqualifiedOfficerResults.tsx", import.meta.url), "utf8");
const searchPage = readFileSync(
  new URL("../../app/(landing)/search/page.tsx", import.meta.url),
  "utf8",
);
const naturalPage = readFileSync(
  new URL(
    "../../app/(landing)/disqualified-officers/natural/[officer-id]/page.tsx",
    import.meta.url,
  ),
  "utf8",
);

void test("disqualification subtype navigation is shareable and corporate defaults safely", () => {
  assert.match(searchPage, /params\.type === "natural" \? "natural" : "corporate"/);
  assert.match(experience, /aria-label="Disqualification types"/);
  assert.match(experience, /"Corporate" : "People"/);
  assert.match(experience, /type, page: "1"/);
});

void test("only the selected subtype is passed to one search result component", () => {
  assert.equal((experience.match(/<DisqualifiedOfficerResults/g) ?? []).length, 1);
  assert.match(experience, /subtype=\{disqualificationType\}/);
  assert.match(results, /searchDisqualifiedOfficers\(query, page, subtype\)/);
});

void test("natural results and details preserve natural URL state and factual sections", () => {
  assert.match(results, /\/disqualified-officers\/natural/);
  assert.match(results, /type: subtype/);
  assert.match(naturalPage, /type=natural/);
  assert.match(naturalPage, /Disqualifications/);
  assert.match(naturalPage, /Permissions to act/);
  assert.match(naturalPage, /ProviderMetadata/);
});
