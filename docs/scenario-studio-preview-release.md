# Scenario Studio Preview

October 20, 2026

The public preview describes a planned marketing and research workspace for comparing assumptions, alternatives and conditional projections. Technology choice is an optional dimension. The preview is in development; paid access, organizational workspaces and secure saved projects are not available.

## Public implementation

`scenario-studio-preview.html`, `styles-scenario-preview.css`, `js/scenario-preview.js` and `assets/video/scenario-preview-poster.svg` provide the presentation. Existing navigation links and contextual links on Dashboard and Research lead to the preview.

The page includes six optional starting structures, two fictional examples, a fourteen-step written workflow, a planned video script and storyboard, limitations, and an Advertising and Attention concept preview. No finished video is offered. The poster is an original SVG composed of text and shapes. The new preview uses text branding without adding a dependency on an image of unresolved provenance.

The examples use deliberately fixed assumptions:

- Marketing: unique reach × response rate = responses. Responses × purchase conversion rate = purchases. Each purchase represents one sales transaction. Purchases × revenue per purchase = revenue. Revenue × gross-margin rate − advertising spend = contribution after advertising spend, excluding other costs. Qualified leads are a separate stage not modeled in this example.
- Research: invitations × survey-start rate = survey starts. Starts × completion rate = completed responses. Usable responses require a separate quality review. Retained participants require a defined later follow-up. Neither is calculated from completed responses. Recruitment cost plus an illustrative incentive per completed response is a partial cost calculation.

All input and output figures are fictional and illustrative. The controls change one documented assumption; they do not estimate likelihood, establish causation, choose a preferred scenario or validate a research design.

## Privacy and accessibility

The preview has no form, upload, account, payment, project storage, model request or general scenario engine. Its JavaScript only switches the predefined examples and written workflow steps. The full written examples remain available without JavaScript. The existing contact-page link is an inquiry route, not pilot enrollment.

Native disclosures, keyboard controls, a skip link, status announcements, labeled scrollable tables and reduced-motion support are provided. Responsive checks cover 320, 390, 768, 1024 and 1440 pixel widths.

## Survey retirement

This release integrates the former questionnaires as eighteen self-report assessments within Assessment Center and retires the standalone survey starters. Assessment Center replaces those entry points. Both old survey URLs retain retirement notices, read-only historical access and downloads. Legacy survey records remain separate from assessment results. The original survey engines, shared-script functions, storage readers and original export support are retained. The five context assessments reuse the original local engine without the old submission interface. No Phase 2 deletion, historical conversion or rescoring is included.

See [the Phase 1 implementation note](legacy-survey-retirement-phase1.md).

## Release boundaries and verification

The working Scenario Studio engine, vault and storage implementation, full Advertising implementation, private planning and licensing audits, owner records, local caches and review screenshots are excluded. Existing assessment definitions, calculation rules, storage modules and licenses are unchanged. The existing evidence-led assessment interface replaces its retired follow-up survey suggestion; the new self-report section uses separate identities and history.

The isolated candidate is checked with the complete included Node unit suite, PowerShell suites and browser suites, covering links, keyboard navigation, responsive layouts, no-JavaScript access, historical downloads and storage preservation. Release review also compares protected files with the previously published commit and scans the selected files for credentials and private-module imports. These checks establish implementation behavior, not scientific validation or a general security certification.
