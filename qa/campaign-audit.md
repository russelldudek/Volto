# VOLTO Candidate Campaign Audit

## Campaign state
- Repository: `russelldudek/Volto`
- Audited branch: `main`
- Job posting: supplied directly in chat on 2026-07-28; no public posting URL verified
- State: `blocked`
- Blocking item: the latest GitHub Pages deployment could not be independently fetched from the available verification environment

## Source and publication
- Six HTML routes are present: candidate vision, resume, cover letter, interview thesis brief, 90-day entry plan, and Power User Enablement Kit.
- Shared styles, brand tokens, WebGL/scenario controller, brand record, research, evidence map, asset decision record, README, manifest, and regression contract are present.
- Five generated PDF binaries are present.
- The public manifest resolves every expected path from `main`.

## Brand fidelity
- Visible company identity: passed.
- Official logo or wordmark: unavailable with documented reason; no approximation is used.
- Source-sampled color provenance: passed.
- Typography decision and font licensing boundary: passed.
- Independent-candidate distinction: passed.
- Website and document visual continuity: passed.

## Rendered visual QA
Testing used Playwright with Chromium under Xvfb and software WebGL2 because the preferred interactive browser runtime was not available.

| Viewport | Hero mode | Horizontal overflow | Tested semantic overlaps | Browser errors |
|---|---|---:|---:|---:|
| 1440 × 900 | WebGL2 | 0 | 0 | 0 |
| 1280 × 800 | WebGL2 | 0 | 0 | 0 |
| 768 × 1024 | semantic composition | 0 | 0 | 0 |
| 390 × 844 | semantic composition | 0 | 0 | 0 |
| 320 × 800 | semantic composition | 0 | 0 | 0 |

The complete page was reviewed at all five widths. Every section rendered in sequence. A dark-background inheritance defect in the 90-day section was found during full-page review and corrected. The final full-page renders show a readable white entry-plan section, integrated objection treatment, executive questions, and document navigation.

## Motion QA
- Actual WebGL2 initialization: passed at 1440 × 900 and 1280 × 800.
- Opening transformation: passed.
- Continuous movement after semantic settlement: passed.
- Pixel difference between post-intro frames 1.8 seconds apart: `0.0011882675704026466`.
- Forward capability-to-work flow: passed.
- Slower learning-return path: passed.
- Replay: passed.
- Visibility-aware pause and resume: passed by source contract.
- Reduced motion: passed; frame difference `0.0` and complete static state retained.

## Functional and accessibility QA
- Smart starting state: Operations.
- Talent Operations atomic state change: passed.
- Rapid Sales & Delivery → Support selection: final Support state authoritative.
- Replay starts and returns to the resolved semantic state: passed.
- Reset returns to Operations: passed.
- Keyboard activation with Enter: passed.
- Scenario buttons expose `aria-pressed`: passed.
- Live announcement region: passed.
- Hero accessible name and description: passed.
- Duplicate IDs: 0.
- Broken internal links: 0.
- Console errors and page errors: 0.

## Content and evidence QA
The campaign explicitly covers:
- workflow optimization and automation;
- demo sessions, practice, office hours, and champion coaching;
- usage analysis, adoption, and business-value measures;
- prompt/workflow design, governance, data security, and human authority;
- cross-functional playbooks;
- a 90-day entry plan;
- the strongest plausible seniority-to-analyst objection;
- executive discovery questions.

Evidence boundaries remain intact. The campaign does not claim named production custom-GPT deployments, formal ownership of a major ChatGPT workspace, invented ROI, or undisclosed VOLTO access.

## Documents and PDFs
All five printable HTML routes reflow without horizontal overflow at 1440, 768, 390, and 320 pixels.

| PDF | Pages |
|---|---:|
| Role-aligned resume | 2 |
| Cover letter | 1 |
| Interview thesis brief | 2 |
| 90-day entry plan | 2 |
| Power User Enablement Kit | 2 |

The nine rendered PDF pages were reviewed as a contact sheet. Application documents retain the candidate contact block and complete VOLTO candidate-vision URL.

## Confidentiality
- Candidate-facing public source scan: passed.
- Forbidden internal process-name matches: 0.
- Public filenames and directories: passed.

## Final disposition
All available source, rendered visual, motion, responsive, content, interaction, accessibility, document, PDF, evidence-integrity, and confidentiality gates pass. The campaign remains `blocked`, not `complete`, solely because the exact latest GitHub Pages deployment could not be independently verified from this environment.
