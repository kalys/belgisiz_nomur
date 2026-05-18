# Manual Test Cases — Web App

**Base URL:** http://localhost:3000  
**Locales:** `/ky/...` (Kyrgyz, default) and `/ru/...` (Russian)

---

## TC-01 — Homepage loads

1. Open `http://localhost:3000`
2. Confirm redirect to `/ky/`

**Expected:**
- Hero title and subtitle visible in Kyrgyz
- Search bar rendered
- Three stat cards shown: Numbers, Reports, Votes (numbers ≥ 0)
- "View top scammers" link at the bottom

---

## TC-02 — Locale switch

1. Open `/ky/`
2. Switch locale to Russian via navbar

**Expected:**
- URL changes to `/ru/`
- All UI text switches to Russian
- Stat cards still show correct numbers

---

## TC-03 — Search: known number

1. Open `/ky/`
2. Type `+996555555555` in the search bar and submit

**Expected:**
- Redirected to `/ky/search?q=%2B996555555555` (or similar)
- At least one result card shown with the E.164 number
- Score badge visible on the result card
- Clicking the card goes to `/ky/number/...`

---

## TC-04 — Search: partial number

1. Search for `555` (partial digits)

**Expected:**
- Results list shows all numbers containing `555`
- Each result has a score badge

---

## TC-05 — Search: unknown valid number

1. Search for `+996700000001` (not in DB)

**Expected:**
- "No results" message shown
- Blue "Submit report →" link appears below, showing `+996700000001`
- Clicking it goes to the number detail page

---

## TC-06 — Search: too short query

1. Search for `99` (fewer than 3 characters)

**Expected:**
- API returns 400 / no results shown
- "No results" empty state visible, no crash

---

## TC-07 — Search: local format

1. Search for `0555555555` (local KG format, leading zero)

**Expected:**
- Results include `+996555555555` if it exists in DB (digit strip + leading zero removal works)

---

## TC-08 — Number detail: known number

1. Navigate to `/ky/number/%2B996555555555`

**Expected:**
- E.164 number shown as heading
- Score badge visible with correct confidence label
- Report count line ("X reports")
- Report submission form below heading
- Reports list at the bottom

---

## TC-09 — Number detail: unknown number

1. Navigate to `/ky/number/%2B996700000001` (not in DB)

**Expected:**
- Page renders (no 404)
- Score badge shows 0 / low confidence / 0 reports
- "No reports yet — be first" empty state
- Report form still shown

---

## TC-10 — Submit report: happy path

1. Go to a number detail page
2. Select category "Spam" from the dropdown
3. Enter a comment
4. Click Submit

**Expected:**
- Button shows "Submitting…" while pending
- Form replaced by green success message
- Page does not reload (no full navigation)

---

## TC-11 — Submit report: no comment

1. Go to a number detail page
2. Select any category, leave comment empty
3. Click Submit

**Expected:**
- Report submits successfully (comment is optional)
- Green success message shown

---

## TC-12 — Submit report: all categories

1. Open the category dropdown

**Expected:**
- Six options visible: Scam, Spam, Telemarketer, Debt collector, Legitimate, Unknown
- All labels in the current locale language

---

## TC-13 — Rate limit on report submission

1. Submit 6 reports from the same browser within 10 minutes

**Expected:**
- First 5 succeed
- 6th shows the error state (red message)

---

## TC-13b — Top Scammers page

1. Navigate to `/ky/top-scammers`

**Expected:**
- Page title in Kyrgyz, subtitle visible
- Numbered list of numbers ordered by report count (most reported first)
- Each row shows E.164, score badge
- Clicking a row goes to the number detail page

2. Navigate to `/ru/top-scammers`

**Expected:** Same content, all text in Russian

---

## TC-14 — Navigation links

1. Click the site logo / name in the navbar

**Expected:** Navigates to `/ky/`

2. Click "Top Scammers" link

**Expected:** Navigates to `/ky/top-scammers`

---

## TC-15 — Page titles (SEO)

| Page | Expected `<title>` |
|---|---|
| `/ky/` | Site name + tagline |
| `/ky/search?q=555` | Search page title |
| `/ky/number/%2B996555555555` | `+996555555555 — ...` |

---

## TC-16 — Mobile viewport

Resize browser to 375 × 812 (iPhone SE size).

**Expected:**
- Search bar full width
- Stat cards stack or scroll without overflow
- Number detail cards readable
- Report form usable on touch

---

## TC-17 — API offline fallback

1. Stop the API (`docker compose stop api`)
2. Open homepage

**Expected:**
- Page renders (no crash)
- Stat cards show `0` values
- No unhandled error page

3. Navigate to a number detail page

**Expected:**
- Page renders with empty score and no reports
- Report form visible (submission will show error state)

---

## TC-18 — Direct URL access (no JS)

Disable JavaScript in browser devtools, then open:
- `/ky/`
- `/ky/search?q=555`
- `/ky/number/%2B996555555555`

**Expected:**
- All three pages render their content (SSR)
- Search results and number data visible without JS

> Report form will not function without JS (client component) — this is expected.
