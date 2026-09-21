/** Dedicated marketing report; shared assessment controls and storage stay in app.mjs. */
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
const scoreText = value => typeof value === 'number' && Number.isFinite(value) ? value.toFixed(1) : '—';
const list = (items, render, className = '') => `<ul${className ? ` class="${className}"` : ''}>${(items || []).map(item => `<li>${render(item)}</li>`).join('')}</ul>`;
const paragraph = value => value ? `<p>${escapeHTML(value)}</p>` : '';
const detail = (label, value) => value ? `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>` : '';

function confidenceHTML(value) {
  const support = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const label = support >= 70 ? 'Stronger' : support >= 40 ? 'Moderate' : 'Low';
  return `<span class="mk-confidence" title="User-declared evidence support, not statistical confidence or independent verification">${label} confidence · ${Math.round(support)}% evidence support</span>`;
}

function dimensionSummary(dimension, kind) {
  return `<strong>${escapeHTML(dimension.title)}</strong> <span class="mk-inline-score">${scoreText(dimension.score)} / 5 · ${escapeHTML(dimension.maturity)}</span><p>${confidenceHTML(dimension.confidence)}</p>${paragraph(dimension[kind])}${kind === 'gap' && dimension.risk ? `<p><strong>Potential risk:</strong> ${escapeHTML(dimension.risk)}</p>` : ''}`;
}

function profileHTML(profile) {
  return `<section class="ac-result-section mk-profile" aria-labelledby="mk-profile-heading">
    <div class="mk-profile-heading"><div><h3 id="mk-profile-heading">Eight dimensions of marketing capability</h3><p>Read the differences between dimensions first. Your organization may need to invest in some capabilities more than others.</p></div><div class="mk-overall"><span>Overall Marketing Capability</span><strong>${scoreText(profile.overall)} <small>/ 5</small></strong><span>${escapeHTML(profile.maturity)}</span></div></div>
    <div class="ac-table-wrap"><table class="mk-profile-table"><caption class="mk-table-caption">Self-reported capability on the 1–5 response scale; each dimension contains five questions.</caption><thead><tr><th scope="col">Marketing dimension</th><th scope="col">Capability score</th><th scope="col">Maturity level</th></tr></thead><tbody>${profile.dimensions.map(dimension => `<tr><th scope="row"><a href="#mk-dimension-${escapeHTML(dimension.id)}">${escapeHTML(dimension.title)}</a></th><td><div class="mk-score-cell"><span class="mk-score-track" aria-hidden="true"><span class="mk-score-fill" style="width:${Number.isFinite(dimension.score) ? Math.max(0, Math.min(100, dimension.score / 5 * 100)) : 0}%"></span></span><strong>${scoreText(dimension.score)}<span class="mk-score-denominator"> / 5</span></strong></div></td><td>${escapeHTML(dimension.maturity)}</td></tr>`).join('')}</tbody></table></div>
    <p class="ac-small">Foundational: 1.0–1.9 · Developing: 2.0–2.9 · Established: 3.0–3.9 · Advanced: 4.0–4.5 · Integrated: 4.6–5.0. Bands are planning conventions, not validated benchmarks.</p>
    ${paragraph(profile.contextNote)}
    <div class="mk-evidence-note"><strong>How much evidence supports this profile?</strong><p>${confidenceHTML(profile.confidence)} <span class="mk-coverage">${Math.round(profile.coverage || 0)}% response coverage</span></p>${paragraph(profile.evidenceNote)}</div>
  </section>`;
}

function strengthsAndGapsHTML(profile) {
  return `<div class="ac-result-grid mk-highlights"><section class="ac-result-section"><h3>Top 3 strengths</h3><p class="ac-small">The relatively strongest dimensions in this profile. Check the reported capabilities and evidence before relying on them.</p>${list(profile.strengths, item => dimensionSummary(item, 'strength'), 'mk-ranked-list')}</section><section class="ac-result-section"><h3>Top 3 capability gaps</h3><p class="ac-small">The relatively weakest dimensions. A lower score becomes a priority when it matters to your goals and situation.</p>${list(profile.gaps, item => dimensionSummary(item, 'gap'), 'mk-ranked-list')}</section></div>
    <section class="ac-result-section"><h3>Largest capability differences</h3><p class="ac-small">Differences are between your own dimensions, not a requirement to reach 5 in every area.</p>${profile.largestGaps?.length ? list(profile.largestGaps, gap => `${paragraph(gap.finding)}<span class="mk-gap-size">${scoreText(gap.difference)}-point difference</span>`) : '<p>The dimension scores are balanced. This alone does not establish that the capabilities meet your organization’s needs.</p>'}</section>`;
}

function diagnosticHTML(profile) {
  return `<section class="ac-result-section"><h3>Diagnosis by dimension</h3><p>Open a dimension to review what the responses suggest, what to do, and what to measure.</p><div class="mk-diagnostics">${profile.dimensions.map(dimension => `<details class="mk-dimension" id="mk-dimension-${escapeHTML(dimension.id)}"><summary><span>${escapeHTML(dimension.title)}</span><span class="mk-dimension-summary-score">${scoreText(dimension.score)} / 5 · ${escapeHTML(dimension.maturity)}</span></summary><div class="mk-dimension-body"><p>${confidenceHTML(dimension.confidence)}</p><dl class="mk-diagnostic-list">${detail('Current State', dimension.currentState)}${detail('Strength', dimension.strength)}${detail('Gap', dimension.gap)}${detail('Risk', dimension.risk)}${detail('Recommended Action', dimension.action)}${detail('Metric', dimension.metric)}${detail('Follow-Up', dimension.followUp)}</dl>${evidenceHTML(dimension.evidence)}</div></details>`).join('')}</div></section>`;
}

function patternsHTML(profile) {
  return `<section class="ac-result-section"><h3>Important cross-dimension patterns</h3>${profile.patterns?.length ? profile.patterns.map(pattern => `<article class="mk-pattern"><h4>${escapeHTML(pattern.title)}</h4><p>${confidenceHTML(pattern.confidence)} <span class="ac-small">Inferred from assessment responses</span></p>${paragraph(pattern.finding)}<dl class="mk-diagnostic-list">${detail('Next step', pattern.action)}${detail('Measure', pattern.metric)}</dl></article>`).join('') : '<p>No pronounced high–low pattern met the diagnostic rules. Review the individual dimensions and business evidence before deciding whether any imbalance needs action.</p>'}</section>`;
}

function evidenceHTML(evidence) {
  if (!evidence) return '';
  return `<p class="ac-small mk-source"><strong>Evidence:</strong> ${escapeHTML(evidence.label || evidence.type || 'Self-reported assessment responses')}${evidence.source ? ` · User-described source: ${escapeHTML(evidence.source)}` : ''}${evidence.note ? `. ${escapeHTML(evidence.note)}` : ''}${evidence.contradiction ? ' Conflicting evidence was flagged; resolve it before committing to a decision.' : ''}</p>`;
}

function findingHTML(finding) {
  return `<article class="mk-layer-card"><h4>${escapeHTML(finding.title || finding.label)}</h4><p>${confidenceHTML(finding.confidence)}</p>${paragraph(finding.finding)}<dl class="mk-diagnostic-list">${detail('Next step', finding.action)}${detail('Measure', finding.metric)}</dl>${evidenceHTML(finding.evidence)}</article>`;
}

function domainLayersHTML(profile) {
  const orientation = profile.orientation || {};
  const relationships = profile.relationships || {};
  const performance = profile.performance || {};
  return `<details class="ac-result-section mk-more"><summary>External environment: potential risks and opportunities</summary><p>These indicators describe your reported ability to monitor change. They do not establish that a particular market event has occurred. Explore the prompts using your organization’s market and current external evidence before recording an opportunity or threat in SWOT.</p>${(profile.externalIndicators || []).map(indicator => `<article class="mk-external-indicator"><h4>${escapeHTML(indicator.label)} <span class="mk-inline-score">${scoreText(indicator.score)} / 5 · ${escapeHTML(indicator.classification || 'Context required')}</span></h4><p>${confidenceHTML(indicator.confidence)}</p>${paragraph(indicator.observation)}<dl class="mk-diagnostic-list">${detail('Possible opportunity to investigate', indicator.opportunity)}${detail('Possible threat to investigate', indicator.threat)}${detail('Next step', indicator.action)}</dl>${evidenceHTML(indicator.evidence)}</article>`).join('')}<p><a class="text-link" href="analytics-lab.html?mode=case&amp;tool=swot">Examine opportunities and threats in the Marketing Analytics Lab</a></p></details>
    <details class="ac-result-section mk-more"><summary>Market orientation and marketing mix</summary><h4>Current orientation: ${escapeHTML(orientation.label || 'Insufficient evidence')}</h4><p>${confidenceHTML(orientation.confidence)}</p>${paragraph(orientation.finding)}<p>Market-driven organizations respond to existing needs and conditions. Market-driving organizations seek to shape expectations, create new value, or change a market. Either can fit an organization’s goals; neither is universally superior.</p>${paragraph(orientation.action)}${evidenceHTML(orientation.evidence)}<h4>Product, Price, Place/distribution, and Promotion</h4><p class="ac-small">The marketing mix is one diagnostic layer. These observations do not replace the eight-dimension capability profile.</p><div class="mk-layer-grid">${(profile.marketingMix || []).map(findingHTML).join('')}</div></details>
    <details class="ac-result-section mk-more"><summary>Customer relationships: acquisition, retention, and value</summary>${paragraph(relationships.summary)}<div class="mk-layer-grid">${(relationships.findings || []).map(findingHTML).join('')}</div>${relationships.metrics?.length ? `<h4>Useful customer measures</h4>${list(relationships.metrics, escapeHTML)}` : ''}</details>
    <details class="ac-result-section mk-more"><summary>Performance: short-term results and long-term marketing value</summary>${paragraph(performance.summary)}<div class="mk-layer-grid"><section class="mk-layer-card"><h4>Short-term performance</h4>${list(performance.shortTerm, escapeHTML)}</section><section class="mk-layer-card"><h4>Long-term marketing value</h4>${list(performance.longTerm, escapeHTML)}</section></div>${performance.findings?.length ? `<h4>What this profile suggests</h4><div class="mk-layer-grid">${performance.findings.map(findingHTML).join('')}</div>` : ''}<p class="ac-small">These are suggested measures, not calculated business outcomes. Use comparable periods and customer groups; ROMI alone cannot establish long-term marketing value.</p></details>`;
}

function nextToolsHTML(profile) {
  return `<details class="ac-result-section mk-more"><summary>Suggested CEAM+ tools and follow-up</summary><p>Use another assessment when a marketing finding points to a distinct capability that needs its own diagnosis.</p>${list(profile.nextTools, tool => {
    const href = /^[a-z0-9-]+\.html(?:[?#][^\s]*)?$/i.test(tool.href || '') ? tool.href : 'assessment-center.html';
    return `<a href="${escapeHTML(href)}">${escapeHTML(tool.title || tool.label)}</a>${paragraph(tool.reason)}`;
  }, 'mk-tools')}<h4>Follow-up and reassessment</h4>${paragraph(profile.followUp)}<p>Keep the original results as a baseline. Use Start Follow-Up to repeat the same assessment, compare the eight dimensions, and record changes in the measures behind your action plan.</p><p class="ac-small">Surveys → Assessments → Analytics → Decisions → Follow-Up</p></details>`;
}

function prioritiesHTML(profile) {
  return `<section class="ac-result-section mk-next" aria-labelledby="mk-next-heading"><h3 id="mk-next-heading">What should this organization do next?</h3><p>Start with these priorities, then agree on an owner, due date, and measure of progress.</p><ol class="mk-priorities">${(profile.priorities || []).slice(0, 3).map(priority => `<li><h4>${escapeHTML(priority.title)}</h4><p>${confidenceHTML(priority.confidence)}</p>${paragraph(priority.action)}<dl class="mk-diagnostic-list">${detail('Why this comes next', priority.reason)}${detail('Measure progress', priority.metric)}${detail('Reassess', priority.followUp)}</dl></li>`).join('')}</ol><button type="button" id="ac-create-plan" class="button primary ac-no-print">Create Measurable Action Plan</button><p class="ac-small">Use the action plan to record an owner, due date, baseline, target, and follow-up result.</p></section>`;
}

/** Pure HTML renderer. Never treats response text as markup. */
export function renderMarketingResults({ definition, response = {}, result, profile }) {
  if (!profile?.dimensions) return '<section class="ac-result-section"><p>The marketing profile is unavailable. Reopen the assessment and generate the report again.</p></section>';
  return `<div class="mk-report">${profileHTML(profile)}${strengthsAndGapsHTML(profile)}${patternsHTML(profile)}${diagnosticHTML(profile)}${domainLayersHTML(profile)}${nextToolsHTML(profile)}${prioritiesHTML(profile)}<p class="mk-cycle">Assess → Diagnose → Decide → Act → Measure → Learn → Reassess</p></div>`;
}
