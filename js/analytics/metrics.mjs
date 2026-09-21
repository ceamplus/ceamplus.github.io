/**
 * Pure marketing calculations. Inputs are finite numbers; percent fields contain
 * ratios (0.07 = 7%). Percent results contain percentage points (7, unit "%").
 * Money is in the user's consistent currency; no currency is inferred.
 * Definitions are also the UI's form and methodology registry. No network or DOM.
 * Formula references: OpenStax managerial accounting, chapter 3;
 * https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars
 * https://openstax.org/books/principles-economics-3e/pages/5-1-price-elasticity-of-demand-and-price-elasticity-of-supply
 * CAC, CLV and attribution conventions are intentionally named in each model.
 */

const registry = new Map();
export const metricDefinitions = [];
const fmt = (n) => new Intl.NumberFormat("en", { maximumFractionDigits: 6 }).format(n);
const number = (key, label, extra = {}) => ({ key, label, type: "number", min: 0, ...extra });
const percent = (key, label, extra = {}) => ({ key, label, type: "percent", min: 0, max: 1, ...extra });
const positive = (key, label, extra = {}) => number(key, label, { exclusiveMin: 0, ...extra });
const signed = (key, label, extra = {}) => number(key, label, { min: undefined, ...extra });
const samePeriod = "Use the same population, time period, unit and currency for comparable inputs.";
const defaultQuestions = ["Are the population and time periods comparable?", "Which missing evidence could change this interpretation?", "What small action could be tested and measured?"];

function add(definition, calculate) {
  const entry = {
    assumptions: samePeriod,
    limitations: "A calculation describes the supplied inputs; it does not establish the cause or guarantee a future outcome.",
    commonMistake: "Comparing inputs with different definitions, populations or time periods.",
    ...definition,
  };
  metricDefinitions.push(entry);
  registry.set(entry.id, { entry, calculate });
}

function ensure(condition, message) { if (!condition) throw new Error(message); }
function partOf(part, whole, label) { ensure(part <= whole, `${label} cannot exceed the defined total. Check units, populations and periods.`); }
function result(value, unit, calculation, interpretation, managerial, details = []) {
  return { result: value, unit, calculation, interpretation, managerial, details };
}
const detail = (label, value, unit = "") => ({ label, value, unit });
const product = (...values) => values.reduce((a, b) => a * b, 1);

/** Calculate a registered metric; throws a readable Error for missing/invalid data. */
export function calculateMetric(id, values) {
  const recipe = registry.get(id);
  ensure(recipe, `Unknown metric: ${id}. Choose a listed calculation.`);
  ensure(values && typeof values === "object" && !Array.isArray(values), "Enter the required input values.");
  const { entry, calculate } = recipe;
  const validated = {};
  for (const field of entry.fields) {
    const value = values[field.key];
    ensure(value !== undefined && value !== null && value !== "", `${field.label} is required.`);
    ensure(typeof value === "number" && Number.isFinite(value), `${field.label} must be a finite number. Resolve number or percentage formatting first.`);
    if (field.min !== undefined) ensure(value >= field.min, `${field.label} must be at least ${field.type === "percent" ? `${field.min * 100}%` : field.min}.`);
    if (field.max !== undefined) ensure(value <= field.max, `${field.label} must be at most ${field.type === "percent" ? `${field.max * 100}% (use a normalized ratio)` : field.max}.`);
    if (field.exclusiveMin !== undefined) ensure(value > field.exclusiveMin, `${field.label} must be greater than ${field.exclusiveMin}; division by zero is undefined.`);
    validated[field.key] = value;
  }
  const calculated = calculate(validated);
  ensure(Number.isFinite(calculated.result), "The result is outside the supported numeric range. Check the magnitude of the inputs.");
  for (const item of calculated.details || []) {
    ensure(typeof item.value !== "number" || Number.isFinite(item.value), "A calculation detail is outside the supported numeric range.");
  }
  return {
    id: entry.id, label: entry.label, category: entry.category, question: entry.question, why: entry.why,
    formula: entry.formula, assumptions: entry.assumptions, limitations: entry.limitations,
    excel: entry.excel, commonMistake: entry.commonMistake,
    questions: entry.questions || defaultQuestions, ...calculated,
  };
}

add({ id: "growth", label: "Projected market growth", category: "Market", question: "How much could the market grow?",
  fields: [number("market", "Current market size"), percent("growthRate", "Growth rate", { min: -1, max: undefined })],
  formula: "Growth amount = current market × growth rate; projected market = current market + growth amount",
  why: "A current market size and an assumed growth rate support a one-period projection.",
  assumptions: "The supplied rate applies to one stated period; no growth beyond that period is implied.",
  limitations: "This is a scenario, not a guaranteed forecast. Growth amount and projected total are different quantities.",
  excel: "With current market in A2 and growth rate in B2: =A2*B2 and =A2*(1+B2)",
  commonMistake: "Entering 7 instead of 0.07 in a normalized ratio field, or confusing the growth amount with the new total." }, (v) => {
  const amount = v.market * v.growthRate;
  return result(amount, "market units", `${fmt(v.market)} × ${fmt(v.growthRate)} = ${fmt(amount)}; ${fmt(v.market)} + ${fmt(amount)} = ${fmt(v.market + amount)}`,
    `The assumed ${fmt(v.growthRate * 100)}% change gives ${fmt(amount)} market units of growth and a projected total of ${fmt(v.market + amount)}.`,
    "Check the market definition and evidence for the assumed rate before planning capacity or acquisition spending.", [detail("Projected market size", v.market + amount, "market units"), detail("Growth rate", v.growthRate * 100, "%")]);
});

add({ id: "purchasers", label: "Estimated purchasers", category: "Market", question: "How many members of the market purchased?",
  fields: [number("market", "Defined target market"), percent("purchaseRate", "Purchased during the period")],
  formula: "Purchasers = defined market × purchase penetration", why: "The market population and its purchasing proportion give an estimated purchaser count.",
  assumptions: "The percentage means unique purchasers in this defined market and period, not transactions or sales share.",
  limitations: "A rounded survey percentage can yield a fractional estimate. Nonpurchase alone does not establish unmet demand.",
  excel: "With market in A2 and penetration in B2: =A2*B2", commonMistake: "Calling purchase penetration market share.",
  questions: ["Is the defined market reachable and relevant?", "What explains nonpurchase: awareness, need, access, price or competition?", "Does the percentage count unique purchasers?"] }, (v) =>
  result(v.market * v.purchaseRate, "purchasers", `${fmt(v.market)} × ${fmt(v.purchaseRate)} = ${fmt(v.market * v.purchaseRate)}`,
    `Approximately ${fmt(v.market * v.purchaseRate)} members of the defined market purchased during the period (${fmt(v.purchaseRate * 100)}%).`,
    "Investigate awareness, positioning, access and customer need before treating the remaining population as an acquisition opportunity.", [detail("Purchase penetration", v.purchaseRate * 100, "%")]));

add({ id: "growth_rate", label: "Observed growth rate", category: "Market", question: "How fast did the market or sales change?",
  fields: [positive("previous", "Previous value"), number("current", "Current value")], formula: "(Current − previous) / previous × 100",
  why: "Two comparable period totals allow a relative change calculation.", excel: "=(B2-A2)/A2 (format as Percentage)",
  commonMistake: "Dividing by the current value or calling a change between two rates a percentage-point change." }, (v) =>
  result((v.current - v.previous) / v.previous * 100, "%", `(${fmt(v.current)} − ${fmt(v.previous)}) / ${fmt(v.previous)} × 100 = ${fmt((v.current - v.previous) / v.previous * 100)}%`,
    `The comparable value ${v.current >= v.previous ? "increased" : "decreased"} by ${fmt(Math.abs((v.current - v.previous) / v.previous * 100))}%.`,
    "Compare periods of equal length and investigate seasonality, price and volume before attributing the change.", [detail("Absolute change", v.current - v.previous)]));

function rateMetric(id, label, category, question, top, bottom, why, managerial, extras = {}) {
  add({ id, label, category, question, fields: [number(top[0], top[1]), positive(bottom[0], bottom[1])],
    formula: `${top[1]} / ${bottom[1]} × 100`, why,
    excel: `With ${top[1]} in A2 and ${bottom[1]} in B2: =A2/B2 (format as Percentage)`, ...extras }, (v) => {
    partOf(v[top[0]], v[bottom[0]], top[1]);
    const n = v[top[0]] / v[bottom[0]] * 100;
    return result(n, "%", `${fmt(v[top[0]])} / ${fmt(v[bottom[0]])} × 100 = ${fmt(n)}%`, `${label} is ${fmt(n)}% for the defined population and period.`, managerial);
  });
}
rateMetric("penetration", "Purchase penetration", "Market", "What proportion of the defined market purchased?", ["purchasers", "Unique purchasers"], ["market", "Defined target market"], "Unique purchasers are a subset of the stated market population.", "Compare relevant segments and investigate barriers; nonpurchasers are not automatically reachable demand.", { commonMistake: "Using transactions rather than unique purchasers, or confusing penetration with sales-based market share." });
rateMetric("unit_share", "Unit market share", "Market", "What share of category units did the company sell?", ["companyUnits", "Company units sold"], ["marketUnits", "Total market units sold"], "Company and total category unit sales use a comparable unit and market definition.", "Share measures relative sales position; assess profitability and customer value separately.");
rateMetric("revenue_share", "Revenue market share", "Market", "What share of category revenue did the company earn?", ["companyRevenue", "Company revenue"], ["marketRevenue", "Total market revenue"], "Company revenue and total category revenue use the same market and accounting period.", "Premium prices can raise revenue share without an equivalent increase in unit share.");
rateMetric("conversion", "Conversion rate", "Customer", "What proportion of eligible leads or visitors converted?", ["conversions", "Conversions"], ["opportunities", "Eligible leads or visitors"], "The numerator counts successful outcomes within the denominator's defined eligible population.", "Inspect stage-specific friction and qualification before changing promotion spending.", { assumptions: "Use one conversion outcome per eligible person or session; this model bounds the rate at 100%." });
rateMetric("churn", "Customer churn rate", "Customer", "What proportion of starting customers were lost?", ["lost", "Customers lost from starting cohort"], ["beginning", "Customers at beginning"], "Lost customers are measured against the same starting cohort.", "Investigate reasons for departure and cohort differences; do not assume every customer should be retained.");
rateMetric("ctr", "Click-through rate (CTR)", "Campaign", "How often did an ad impression lead to a click?", ["clicks", "Clicks"], ["impressions", "Impressions"], "Clicks and impressions describe the same campaign and reporting window.", "A click is an intermediate response; evaluate downstream customer quality and cost.", { assumptions: "Clicks and impressions use matching platform definitions; this calculation assumes no more than one counted click per impression." });

add({ id: "retention", label: "Customer retention rate", category: "Customer", question: "What share of starting customers remained?",
  fields: [number("ending", "Customers at end"), number("newCustomers", "New customers acquired"), positive("beginning", "Customers at beginning")],
  formula: "(Customers at end − new customers) / customers at beginning × 100", why: "Removing newly acquired customers estimates the retained starting cohort.",
  assumptions: "The ending base and new-customer count are reconciled; new customers include those represented in the ending base. Reactivations and acquisition-period churn may require cohort-level treatment.",
  limitations: "This aggregate convention can misstate retention when acquisitions also churn or customer definitions change. Use an identified starting cohort when possible.",
  excel: "=(A2-B2)/C2 (format as Percentage)", commonMistake: "Counting newly acquired customers as retained customers." }, (v) => {
  const retained = v.ending - v.newCustomers;
  ensure(retained >= 0, "New customers cannot exceed ending customers under this retention definition. Reconcile the cohort first.");
  partOf(retained, v.beginning, "Retained starting customers");
  return result(retained / v.beginning * 100, "%", `(${fmt(v.ending)} − ${fmt(v.newCustomers)}) / ${fmt(v.beginning)} × 100 = ${fmt(retained / v.beginning * 100)}%`,
    `An estimated ${fmt(retained)} starting customers remained, a retention rate of ${fmt(retained / v.beginning * 100)}%.`, "Compare cohorts and service experiences before choosing a retention intervention.", [detail("Retained starting customers", retained, "customers")]);
});

function costMetric(id, label, question, top, bottom, unit, why, extras = {}) {
  add({ id, label, category: "Customer", question, fields: [number(top[0], top[1]), positive(bottom[0], bottom[1])],
    formula: `${top[1]} / ${bottom[1]}`, why, excel: "=A2/B2", ...extras }, (v) =>
    result(v[top[0]] / v[bottom[0]], unit, `${fmt(v[top[0]])} / ${fmt(v[bottom[0]])} = ${fmt(v[top[0]] / v[bottom[0]])}`,
      `${label} is ${fmt(v[top[0]] / v[bottom[0]])} ${unit} under the selected input definition.`,
      extras.managerial || "Compare the same cost scope across periods and segments, alongside customer quality and contribution."));
}
costMetric("avg_purchase", "Average purchase value", "How much revenue does each purchase generate on average?", ["revenue", "Revenue"], ["purchases", "Number of purchases"], "currency / purchase", "Revenue and transaction count measure the same purchase population.", { managerial: "Inspect the distribution and repeat behavior; an average can hide large customer or product differences." });
costMetric("cac", "Customer acquisition cost (CAC)", "What did it cost to acquire each new customer?", ["acquisitionCost", "Selected acquisition costs"], ["newCustomers", "New customers acquired"], "currency / customer", "A stated acquisition cost scope and acquired-customer count support an average acquisition cost.", {
  assumptions: "Select a cost scope before entering the total: marketing-only, sales-only, or marketing plus sales. Include personnel, tools and allocated overhead only if your chosen convention requires them; avoid double-counting. Match acquisition timing.",
  limitations: "Different cost scopes produce different CAC values. The result cannot reveal incrementality or retention quality.",
  commonMistake: "Comparing marketing-only CAC with fully loaded CAC or dividing by all existing customers."
});
costMetric("cpc", "Cost per click (CPC)", "How much did each advertising click cost?", ["spend", "Advertising spend"], ["clicks", "Clicks"], "currency / click", "Campaign spend and attributed clicks refer to the same campaign period.", { category: "Campaign" });
costMetric("cpl", "Cost per lead (CPL)", "How much did each lead cost?", ["spend", "Campaign spend"], ["leads", "Leads"], "currency / lead", "A defined lead count and its acquisition spend support a cost-per-lead calculation.", { category: "Campaign" });

add({ id: "clv", label: "Simple revenue CLV", category: "Customer", question: "How much revenue might a customer generate over their relationship?",
  fields: [number("averagePurchase", "Average purchase value"), number("frequency", "Purchases per period"), number("lifespan", "Expected lifespan in periods")],
  formula: "Average purchase value × purchases per period × customer lifespan", why: "Average purchase value, purchase frequency and expected duration form a simple revenue model.",
  assumptions: "Frequency and lifespan use the same period. Purchase value and frequency are assumed stable.",
  limitations: "Revenue CLV excludes product costs, acquisition costs, discounting and changing retention. CLV conventions vary.",
  excel: "=A2*B2*C2", commonMistake: "Comparing revenue CLV directly with contribution CLV or mixing monthly frequency with lifespan in years." }, (v) => {
  const n = product(v.averagePurchase, v.frequency, v.lifespan);
  return result(n, "currency / customer", `${fmt(v.averagePurchase)} × ${fmt(v.frequency)} × ${fmt(v.lifespan)} = ${fmt(n)}`, `Modeled lifetime revenue is ${fmt(n)} per customer, before costs and discounting.`, "Use a contribution-based model to examine acquisition economics and test whether retention assumptions are plausible.");
});
add({ id: "clv_margin", label: "Margin-based CLV", category: "Customer", question: "What customer contribution might remain over the expected lifespan?",
  fields: [number("periodRevenue", "Revenue per customer per period"), percent("marginRate", "Gross or contribution margin rate", { min: undefined }), number("lifespan", "Expected lifespan in periods")],
  formula: "Revenue per customer per period × margin rate × customer lifespan", why: "Revenue, an explicit margin basis and expected duration estimate lifetime gross profit or contribution.",
  assumptions: "State whether the margin is gross or contribution. Duration matches the revenue period and rates remain stable.",
  limitations: "This simplified model excludes discounting, changing survival probabilities, acquisition costs and any costs excluded by the chosen margin.",
  excel: "=A2*B2*C2", commonMistake: "Treating a margin-based estimate as fully net lifetime profit." }, (v) => {
  const n = product(v.periodRevenue, v.marginRate, v.lifespan);
  return result(n, "currency / customer", `${fmt(v.periodRevenue)} × ${fmt(v.marginRate)} × ${fmt(v.lifespan)} = ${fmt(n)}`, `Modeled lifetime gross profit or contribution is ${fmt(n)} per customer under the selected margin definition.`, "Reconcile this margin basis with CAC and service costs before assessing customer economics.");
});
costMetric("clv_cac", "CLV:CAC ratio", "How does lifetime customer value compare with acquisition cost?", ["clv", "Margin-based CLV"], ["cac", "Customer acquisition cost"], "×", "A compatible lifetime value estimate and acquisition cost give an economic planning ratio.", {
  fields: [signed("clv", "Margin-based CLV"), positive("cac", "Customer acquisition cost")],
  assumptions: "Use margin-based CLV and an explicit CAC cost scope for a comparable cohort.", limitations: "There is no universal good ratio. Cash timing, uncertainty, retention, margin and growth stage matter.",
  managerial: "Compare against your cash needs and cohort economics; a larger ratio alone does not prove sustainable growth."
});
costMetric("cac_payback", "CAC payback period", "How long might it take to recover customer acquisition cost?", ["cac", "Customer acquisition cost"], ["monthlyContribution", "Monthly contribution per customer"], "months", "Stable monthly contribution can be compared with the one-time acquisition cost.", { assumptions: "Contribution is positive and stable; ignore discounting and churn in this simple model.", limitations: "If customers leave earlier or service costs rise, actual recovery may take longer or never occur.", managerial: "Compare the recovery period with retention and available working capital." });

function returnMetric(id, label, category, question, top, investment, extras = {}) {
  add({ id, label, category, question,
    fields: [signed(top[0], top[1]), positive(investment[0], investment[1])],
    formula: `(${top[1]} − ${investment[1]}) / ${investment[1]} × 100`,
    why: "An explicitly defined benefit before the investment cost can be compared with that investment.",
    excel: "=(A2-B2)/B2 (format as Percentage)",
    commonMistake: "Subtracting the investment twice when the entered return is already net of that cost.", ...extras }, (v) => {
    const net = v[top[0]] - v[investment[0]], n = net / v[investment[0]] * 100;
    return result(n, "%", `(${fmt(v[top[0]])} − ${fmt(v[investment[0]])}) / ${fmt(v[investment[0]])} × 100 = ${fmt(n)}%`,
      `${label} is ${fmt(n)}% using ${top[1].toLowerCase()} as the benefit before the stated investment.`,
      extras.managerial || "Test attribution against a baseline or control group and include relevant cost and timing assumptions before reallocating spending.", [detail("Benefit less investment", net, "currency")]);
  });
}
returnMetric("romi_revenue", "Revenue-based ROMI", "Campaign", "How does incremental revenue compare with marketing cost?", ["incrementalRevenue", "Incremental revenue attributable to marketing"], ["marketingCost", "Marketing cost"], {
  assumptions: "The input is incremental revenue above a defensible baseline, before marketing cost; use an experiment or explicit attribution assumption.",
  limitations: "Revenue-based ROMI excludes product and service costs and is not a profit return. Observed sales after marketing do not establish causation."
});
returnMetric("romi_contribution", "Contribution-based ROMI", "Campaign", "Does incremental contribution cover the marketing investment?", ["incrementalContribution", "Incremental profit or contribution before marketing cost"], ["marketingCost", "Marketing cost"], {
  assumptions: "Incremental contribution already subtracts relevant nonmarketing costs but does not subtract this marketing cost. State the attribution baseline.",
  limitations: "The result depends on attribution and the chosen cost scope. Do not enter profit already net of marketing, which would subtract marketing twice."
});
returnMetric("roi", "Return on investment (ROI)", "Financial", "How does the total return compare with the investment?", ["totalReturn", "Total benefit or proceeds before investment cost"], ["investment", "Initial investment"], {
  assumptions: "Return means the total benefit or proceeds before subtracting the stated investment; both are measured on a compatible basis.",
  limitations: "Simple ROI ignores cash timing, risk and time horizon. It is distinct from advertising revenue/spend (ROAS) and marketing-specific incremental return (ROMI)."
});
costMetric("roas", "Return on ad spend (ROAS)", "How much attributed revenue did each unit of ad spend generate?", ["attributedRevenue", "Revenue attributed to advertising"], ["adSpend", "Advertising spend"], "×", "Attributed advertising revenue divided by ad spend expresses a revenue multiple.", {
  category: "Campaign", assumptions: "Use a stated attribution window and method for the same campaigns.", limitations: "ROAS is revenue divided by spend, not profit and not proof of incremental sales.",
  managerial: "Combine the revenue multiple with product margins and incrementality evidence; high ROAS can coexist with losses."
});

function profitMetric(id, label, question, costKey, costLabel, margin = false, operating = false) {
  const fields = [number("revenue", "Revenue"), number(costKey, costLabel)];
  if (operating) fields.push(number("fixedCosts", "Fixed operating costs"));
  if (margin) fields[0] = positive("revenue", "Revenue");
  const costFormula = operating ? `${costLabel} − fixed operating costs` : costLabel;
  add({ id, label, category: "Financial", question, fields,
    formula: margin ? `(Revenue − ${costFormula}) / revenue × 100` : `Revenue − ${costFormula}`,
    why: "Revenue and the explicitly defined cost scope show the amount remaining at this level of the income model.",
    assumptions: operating ? "Variable and fixed costs are nonoverlapping operating costs for the same period; exclude financing costs and taxes." : `${costLabel} and revenue use the same period and accounting basis.`,
    limitations: operating ? "This cost-volume model is not a full accounting statement. Allocations, taxes, financing and exceptional items may change net income." : "Gross profit uses COGS; contribution uses variable costs. Neither alone equals net profit.",
    excel: operating ? (margin ? "=(A2-B2-C2)/A2 (format as Percentage)" : "=A2-B2-C2") : (margin ? "=(A2-B2)/A2 (format as Percentage)" : "=A2-B2"),
    commonMistake: "Treating revenue, gross profit, contribution and operating profit as interchangeable." }, (v) => {
    const amount = v.revenue - v[costKey] - (operating ? v.fixedCosts : 0), n = margin ? amount / v.revenue * 100 : amount;
    const expression = `${fmt(v.revenue)} − ${fmt(v[costKey])}${operating ? ` − ${fmt(v.fixedCosts)}` : ""}`;
    return result(n, margin ? "%" : "currency", margin ? `(${expression}) / ${fmt(v.revenue)} × 100 = ${fmt(n)}%` : `${expression} = ${fmt(n)}`,
      `${label} is ${fmt(n)}${margin ? "%" : " in the stated currency"}; ${amount < 0 ? "the included costs exceed revenue" : "this is the amount remaining after the included costs"}.`,
      "Compare cost definitions and segment mix. Identify cost or value drivers before reducing service quality or changing price.", margin ? [detail("Profit / contribution amount", amount, "currency")] : []);
  });
}
profitMetric("gross_profit", "Gross profit", "What remains after cost of goods sold?", "cogs", "Cost of goods sold");
profitMetric("gross_margin", "Gross margin percentage", "What proportion of revenue remains after COGS?", "cogs", "Cost of goods sold", true);
profitMetric("contribution", "Contribution", "What remains to cover fixed costs and profit?", "variableCosts", "Variable costs");
profitMetric("contribution_margin", "Contribution margin percentage", "How much of each revenue unit contributes toward fixed costs?", "variableCosts", "Variable costs", true);
profitMetric("operating_profit", "Operating profit", "What remains after variable and fixed operating costs?", "variableCosts", "Variable costs", false, true);
profitMetric("operating_margin", "Operating margin percentage", "What proportion of revenue remains as operating profit?", "variableCosts", "Variable costs", true, true);

add({ id: "margin", label: "Unit margin", category: "Pricing", question: "What share of the selling price remains after unit variable cost?",
  fields: [positive("price", "Price per unit"), number("unitCost", "Variable cost per unit")], formula: "(Price − variable cost) / price × 100",
  why: "Price and unit variable cost determine contribution per unit and its share of price.", excel: "=(A2-B2)/A2 (format as Percentage)", commonMistake: "Confusing margin (price denominator) with markup (cost denominator)." }, (v) =>
  result((v.price - v.unitCost) / v.price * 100, "%", `(${fmt(v.price)} − ${fmt(v.unitCost)}) / ${fmt(v.price)} × 100 = ${fmt((v.price - v.unitCost) / v.price * 100)}%`,
    `Each unit contributes ${fmt(v.price - v.unitCost)}, or ${fmt((v.price - v.unitCost) / v.price * 100)}% of its selling price, before fixed costs.`, "Check willingness to pay, competitive positioning and fixed-cost coverage before setting a price.", [detail("Contribution per unit", v.price - v.unitCost, "currency / unit")]));
add({ id: "markup", label: "Markup percentage", category: "Pricing", question: "How much is added above unit cost?",
  fields: [number("price", "Price per unit"), positive("unitCost", "Cost per unit")], formula: "(Price − cost) / cost × 100",
  why: "Markup expresses the price uplift relative to cost, rather than relative to the selling price.", excel: "=(A2-B2)/B2 (format as Percentage)", commonMistake: "A 50% markup is not a 50% margin." }, (v) =>
  result((v.price - v.unitCost) / v.unitCost * 100, "%", `(${fmt(v.price)} − ${fmt(v.unitCost)}) / ${fmt(v.unitCost)} × 100 = ${fmt((v.price - v.unitCost) / v.unitCost * 100)}%`,
    `The price is ${fmt((v.price - v.unitCost) / v.unitCost * 100)}% above the supplied unit cost.`, "Cost-plus pricing should be checked against customer value and competitive alternatives."));

add({ id: "breakeven", label: "Break-even units", category: "Pricing", question: "How much must be sold to cover fixed costs?",
  fields: [number("fixedCosts", "Fixed costs"), positive("price", "Price per unit"), number("unitCost", "Variable cost per unit")],
  formula: "Fixed costs / (price − variable cost per unit)", why: "Positive contribution per unit can cover the fixed cost of a single product or stable sales mix.",
  assumptions: "Price, unit variable cost and fixed costs remain stable within the relevant range; units produced and sold are treated consistently.",
  limitations: "Capacity limits, changing costs, mixed products and demand uncertainty can invalidate this simple model.",
  excel: "=A2/(B2-C2); =ROUNDUP(A2/(B2-C2),0) for indivisible whole units", commonMistake: "Reporting a feasible break-even volume when unit contribution is zero or negative." }, (v) => {
  ensure(v.price > v.unitCost, "Break-even requires price greater than variable cost per unit; there is no positive contribution to cover fixed costs.");
  const units = v.fixedCosts / (v.price - v.unitCost);
  return result(units, "units", `${fmt(v.fixedCosts)} / (${fmt(v.price)} − ${fmt(v.unitCost)}) = ${fmt(units)}`,
    `The mathematical break-even volume is ${fmt(units)} units. If units are indivisible, at least ${fmt(Math.ceil(units))} units are needed.`, "Compare break-even with realistic demand, capacity and customer value before committing fixed expenditure.",
    [detail("Whole units required", Math.ceil(units), "units"), detail("Break-even revenue (continuous units)", units * v.price, "currency"), detail("Contribution per unit", v.price - v.unitCost, "currency / unit")]);
});

add({ id: "price_scenario", label: "Price and volume scenario", category: "Pricing", question: "How could a price change affect revenue and operating profit?",
  fields: [positive("currentPrice", "Current price"), number("proposedPrice", "Proposed price"), number("unitCost", "Variable cost per unit"), number("volume", "Current units sold"), percent("volumeChange", "Assumed volume change", { min: -1, max: undefined }), number("fixedCosts", "Fixed costs")],
  formula: "New units = current units × (1 + volume change); profit = (price − unit variable cost) × units − fixed costs",
  why: "Explicit price and volume assumptions permit an internally consistent before/after comparison.",
  assumptions: "Unit variable cost and fixed costs remain unchanged; the volume change is supplied by the user, not estimated from elasticity.",
  limitations: "A scenario is not a demand forecast. Competition, service quality, capacity and customer trust may change the outcome.",
  excel: "New units =D2*(1+E2); current profit =(A2-C2)*D2-F2; proposed profit =(B2-C2)*D2*(1+E2)-F2", commonMistake: "Assuming volume stays constant after a price change without testing that assumption." }, (v) => {
  const newUnits = v.volume * (1 + v.volumeChange), oldContribution = (v.currentPrice - v.unitCost) * v.volume, newContribution = (v.proposedPrice - v.unitCost) * newUnits;
  return result(newContribution - oldContribution, "currency change", `${fmt(newContribution - v.fixedCosts)} proposed profit − ${fmt(oldContribution - v.fixedCosts)} current profit = ${fmt(newContribution - oldContribution)}`,
    `Under the supplied assumptions, operating profit changes by ${fmt(newContribution - oldContribution)}.`, "Test the most sensitive volume assumption, including a conservative case, before changing prices.",
    [detail("Current revenue", v.currentPrice * v.volume, "currency"), detail("Proposed revenue", v.proposedPrice * newUnits, "currency"), detail("Proposed units", newUnits, "units"), detail("Current contribution", oldContribution, "currency"), detail("Proposed contribution", newContribution, "currency"), detail("Current operating profit", oldContribution - v.fixedCosts, "currency"), detail("Proposed operating profit", newContribution - v.fixedCosts, "currency")]);
});
add({ id: "elasticity", label: "Midpoint price elasticity", category: "Pricing", question: "How responsive was observed quantity to a price change?",
  fields: [positive("oldPrice", "First price"), positive("newPrice", "Second price"), number("oldQuantity", "Quantity at first price"), number("newQuantity", "Quantity at second price")],
  formula: "[(Q₂ − Q₁) / ((Q₁ + Q₂)/2)] / [(P₂ − P₁) / ((P₁ + P₂)/2)]",
  why: "Two matched price/quantity observations permit an exploratory arc elasticity using midpoint bases.",
  assumptions: "Other demand drivers would need to be controlled to interpret this as a causal price response.",
  limitations: "Two observations alone do not establish a demand curve. Seasonality, promotions, competition and availability can confound the relationship.",
  excel: "=((D2-C2)/AVERAGE(C2:D2))/((B2-A2)/AVERAGE(A2:B2))", commonMistake: "Inferring causal demand elasticity from two unmatched observations." }, (v) => {
  ensure(v.oldPrice !== v.newPrice, "The two prices must differ to calculate price elasticity.");
  ensure(v.oldQuantity + v.newQuantity > 0, "At least one observed quantity must be positive.");
  const q = (v.newQuantity - v.oldQuantity) / ((v.oldQuantity + v.newQuantity) / 2), p = (v.newPrice - v.oldPrice) / ((v.oldPrice + v.newPrice) / 2), n = q / p;
  const type = Math.abs(Math.abs(n) - 1) < 1e-8 ? "unit elasticity" : Math.abs(n) > 1 ? "elastic responsiveness" : "inelastic responsiveness";
  return result(n, "elasticity", `${fmt(q)} / ${fmt(p)} = ${fmt(n)}`, `The signed midpoint estimate is ${fmt(n)}; its magnitude indicates ${type}. ${n > 0 ? "Price and quantity moved together, which warrants investigation before a demand interpretation." : "This describes the observations and does not establish causation."}`,
    "Seek experimental or appropriate historical evidence before using this estimate to project a price intervention.", [detail("Midpoint quantity change", q * 100, "%"), detail("Midpoint price change", p * 100, "%"), detail("Absolute elasticity", Math.abs(n))]);
});

add({ id: "budget_variance", label: "Budget variance", category: "Financial", question: "How did actual spending compare with the budget?",
  fields: [positive("budget", "Budgeted spending"), number("actual", "Actual spending")], formula: "Actual − budget; variance percentage = (actual − budget) / budget × 100",
  why: "Planned and actual spending for the same scope reveal an absolute and relative variance.",
  assumptions: "A positive variance means spending above budget. Whether it is favorable depends on the outcomes delivered.",
  excel: "=B2-A2; =(B2-A2)/A2 (format as Percentage)", commonMistake: "Calling all underspending favorable without examining missed activity or performance." }, (v) =>
  result(v.actual - v.budget, "currency", `${fmt(v.actual)} − ${fmt(v.budget)} = ${fmt(v.actual - v.budget)}`, `Actual spend was ${fmt(Math.abs(v.actual - v.budget))} ${v.actual >= v.budget ? "above" : "below"} budget (${fmt((v.actual - v.budget) / v.budget * 100)}%).`,
    "Compare variance with delivery, timing and outcomes before calling it favorable or unfavorable.", [detail("Variance percentage", (v.actual - v.budget) / v.budget * 100, "%")]));
costMetric("payback", "Simple investment payback", "How long could it take to recover the investment?", ["investment", "Initial investment"], ["periodBenefit", "Expected net cash benefit per period"], "periods", "A positive constant cash benefit can recover an initial outlay over time.", {
  category: "Financial", assumptions: "Net cash benefits arrive at a constant rate; choose a consistent monthly, quarterly or annual period.",
  limitations: "Simple payback ignores discounting and benefits after recovery. Revenue is not a cash benefit.", managerial: "Compare the recovery period with liquidity needs and the reliability of expected cash benefits."
});
add({ id: "npv", label: "Net present value (3 periods)", category: "Advanced financial", question: "What are three future net cash flows worth after the initial investment?",
  fields: [number("investment", "Initial investment at time 0"), percent("discountRate", "Discount rate per period", { min: undefined, exclusiveMin: -1, max: undefined }), signed("cashFlow1", "Net cash flow at end of period 1"), signed("cashFlow2", "Net cash flow at end of period 2"), signed("cashFlow3", "Net cash flow at end of period 3")],
  formula: "NPV = CF₁/(1+r) + CF₂/(1+r)² + CF₃/(1+r)³ − initial investment",
  why: "Dated future cash flows can be discounted to a comparable present-value basis.",
  assumptions: "Cash flows occur at the end of each equal period. The supplied discount rate matches the period and chosen risk and inflation basis.",
  limitations: "This three-period educational model includes no unstated terminal value. The result is sensitive to cash-flow and discount-rate assumptions.",
  excel: "=NPV(B2,C2:E2)-A2", commonMistake: "Including the time-0 investment inside Excel NPV, or discounting revenue instead of net cash flow." }, (v) => {
  const pv = [v.cashFlow1, v.cashFlow2, v.cashFlow3].map((cf, i) => cf / (1 + v.discountRate) ** (i + 1)), n = pv.reduce((s, x) => s + x, 0) - v.investment;
  return result(n, "currency", `${fmt(v.cashFlow1)}/(1+${fmt(v.discountRate)}) + ${fmt(v.cashFlow2)}/(1+${fmt(v.discountRate)})² + ${fmt(v.cashFlow3)}/(1+${fmt(v.discountRate)})³ − ${fmt(v.investment)} = ${fmt(n)}`,
    `The present value of these three cash flows less the initial investment is ${fmt(n)}.`, "Compare alternative uses of funds and test the cash-flow assumptions. Positive modeled NPV alone does not guarantee a good decision.", pv.map((value, i) => detail(`Present value, period ${i + 1}`, value, "currency")));
});
add({ id: "operating_leverage", label: "Degree of operating leverage", category: "Advanced financial", question: "How sensitive might operating profit be to a small change in sales?",
  fields: [number("revenue", "Revenue"), number("variableCosts", "Variable costs"), number("fixedCosts", "Fixed costs")],
  formula: "(Revenue − variable costs) / (revenue − variable costs − fixed costs)",
  why: "Contribution and positive operating profit describe local profit sensitivity in a fixed/variable cost model.",
  assumptions: "Price, sales mix, variable-cost ratio and fixed costs remain stable for a small sales change.",
  limitations: "The ratio becomes unstable near break-even. This calculator requires positive operating profit; it is not a general sales forecast.",
  excel: "=(A2-B2)/(A2-B2-C2)", commonMistake: "Applying the local sensitivity estimate to a large change that alters capacity or costs." }, (v) => {
  const contribution = v.revenue - v.variableCosts, profit = contribution - v.fixedCosts;
  ensure(profit > 0, "Operating leverage requires positive operating profit in this educational model; review loss or break-even conditions separately.");
  const n = contribution / profit;
  return result(n, "×", `(${fmt(v.revenue)} − ${fmt(v.variableCosts)}) / (${fmt(v.revenue)} − ${fmt(v.variableCosts)} − ${fmt(v.fixedCosts)}) = ${fmt(n)}`,
    `Under fixed cost-volume assumptions, a small 1% sales change corresponds to approximately a ${fmt(n)}% operating-profit change.`, "Consider both upside and downside sensitivity before increasing fixed commitments.");
});
add({ id: "nps", label: "Net Promoter Score (NPS)", category: "Customer", question: "How does the promoter share compare with the detractor share?",
  fields: [percent("promoters", "Promoter proportion (ratings 9–10)"), percent("detractors", "Detractor proportion (ratings 0–6)")],
  formula: "Promoter percentage − detractor percentage", why: "The standard 0–10 recommendation item divides valid respondents into promoters, passives and detractors.",
  assumptions: "Both proportions use all valid responses to the same 0–10 item; 7–8 ratings are passives.",
  limitations: "NPS ranges from −100 to 100 points. Sampling, response bias and context matter; it is not a complete customer-experience measure.",
  excel: "=(A2-B2)*100", commonMistake: "Excluding passives from the denominator or reporting the score as a probability." }, (v) => {
  ensure(v.promoters + v.detractors <= 1 + Number.EPSILON, "Promoters and detractors cannot together exceed 100% of valid respondents.");
  return result((v.promoters - v.detractors) * 100, "points", `${fmt(v.promoters * 100)} − ${fmt(v.detractors * 100)} = ${fmt((v.promoters - v.detractors) * 100)}`,
    `The NPS is ${fmt((v.promoters - v.detractors) * 100)} points for these respondents.`, "Examine sample representativeness, comments and behavior alongside the score.");
});
