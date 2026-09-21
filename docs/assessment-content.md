# CEAM+ assessment content and weight register

## Purpose and boundaries

Version 1.0 provides 12 configurable assessments, 192 dimensions and 385 questions. The definitions are in `js/assessments/definitions.mjs`, separate from browser rendering, scoring, evidence confidence, persistence and numerical calculations.

The evidence flow remains **Surveys → Assessments → Analytics → Decisions → Follow-Up**:

- **Surveys** collect what people report about perceptions, experience, attitudes, barriers and conditions.
- **Assessments** organize questions about readiness, maturity, capability and strategic conditions together with user-described evidence.
- **Analytics** calculate and explore numerical or business information.
- **Decisions** require a human reviewer to examine context, alternatives and consequences.
- **Follow-up** reviews what changed and what remains uncertain.

These are authored planning prompts, not validated psychometric instruments, scientific benchmarks or certifications. They do not infer a person's character or diagnose a condition. Additional validation would be required before claiming reliability, construct validity, predictive accuracy or population norms. All action suggestions remain conditional on context and evidence.

## Configuration contract

The module exports `assessments` and `getAssessment(id)`. An unknown ID returns `undefined`; the UI owns safe route fallback behavior.

Each assessment declares its ID, title, category, purpose, audience, evidence suggestions, output, estimated minutes, version, overall-result label, context choices, retake interval, limitations and dimensions. Optional cross-dimension patterns name relative strengths and gaps; they prompt investigation or sequencing without establishing causality.

Each dimension contains:

- A stable ID and a user-facing title.
- A positive relative **dimension weight** for the overall profile.
- **Strategic importance** and **risk** planning ratings from 1 to 5.
- Focused questions with stable globally unique IDs, response type, positive question weight and explicit N/A permission.
- A specific action, explanation of why it matters, suggested KPI, evidence needed and follow-up question.
- Links to relevant existing Analytics Lab tools and supporting survey contexts.

The compact `d(...)` authoring helper takes questions followed by a named-order plan tuple: `[action, why, KPI, evidence needed, investigation question]`. It returns ordinary objects consumed by the engine. This avoids duplicating rendering or scoring logic inside content. The `assessment(...)` helper prefixes question IDs with the assessment and dimension IDs, assigns the version default and applies supporting survey context links.

Question IDs must not be reused for a substantially different construct. A future material wording, scope or weighting change should increment the version and retain an interpretation of previous saved results. Do not silently treat scores from different definitions as directly comparable.

The UI can interpolate `{initiative}` and `{context}` in question text. These strings personalize the reference without changing the construct. Organization-profile tailoring is a separate layer and must not treat organization size as maturity.

## Question scales and question weights

Maturity questions have weight **2** and use the specified five points: Not currently in place, Beginning, Developing, Established, Advanced. They describe how reliably a practice or enabling condition is established. Agreement questions have weight **1** and use the five-point agreement scale. Yes / Partly / No questions have weight **1**. Evidence available / unavailable questions have weight **1**. The Ansoff multiple-choice question has weight **2** and declares the complete score map in its options.

For the common two-question organizational dimension, the broad practice receives two-thirds of the answered-question weight and the specific corroborating condition receives one-third. This prevents one binary implementation check from dominating the broader maturity description. Customer risk has three focused questions: risk-management maturity receives half of the weight, with the two additional risk checks receiving one-quarter each. Personal dimensions use one agreement prompt and one practical check, each with equal weight, to emphasize the individual's reported conditions and feasible next step together.

The 1–5 scales map to 0, 25, 50, 75 and 100; Yes / Partly / No maps to 100, 50 and 0. Evidence available / unavailable maps to 100 and 0. Evidence presence questions assess whether the relevant record exists; they do **not** assert that its contents are accurate, independent or scientifically verified. The separate evidence-support index remains necessary.

All questions permit **Not sure** through the common engine. Explicitly appropriate questions also permit **Not applicable**. Neither response is a lowest-score substitute. Missingness, uncertainty, N/A coverage and contradictory or unsupported evidence must remain visible. A partial profile cannot establish overall readiness.

No numerical performance value is folded into these maturity questions. Optional financial inputs are calculated separately by the scoring/metric layer with the corresponding formula, scope and limitations. A high measurement-capability score must never be relabeled as strong financial performance.

## Why assessment weights differ

Weights are editorial planning judgments, not fitted coefficients or validated importance estimates. They apply **within** an assessment. Compare a dimension profile before relying on an overall weighted result; a critical privacy, authority, resource or recovery gap can matter even when the mean is high.

| Assessment | Weight rationale |
| --- | --- |
| Marketing Readiness | Performance measurement receives the greatest emphasis. Customer knowledge, targeting, positioning, analytics and execution capability receive more emphasis than the breadth of competitor monitoring because they directly support informed, executable marketing choices. |
| Customer Insight Maturity | Insight-to-action receives the greatest emphasis; needs, purchase behavior, barriers, retention and integration follow. Collecting feedback without using it cannot produce a high action dimension. |
| Analytics & Data Maturity | Data quality, KPI discipline and decision integration receive the greatest emphasis. Governance, availability, integration and diagnosis support them. Prediction, prescriptions and forecasting carry less weight and allow N/A when complexity is not justified. |
| AI Adoption Readiness | Data and technology foundations, use-case clarity, privacy, role clarity, governance and implementation capacity receive the greatest emphasis. External pressure carries less weight because pressure does not establish usefulness or responsible feasibility. |
| Change Readiness | Resources, structural barriers and implementation capacity receive the greatest emphasis. Trust, control, leadership, safety, fatigue and sustainable functioning remain prominent. Willingness alone cannot offset blocked conditions. |
| Customer Adoption | Perceived value, trust, risk management and continued adoption receive the greatest emphasis. Social influence and recommendation intent carry less weight because they are indirect evidence of sustained useful adoption. |
| Organizational Readiness | Strategic fit, decision rights and implementation capacity receive the greatest emphasis. Resources and coordination remain prominent because accountability without authority or capacity cannot support delivery. |
| Strategic Marketing | Targeting, positioning, value proposition, competitive advantage and strategic alignment receive the greatest emphasis. Optional 7Ps extensions receive lower weight; completed frameworks alone are not a coherent strategy. |
| Financial & Marketing Performance | Profitability, CAC, CLV, ROMI and measurement discipline receive the greatest emphasis. Share, AOV and intermediate campaign measures carry less weight. All dimensions assess measurement and use, independently of whether the measured result is favorable. |
| Sustainability & Resilience | Financial resilience, scenarios, long-term viability, risk management and recovery receive the greatest emphasis. Concentration and dependencies remain prominent because a single failure can disrupt essential functioning. |
| Agency & Trust | Meaningful choice, control, consent, manageable dependency, oversight, contestability and agency preservation receive the greatest emphasis. Trust is evaluated for appropriate grounding rather than maximization. |
| Personal Change / Adoption | Resources, control, barriers and sustainable pacing receive the greatest emphasis. Purpose, support, practical risk and environment follow. The profile should not attribute structural limitations to inadequate motivation. |

The default strategic-importance rating is `min(5, dimensionWeight + 1)`, a disclosed planning convention. Default risk is 3; explicitly consequential conditions receive 4 or 5. For example, privacy/security, psychological safety, structural barriers, informed choice, consent, oversight and tested recovery receive risk 5 where applicable. These are editorial consequence ratings, not estimated event probabilities. A future version can revise any dimension's explicit settings without changing the engine.

The full register below shows the exact effective values, including defaults. See `assessment-scoring.md` for the current normalization, confidence, planning-priority formula and missing-response treatment.

## Interpretation rules specific to these assessments

- **Financial:** “We measure and use this” is distinct from “performance is strong.” Growth, margin, customer economics and attributed returns need comparable definitions and contextual judgment. No universal favorable financial threshold is embedded in the assessment questions.
- **Change:** hesitation or avoidance is a **resistance signal**. The probable cause needs investigation. Missing information, legitimate risk, workload, previous experiences, trust, loss of control and structural constraints are alternative explanations. The Resistance dimension is scored positively for constructive investigation and response; it does not reward low reported resistance.
- **AI:** patterns compare technical and social conditions, use-case clarity and governance, leadership interest and implementation capacity, or expected value and trust. Resolve data, role and governance gaps before expanding consequential deployment. Pattern labels do not authorize deployment or establish “ready/not ready.” The content draws on technology–organization–environment, technology acceptance, adoption, trust, agency and organizational change concepts without claiming a validated combined scale.
- **Analytics:** reporting, description, diagnosis, prediction and decision support describe uses, not an inevitable ladder of superiority. A reliable simple metric can be sufficient. Predictive or prescriptive complexity is optional when no useful decision requires it. Even an advanced technique still needs appropriate data, checks and human review.
- **Agency:** describe the conditions around a person. A low condition score must not become a label such as “low agency person” or “untrusting employee.” Dependency, risk and oversight prompts are positively worded, so higher values consistently mean stronger enabling conditions.
- **Personal:** the prompts concern choices, practical resources, support and sustainable steps. They are not clinical questions, treatment advice or judgments about worth. Pausing or declining a change can be a reasonable outcome.
- **Bands and retakes:** visual bands are illustrative planning conventions. A one-point difference or crossing a band is not evidence of scientific or practical significance. Retake intervals of 30, 60 or 90 days are starting points; compare like contexts and consider changed respondents, interpretation, evidence and circumstances before attributing a score change to an intervention.

## Existing-tool integration

Survey links point to the existing Personal / Daily Life, Work / Business and Education contexts. Labels identify supporting topics inside those contexts; they do not claim there are new standalone Employee Trust, AI Willingness or Customer Value instruments. Survey findings remain self-report evidence.

Analytics links use actual metric IDs and case worksheet IDs from the existing lab. Metric links select a calculator; case links select a strategy worksheet. Forecasting links select the existing forecasting analysis. RFM links open the data workflow and state the required customer ID, date and revenue inputs; RFM output appears only after suitable records are loaded. No assessment responses are encoded into these links.

Some Agency & Trust and Personal dimensions have no analytics link because their next useful step is a discussion, practical observation or support action. Avoid implying that every human condition has a numerical calculator.

## Content verification

Run `node --test tests/assessment-definitions.test.mjs` to check the full required registry and dimension lists, unique and well-formed question IDs, valid scales and score mappings, positive varied weights, required action/evidence fields, valid pattern references and actual local survey/analytics targets. The tests also guard important construct boundaries: financial measurement versus performance; positive resistance/dependency wording; all five customer risk topics; optional advanced analytics; and personal non-diagnostic safeguards.

Browser flow, scoring arithmetic, accessibility, persistence, exports and preservation of the existing survey system are checked separately. Content coverage tests do not establish scientific validity or replace review with users and subject-matter experts.

## Version 1.0 dimension register

The tables below are generated from the versioned definitions. Update them after changing content weights, using each dimension's effective `weight`, `importance` and `risk` values. Question weights follow the rules above and remain inspectable in the definition and results scoring table.

### Marketing Readiness Assessment

ID: `marketing-readiness`. Dimension weight total: **36**. Retake starting point: **90 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| Customer Knowledge | 4 | 11.1% | 5 | 3 |
| Segmentation & Targeting | 4 | 11.1% | 5 | 3 |
| Positioning & Value Proposition | 4 | 11.1% | 5 | 3 |
| Market Research Maturity | 3 | 8.3% | 4 | 3 |
| Marketing Analytics | 4 | 11.1% | 5 | 3 |
| CRM & Retention | 3 | 8.3% | 4 | 3 |
| Channel Strategy | 3 | 8.3% | 4 | 3 |
| Performance Measurement | 5 | 13.9% | 5 | 3 |
| Competitive Awareness | 2 | 5.6% | 3 | 3 |
| Marketing Capabilities | 4 | 11.1% | 5 | 4 |

### Customer Insight Maturity Assessment

ID: `customer-insight`. Dimension weight total: **48**. Retake starting point: **90 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| Needs & Problems | 4 | 8.3% | 5 | 3 |
| Motivations | 3 | 6.3% | 4 | 3 |
| Purchase Behavior | 4 | 8.3% | 5 | 3 |
| Customer Journey | 3 | 6.3% | 4 | 3 |
| Barriers & Friction | 4 | 8.3% | 5 | 3 |
| Satisfaction | 2 | 4.2% | 3 | 3 |
| Loyalty & Retention | 4 | 8.3% | 5 | 3 |
| Switching Behavior | 3 | 6.3% | 4 | 3 |
| Customer Value | 3 | 6.3% | 4 | 3 |
| Voice of Customer | 3 | 6.3% | 4 | 3 |
| Qualitative Research Capability | 3 | 6.3% | 4 | 3 |
| Quantitative Research Capability | 3 | 6.3% | 4 | 3 |
| Customer Data Integration | 4 | 8.3% | 5 | 4 |
| Insight-to-Action Capability | 5 | 10.4% | 5 | 3 |

### Analytics & Data Maturity Assessment

ID: `analytics-data`. Dimension weight total: **58**. Retake starting point: **90 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| Data Availability | 4 | 6.9% | 5 | 3 |
| Data Quality | 5 | 8.6% | 5 | 5 |
| Data Governance | 4 | 6.9% | 5 | 5 |
| Integration | 4 | 6.9% | 5 | 3 |
| KPI Discipline | 5 | 8.6% | 5 | 3 |
| Dashboard Use | 2 | 3.4% | 3 | 3 |
| Descriptive Analytics | 3 | 5.2% | 4 | 3 |
| Diagnostic Analytics | 4 | 6.9% | 5 | 3 |
| Predictive Analytics | 2 | 3.4% | 3 | 4 |
| Prescriptive Analytics | 2 | 3.4% | 3 | 4 |
| Statistical Capability | 3 | 5.2% | 4 | 3 |
| Forecasting | 2 | 3.4% | 3 | 3 |
| Experimentation | 3 | 5.2% | 4 | 3 |
| Data Visualization | 2 | 3.4% | 3 | 3 |
| Decision Integration | 5 | 8.6% | 5 | 3 |
| Skills & Literacy | 3 | 5.2% | 4 | 3 |
| Technology | 2 | 3.4% | 3 | 3 |
| Data Culture | 3 | 5.2% | 4 | 3 |

### AI Adoption Readiness Assessment

ID: `ai-adoption`. Dimension weight total: **65**. Retake starting point: **60 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| Technology Readiness | 5 | 7.7% | 5 | 5 |
| Organizational Readiness | 4 | 6.2% | 5 | 4 |
| Environmental Conditions | 2 | 3.1% | 3 | 4 |
| AI Literacy | 3 | 4.6% | 4 | 3 |
| Use-Case Clarity | 5 | 7.7% | 5 | 3 |
| Financial Readiness | 3 | 4.6% | 4 | 3 |
| Privacy & Security | 5 | 7.7% | 5 | 5 |
| Integration Readiness | 4 | 6.2% | 5 | 4 |
| Leadership Support | 3 | 4.6% | 4 | 3 |
| Employee Adoption | 4 | 6.2% | 5 | 4 |
| Trust | 4 | 6.2% | 5 | 5 |
| Perceived Control | 4 | 6.2% | 5 | 4 |
| Human-AI Role Clarity | 5 | 7.7% | 5 | 5 |
| Governance | 5 | 7.7% | 5 | 5 |
| Expected Value | 4 | 6.2% | 5 | 3 |
| Implementation Capacity | 5 | 7.7% | 5 | 4 |

### Change Readiness Assessment

ID: `change-readiness`. Dimension weight total: **62**. Retake starting point: **60 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| Willingness | 3 | 4.8% | 4 | 3 |
| Resistance | 4 | 6.5% | 5 | 4 |
| Trust | 4 | 6.5% | 5 | 3 |
| Perceived Control | 4 | 6.5% | 5 | 3 |
| Communication | 3 | 4.8% | 4 | 3 |
| Leadership | 4 | 6.5% | 5 | 3 |
| Purpose Clarity | 4 | 6.5% | 5 | 3 |
| Resources | 5 | 8.1% | 5 | 5 |
| Skills | 3 | 4.8% | 4 | 3 |
| Organizational Culture | 3 | 4.8% | 4 | 3 |
| Psychological Safety | 4 | 6.5% | 5 | 5 |
| Participation | 3 | 4.8% | 4 | 3 |
| Implementation Capacity | 5 | 8.1% | 5 | 4 |
| Change Fatigue | 4 | 6.5% | 5 | 4 |
| Structural Barriers | 5 | 8.1% | 5 | 5 |
| Sustainability | 4 | 6.5% | 5 | 3 |

### Customer Adoption Assessment

ID: `customer-adoption`. Dimension weight total: **59**. Retake starting point: **60 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| Perceived Value | 5 | 8.5% | 5 | 3 |
| Perceived Usefulness | 4 | 6.8% | 5 | 3 |
| Ease of Use | 4 | 6.8% | 5 | 3 |
| Trust | 5 | 8.5% | 5 | 4 |
| Perceived Risk | 5 | 8.5% | 5 | 5 |
| Switching Costs | 4 | 6.8% | 5 | 3 |
| Awareness | 3 | 5.1% | 4 | 3 |
| Understanding | 4 | 6.8% | 5 | 3 |
| Trialability | 3 | 5.1% | 4 | 3 |
| Compatibility | 4 | 6.8% | 5 | 3 |
| Social Influence | 2 | 3.4% | 3 | 3 |
| Willingness to Try | 3 | 5.1% | 4 | 3 |
| Purchase Intent | 3 | 5.1% | 4 | 3 |
| Repeat Use Intent | 3 | 5.1% | 4 | 3 |
| Recommendation Intent | 2 | 3.4% | 3 | 3 |
| Continued Adoption | 5 | 8.5% | 5 | 3 |

### Organizational Readiness Assessment

ID: `organizational-readiness`. Dimension weight total: **62**. Retake starting point: **90 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| People | 4 | 6.5% | 5 | 3 |
| Leadership | 4 | 6.5% | 5 | 3 |
| Strategy | 5 | 8.1% | 5 | 3 |
| Processes | 4 | 6.5% | 5 | 3 |
| Technology | 3 | 4.8% | 4 | 4 |
| Data | 4 | 6.5% | 5 | 4 |
| Financial Resources | 4 | 6.5% | 5 | 3 |
| Skills | 3 | 4.8% | 4 | 3 |
| Governance | 4 | 6.5% | 5 | 5 |
| Culture | 3 | 4.8% | 4 | 3 |
| Communication | 3 | 4.8% | 4 | 3 |
| Decision Rights | 5 | 8.1% | 5 | 4 |
| Change Capability | 4 | 6.5% | 5 | 3 |
| Implementation Capacity | 5 | 8.1% | 5 | 4 |
| Measurement | 4 | 6.5% | 5 | 3 |
| Learning Capability | 3 | 4.8% | 4 | 3 |

### Strategic Marketing Assessment

ID: `strategic-marketing`. Dimension weight total: **66**. Retake starting point: **90 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| SWOT Quality | 3 | 4.5% | 4 | 3 |
| Porter’s Five Forces | 4 | 6.1% | 5 | 3 |
| Segmentation | 4 | 6.1% | 5 | 3 |
| Targeting | 5 | 7.6% | 5 | 3 |
| Positioning | 5 | 7.6% | 5 | 3 |
| Value Proposition | 5 | 7.6% | 5 | 3 |
| Product Strategy | 4 | 6.1% | 5 | 3 |
| Pricing Strategy | 4 | 6.1% | 5 | 3 |
| Place / Distribution | 3 | 4.5% | 4 | 3 |
| Promotion | 3 | 4.5% | 4 | 3 |
| People / Process / Physical Evidence | 2 | 3.0% | 3 | 3 |
| Competitive Advantage | 5 | 7.6% | 5 | 3 |
| Market Attractiveness | 4 | 6.1% | 5 | 3 |
| Growth Opportunities | 3 | 4.5% | 4 | 3 |
| Ansoff Options | 3 | 4.5% | 4 | 3 |
| Strategic Alignment | 5 | 7.6% | 5 | 3 |
| Measurement | 4 | 6.1% | 5 | 3 |

### Financial & Marketing Performance Assessment

ID: `financial-marketing`. Dimension weight total: **83**. Retake starting point: **90 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| Revenue Growth | 3 | 3.6% | 4 | 3 |
| Gross Margin | 4 | 4.8% | 5 | 3 |
| Contribution Margin | 4 | 4.8% | 5 | 3 |
| Profitability | 5 | 6.0% | 5 | 3 |
| Market Share | 2 | 2.4% | 3 | 3 |
| Customer Acquisition Cost | 5 | 6.0% | 5 | 3 |
| Customer Lifetime Value | 5 | 6.0% | 5 | 3 |
| CLV:CAC | 4 | 4.8% | 5 | 3 |
| Retention | 4 | 4.8% | 5 | 3 |
| Churn | 4 | 4.8% | 5 | 3 |
| Conversion | 3 | 3.6% | 4 | 3 |
| Average Order Value | 2 | 2.4% | 3 | 3 |
| Break-Even | 4 | 4.8% | 5 | 3 |
| ROMI | 5 | 6.0% | 5 | 3 |
| ROAS | 3 | 3.6% | 4 | 3 |
| CAC Payback | 4 | 4.8% | 5 | 3 |
| Budget vs Actual | 3 | 3.6% | 4 | 3 |
| Forecast Accuracy | 3 | 3.6% | 4 | 3 |
| Segment Profitability | 4 | 4.8% | 5 | 3 |
| Channel Profitability | 4 | 4.8% | 5 | 3 |
| Campaign Performance | 3 | 3.6% | 4 | 3 |
| Measurement Discipline | 5 | 6.0% | 5 | 4 |

### Sustainability & Resilience Assessment

ID: `sustainability-resilience`. Dimension weight total: **64**. Retake starting point: **90 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| Financial Resilience | 5 | 7.8% | 5 | 5 |
| Revenue Concentration | 4 | 6.3% | 5 | 4 |
| Customer Dependence | 4 | 6.3% | 5 | 4 |
| Supplier Dependence | 4 | 6.3% | 5 | 5 |
| Technology Dependence | 4 | 6.3% | 5 | 5 |
| Workforce Resilience | 4 | 6.3% | 5 | 4 |
| Operational Flexibility | 4 | 6.3% | 5 | 3 |
| Market Adaptability | 3 | 4.7% | 4 | 3 |
| Scenario Preparedness | 5 | 7.8% | 5 | 4 |
| Learning Capability | 3 | 4.7% | 4 | 3 |
| Ethical Considerations | 3 | 4.7% | 4 | 4 |
| Social Impact | 3 | 4.7% | 4 | 3 |
| Environmental Considerations | 3 | 4.7% | 4 | 3 |
| Long-Term Viability | 5 | 7.8% | 5 | 4 |
| Risk Management | 5 | 7.8% | 5 | 5 |
| Recovery Capability | 5 | 7.8% | 5 | 5 |

### CEAM+ Agency & Trust Assessment

ID: `agency-trust`. Dimension weight total: **71**. Retake starting point: **60 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| Information Quality | 4 | 5.6% | 5 | 4 |
| Transparency | 4 | 5.6% | 5 | 3 |
| Choice | 5 | 7.0% | 5 | 5 |
| Voice | 4 | 5.6% | 5 | 3 |
| Perceived Control | 5 | 7.0% | 5 | 4 |
| Reversibility | 4 | 5.6% | 5 | 4 |
| Consent | 5 | 7.0% | 5 | 5 |
| Trust | 4 | 5.6% | 5 | 4 |
| Reliability | 4 | 5.6% | 5 | 4 |
| Competence | 4 | 5.6% | 5 | 4 |
| Benevolence / Stakeholder Regard | 4 | 5.6% | 5 | 3 |
| Risk Awareness | 4 | 5.6% | 5 | 5 |
| Dependency | 5 | 7.0% | 5 | 5 |
| Human Oversight | 5 | 7.0% | 5 | 5 |
| Contestability | 5 | 7.0% | 5 | 5 |
| Agency Preservation | 5 | 7.0% | 5 | 5 |

### Personal Change / Adoption Assessment

ID: `personal-change`. Dimension weight total: **57**. Retake starting point: **30 days**.

| Dimension | Weight | Share of full profile | Importance / 5 | Risk / 5 |
| --- | ---: | ---: | ---: | ---: |
| Purpose | 4 | 7.0% | 5 | 3 |
| Readiness | 3 | 5.3% | 4 | 3 |
| Willingness | 3 | 5.3% | 4 | 3 |
| Confidence | 3 | 5.3% | 4 | 3 |
| Knowledge | 3 | 5.3% | 4 | 3 |
| Resources | 5 | 8.8% | 5 | 4 |
| Support | 4 | 7.0% | 5 | 3 |
| Perceived Control | 5 | 8.8% | 5 | 4 |
| Barriers | 5 | 8.8% | 5 | 4 |
| Risk | 4 | 7.0% | 5 | 4 |
| Habits | 3 | 5.3% | 4 | 3 |
| Environment | 4 | 7.0% | 5 | 3 |
| Sustainability | 5 | 8.8% | 5 | 4 |
| Learning | 3 | 5.3% | 4 | 3 |
| Reflection | 3 | 5.3% | 4 | 3 |


## Dedicated Marketing Assessment

The forty author-supplied items form a separate self-report screening profile; they are not a validated instrument. Each item and dimension has equal weight. Each of the eight dimensions has five items.

| Dimension | Weight | Share | Importance | Risk |
|---|---|---|---|---|
| Strategic Marketing — Big M | 1 | 12.5% | 2 | 3 |
| Customer & Market Understanding | 1 | 12.5% | 2 | 3 |
| External Environment | 1 | 12.5% | 2 | 3 |
| Value Proposition & Differentiation | 1 | 12.5% | 2 | 3 |
| Marketing Execution — little m | 1 | 12.5% | 2 | 3 |
| Customer Relationships | 1 | 12.5% | 2 | 3 |
| Marketing Information & Research | 1 | 12.5% | 2 | 3 |
| Analytics & Performance | 1 | 12.5% | 2 | 3 |
