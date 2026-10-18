import { measurementSources } from './measurement-dictionary.mjs';
export const evidenceClasses=['Observed Evidence','Supported Inference','Proposed Application','Unknown'];
export const journeyStages=['Awareness','Consideration','Purchase','Experience','Loyalty / Retention','Advocacy'];
export const stressScenarios=['Customers reject automated interactions','Generated content causes reputational harm','Regulation changes','Data becomes unavailable','Model performance declines','Costs increase','Competitors adopt identical technology','Customers value human interaction more highly','Unexpected cultural or market event'];
export const aiApplications=['Segmentation','Targeting','Positioning','Personas','Survey development','Customer research','Personalization','Content development','Campaign optimization','Pricing insight','Customer service','Forecasting','Large-scale data analysis','Pattern recognition'];
const sections=[
 ['strategic-fit','Strategic Fit','Appropriateness of the application for a defined problem, including a credible non-AI alternative.','nist',[
 'A specific customer or organizational problem and a measurable objective are documented.',
 'The proposed application has been compared with a simpler non-AI alternative using relevant evidence.',
 'The expected value, competitive context and conditions under which AI is unnecessary are explicit.']],
 ['marketing-value','Marketing Value','Customer and organizational value attributable to an application, distinct from activity volume or production efficiency.','capabilities',[
 'The application is linked to a specific marketing activity and a customer need.',
 'Time or cost savings are measured separately from customer and marketing effectiveness.',
 'Behavioral, financial and longer-term outcomes are tested against an appropriate baseline.']],
 ['allocation','Human–AI Allocation','A reasoned division of tasks based on capability, context and consequences.','nist',[
 'Tasks are allocated using observed capability and error consequences rather than automation potential alone.',
 'Human judgment, experience, cultural understanding and relationship contributions are explicitly considered.',
 'AI outputs can be reviewed, corrected and escalated by a person with authority and adequate time.']],
 ['evidence','Evidence & Measurement','Traceable evidence that separates direct observations, interpretations, proposals and unknowns.','nist',[
 'Benefit claims identify source, period, population and an appropriate outcome measure.',
 'Measurement limitations, alternative explanations and conflicting findings are documented.',
 'Longitudinal outcomes are assessed separately from activity and engagement counts.']],
 ['consumer-response','Consumer Response','Evidence about differentiated customer experiences, preferences, trust and relationship outcomes.','value',[
 'Customer research examines segment, cultural, accessibility and technology-familiarity differences without stereotypes.',
 'Customer benefit and meaningful interaction are assessed separately from interaction volume.',
 'Human interaction preferences, consent, trust and unintended friction are investigated across the journey.']],
 ['ethics','Ethics & Governance','Identified risks with accountable owners, safeguards and affected stakeholder perspectives.','nist',[
 'Privacy, consent, bias, transparency, manipulation and responsible data use have named owners and safeguards.',
 'Developers, data providers, managers, marketers and other responsible parties have explicit duties.',
 'People affected by errors have meaningful oversight, human override and a route to challenge outcomes.']],
 ['adaptation','Adaptation & Sustainment','Monitoring and ability to revise or discontinue an application as conditions change.','nist',[
 'Customer, employee and model feedback inform regular reviews of usefulness and harm.',
 'Dependencies, changing costs, model limits and unexpected events have tested fallback options.',
 'A named person can modify or discontinue AI when it no longer produces acceptable value.']],
 ['human-necessity','Human Necessity','Task-specific value of human participation and the consequences of removing it.','nist',[
 'For each major activity we distinguish whether AI can perform it from whether it should perform the whole task.',
 'We identify the human capabilities that could be lost and who would be affected.',
 'Accountability, error response and meaningful human participation match the consequences of the task.']],
];
export const aiUseDefinition={id:'ai-adoption',version:'2.0-analysis',title:'CEAM+ AI Use & Adoption Analysis',category:'Data & Technology',overallEnabled:false,overallLabel:null,retakeDays:90,contextOptions:['Existing AI use','Business case','Proposed strategy'],limitations:['Exploratory CEAM+ diagnostics; these are not empirically validated scales.','Local rules organize supplied evidence; no AI model, external verification or causal inference is performed.'],dimensions:sections.map(([id,title,definition,basis,items])=>({id,title,weight:1,importance:3,risk:3,questions:items.map((text,i)=>({id:`ai-use-${id}-${i+1}`,text,type:'maturity',weight:1,allowNA:false})),measurement:{id,name:title,definition,basis,indicators:items,question:items.join(' '),metric:'Dimension mean of answered 1–5 practice ratings, response coverage and separate categorical evidence confidence.',why:'Application-level conditions require separate scrutiny; more automation does not itself establish greater value.',variableTypes:['self-reported practice','documented evidence','exploratory inference'],scale:'1 Not established; 2 Limited; 3 Developing; 4 Usually supported; 5 Consistently supported; Unknown is excluded.',scoring:'Equal item weights within each dimension; no overall AI score. Missing items remain visible.',interpretation:'Ratings describe claimed practices. Evidence confidence and outcome measures are separate; no score certifies appropriate use.',validationStatus:'CEAM+ proposed construct / exploratory diagnostic. Framework-informed original items; not a reproduced validated measure.',limitations:'Single-informant reports, uncertain attribution and selection effects can distort inference. Human Necessity is a proposed CEAM+ construct, not an established psychometric scale.',source:measurementSources[basis]}}))};
export function newAIAnalysis(){return {aiAnalysis:true,context:'Existing AI use',initiative:'',answers:{},evidence:{},actionPlan:[],caseInfo:{company:'',industry:'',problem:'',application:'',target:'',objective:'',humanRole:'',risks:'',questions:'',text:'',source:''},baseline:{text:'',locked:false,skipped:false,capturedAt:null},claims:[],tasks:[],risks:[],segments:[],journey:journeyStages.map(stage=>({stage})),mix:['Product','Price','Place','Promotion','People','Process','Physical evidence'].map(stage=>({stage})),stress:stressScenarios.map(scenario=>({scenario})),extracted:[]};}
export const aiRowTemplates={claims:{claim:'',metric:'',metricType:'unknown',value:'',expected:'',classification:'Unknown',sources:'',quality:'limited',objective:false,contradiction:false},tasks:{activity:'',aiContribution:'',humanContribution:'',can:'Unknown',should:'Unknown',lost:'',matters:'',affected:'',oversight:'',failure:'',accountable:'',allocation:'Unknown',classification:'Unknown',sources:''},risks:{risk:'',stakeholder:'',consequence:'',safeguard:'',recommended:'',owner:'',level:'Organization',classification:'Unknown',sources:''},segments:{segment:'',age:'',familiarity:'',culture:'',accessibility:'',humanPreference:'',trust:'',finding:'',classification:'Unknown',sources:''}};
