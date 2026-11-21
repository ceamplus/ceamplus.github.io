# Communication and Planning Studio release

## Delivered behavior

The November 21, 2026 update adds `communication-planning-studio.html` as a primary navigation destination. It provides 55 structured templates across workplace, personal, governance, project planning, and grants; a blank editor; reusable custom templates; and a browser-local workspace.

Drafts preserve paragraph breaks and manual preview edits. Users can rename, duplicate, delete, copy, download, print, and attach drafts to projects. Additional guided fields collapse to keep the editor manageable. Project templates include team work, board actions, marketing campaigns, events, personal goals, grant applications, and grant reporting. Tasks have owner labels, priorities, deadlines, checklists, linked drafts, and accessible status controls in list and Kanban views. Columns can be added or renamed.

Grant applications retain user-supplied requirements, eligibility notes, questions, review criteria, limits, deadlines and time zones, applicant facts, narrative sections, budget assumptions, required-document checklists, and funder questions/responses. Sections link to budget lines and required documents. Counts, budget totals, requested-amount discrepancies, missing information, and incomplete items remain visible alongside the combined proposal. Nothing establishes eligibility, compliance, submission, or funding likelihood.

Human writing requests include writing, editing, formatting, grant proposal writing, budget narrative assistance, and application review. Draft/application inclusion requires an explicit checkbox. Required fields validate before export. Requests can be copied, downloaded, or opened in an email application; long email requests fall back to a text download. No request is reported as delivered. The public recipient is configured in `js/communication-studio/config.mjs` using the contact already listed on the site. Pricing, availability, scope, and dates require a later agreement.

The homepage now identifies business leaders and consultants as the immediate audience, provides an isolated fictional revenue/cost assumption explorer, and links to the Studio, a pilot conversation, and educator/researcher materials. Existing conceptual content and research cautions remain available. The Dashboard has clearer first-visit guidance.

## Storage and privacy

- One separate key: `ceamplus.communication-planning.v1`. Assessment and persona records are never changed.
- Local automatic saving; no accounts, cross-device sync, team notifications, AI, external generation, or server uploads.
- Writing request contact details stay in tab memory and are not inserted into saved projects or examples.
- Validated JSON backups support restoration with explicit replacement confirmation. Invalid schemas, unsafe identifiers, broken links, invalid amounts, and oversized files are rejected before storage replacement.
- Failed storage writes retain the working session; failed imports leave the current session and saved data intact. Corrupt stored data pauses saving until explicit recovery. Cross-tab changes pause saving to avoid overwriting newer work.
- Fictional examples are opt-in, labeled, and removable independently of real work. Editing a fictional record does not remove its example label.
- Backups contain private text and owner labels. Browser profile users can access saved work. Export before clearing browser data.

## Verification

- All 161 pure calculation, definition, preservation, local-link, and Studio model tests pass. The existing source-hash check now accepts Git LF/CRLF conversion while retaining its original content hashes; no assessment definitions or scoring formulas changed.
- Studio browser workflow passes: choose/edit/save/reopen/export, manual preview preservation, copy and print, reusable templates, duplicate/delete, task creation/status/columns/draft links, grant questions and limits, totals and links, writing request validation and explicit inclusion, invalid import rejection, valid restore, and persistence.
- Separate browser checks verify quota failure, import write failure, and corrupt-storage preservation.
- Desktop and 320/390/768/1440 layouts, keyboard operation, no-JavaScript fallback, and homepage arithmetic were verified. Screenshots were inspected.
- Shared headers pass on every published HTML page at four widths. Keyboard navigation, Dashboard scenarios, Dashboard demos, Assessment Center, progressive disclosures, internal links, and research integrity pass.
- No writing requests were sent during testing. Test data lived in isolated browser contexts.

## Release scope and follow-up

The release is based on the current published `origin/git-branch` and includes only this task's changes. The original checkout's unrelated local edits remain intact. GitHub Pages continues using its existing branch and root publishing configuration.

Future work, outside this pass: an authenticated delivery service with verified receipts and secure uploads; optional authenticated syncing and collaboration; richer document-format exports; and user research to refine template language. Live grant discovery, automated eligibility verification, AI drafting, and application submission are not part of this release.

## Completion fixes

The follow-up completes the connections between drafting, projects, and grant applications:

- Email and formal-letter previews use document layouts instead of exporting the planning questionnaire. Existing saved text is retained; a rebuild remains explicit. Tone and accessibility preferences guide the user's review without claiming automatic rewriting.
- Grant templates can be added directly as editable proposal sections. An existing grant draft can be copied into a selected application without overwriting earlier sections. Copied text and the source draft remain independently editable, with explicit guidance in the interface.
- Linked budget lines, rounded totals, and required-document statuses appear beside each section and in the combined proposal export. Budget lines now use the same cent-rounding rule in every display and export.
- Grant Save excludes empty optional add-item forms from validation and opens collapsed panels containing invalid saved fields.
- Boards retain the identity of their completion column when renamed. Project settings allow choosing a completion column. Existing version-1 backups without this property remain readable and are not rewritten on load.
- Search works while editing, Create New closes after selection, and task status changes retain keyboard focus. Grant-draft writing requests open with the grant service selected and retain explicit inclusion consent.

The added model and browser regression checks cover these behaviors, old backup compatibility, unchanged manual drafts, linked budget recalculation, invalid-field recovery, and desktop/mobile layouts. The complete model suite now contains 165 passing tests. Both Studio browser suites pass locally; the completion suite is also used for post-deployment verification.
