/** Configurable context layers. No network, storage, dependencies or size-based score adjustment. */
import { classifyQuestion } from './ceam-metadata.mjs';

const item = (id, label, fields) => ({ id, label, ...fields });
const objective = (id, label, constructId, question, action, kpi, evidence) => ({ id, label, constructId, question, action, kpi, evidence });

export const industries = [
  item('restaurant', 'Restaurant / Food Service', {
    setting: 'restaurant service, takeaway and delivery', resources: 'staff coverage, prep and service capacity, point-of-sale information, time and promotion resources',
    question: 'Can staffing, kitchen capacity, point-of-sale records and delivery arrangements support a promotion without reducing service quality?',
    action: 'Test one promotion during a defined service period, check kitchen and service capacity, and review diner feedback before repeating it.',
    kpi: 'Promotion contribution, repeat visits and service complaints by service period', evidence: 'POS sales by daypart; menu costs; diner reviews; repeat-visit records; delivery-platform fees',
    marketing: ['local visibility and reviews', 'repeat diners and loyalty', 'promotions and social media', 'delivery platforms and customer experience', 'menu positioning and demand by daypart'],
    insight: 'Do diner feedback, reviews, menu sales and demand by daypart identify why nearby customers visit, return or choose another venue?',
    channels: 'Are local search, reviews, social posts and delivery-platform promotions coordinated with menu availability and service capacity?',
    positioning: 'Does menu positioning communicate a credible reason to visit for the intended dining occasion and local customer group?',
    measurement: 'Can you compare promotion contribution, platform fees, repeat visits and service demand with a comparable period?',
    lifecycle: 'Do repeat-visit and loyalty records distinguish returning diners from discount-only visits, with respectful communication choices?',
    sectorObjective: objective('restaurant-demand', 'Restaurant demand, promotions and service capacity', 'resource-readiness', 'Can you connect promotions and demand patterns to staffing, menu availability and a consistent diner experience?', 'Use a weekly daypart view to align one promotion with service capacity and menu contribution.', 'Contribution and repeat visits by daypart, alongside service waiting time', 'POS daypart totals; staff schedule; menu costs; service feedback'),
  }),
  item('retail', 'Retail', {
    setting: 'store and omnichannel retail', resources: 'staffing, inventory information, merchandising, checkout systems and promotion resources',
    question: 'Can staffing, stock visibility, merchandising and checkout processes support promotions consistently across the channels customers use?',
    action: 'Align one promotion with available inventory, staff guidance and a consistent store-to-online customer journey.',
    kpi: 'Promotion conversion, stock availability and repeat purchases by channel', evidence: 'Footfall; transactions; stockouts; merchandising plan; loyalty records; online-to-store feedback',
    marketing: ['merchandising and promotions', 'foot traffic and conversion', 'customer segments and inventory alignment', 'loyalty and retention', 'omnichannel experience'],
    insight: 'Do foot traffic, purchase baskets and customer feedback distinguish segments, shopping missions and barriers to buying?',
    channels: 'Do promotions and merchandising reflect available stock, store staffing and a consistent online-to-store experience?',
    positioning: 'Are assortment, price, merchandising and brand claims relevant to the chosen shopper segments?',
    measurement: 'Can you trace foot traffic to conversion, promotion contribution, stockouts and repeat purchases by channel?',
    lifecycle: 'Do loyalty and purchase records show which shopper groups return without relying only on repeated discounts?',
    sectorObjective: objective('retail-inventory', 'Retail promotions and inventory alignment', 'resource-readiness', 'Are promotion commitments aligned with stock availability, merchandising and store-to-online fulfillment?', 'Pilot an inventory-aware promotion and track stockouts and customer substitutions.', 'Promotion conversion and contribution with stockout rate', 'Inventory snapshots; promotional sales; substitution and fulfillment records'),
  }),
  item('ecommerce', 'E-commerce', {
    setting: 'online storefront, fulfillment and post-purchase journeys', resources: 'storefront access, product data, fulfillment capacity, support and acquisition budget',
    question: 'Can storefront, inventory, fulfillment and customer support handle a campaign without avoidable checkout or delivery friction?',
    action: 'Test one checkout-to-delivery journey and correct its most consequential friction before expanding acquisition spend.',
    kpi: 'Checkout conversion, contribution per order, delivery reliability and repeat orders', evidence: 'Funnel events; order margins; fulfillment logs; returns; customer support themes',
    marketing: ['product discovery', 'checkout conversion', 'acquisition contribution', 'fulfillment experience', 'repeat orders'],
    insight: 'Do search, product-view, abandonment and return records explain why different online shoppers buy or leave?',
    channels: 'Are paid, organic, email and marketplace campaigns coordinated with inventory, delivery promises and customer consent?',
    positioning: 'Do product descriptions and comparison content explain a credible benefit without hiding delivery, return or total-cost terms?',
    measurement: 'Can campaign revenue be reconciled with acquisition costs, returns, fulfillment costs and repeat orders?',
    lifecycle: 'Are reorder and retention messages based on useful customer needs, with clear communication choices and manageable frequency?',
    sectorObjective: objective('ecommerce-checkout', 'Checkout, fulfillment and repeat orders', 'capability', 'Can you identify the largest preventable loss between product interest, checkout, delivery and a second purchase?', 'Trace a customer cohort through checkout, fulfillment and repeat purchase before choosing a fix.', 'Checkout completion, contribution per order and cohort repeat rate', 'Funnel definitions; fulfillment and return records; cohort orders'),
  }),
  item('professional-services', 'Professional Services', {
    setting: 'client relationships and service engagements', resources: 'qualified staff time, client information, proposal capacity and delivery tools',
    question: 'Can qualified staff, proposal preparation and delivery capacity support promised client outcomes without overcommitting?',
    action: 'Review one client segment from inquiry to delivery, then align proposals and follow-up with available expertise.',
    kpi: 'Qualified inquiry-to-engagement conversion, engagement contribution and repeat clients', evidence: 'Inquiry and proposal records; project effort; client feedback; referral sources',
    marketing: ['qualified inquiries', 'expertise positioning', 'referrals', 'proposal follow-up', 'client retention'],
    insight: 'Do interviews, proposal outcomes and client feedback identify buying needs, decision criteria and reasons for lost engagements?',
    channels: 'Are referrals, professional content and inquiry follow-up coordinated with the expertise and capacity available to deliver?',
    positioning: 'Do service claims show relevant expertise, clear scope and credible evidence for the client problem?',
    measurement: 'Can you relate inquiry source and proposal conversion to engagement effort, contribution and repeat work?',
    lifecycle: 'Are follow-up and relationship reviews based on client outcomes and future needs rather than contact frequency alone?',
    sectorObjective: objective('services-pipeline', 'Qualified client pipeline and delivery fit', 'capability', 'Can you qualify inquiries against client needs, expertise, scope and delivery capacity?', 'Agree a simple inquiry qualification and proposal follow-up process linked to delivery availability.', 'Qualified proposal conversion and engagement contribution', 'Inquiry sources; qualification notes; proposal outcomes; delivery effort'),
  }),
  item('construction', 'Construction / Skilled Trades', {
    setting: 'local inquiries, estimates and job delivery', resources: 'crew availability, scheduling, estimating time, materials information and customer communication',
    question: 'Can crew availability, estimating time, materials and job scheduling support new inquiries without promises the team cannot keep?',
    action: 'Use a shared inquiry and estimate log with a named follow-up owner, then compare inquiry-to-job conversion and job contribution.',
    kpi: 'Qualified inquiry-to-job conversion, estimate follow-up time and referral jobs', evidence: 'Lead sources; estimate dates and outcomes; job margins; review and referral records',
    marketing: ['lead generation and local search', 'referrals and reputation', 'estimate follow-up', 'inquiry-to-job conversion', 'customer communication and repeat/referral business'],
    insight: 'Do inquiry notes, lost estimates and customer feedback explain the job types, service areas and concerns that matter most?',
    channels: 'Are local search, reviews, referrals and inquiry follow-up coordinated with the service area and crew availability?',
    positioning: 'Do estimates and reputation claims clearly explain relevant workmanship, job scope, scheduling and reasons to choose the business?',
    measurement: 'Can you track lead source through estimate follow-up, accepted jobs, job contribution and referral business?',
    lifecycle: 'Are completion updates, after-job follow-up and referral requests timely, useful and respectful of customer preferences?',
    sectorObjective: objective('trades-estimates', 'Local inquiries, estimate follow-up and referral jobs', 'capability', 'Can every qualified inquiry be followed through estimate, decision, job delivery and a possible referral?', 'Maintain a simple inquiry-to-job log and schedule one estimate follow-up routine.', 'Estimate response time, inquiry-to-job conversion and referral share', 'Inquiry log; estimates; accepted jobs; job feedback and referrals'),
  }),
  item('manufacturing', 'Manufacturing', {
    setting: 'buyer requirements, production and distribution', resources: 'production capacity, quality information, technical expertise and channel coordination',
    question: 'Can production capacity, quality controls and delivery commitments support the demand or change being proposed?',
    action: 'Align one target-buyer promise with production, quality and distribution capacity before extending the offer.',
    kpi: 'Qualified order conversion, contribution and on-time complete delivery', evidence: 'Buyer requirements; capacity plan; quality and order records; channel feedback',
    marketing: ['buyer requirements', 'technical positioning', 'channel relationships', 'order contribution', 'capacity alignment'],
    insight: 'Do buyer interviews, technical requirements and lost-order reasons inform the segments and applications being targeted?',
    channels: 'Are distributor and direct-sales messages consistent with specification, availability and delivery capability?',
    positioning: 'Do technical and value claims match buyer requirements and demonstrated product performance?',
    measurement: 'Can you connect target-segment demand and channel costs to order contribution, capacity and repeat orders?',
    lifecycle: 'Are account reviews and service records used to maintain useful buyer relationships and identify recurring product needs?',
    sectorObjective: objective('manufacturing-demand', 'Buyer demand and production alignment', 'resource-readiness', 'Can customer demand signals be translated into realistic production and delivery decisions?', 'Review one target segment jointly with sales, production and quality owners.', 'Demand-plan variance, order contribution and on-time delivery', 'Order pipeline; production plan; quality and delivery records'),
  }),
  item('hospitality', 'Hospitality / Tourism', {
    setting: 'guest discovery, booking and stay or visit experiences', resources: 'staff capacity, booking information, service availability and guest support',
    question: 'Can staffing, booking systems and service availability deliver the guest experience promised during peak and quieter periods?',
    action: 'Review one booking-to-visit journey and align seasonal promotion with capacity and guest expectations.',
    kpi: 'Booking conversion, contribution per visit, guest feedback and repeat bookings', evidence: 'Booking sources; occupancy or visit patterns; channel fees; guest reviews',
    marketing: ['seasonal demand', 'booking conversion', 'guest reviews', 'channel fees', 'repeat visits'],
    insight: 'Do booking patterns and guest feedback distinguish visit purposes, seasonal needs and reasons for choosing alternatives?',
    channels: 'Are booking-platform, local and direct promotions consistent with real availability and service promises?',
    positioning: 'Does the offer communicate a credible guest experience for the intended visit occasion and budget?',
    measurement: 'Can you compare channel contribution, cancellation patterns and guest outcomes across comparable seasons?',
    lifecycle: 'Are repeat-visit invitations based on guest preferences and a useful reason to return?',
    sectorObjective: objective('hospitality-seasonality', 'Seasonal demand and guest experience', 'sustainment', 'Can you adapt promotion and staffing to seasonal demand without weakening the guest experience?', 'Plan a small seasonal test with capacity checks and guest feedback.', 'Booking contribution and guest experience by comparable season', 'Seasonal bookings; staffing; channel costs; guest feedback'),
  }),
  item('healthcare', 'Healthcare', {
    setting: 'nonclinical service access and patient or service-user communication', resources: 'staff time, accessible information, scheduling capacity and privacy-aware workflows',
    question: 'Can staff, access arrangements and privacy-aware information practices support a service change without undermining understandable choices?',
    action: 'Review a nonclinical access or communication journey with affected service users and accountable staff.',
    kpi: 'Access completion, communication understanding and resolved service barriers', evidence: 'De-identified access records; communication review; patient or service-user feedback',
    marketing: ['accessible service information', 'grounded trust', 'appropriate service access', 'privacy-aware communication', 'experience feedback'],
    insight: 'Do privacy-respecting service-user feedback and access records identify information needs and barriers across groups?',
    channels: 'Are service descriptions, referral information and public messages understandable and consistent with actual access?',
    positioning: 'Do service claims accurately explain scope and limitations without implying guaranteed clinical outcomes?',
    measurement: 'Can access and communication outcomes be reviewed using appropriate, de-identified information and human oversight?',
    lifecycle: 'Are follow-up communications useful, understandable and respectful of consent, privacy and service-user choice?',
    sectorObjective: objective('healthcare-access', 'Nonclinical access and communication', 'agency-trust', 'Can service users understand access steps, ask questions and receive support when communication or scheduling creates a barrier?', 'Test one nonclinical access journey with diverse service users and responsible staff.', 'Access completion and unresolved information barriers', 'De-identified access feedback; communication materials; support records'),
  }),
  item('financial-services', 'Financial Services', {
    setting: 'customer financial-service information and support journeys', resources: 'knowledgeable staff, product information, controlled data access and review capacity',
    question: 'Can accountable staff and controlled information workflows support understandable customer choices and review concerns?',
    action: 'Review one customer information journey for clear terms, material limitations and a usable route to question an outcome.',
    kpi: 'Customer comprehension, resolved concerns and journey completion', evidence: 'Communication reviews; customer feedback; complaint themes; access controls',
    marketing: ['clear terms and grounded claims', 'customer understanding', 'trust and risk awareness', 'journey friction', 'accountable review'],
    insight: 'Do customer research and concern records identify needs, comprehension gaps and barriers without inferring them from financial value alone?',
    channels: 'Are product messages consistent across channels, with clear material terms and routes to qualified human support?',
    positioning: 'Can customers distinguish the service benefit, material costs and limitations without relying on unsupported promises?',
    measurement: 'Are acquisition and retention measures considered alongside customer understanding, complaints and fair service outcomes?',
    lifecycle: 'Do ongoing communications explain relevant changes and preserve a practical way to question or leave a service?',
    sectorObjective: objective('finance-understanding', 'Customer understanding and grounded trust', 'agency-trust', 'Can customers explain material service terms and obtain a fair human review when something is unclear?', 'Test a key communication with customers and resolve the most consequential misunderstandings.', 'Comprehension of material terms and concern resolution time', 'Communication tests; concern records; human review workflow'),
  }),
  item('technology', 'Technology / SaaS', {
    setting: 'product discovery, onboarding and continued software use', resources: 'product telemetry, engineering capacity, onboarding support and reliable systems',
    question: 'Can product, engineering and customer-support capacity sustain onboarding and reliable use as adoption grows?',
    action: 'Connect one target use case to onboarding steps, a useful activation outcome and a support owner.',
    kpi: 'Useful activation, cohort retention, support burden and contribution', evidence: 'Product events; use-case interviews; support records; billing cohorts',
    marketing: ['use-case clarity', 'activation', 'product-led journeys', 'lifecycle retention', 'customer value'],
    insight: 'Do product-use records and customer interviews distinguish a useful outcome from account creation or feature activity alone?',
    channels: 'Do acquisition and onboarding messages set realistic expectations about product fit, effort, data use and support?',
    positioning: 'Can target users explain the use case, alternatives and demonstrable value without unsupported AI or automation claims?',
    measurement: 'Can you trace acquisition cohorts through useful activation, retention, support costs and customer contribution?',
    lifecycle: 'Do lifecycle messages respond to actual user needs and preserve clear control over communications and account decisions?',
    sectorObjective: objective('technology-activation', 'Useful activation and sustained product adoption', 'sustainment', 'Can you identify when a user first obtains a useful outcome and what prevents that value from continuing?', 'Define one useful activation event and compare it with later cohort outcomes.', 'Useful activation and retained value by acquisition cohort', 'Event definitions; interviews; cohorts; support and billing records'),
  }),
  item('education', 'Education', {
    setting: 'learner access, participation and educational support', resources: 'educator time, learning systems, accessible materials and learner support',
    question: 'Can educator time, accessible materials, systems and support meet the needs of learners affected by the proposed change?',
    action: 'Review one learner journey with educators and learners, then remove a documented access or information barrier.',
    kpi: 'Supported participation, access-barrier resolution and learner feedback', evidence: 'Learner feedback; access records; support capacity; participation patterns',
    marketing: ['clear program information', 'learner fit', 'accessible outreach', 'participation', 'continued support'],
    insight: 'Do learner and educator perspectives identify goals, access barriers and support needs across learner groups?',
    channels: 'Are program messages and enrollment steps accessible, understandable and consistent with available support?',
    positioning: 'Do program claims explain intended learning, required effort and limitations without guaranteeing outcomes?',
    measurement: 'Are outreach and participation measures interpreted alongside access, support needs and learner experience?',
    lifecycle: 'Do ongoing communications help learners find support and make informed choices about continued participation?',
    sectorObjective: objective('education-participation', 'Learner access and supported participation', 'resource-readiness', 'Can learners understand participation requirements and obtain support for practical access barriers?', 'Test an enrollment-to-participation journey and assign an owner to unresolved barriers.', 'Participation with required support and resolved access barriers', 'Learner feedback; enrollment steps; support and access records'),
  }),
  item('nonprofit', 'Nonprofit', {
    setting: 'mission delivery, community relationships and supporter engagement', resources: 'staff and volunteer time, sustainable funding, community knowledge and service capacity',
    question: 'Can staff, volunteers, funding and community relationships support the initiative without weakening existing mission delivery?',
    action: 'Connect one initiative to a community-defined need, available capacity and a modest outcome measure.',
    kpi: 'Mission-relevant outcomes, participation access and supporter continuity', evidence: 'Community feedback; program records; volunteer capacity; funding restrictions',
    marketing: ['mission clarity', 'community voice', 'supporter trust', 'accessible participation', 'sustainable fundraising'],
    insight: 'Do community and supporter perspectives distinguish needs, participation barriers and the outcomes that matter to them?',
    channels: 'Are outreach and fundraising messages aligned with mission delivery, available capacity and respectful communication choices?',
    positioning: 'Do mission and impact claims have clear evidence and avoid overstating what the organization caused?',
    measurement: 'Are campaign and supporter measures reviewed with mission outcomes, delivery costs and restricted-funding conditions?',
    lifecycle: 'Are supporter and participant relationships maintained through useful feedback, transparent updates and meaningful voice?',
    sectorObjective: objective('nonprofit-mission', 'Mission delivery and sustainable engagement', 'sustainment', 'Can the initiative deliver a community-relevant outcome with realistic volunteer, staff and funding capacity?', 'Choose one community-informed outcome and review the resources needed to sustain it.', 'Mission outcome progress alongside delivery capacity', 'Community input; program evidence; funding and volunteer plans'),
  }),
  item('government', 'Government / Public Sector', {
    setting: 'public service access and accountable delivery', resources: 'staffing, accessible service channels, public information and accountable decision processes',
    question: 'Can staff, accessible channels and accountable decision processes support the change for the different communities affected?',
    action: 'Review one service journey with affected users and record an accountable route for resolving access barriers.',
    kpi: 'Service completion, access equity indicators and resolved concerns', evidence: 'Service records; community input; access reviews; decision and review logs',
    marketing: ['public information', 'accessible service discovery', 'community understanding', 'service uptake', 'accountability'],
    insight: 'Do community input and service records identify different information needs and practical barriers to access?',
    channels: 'Is public service information consistent and usable across digital and assisted channels?',
    positioning: 'Do service descriptions explain eligibility, steps, limitations and a route to clarification?',
    measurement: 'Are communication and service-uptake measures reviewed alongside accessibility and differences between affected groups?',
    lifecycle: 'Do follow-up communications provide useful updates, meaningful voice and clear routes to challenge errors?',
    sectorObjective: objective('public-access', 'Accessible and accountable public service', 'agency-trust', 'Can affected people understand a service decision, obtain help and challenge an error through a usable process?', 'Test a service information and review route with affected community members.', 'Successful service access and resolution of challenged errors', 'Service journey evidence; community input; review and access logs'),
  }),
  item('corporate', 'Corporate / Multi-Department Organization', {
    setting: 'cross-functional initiatives and customer lifecycle management', resources: 'technology, customer data, skills, budget and cross-functional decision support',
    question: 'Can the team access customer data, technology, skills, budget and cross-functional support needed to execute a coordinated initiative?',
    action: 'Assign shared decision rights and an owner for one cross-functional dependency, then test delivery across the handoff.',
    kpi: 'Shared outcome performance, dependency resolution time and initiative contribution', evidence: 'Shared KPI definitions; customer-data lineage; budget decisions; handoff and ownership records',
    marketing: ['segmentation and brand strategy', 'campaign attribution and customer data', 'analytics and MarTech integration', 'cross-functional coordination', 'ROMI, experimentation and lifecycle management'],
    insight: 'Are segmented customer research and lifecycle data integrated across functions and used in documented decisions?',
    channels: 'Are campaigns, MarTech workflows and customer handoffs coordinated across functions with clear ownership?',
    positioning: 'Do segment strategy and brand promises stay consistent across business units, campaigns and delivered customer experiences?',
    measurement: 'Are attribution assumptions, ROMI, experiments and lifecycle measures reviewed across marketing, sales and finance?',
    lifecycle: 'Can teams coordinate lifecycle decisions using shared customer definitions, accountable ownership and communication preferences?',
    sectorObjective: objective('corporate-coordination', 'Cross-functional customer and campaign coordination', 'capability', 'Can functions share customer definitions, decision rights and outcome measures to resolve campaign and lifecycle dependencies?', 'Pilot one cross-functional customer journey with named decision owners and a shared outcome review.', 'Handoff completion, shared KPI reconciliation and initiative contribution', 'Journey handoffs; KPI definitions; data lineage; joint review decisions'),
  }),
  item('other', 'Other', {
    setting: 'the organization and stakeholders in this assessment', resources: 'people, time, relevant information, practical tools and implementation resources',
    question: 'Can available people, time, information and practical tools support the initiative in your actual operating context?',
    action: 'Describe one relevant stakeholder journey and test a manageable improvement with available resources.',
    kpi: 'A defined stakeholder outcome alongside implementation effort and burden', evidence: 'Stakeholder feedback; operating records; resource plan; outcome measures',
    marketing: ['stakeholder needs', 'clear value', 'appropriate channels', 'measurable outcomes', 'sustainable relationships'],
    insight: 'Do stakeholder research and operating records identify needs, alternatives and barriers in the actual context?',
    channels: 'Are outreach and follow-up channels appropriate to the audience and supported by real delivery capacity?',
    positioning: 'Can the intended audience explain a relevant benefit and the evidence behind the offer?',
    measurement: 'Can you connect activity to a defined outcome, costs and a reasonable comparison period?',
    lifecycle: 'Are ongoing relationships supported by useful feedback, reliable delivery and meaningful choices?',
    sectorObjective: null,
  }),
];

export const sizes = [
  item('solo', 'Solo / Owner-operated', { question: 'Can the owner reserve realistic time, maintain a simple record and obtain outside help for tasks beyond current capacity?', action: 'Use one owner-maintained checklist or spreadsheet, one outcome measure and a short weekly review; seek specific outside help only where needed.', kpi: 'Owner time required, commitments completed and one outcome measure', evidence: 'A simple work log, calendar, customer notes and recorded outcomes', resources: 'owner time, accessible tools and targeted support' }),
  item('micro', 'Microbusiness: 1–9 employees', { question: 'Can the small team assign an owner, cover day-to-day work and maintain a shared record without creating excessive administration?', action: 'Use a shared spreadsheet, existing point-of-sale or customer records, a named owner and a brief weekly check; test the workflow before adding software.', kpi: 'Work completed within available staff time and one shared outcome measure', evidence: 'Staff coverage plan; shared task or customer log; existing sales or service records', resources: 'small-team time, staff cover and a simple shared workflow' }),
  item('small', 'Small Business: 10–49 employees', { question: 'Are responsibilities, staff coverage, shared information and escalation clear enough to deliver the initiative across the small team?', action: 'Agree a named owner, a simple handoff and a small shared dashboard using existing tools before expanding the process.', kpi: 'Owner-assigned milestones, handoff completion and outcome progress', evidence: 'Role and coverage plan; shared records; a short KPI review', resources: 'staff coverage, clear ownership and shared operating information' }),
  item('mid-sized', 'Mid-Sized / Growing Organization: 50–249 employees', { question: 'Can growing teams coordinate dependencies, information access and training without relying on informal workarounds that no longer scale?', action: 'Document the most important dependencies, agree shared definitions and pilot a repeatable handoff with accountable team leads.', kpi: 'Dependency resolution, consistent process use and shared outcome progress', evidence: 'Dependency map; role definitions; training and access records; team reviews', resources: 'team coordination, consistent processes and growing support capacity' }),
  item('large', 'Large Organization: 250+ employees', { question: 'Are decision rights, cross-functional dependencies, data access and rollout support explicit across the units affected by this initiative?', action: 'Establish decision rights and a cross-functional dependency review, then pilot in a representative unit before coordinating a wider rollout.', kpi: 'Dependency resolution, rollout consistency and comparable outcomes across units', evidence: 'Decision-rights map; shared KPI definitions; unit-level pilot and rollout records', resources: 'cross-functional ownership, controlled data access and coordinated rollout support' }),
];

export const departments = [
  item('whole', 'Whole Organization', { question: 'Do leadership, delivery teams and affected stakeholders share a clear purpose, sufficient resources and a practical review process?', action: 'Agree one shared outcome and resolve the most important dependency between functions.', kpi: 'Shared outcome progress and unresolved cross-functional dependencies', evidence: 'Initiative plan; stakeholder input; ownership and resource decisions' }),
  item('marketing', 'Marketing', { question: 'Can marketing connect research, segmentation, positioning, brand and customer experience with coordinated campaigns, channels, acquisition, retention and measurable decisions?', action: 'Choose one target audience and objective, coordinate the relevant channels and customer handoffs, then review a meaningful outcome.', kpi: 'Target-audience outcome, campaign contribution and customer lifecycle progress', evidence: 'Research; segment and positioning decisions; channel records; campaign, customer and financial data' }),
  item('sales', 'Sales', { question: 'Can sales qualify opportunities, communicate a credible offer, follow up consistently and hand over promises the delivery team can meet?', action: 'Define a qualified opportunity and track one consistent inquiry-to-outcome process with an accountable handoff.', kpi: 'Qualified opportunity conversion, sales cycle and reliable delivery handoff', evidence: 'Opportunity definitions; pipeline stages; follow-up records; won and lost reasons' }),
  item('customer-experience', 'Customer Experience', { question: 'Can the team identify customer friction, respond to concerns, preserve meaningful choices and close the loop across the journey?', action: 'Investigate one recurring customer friction point and assign an owner to test and review a correction.', kpi: 'Resolved journey friction, response quality and continued useful customer outcomes', evidence: 'Journey observations; feedback; support themes; recovery and retention records' }),
  item('people', 'Human Resources / People', { question: 'Can affected people access information, skills, time, support and a safe way to raise concerns about the proposed change?', action: 'Discuss role-specific demands and remove one documented resource, access or authority barrier before increasing expectations.', kpi: 'Roles with required support, resolved structural barriers and staff feedback', evidence: 'Role requirements; workload and learning records; staff perspectives; barrier log' }),
  item('operations', 'Operations', { question: 'Can operational owners coordinate capacity, reliable processes, quality, handoffs and recovery when demand or conditions change?', action: 'Map one important process and test the weakest handoff with its owner and affected staff.', kpi: 'Process reliability, cycle time, rework and recovery performance', evidence: 'Process map; capacity and quality records; handoff and incident logs' }),
  item('finance', 'Finance', { question: 'Can finance produce comparable cost, cash and performance information that decision owners understand and use with explicit assumptions?', action: 'Reconcile one decision-critical metric and document its cost scope, period and owner before using it to allocate resources.', kpi: 'Reconciled decision metrics, forecast error and resource-review follow-through', evidence: 'Financial records; metric definitions; forecast assumptions; budget decisions' }),
  item('leadership', 'Leadership / Strategy', { question: 'Can leaders explain the objective, test assumptions, allocate authority and resources, and revise decisions when evidence changes?', action: 'Record a strategic assumption, its supporting evidence and a trigger for reconsidering the decision.', kpi: 'Reviewed assumptions, resolved priority conflicts and outcome progress', evidence: 'Strategy choices; decision rights; resource tradeoffs; review decisions' }),
  item('technology', 'Technology / AI', { question: 'Can technology owners connect a clear use case with reliable systems, appropriate data access, user support, human oversight and a recovery route?', action: 'Pilot one bounded use case with success criteria, human review and a tested way to stop or recover.', kpi: 'Useful task outcomes, reliability, user support burden and review exceptions', evidence: 'Use-case specification; integration and data checks; pilot records; oversight and recovery tests' }),
  item('other', 'Other / Shared Function', { question: 'Can this function explain its role, dependencies, available resources and the stakeholder outcome it is responsible for?', action: 'Describe the function’s contribution and agree one useful handoff and review measure with its stakeholders.', kpi: 'Agreed service outcome and completion of critical handoffs', evidence: 'Function responsibilities; stakeholder feedback; operating and handoff records' }),
];

const marketingObjectives = [
  objective('marketing-readiness', 'Marketing Readiness', 'resource-readiness', 'Are the research, skills, time, budget and customer information needed for the marketing objective available and coordinated?', 'Map the marketing objective to required capabilities and close the most limiting resource gap.', 'Priority marketing tasks with an owner, resources and outcome measure', 'Capability map; staffing; budget; customer information'),
  objective('customer-insights', 'Customer Insights', 'capability', 'Are current customer needs, motives, journey friction and alternatives investigated and used in marketing decisions?', 'Interview a small, relevant mix of customers and noncustomers and record what changes in the decision.', 'Important customer questions answered and decisions revised with evidence', 'Interviews; feedback themes; journey records; decision notes'),
  objective('segmentation', 'Customer Segmentation', 'capability', 'Are segments distinguishable by needs or behavior, practical to reach and relevant to an explicit targeting decision?', 'Compare a few usable segments by need, accessibility, value and delivery fit.', 'Target decisions supported by useful segment differences', 'Segment definitions; customer behavior; cost-to-serve and reach evidence'),
  objective('positioning', 'Brand Positioning', 'purpose-clarity', 'Can the chosen audience explain a relevant difference between the offer and credible alternatives, with reasons to believe it?', 'Test one positioning statement against customer alternatives and the delivered experience.', 'Target customers recognizing the intended relevant difference', 'Message tests; competitor comparisons; customer experience evidence'),
  objective('customer-experience', 'Customer Experience', 'agency-trust', 'Does the experience deliver the marketing promise while helping customers understand choices and obtain support?', 'Trace one promise through the customer journey and correct the most consequential mismatch.', 'Promise-to-experience consistency and resolved customer friction', 'Journey observations; complaints; message and service reviews'),
  objective('campaigns', 'Campaign Effectiveness', 'capability', 'Does each campaign have a defined audience, credible message, delivery capacity, outcome and a reasonable comparison?', 'Run one bounded campaign with a baseline, cost scope and review date.', 'Campaign contribution and target-audience outcome against a stated baseline', 'Campaign brief; costs; audience and outcome records; comparison assumptions'),
  objective('marketing-analytics', 'Marketing Analytics', 'capability', 'Can the team reconcile relevant data, interpret uncertainty and use a small set of decision-relevant marketing measures?', 'Choose one marketing decision and build only the measures needed to review it.', 'Decision-critical metrics with defined sources and documented use', 'KPI definitions; source checks; analysis and decision records'),
  objective('martech', 'Marketing Technology / MarTech', 'resource-readiness', 'Do the current marketing tools, customer data and handoffs support the workflow without avoidable duplication or dependence?', 'Map the current workflow and fix one data or handoff problem before considering additional software.', 'Manual rework, data completeness and usable customer handoffs', 'Tool inventory; data flows; access records; workflow observations'),
  objective('ai-marketing', 'AI in Marketing', 'agency-trust', 'Does a defined marketing AI use case have suitable data, human review, realistic value expectations and control over errors or misleading content?', 'Pilot one bounded marketing AI task with human review, quality checks and a clear stop rule.', 'Useful task quality, review burden and corrected AI errors', 'Use-case brief; approved inputs; human review and pilot records'),
  objective('acquisition', 'Customer Acquisition', 'capability', 'Can you connect acquisition channels and costs to appropriate new customers and the value they obtain after joining?', 'Compare one acquisition cohort by cost scope, useful customer outcome and contribution.', 'CAC, useful activation or first-purchase outcome and cohort contribution', 'Acquisition costs; source definitions; new-customer and outcome records'),
  objective('retention', 'Customer Retention', 'sustainment', 'Do comparable customer cohorts reveal who continues, who leaves and which experience or barriers may explain the difference?', 'Review a starting cohort and talk with leavers before selecting a retention action.', 'Cohort retention, churn reasons and sustained customer value', 'Starting-cohort records; repeat behavior; exit interviews; service themes'),
  objective('attribution', 'Marketing Attribution', 'capability', 'Are attribution rules, missing touchpoints and limits on causal interpretation explicit when allocating marketing credit?', 'Compare attribution assumptions and test whether the spending decision changes under plausible alternatives.', 'Attributed outcomes reconciled with source data and sensitivity to attribution assumptions', 'Touchpoint definitions; attribution rules; conversion paths; experiment evidence'),
  objective('romi', 'ROMI', 'capability', 'Can incremental contribution, marketing costs and the assumptions needed for ROMI be separated from attributed revenue?', 'Define contribution and marketing cost scope, then compare a campaign with a defensible baseline.', 'Contribution-based ROMI with documented incrementality assumptions', 'Campaign costs; contribution margins; comparable baseline; incrementality assumptions'),
  objective('digital', 'Digital Marketing', 'capability', 'Are website, search, social and email activities connected to a coherent customer journey and measurable useful outcomes?', 'Improve one digital journey step and compare useful outcomes, effort and cost.', 'Relevant journey conversion, customer outcome and cost per outcome', 'Website and channel records; journey tests; consent and communication settings'),
  objective('local', 'Local Marketing', 'capability', 'Can relevant nearby or service-area customers discover an accurate offer, trust the information and take a practical next step?', 'Check local listings, reviews and contact steps, then track the inquiries or visits they support.', 'Qualified local inquiries or visits and inquiry-to-outcome conversion', 'Listing accuracy; reviews; inquiry sources; visits or job outcomes'),
  objective('loyalty', 'Loyalty', 'sustainment', 'Does the loyalty approach provide useful reasons to return without hiding costs, pressuring participation or rewarding unprofitable behavior?', 'Test one simple loyalty benefit and compare repeat behavior, contribution and customer understanding.', 'Repeat behavior and contribution alongside loyalty participation quality', 'Loyalty terms; repeat purchases; contribution; customer feedback'),
  objective('market-research', 'Market Research', 'capability', 'Are research methods, sample limitations and evidence recency appropriate to the marketing decision being made?', 'Write one research decision question and combine a suitable small qualitative inquiry with relevant existing data.', 'Priority research questions answered with explicit limitations and decision use', 'Research brief; recruitment approach; findings; limitations; decision notes'),
];

const objectiveBanks = {
  marketing: marketingObjectives,
  whole: [
    objective('execution-readiness', 'Initiative execution readiness', 'resource-readiness', 'Are purpose, ownership, resources and dependencies clear enough to begin a bounded initiative?', 'Agree one realistic milestone with a responsible owner and required support.', 'Milestones delivered with required resources', 'Initiative plan; ownership; resources; dependencies'),
    objective('organizational-change', 'Organizational change', 'agency-trust', 'Do affected people understand the change, have meaningful input and receive the resources needed to participate?', 'Investigate hesitation and remove one structural barrier with affected people.', 'Resolved barriers and supported participation', 'Staff perspectives; workload; access and decision records'),
    objective('business-resilience', 'Business resilience', 'sustainment', 'Can the organization sustain useful delivery when a major resource, supplier or demand assumption changes?', 'Test one disruption scenario and identify a practical recovery owner.', 'Critical activities with feasible recovery arrangements', 'Dependencies; scenarios; continuity and recovery records'),
    objective('data-decisions', 'Evidence-informed decisions', 'capability', 'Are reported experiences, organizational records and numerical evidence compared before material decisions?', 'Create one decision note separating evidence, assumptions and what remains unknown.', 'Important decisions with traceable evidence and review triggers', 'Survey findings; operating data; decision and review notes'),
    objective('stakeholder-trust', 'Stakeholder trust and agency', 'agency-trust', 'Can stakeholders understand decisions, express concerns and retain meaningful choices in the initiative?', 'Test the clarity of a key decision and its route for questions or correction.', 'Concerns resolved and choices understood', 'Stakeholder feedback; communications; review pathways'),
  ],
  sales: [
    objective('sales-pipeline', 'Pipeline quality', 'capability', 'Are sales opportunities qualified using relevant customer need, fit, timing and practical next steps?', 'Define qualified stages and review stale opportunities with owners.', 'Qualified pipeline progression and stale-opportunity share', 'Stage definitions; qualification notes; opportunity history'),
    objective('sales-conversion', 'Inquiry-to-sale conversion', 'capability', 'Can you explain losses between inquiry, response, proposal and an appropriate customer decision?', 'Trace a small group of inquiries through the full sales process and investigate drop-offs.', 'Qualified inquiry-to-sale conversion and response time', 'Inquiry, follow-up, proposal and outcome records'),
    objective('sales-followup', 'Follow-up discipline', 'resource-readiness', 'Does each qualified inquiry have a clear owner, useful follow-up and a recorded outcome?', 'Use a shared follow-up list with owners and realistic response windows.', 'Qualified inquiries followed up within the agreed window', 'Inquiry log; ownership; follow-up dates; outcomes'),
    objective('sales-value', 'Value communication', 'purpose-clarity', 'Can sales explain a relevant benefit, actual scope and limitations in terms the customer understands?', 'Test one proposal with customer language and evidence for its central claim.', 'Customer understanding and qualified proposal conversion', 'Proposal examples; customer questions; win/loss reasons'),
    objective('sales-handoff', 'Sales-to-delivery handoffs', 'capability', 'Are customer promises and requirements transferred accurately to the people delivering the work?', 'Agree one handoff checklist and review missed promises with sales and delivery owners.', 'Complete handoffs and avoidable promise mismatches', 'Requirements; proposals; handoff and delivery records'),
    objective('sales-accounts', 'Account development', 'sustainment', 'Are account plans based on continuing customer needs, delivered value and realistic service capacity?', 'Review one account’s outcomes before proposing additional work.', 'Useful repeat business and account contribution', 'Account feedback; delivered outcomes; service capacity; contribution'),
  ],
  'customer-experience': [
    objective('cx-journey', 'Customer journey friction', 'capability', 'Can the team identify and explain barriers across the customer journey, including differences between groups?', 'Observe one journey and prioritize a documented friction point with affected customers.', 'Journey completion and avoidable effort', 'Observations; journey records; customer feedback'),
    objective('cx-recovery', 'Service recovery', 'agency-trust', 'Can customers raise a problem and receive an understandable, fair and timely response?', 'Test a complaint-to-resolution path and close a recurring cause of failure.', 'Resolution time and customer understanding of the outcome', 'Complaint themes; responses; recovery outcomes'),
    objective('cx-voice', 'Voice of customer', 'agency-trust', 'Are missing customer perspectives actively sought and visible in decisions about the experience?', 'Include an underrepresented customer group and document how their evidence changes a decision.', 'Customer themes reviewed and acted on with stated limitations', 'Feedback sources; representation review; decision records'),
    objective('cx-access', 'Access and inclusion', 'resource-readiness', 'Can customers with different access, language, time or support needs complete the important service steps?', 'Test the journey with people facing different practical barriers and assign a correction owner.', 'Access barriers resolved and assisted journey completion', 'Accessibility observations; support needs; journey feedback'),
    objective('cx-retention', 'Continued customer value', 'sustainment', 'Do customers continue obtaining useful outcomes after their initial purchase or participation?', 'Compare a customer cohort’s continuing outcomes with reasons for leaving.', 'Sustained useful outcomes and cohort retention', 'Usage or service records; retention cohorts; leaver feedback'),
  ],
  people: [
    objective('people-capability', 'Skills and support', 'capability', 'Can people practice the actual tasks they are expected to perform with accessible learning and support?', 'Provide supported practice for one demanding task and review performance in realistic conditions.', 'Roles able to complete tasks with available support', 'Task requirements; practice observations; support records'),
    objective('people-capacity', 'Workload and resource capacity', 'resource-readiness', 'Are workload, time, staff coverage and competing demands realistic for the proposed change?', 'Review what must stop, wait or receive support before adding new work.', 'Work commitments within available capacity', 'Workload map; staffing; schedules; competing initiatives'),
    objective('people-trust', 'Trust and meaningful voice', 'agency-trust', 'Can people raise concerns safely and see a constructive response from decision owners?', 'Review one concern pathway with staff and demonstrate how feedback affects a decision.', 'Concerns receiving timely, constructive responses', 'Staff feedback; concern and response records; decision explanations'),
    objective('people-change', 'Change participation', 'agency-trust', 'Are affected roles involved early enough to influence implementation and identify legitimate barriers?', 'Include missing roles in a small implementation review and assign structural barriers to accountable owners.', 'Affected roles represented and barriers resolved', 'Participation records; role input; barrier log'),
    objective('people-retention', 'Sustainable work and retention', 'sustainment', 'Are role clarity, workload, support and reasons for leaving reviewed together?', 'Investigate one recurring work condition affecting sustainable participation.', 'Resolved work barriers and sustained supported participation', 'Role and workload records; staff feedback; exit themes'),
  ],
  operations: [
    objective('operations-reliability', 'Process reliability', 'capability', 'Is an important process defined, usable and supported when routine conditions vary?', 'Observe the process and test a correction at its least reliable handoff.', 'First-time completion, rework and service reliability', 'Process observations; quality records; handoff failures'),
    objective('operations-capacity', 'Capacity and demand', 'resource-readiness', 'Can staffing, equipment, stock and scheduling respond to the actual pattern of demand?', 'Compare demand with capacity over a relevant operating cycle and adjust one constraint.', 'Demand served within available capacity and agreed service level', 'Demand records; schedules; stock and equipment availability'),
    objective('operations-quality', 'Quality improvement', 'capability', 'Are recurring quality problems investigated with evidence rather than attributed to staff motivation alone?', 'Investigate one recurring defect or service failure and test a specific process change.', 'Repeated defects, rework and customer impact', 'Quality observations; defect themes; process and workload records'),
    objective('operations-handoffs', 'Workflow and handoffs', 'capability', 'Do owners have the information, authority and timing needed to complete critical handoffs?', 'Agree a simple handoff definition and check it in a real delivery cycle.', 'Complete handoffs and avoidable waiting time', 'Workflow map; role ownership; handoff records'),
    objective('operations-recovery', 'Disruption and recovery', 'sustainment', 'Can essential work continue or recover when a supplier, person, system or site becomes unavailable?', 'Run a small disruption scenario and test a feasible backup or recovery step.', 'Critical activities with tested recovery arrangements', 'Dependency map; recovery plan; scenario findings'),
  ],
  finance: [
    objective('finance-profitability', 'Profitability and contribution', 'capability', 'Are revenue, direct or variable costs and fixed costs defined consistently enough to compare meaningful contribution?', 'Reconcile one product, segment or channel contribution calculation with its cost scope.', 'Comparable contribution and cost-scope reconciliation', 'Revenue; cost allocation; segment or channel records'),
    objective('finance-cash', 'Cash and resource resilience', 'sustainment', 'Are timing, uncertainty and dependencies in cash inflows and outflows visible in planning?', 'Review a simple cash-timing scenario and identify an early trigger for adjusting commitments.', 'Cash-timing variance and commitments with review triggers', 'Cash timing; commitments; assumptions; scenario records'),
    objective('finance-budget', 'Budget versus actual', 'capability', 'Can budget differences be traced to scope, price, volume or timing instead of treated as unexplained totals?', 'Review one material variance and document its likely drivers and remaining uncertainty.', 'Explained budget variance with accountable follow-up', 'Budget; actual costs; scope and timing changes'),
    objective('finance-forecast', 'Forecast accuracy', 'capability', 'Are forecast assumptions explicit and errors reviewed across comparable periods?', 'Record the forecast before the period, then review signed and absolute errors with context.', 'Comparable forecast error and assumption-review completion', 'Dated forecasts; actuals; assumptions; error reviews'),
    objective('finance-marketing', 'Marketing financial performance', 'capability', 'Can CAC, contribution-based ROMI and customer value be calculated with matching scopes and explicit assumptions?', 'Reconcile a campaign or cohort’s costs, contribution and customer outcomes.', 'CAC and contribution-based ROMI with documented scope', 'Acquisition costs; contribution; campaign and cohort records'),
    objective('finance-investment', 'Investment decisions', 'purpose-clarity', 'Are investment alternatives compared using realistic benefits, costs, uncertainty and implementation demands?', 'Compare a small set of investment scenarios and define what evidence would change the choice.', 'Investment assumptions reviewed and benefits measured against plan', 'Cost and benefit assumptions; scenarios; implementation resources'),
  ],
  leadership: [
    objective('strategy-priorities', 'Strategic priorities', 'purpose-clarity', 'Are the most important outcomes clear enough to resolve competing demands and decide what to defer?', 'Choose a limited set of priorities and explain the tradeoffs and deferred work.', 'Priority conflicts resolved and resources aligned with chosen outcomes', 'Strategy choices; resource allocation; deferred commitments'),
    objective('strategy-market', 'Market and competitive choices', 'capability', 'Are market, customer and competitor assumptions supported by current evidence and plausible alternatives?', 'Review a strategic choice against customer alternatives and a competing scenario.', 'Strategic assumptions with current supporting and challenging evidence', 'Market research; competitors; customer alternatives; scenarios'),
    objective('strategy-governance', 'Decision rights and accountability', 'agency-trust', 'Can people identify who decides, whose input matters and how a decision can be reconsidered?', 'Clarify decision rights for one recurring cross-functional decision.', 'Decisions with clear ownership, input and review routes', 'Decision-rights map; stakeholder input; review records'),
    objective('strategy-execution', 'Strategy execution', 'resource-readiness', 'Are strategic commitments matched to practical capacity, dependencies and accountable delivery?', 'Translate one strategy into a bounded milestone and resolve its key resource constraint.', 'Strategic milestones with resources and accountable owners', 'Delivery plan; dependencies; owner and resource decisions'),
    objective('strategy-learning', 'Strategic learning and resilience', 'sustainment', 'Are decisions revisited when evidence, demand or constraints change rather than defended automatically?', 'Set a review trigger and test one plausible disruption scenario.', 'Review triggers acted on and recovery options tested', 'Assumption register; scenarios; review and adaptation records'),
  ],
  technology: [
    objective('technology-ai', 'AI adoption readiness', 'agency-trust', 'Does a clear AI use case have suitable data, practical user support, human oversight and a way to stop or correct failures?', 'Pilot a bounded AI workflow with role clarity, review and recovery criteria.', 'Useful task outcomes, review exceptions and support burden', 'Use case; data checks; pilot; oversight and recovery records'),
    objective('technology-data', 'Data quality and access', 'capability', 'Is decision-critical data fit for use, understandable and accessible to authorized people?', 'Trace one critical measure to its source and resolve a consequential quality or access problem.', 'Critical data issues resolved and authorized task completion', 'Data definitions; lineage; quality checks; access records'),
    objective('technology-integration', 'Systems integration', 'resource-readiness', 'Can systems exchange the information needed for the workflow with accountable ownership and manageable failure handling?', 'Test one important integration handoff and document ownership and recovery.', 'Reliable handoffs, manual rework and recovery time', 'System map; integration tests; failures; ownership records'),
    objective('technology-adoption', 'User adoption and support', 'capability', 'Can users understand the system, practice relevant tasks and obtain help without losing necessary control?', 'Observe users completing a real task and resolve one usability or support barrier.', 'Useful task completion and avoidable support burden', 'User observations; training; task and support records'),
    objective('technology-reliability', 'Reliability and recovery', 'sustainment', 'Are system reliability, dependencies and recovery arrangements sufficient for the workflow’s actual importance?', 'Test a proportionate recovery step and clarify who responds to a material failure.', 'Service reliability and tested recovery time', 'Service needs; incidents; dependencies; recovery exercises'),
    objective('technology-governance', 'Technology governance', 'agency-trust', 'Are data use, system decisions, human review and accountability understandable to affected people?', 'Document one high-impact system decision and test its explanation and review route.', 'Material decisions with usable human review and clear ownership', 'Governance records; explanations; review and concern pathways'),
  ],
  other: [
    objective('function-readiness', 'Function readiness', 'resource-readiness', 'Are the function’s responsibilities, resources and dependencies sufficient for its intended contribution?', 'Agree one outcome and the minimum resources required to deliver it.', 'Function commitments with owners and required support', 'Responsibilities; resources; dependencies; stakeholder needs'),
    objective('function-service', 'Service improvement', 'capability', 'Can the function identify and address an important source of friction for the people it serves?', 'Observe one service handoff and test a practical correction.', 'Service completion and avoidable effort', 'Service observations; feedback; handoff records'),
    objective('function-coordination', 'Shared-function coordination', 'agency-trust', 'Do connected functions understand ownership, information needs and a fair route to resolve conflicting priorities?', 'Clarify one shared decision and its escalation path with affected functions.', 'Resolved priority conflicts and complete handoffs', 'Ownership; shared decisions; escalation and handoff records'),
    objective('function-learning', 'Learning and sustainment', 'sustainment', 'Does the function review its outcomes and adapt its work when needs or constraints change?', 'Schedule a short review of one outcome and the burden required to sustain it.', 'Documented improvements and sustainable delivery effort', 'Outcome reviews; changing needs; capacity and effort records'),
  ],
};

export const defaultProfile = Object.freeze({ industry: 'other', size: 'small', department: 'whole', objective: 'execution-readiness' });
const validId = (catalog, value, fallback) => catalog.some((entry) => entry.id === value) ? value : fallback;

/** Marketing keeps its complete 17-objective bank; relevant sectors add a concrete option. */
export function objectivesFor(departmentId, industryId) {
  const department = validId(departments, departmentId, defaultProfile.department);
  const industry = industries.find((entry) => entry.id === industryId) || industries.find((entry) => entry.id === 'other');
  const list = objectiveBanks[department].map((entry) => ({ ...entry }));
  if (industry.sectorObjective && ['whole', 'marketing', 'operations', 'customer-experience'].includes(department)) list.push({ ...industry.sectorObjective, industrySpecific: true });
  if (department === 'marketing') {
    const local = list.find((entry) => entry.id === 'local');
    const suffix = { restaurant: 'Nearby Diners', retail: 'Store-Area Shoppers', construction: 'Service-Area Inquiries', hospitality: 'Destination Discovery', corporate: 'Local Units and Regional Markets', government: 'Local Service Awareness', education: 'Community Program Discovery' }[industry.id];
    if (suffix) local.label = `Local Marketing / ${suffix}`;
  }
  return list;
}

export function sanitizeProfile(raw = {}) {
  const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const industry = validId(industries, input.industry, defaultProfile.industry);
  const size = validId(sizes, input.size, defaultProfile.size);
  const department = validId(departments, input.department, defaultProfile.department);
  const options = objectivesFor(department, industry);
  const selected = options.some((entry) => entry.id === input.objective) ? input.objective : options[0].id;
  return { industry, size, department, objective: selected };
}

export function profileSignature(raw) {
  const profile = sanitizeProfile(raw);
  return `personalization-v1:${JSON.stringify([profile.industry, profile.size, profile.department, profile.objective])}`;
}

export function profileLabel(raw) {
  const profile = sanitizeProfile(raw);
  return [industries.find((entry) => entry.id === profile.industry).label, sizes.find((entry) => entry.id === profile.size).label, departments.find((entry) => entry.id === profile.department).label, objectivesFor(profile.department, profile.industry).find((entry) => entry.id === profile.objective).label].join(' · ');
}

function marketingTopic(dimension) {
  const text = `${dimension.id} ${dimension.title}`.toLowerCase();
  if (/crm|retention|loyalty|lifecycle|repeat|continued/.test(text)) return 'lifecycle';
  if (/position|segment|target|brand|value proposition/.test(text)) return 'positioning';
  if (/channel|campaign|promotion|digital|place|distribution|mix/.test(text)) return 'channels';
  if (/analytic|measur|performance|financial|romi|attribution|forecast/.test(text)) return 'measurement';
  if (/customer|research|insight|journey|needs|behavior|switching|voice|satisfaction/.test(text)) return 'insight';
  return null;
}

function contextQuestion(id, text, module, constructId, weight = 1) {
  return { id, type: 'maturity', text, weight, allowNA: false, module, constructId };
}

/**
 * Original dimensions/questions remain available and keep their weights and IDs.
 * Context layers add consistently weighted questions; employee count never adds
 * score points or changes the response mapping. Compare only matching profiles.
 */
export function tailorAssessment(baseDefinition, rawProfile) {
  if (!baseDefinition || !Array.isArray(baseDefinition.dimensions)) throw new TypeError('A base assessment with dimensions is required.');
  if (baseDefinition.tailoring) throw new TypeError('Tailor the original definition, not an already tailored assessment.');
  const definition = JSON.parse(JSON.stringify(baseDefinition));
  const profile = sanitizeProfile(rawProfile);
  // Fixed questionnaires preserve their question count and scale across contexts.
  // Context changes interpretation only; it never adds questions or score points.
  if (definition.fixedQuestions) return definition;
  const industry = industries.find((entry) => entry.id === profile.industry);
  const size = sizes.find((entry) => entry.id === profile.size);
  const department = departments.find((entry) => entry.id === profile.department);
  const selectedObjective = objectivesFor(profile.department, profile.industry).find((entry) => entry.id === profile.objective);
  const prefix = `${definition.id}-ceam-context`;
  const moduleIds = { core: [], industry: [], size: [], department: [], objective: [] };
  const add = (suffix, text, module, constructId, weight = 1) => {
    const entry = contextQuestion(`${prefix}-${suffix}`, text, module, constructId, weight);
    moduleIds[module].push(entry.id);
    return entry;
  };
  const contextDimension = {
    id: 'ceam-context', title: 'CEAM+ implementation conditions', weight: 3, importance: 4, risk: 3,
    why: 'Purpose, resources, practical capability, meaningful choice and sustainment shape whether an initiative can work in this context.',
    action: `${selectedObjective.action} ${size.action} ${industry.action}`,
    kpi: `${selectedObjective.kpi}; ${size.kpi}`,
    evidenceNeeded: `${selectedObjective.evidence}; ${industry.evidence}; ${size.evidence}`,
    followUp: `For ${selectedObjective.label.toLowerCase()}, which resource, authority, access or coordination constraint should be investigated first?`,
    tools: [], surveys: [...(definition.dimensions[0]?.surveys || [])],
    questions: [
      add('core-purpose', 'Is the intended outcome clear, grounded in evidence and understood by the people affected by the initiative?', 'core', 'purpose-clarity'),
      add('core-resources', 'Are the time, resources, authority, access and support needed for the initiative available in practice?', 'core', 'resource-readiness'),
      add('core-agency', 'Can affected people understand their options, raise concerns and obtain a meaningful human review when needed?', 'core', 'agency-trust'),
      add('industry', industry.question, 'industry', 'resource-readiness'),
      add('size', size.question, 'size', 'resource-readiness'),
      add('department', department.question, 'department', 'capability'),
      add('objective', selectedObjective.question, 'objective', selectedObjective.constructId, 2),
      add('core-sustainment', 'Are outcome measures, a review date and a realistic way to sustain or adjust the initiative agreed?', 'core', 'sustainment'),
    ],
  };
  const marketingContext = profile.department === 'marketing' || definition.category === 'Marketing & Customer';
  for (const dimension of definition.dimensions) {
    dimension.baseAction = dimension.action;
    dimension.baseKpi = dimension.kpi;
    dimension.baseEvidenceNeeded = dimension.evidenceNeeded;
    dimension.action = `${dimension.action} ${size.action}`;
    dimension.evidenceNeeded = `${dimension.evidenceNeeded} Context check: ${size.evidence}.`;
    const topic = marketingContext ? marketingTopic(dimension) : null;
    if (topic) {
      const questionId = `${definition.id}-${dimension.id}-industry-application`;
      dimension.questions.push(contextQuestion(questionId, industry[topic], 'industry', topic === 'lifecycle' ? 'sustainment' : topic === 'positioning' ? 'purpose-clarity' : 'capability'));
      moduleIds.industry.push(questionId);
      dimension.action += ` For ${industry.setting}, ${industry.action.charAt(0).toLowerCase()}${industry.action.slice(1)}`;
      dimension.kpi = `${dimension.kpi}; context measure: ${industry.kpi}`;
      dimension.evidenceNeeded += ` Relevant sector evidence: ${industry.evidence}.`;
    }
  }
  // Department and objective changes affect actions as well as added questions.
  const first = definition.dimensions[0];
  if (first) {
    first.action += ` Department focus: ${department.action} Objective focus: ${selectedObjective.action}`;
    first.kpi = `${first.kpi}; department measure: ${department.kpi}; objective measure: ${selectedObjective.kpi}`;
    first.evidenceNeeded += ` Department evidence: ${department.evidence}. Objective evidence: ${selectedObjective.evidence}.`;
    first.followUp = `${first.followUp} What evidence would change the plan for ${selectedObjective.label.toLowerCase()}?`;
  }
  definition.dimensions.push(contextDimension);
  definition.tailoring = {
    profile, signature: profileSignature(profile), label: profileLabel(profile),
    modules: Object.entries(moduleIds).map(([id, questionIds]) => ({ id, label: { core: 'CEAM+ core conditions', industry: industry.label, size: size.label, department: department.label, objective: selectedObjective.label }[id], questionIds })),
    marketingFocus: marketingContext ? [...industry.marketing] : [],
    scoringNote: 'Organization size changes wording and practical guidance, never score points. Scores remain provisional; compare administrations only when the assessment version and full personalization profile match.',
  };
  definition.evidence = [...new Set([...(definition.evidence || []), industry.evidence, size.evidence, department.evidence, selectedObjective.evidence])];
  definition.limitations = [...(definition.limitations || []), 'Industry and size contextualize questions and actions; employee count does not establish maturity. Profiles with different questions or context are not directly comparable.', 'Tailored prompts retain common CEAM+ constructs but require pilot testing and validation before high-stakes use.'];
  definition.timeMinutes = (definition.timeMinutes || 15) + Math.ceil((8 + moduleIds.industry.length - 1) / 3);
  definition.dimensions.forEach(dimension => dimension.questions.forEach(question => {
    question.metadata ||= classifyQuestion(question, { assessment: definition, dimension });
  }));
  return definition;
}
