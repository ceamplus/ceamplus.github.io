import { classifyQuestion } from './ceam-metadata.mjs';
const scale = ['Not at all','Rarely / Very limited','Somewhat / Developing','Usually / Strong','Consistently / Highly developed'];
const sections = [
  ['strategy','Strategic Marketing — Big M',`Our marketing strategy supports the long-term goals of the organization.
Marketing is considered when major business decisions are made.
We understand how changes in the market could affect our future.
We look for opportunities to shape our market rather than only reacting to competitors.
We invest in marketing with long-term organizational performance in mind.`, 'Review one strategic assumption using customer evidence before the next budget decision.', 'Strategic decisions with documented market evidence'],
  ['customers','Customer & Market Understanding',`We clearly understand who our most important customers are.
We understand why customers choose us instead of alternatives.
We regularly collect information about customer needs and preferences.
We recognize that different customer groups may have different needs.
We use customer information when making marketing decisions.`, 'Interview recent buyers and non-buyers about one purchase decision.', 'Customer decisions explained by dated interviews and behavioral records'],
  ['environment','External Environment',`We regularly monitor competitors.
We consider economic conditions when making marketing decisions.
We pay attention to social and cultural changes that could affect customers.
We monitor technological changes that could affect our market.
We consider laws, regulations, and political changes that could affect the organization.`, 'Check one external assumption against a dated source and identify its context-dependent impact.', 'Material market assumptions reviewed with dated evidence'],
  ['value','Value Proposition & Differentiation',`Customers can easily understand what makes our organization different.
Our products or services solve a clearly identified customer problem or need.
Our pricing reflects the value customers receive.
Our brand communicates a consistent message.
We can clearly explain why a customer should choose us over a competitor.`, 'Test whether target customers can describe the claimed difference and its value.', 'Target customers who recognize and value the intended difference'],
  ['execution','Marketing Execution — little m',`Our promotional activities support our overall marketing strategy.
We use marketing channels that match how our customers prefer to communicate and shop.
Our pricing, promotion, product/service, and distribution decisions work together.
Marketing responsibilities are clearly assigned.
Marketing plans are actually implemented rather than remaining only as ideas.`, 'Assign one campaign owner and reconcile product, price, channel and message decisions.', 'Agreed campaign milestones completed and reviewed'],
  ['relationships','Customer Relationships',`We maintain useful information about our customers.
We make an intentional effort to retain existing customers.
We identify our most valuable or profitable customer relationships.
We use customer feedback to improve products, services, or experiences.
We communicate with customers in ways that strengthen long-term relationships.`, 'Review one customer cohort for repeat purchasing, service issues and cost to serve.', 'Cohort retention and contribution after service costs'],
  ['research','Marketing Information & Research',`We use reliable information rather than assumptions when making important marketing decisions.
We clearly define the problem before conducting research.
We use internal information such as sales, customer, and transaction data.
We use external information such as competitor, industry, economic, or market data.
We evaluate whether the information we collect is accurate and useful.`, 'Write a decision-specific research question and audit the sources used to answer it.', 'Priority decisions supported by relevant, current and credible sources'],
  ['performance','Analytics & Performance',`We have clearly defined marketing goals.
We track measures that show whether marketing is working.
We can connect marketing activities to business outcomes.
We evaluate the return on marketing investments when appropriate.
We consider long-term outcomes such as customer loyalty and brand equity, not only short-term sales.`, 'Pair a short-term campaign measure with a long-term cohort or brand measure.', 'Incremental contribution alongside retention and customer value'],
];
export const marketingAssessment = {
  id:'marketing-assessment',version:'1.0',title:'CEAM+ Marketing Assessment',category:'Marketing & Customer',fixedQuestions:true,scoringModel:'marketing-capability',
  purpose:'The CEAM+ Marketing Assessment evaluates how well an organization understands its market, customers, competitive environment, marketing strategy, execution, and performance. The goal is not simply to measure how much marketing a business does, but whether its marketing activities support sound business decisions and long-term growth.',
  audience:'Small businesses, restaurants, retailers, contractors, nonprofits, professional services and larger organizations.',
  evidence:['Dated customer research','Segment and competitor records','Campaign, retention and financial measures'],
  output:'A self-reported capability profile, construct-level evidence review and measurable follow-up actions.',timeMinutes:18,retakeDays:90,overallLabel:'Marketing Capability',contextOptions:['Organization','Business unit','Marketing team','Campaign or initiative'],
  limitations:['The 40 questions are author-supplied self-report screening items, not a validated MARKOR or brand-equity scale.','Capability ratings are not observed customer outcomes or proof of competitive advantage.','Equal weights and maturity bands are provisional planning conventions. Evidence sufficiency and measured outcomes remain separate.'],
  dimensions:sections.map(([id,title,text,action,kpi],index)=>({id,title,weight:1,importance:2,risk:3,action,kpi,why:'This capability helps connect market knowledge with a defensible organizational decision.',evidenceNeeded:'Dated records, customer observations and external research relevant to this section',followUp:'Reassess after one relevant marketing cycle or within 90 days, using comparable respondents and periods.',tools:[{label:'Marketing evidence and analysis',href:'analytics-lab.html'}],surveys:[{label:'Work / Business survey: discuss reported conditions and context',href:'surveys.html?context=business'}],questions:text.split('\n').map((text,i)=>({id:`marketing-assessment-${id}-${i+1}`,number:index*5+i+1,text,type:'choice',weight:1,allowNA:false,options:scale.map((label,i)=>({value:String(i+1),label:`${i+1} – ${label}`,score:i*25}))}))})),
};
for(const dimension of marketingAssessment.dimensions) for(const question of dimension.questions) question.metadata=classifyQuestion(question,{assessment:marketingAssessment,dimension});
