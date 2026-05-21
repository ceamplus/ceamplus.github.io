const header = document.querySelector("[data-header]");
const contactForm = document.querySelector("[data-contact-form]");
const statusMessage = document.querySelector("[data-form-status]");
const organizationSelect = document.querySelector("[data-organization-select]");
const startAssessmentButton = document.querySelector("[data-start-assessment]");
const assessmentPanel = document.querySelector("[data-assessment-panel]");
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const zapierWebhookUrl = "https://hooks.zapier.com/hooks/catch/27676700/4oizoy6/";

// CEAM+ assessment sections. Each section measures behavior and support needs in plain language.
const phases = [
  {
    id: "cognitive",
    title: "Cognitive Layer",
    description: "Notice focus patterns, overwhelm, planning needs, and what helps people complete tasks.",
  },
  {
    id: "trust",
    title: "Trust Layer",
    description: "Understand what makes tools feel clear, fair, reliable, and safe enough to use.",
  },
  {
    id: "adoption",
    title: "Adoption Layer",
    description: "Identify learning preferences, change comfort, support needs, and barriers to trying new tools.",
  },
  {
    id: "plus",
    title: "Plus Layer",
    description: "Look at motivation, feedback, consistency, and what helps progress continue over time.",
  },
  {
    id: "environment",
    title: "Environment Layer",
    description: "Spot work, learning, care, or daily-life barriers that make systems harder than they need to be.",
  },
];

const phaseIds = phases.map((phase) => phase.id);

const scaleSets = {
  agreement: { low: "Strongly disagree", high: "Strongly agree" },
  frequency: { low: "Never", high: "Always" },
  stress: { low: "Not stressful", high: "Extremely stressful" },
  difficulty: { low: "Very easy", high: "Very difficult" },
  helpfulness: { low: "Not helpful", high: "Very helpful" },
  confidence: { low: "Not confident", high: "Very confident" },
  clarity: { low: "Very unclear", high: "Very clear" },
};

const profileRules = [
  { max: 44, label: "Guided Support Preferred", tone: "low" },
  { max: 64, label: "Needs Simplified Systems", tone: "medium" },
  { max: 79, label: "Implementation Ready With Support", tone: "medium" },
  { max: 100, label: "Strong Long-Term Growth Potential", tone: "high" },
];

const profileDescriptions = {
  "Guided Support Preferred":
    "This profile suggests the person may benefit from slower setup, fewer steps, clear examples, and a trusted support person nearby.",
  "Needs Simplified Systems":
    "This profile suggests the current process may be carrying too much confusion, too many choices, or too many unclear expectations.",
  "Implementation Ready With Support":
    "This profile suggests there is enough readiness to try AI or a new tool, as long as support, feedback, and pause points stay visible.",
  "Strong Long-Term Growth Potential":
    "This profile suggests the person or team has strong learning habits and may be ready to build a careful, people-centered rollout plan.",
};

const contextCopy = {
  business: {
    title: "Work / Business AI Readiness Assessment",
    icon: "briefcase",
    description: "Use this to understand work habits, team support needs, customer trust, and day-to-day barriers before trying AI.",
    person: "you or your team",
    setting: "workday",
    stakeholder: "employees or customers",
    support: "manager, coworker, or support lead",
  },
  education: {
    title: "Learning / Education AI Readiness Assessment",
    icon: "book",
    description: "Use this to understand student support, teacher workload, learning preferences, access needs, and trust before using AI.",
    person: "the learner or class",
    setting: "class or learning routine",
    stakeholder: "students or teachers",
    support: "teacher, advisor, or learning support person",
  },
  healthcare: {
    title: "Health / Care AI Readiness Assessment",
    icon: "cross",
    description: "Use this to understand staff workload, patient trust, care routines, privacy comfort, and support needs before using AI.",
    person: "the patient or care team",
    setting: "care routine",
    stakeholder: "patients or staff",
    support: "care lead, supervisor, or trusted reviewer",
  },
  rehabilitation: {
    title: "Rehabilitation / Adaptive Support AI Readiness Assessment",
    icon: "path",
    description: "Use this to understand personal goals, support needs, stress points, communication style, and daily-life fit.",
    person: "the person receiving support",
    setting: "daily support routine",
    stakeholder: "the person, caregiver, or support team",
    support: "caregiver, counselor, therapist, or support staff member",
  },
};

// Question templates stay behavior-based and non-diagnostic. They are adapted by category.
const questionTemplates = [
  {
    id: "current_ai_tools",
    phase: "adoption",
    type: "choice",
    label: "What AI or automation tools do you already use?",
    options: [
      "ChatGPT or another AI chat tool",
      "Email writing or reply suggestions",
      "Scheduling or reminder tools",
      "Document or note summarizers",
      "Invoice, billing, or record tools",
      "I do not use AI tools yet",
    ],
    score: [5, 4, 4, 4, 4, 2],
    indicator: "current_ai_use",
    followUp: {
      when: [
        "ChatGPT or another AI chat tool",
        "Email writing or reply suggestions",
        "Scheduling or reminder tools",
        "Document or note summarizers",
        "Invoice, billing, or record tools",
      ],
      label: "How are those tools helping right now?",
      options: ["Saving time", "Organizing information", "Writing drafts", "Remembering tasks", "Explaining things more simply"],
    },
  },
  {
    id: "many_tasks_first_response",
    phase: "cognitive",
    type: "choice",
    label: "When several things need attention at once, what usually happens first?",
    options: [
      "I pick one clear starting point",
      "I ask someone to help me sort it out",
      "I jump between tasks",
      "I pause because it feels like too much",
    ],
    score: [5, 4, 2, 1],
    indicator: "cognitive_overload",
    followUp: {
      when: ["I jump between tasks", "I pause because it feels like too much"],
      label: "What would make that moment easier?",
      options: ["A shorter list", "A clear first step", "Help from a person", "More time", "Fewer interruptions"],
    },
  },
  {
    id: "unfinished_tasks",
    phase: "cognitive",
    type: "scale",
    scale: "frequency",
    label: "How often do unfinished tasks stay on your mind after the day is over?",
    indicator: "cognitive_overload",
    reverse: true,
    note: "Optional: What kinds of tasks tend to stay on your mind?",
  },
  {
    id: "focus_environment",
    phase: "cognitive",
    type: "choice",
    label: "What type of environment helps you focus best?",
    options: ["Quiet space", "Clear checklist", "Working near someone", "Short timed work sessions", "Flexible space"],
    score: [4, 5, 4, 4, 3],
    indicator: "learning_preference",
  },
  {
    id: "unclear_instructions",
    phase: "cognitive",
    type: "choice",
    label: "When instructions are unclear, what do you usually do?",
    options: ["Ask for clarification", "Look for an example", "Try to figure it out alone", "Wait because I am unsure"],
    score: [5, 5, 3, 1],
    indicator: "support_need",
  },
  {
    id: "new_system_scenario_first",
    phase: "cognitive",
    type: "choice",
    scenario:
      "Imagine a new system has many steps, several menus, and very little explanation.",
    label: "What would you most likely do first?",
    options: ["Look for a simple guide", "Try clicking through it", "Ask someone to show me", "Avoid it until I have to use it"],
    score: [5, 3, 4, 1],
    indicator: "adoption_readiness",
  },
  {
    id: "new_system_scenario_frustration",
    phase: "cognitive",
    type: "choice",
    label: "What part of that situation would feel most frustrating?",
    options: ["Too many buttons", "Unclear instructions", "Fear of mistakes", "Too much information at once", "Not knowing where to start"],
    score: [2, 2, 2, 1, 1],
    indicator: "workflow_friction",
  },
  {
    id: "trust_new_tool",
    phase: "trust",
    type: "choice",
    label: "What helps you trust a new tool?",
    options: ["Clear explanation", "A person reviews it", "Proof it works", "Privacy is explained", "Time to test it safely"],
    score: [5, 5, 4, 5, 5],
    indicator: "trust_sensitivity",
  },
  {
    id: "why_recommendation",
    phase: "trust",
    type: "scale",
    scale: "agreement",
    label: "I need to understand why a tool made a suggestion before I feel comfortable using it.",
    indicator: "trust_sensitivity",
  },
  {
    id: "unexplained_decision",
    phase: "trust",
    type: "choice",
    scenario: "A program recommends a decision, but it does not explain how it reached the answer.",
    label: "What would you most likely do next?",
    options: ["Ask for an explanation", "Check with a person", "Use it if it seems right", "Avoid using the recommendation"],
    score: [5, 5, 3, 2],
    indicator: "trust_sensitivity",
    followUp: {
      when: ["Ask for an explanation", "Check with a person", "Avoid using the recommendation"],
      label: "What would help you trust it more?",
      options: ["Step-by-step reason", "Human review", "Privacy details", "Examples", "A way to correct mistakes"],
    },
  },
  {
    id: "automated_recommendations",
    phase: "trust",
    type: "scale",
    scale: "confidence",
    label: "How confident would you feel following an automated suggestion in this setting?",
    indicator: "trust_sensitivity",
  },
  {
    id: "fairness_concern",
    phase: "trust",
    type: "choice",
    label: "What makes a system feel unfair or unreliable?",
    options: ["No explanation", "Different results for similar people", "Hard-to-fix mistakes", "Privacy concerns", "No person to ask"],
    score: [2, 1, 1, 2, 2],
    indicator: "trust_sensitivity",
  },
  {
    id: "trying_new_tools_barrier",
    phase: "adoption",
    type: "choice",
    label: "What usually gets in the way of trying a new tool?",
    options: ["Too many options", "Unclear instructions", "Fear of mistakes", "Not enough time", "Not enough support"],
    score: [2, 2, 2, 2, 1],
    indicator: "adoption_barrier",
    followUp: {
      when: ["Too many options", "Unclear instructions", "Fear of mistakes", "Not enough support"],
      label: "What part feels hardest?",
      options: ["Too many buttons", "Not knowing where to start", "Fear of breaking something", "Too much information", "No one to ask"],
    },
  },
  {
    id: "learning_style",
    phase: "adoption",
    type: "choice",
    label: "Which way of learning usually works best?",
    options: ["Step-by-step guidance", "Video examples", "Written instructions", "Hands-on practice", "Working with someone directly"],
    score: [5, 4, 4, 5, 5],
    indicator: "learning_preference",
  },
  {
    id: "stop_when_frustrating",
    phase: "adoption",
    type: "scale",
    scale: "frequency",
    label: "How often do you stop using tools that feel frustrating?",
    reverse: true,
    indicator: "adoption_barrier",
  },
  {
    id: "support_type",
    phase: "adoption",
    type: "choice",
    label: "What support would make learning easier?",
    options: ["Short checklist", "Practice time", "A person to ask", "Examples from real life", "A help guide I can return to"],
    score: [5, 5, 5, 5, 5],
    indicator: "support_need",
  },
  {
    id: "long_term_use",
    phase: "adoption",
    type: "scale",
    scale: "helpfulness",
    label: "How helpful would regular check-ins be for keeping the tool useful over time?",
    indicator: "growth_potential",
  },
  {
    id: "motivation",
    phase: "plus",
    type: "choice",
    label: "What helps you stay motivated when learning something new?",
    options: ["Small wins", "Encouragement", "Seeing progress", "Clear reason for using it", "Time to practice"],
    score: [5, 5, 5, 5, 5],
    indicator: "growth_potential",
  },
  {
    id: "track_progress",
    phase: "plus",
    type: "choice",
    label: "How do you usually track progress toward a goal?",
    options: ["Checklist", "Notes", "Calendar reminders", "Someone checks in", "I do not track it often"],
    score: [5, 4, 4, 4, 1],
    indicator: "growth_potential",
  },
  {
    id: "feedback_type",
    phase: "plus",
    type: "choice",
    label: "What kind of feedback helps you improve most?",
    options: ["Kind and direct", "Step-by-step", "Visual examples", "Private feedback", "Quick reminders"],
    score: [5, 5, 4, 4, 4],
    indicator: "support_need",
  },
  {
    id: "small_wins",
    phase: "plus",
    type: "scale",
    scale: "helpfulness",
    label: "How helpful are small wins for keeping you going?",
    indicator: "growth_potential",
  },
  {
    id: "progress_stops",
    phase: "plus",
    type: "choice",
    label: "What usually causes progress to slow down?",
    options: ["Too many steps", "Low energy", "Unclear next step", "No feedback", "Competing priorities"],
    score: [2, 2, 1, 2, 2],
    indicator: "cognitive_overload",
  },
  {
    id: "confusing_workflow",
    phase: "environment",
    type: "choice",
    label: "What part of the current routine feels most confusing?",
    options: ["Where to start", "Who to ask", "Too many apps or forms", "Unclear expectations", "Changing instructions"],
    score: [1, 2, 2, 1, 1],
    indicator: "workflow_friction",
  },
  {
    id: "daily_slowdown",
    phase: "environment",
    type: "choice",
    label: "What slows things down most during daily tasks?",
    options: ["Waiting for answers", "Searching for information", "Repeating the same steps", "Interruptions", "Tools that do not fit the routine"],
    score: [2, 2, 2, 2, 1],
    indicator: "workflow_friction",
  },
  {
    id: "expectation_clarity",
    phase: "environment",
    type: "scale",
    scale: "clarity",
    label: "How clear are expectations in this setting?",
    indicator: "workflow_friction",
  },
  {
    id: "missing_support",
    phase: "environment",
    type: "choice",
    label: "What support or resource feels most missing right now?",
    options: ["Clear instructions", "Enough time", "A person to ask", "Better tool setup", "Privacy guidance"],
    score: [2, 2, 2, 2, 2],
    indicator: "support_need",
  },
  {
    id: "environment_focus",
    phase: "environment",
    type: "choice",
    label: "What makes it harder to focus or stay organized?",
    options: ["Noise", "Interruptions", "Too many tools", "Unclear priorities", "Stress outside the task"],
    score: [2, 2, 1, 1, 2],
    indicator: "environmental_barrier",
    note: "Optional: What would make the environment feel easier to work in?",
  },
];

const categoryQuestionAdditions = {
  business: [
    {
      id: "customer_trust",
      phase: "trust",
      type: "scale",
      scale: "agreement",
      label: "Customers should know when AI is helping with a service or decision.",
      indicator: "trust_sensitivity",
    },
    {
      id: "team_support",
      phase: "environment",
      type: "choice",
      label: "What would help the team try AI without feeling rushed?",
      options: ["Clear owner", "Short trial period", "Training time", "Simple rules", "Feedback space"],
      score: [5, 5, 5, 5, 5],
      indicator: "support_need",
    },
  ],
  education: [
    {
      id: "student_confidence",
      phase: "cognitive",
      type: "choice",
      label: "What helps students feel more confident with a new learning tool?",
      options: ["Examples", "Practice prompts", "Teacher guidance", "Peer discussion", "Clear rules"],
      score: [5, 5, 5, 4, 5],
      indicator: "learning_preference",
    },
    {
      id: "academic_honesty",
      phase: "trust",
      type: "scale",
      scale: "clarity",
      label: "How clear are the rules for honest AI use?",
      indicator: "trust_sensitivity",
    },
  ],
  healthcare: [
    {
      id: "patient_comfort",
      phase: "trust",
      type: "scale",
      scale: "confidence",
      label: "How comfortable would patients feel if AI support was clearly explained?",
      indicator: "trust_sensitivity",
    },
    {
      id: "staff_workload",
      phase: "cognitive",
      type: "scale",
      scale: "stress",
      label: "How stressful is the current paperwork or screen time?",
      reverse: true,
      indicator: "cognitive_overload",
    },
  ],
  rehabilitation: [
    {
      id: "choice_control",
      phase: "trust",
      type: "scale",
      scale: "agreement",
      label: "The person should be able to change or stop AI support when needed.",
      indicator: "trust_sensitivity",
    },
    {
      id: "caregiver_fit",
      phase: "environment",
      type: "choice",
      label: "What would help support feel respectful and easier to use?",
      options: ["Fewer reminders", "Clear choice options", "Caregiver support", "Private feedback", "Simple language"],
      score: [4, 5, 4, 5, 5],
      indicator: "support_need",
    },
  ],
};

const makeQuestion = (categoryId, template) => ({
  ...template,
  id: `${categoryId}_${template.id}`,
});

const assessments = Object.entries(contextCopy).map(([id, copy]) => ({
  id,
  version: "2.0",
  title: copy.title,
  icon: copy.icon,
  description: copy.description,
  phases: phaseIds,
  recommendations: {},
  questions: [...questionTemplates, ...(categoryQuestionAdditions[id] || [])].map((question) => makeQuestion(id, question)),
}));

const getAssessmentById = (id) => assessments.find((assessment) => assessment.id === id);
const getScale = (question) => scaleSets[question.scale] || scaleSets.agreement;

const getReadinessLevel = (score) => profileRules.find((rule) => score <= rule.max) || profileRules.at(-1);

const getQuestionScore = (question, value) => {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) return null;

  if (question.type === "choice") {
    const scores = question.score || question.options.map(() => 4);
    if (Math.max(...scores) <= 3) return 3;
    const selectedValues = Array.isArray(value) ? value : [value];
    const selectedScores = selectedValues
      .map((selected) => scores[question.options.indexOf(selected)])
      .filter((score) => typeof score === "number");
    if (!selectedScores.length) return null;
    return selectedScores.reduce((sum, score) => sum + score, 0) / selectedScores.length;
  }

  const number = Number(value || 3);
  return question.reverse ? 6 - number : number;
};

const calculateScore = (responses, questions = []) => {
  const scoredQuestions = questions
    .filter((question) => question.type !== "text")
    .map((question) => getQuestionScore(question, responses[question.id]))
    .filter((score) => score !== null);
  if (!scoredQuestions.length) return 0;
  const total = scoredQuestions.reduce((sum, score) => sum + score, 0);
  return Math.round((total / (scoredQuestions.length * 5)) * 100);
};

const calculatePhaseScores = (assessment, responses) =>
  phases.reduce((scores, phase) => {
    const phaseQuestions = assessment.questions.filter((question) => question.phase === phase.id);
    scores[phase.id] = calculateScore(responses, phaseQuestions);
    return scores;
  }, {});

const collectIndicators = (assessment, responses) =>
  assessment.questions.reduce((indicators, question) => {
    if (!question.indicator) return indicators;
    const score = getQuestionScore(question, responses[question.id]);
    if (score === null) return indicators;
    const current = indicators[question.indicator] || { total: 0, count: 0 };
    indicators[question.indicator] = { total: current.total + score, count: current.count + 1 };
    return indicators;
  }, {});

const summarizeIndicators = (indicators) =>
  Object.entries(indicators)
    .map(([id, value]) => ({ id, score: Math.round((value.total / (value.count * 5)) * 100) }))
    .sort((a, b) => a.score - b.score);

const indicatorLabels = {
  cognitive_overload: "Some tasks may feel mentally heavy",
  workflow_friction: "Parts of the routine may feel harder than they need to be",
  trust_sensitivity: "Trust and transparency matter here",
  learning_preference: "Learning preferences are important",
  adoption_barrier: "Trying new tools may feel easier with support",
  support_need: "Support should be planned before starting",
  growth_potential: "Long-term growth potential is present",
  environmental_barrier: "The environment may be making focus harder",
  current_ai_use: "Current AI use can shape the next step",
};

const answerInsightRules = [
  {
    match: ["I do not use AI tools yet"],
    message: "The user may be new to AI tools, so recommendations should start with very simple examples and low-risk practice.",
  },
  {
    match: ["ChatGPT or another AI chat tool"],
    message: "The user already has some experience with AI chat tools, so prompts, drafts, and planning templates may be a good next step.",
  },
  {
    match: ["Email writing or reply suggestions"],
    message: "The user already uses writing support, so email drafts, client messages, and follow-up notes may be a practical starting point.",
  },
  {
    match: ["Scheduling or reminder tools"],
    message: "The user already uses reminder or scheduling support, so AI can build on routines, follow-ups, and planning.",
  },
  {
    match: ["Document or note summarizers"],
    message: "The user already uses summarizing support, so record summaries, meeting notes, and checklist creation may be useful.",
  },
  {
    match: ["I pause because it feels like too much", "Too much information at once", "Not knowing where to start"],
    message: "The user may need fewer steps and a clear first action before adding more tools.",
  },
  {
    match: ["Fear of mistakes", "Fear of breaking something"],
    message: "The user may need a safe practice space and reassurance that mistakes can be corrected.",
  },
  {
    match: ["No explanation", "Ask for an explanation", "Clear explanation"],
    message: "Clear explanations will matter. The AI should show what it used, what it suggested, and what a person should review.",
  },
  {
    match: ["Working with someone directly", "A person to ask", "Help from a person"],
    message: "The user may benefit from guided help or a trusted person during setup.",
  },
  {
    match: ["Small wins", "Seeing progress", "Checklist"],
    message: "Progress tracking and small wins may help the user keep going.",
  },
  {
    match: ["Noise", "Interruptions", "Too many tools", "Unclear priorities"],
    message: "The environment may need small changes before AI feels easy to use.",
  },
];

const flattenResponseValues = (responses) =>
  Object.values(responses).flatMap((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return [value];
    return [];
  });

const analyzeSelectedAnswers = (responses) => {
  const values = flattenResponseValues(responses);
  const insights = answerInsightRules
    .filter((rule) => rule.match.some((answer) => values.includes(answer)))
    .map((rule) => rule.message);

  return {
    selectedAnswerCount: values.length,
    currentAiTools: values.filter((value) =>
      [
        "ChatGPT or another AI chat tool",
        "Email writing or reply suggestions",
        "Scheduling or reminder tools",
        "Document or note summarizers",
        "Invoice, billing, or record tools",
        "I do not use AI tools yet",
      ].includes(value)
    ),
    insights: [...new Set(insights)].slice(0, 6),
  };
};

const getProfileTags = (score, indicatorSummary) => {
  const tags = [getReadinessLevel(score).label];
  indicatorSummary.slice(0, 3).forEach((indicator) => {
    if (indicator.score <= 64 && indicatorLabels[indicator.id]) tags.push(indicatorLabels[indicator.id]);
  });
  return [...new Set(tags)];
};

const getLayerSummary = (phaseScores) =>
  phases.map((phase) => ({
    title: phase.title,
    score: phaseScores[phase.id],
    message:
      phaseScores[phase.id] >= 75
        ? "This area looks like a helpful starting strength."
        : phaseScores[phase.id] >= 55
          ? "This area may work better with clearer examples and support."
          : "This area may need simpler steps before adding AI or a new tool.",
  }));

const aiStartingPoints = {
  business: {
    label: "Business use",
    task: "Start with customer messages, estimates, invoices, scheduling, FAQs, training guides, or recordkeeping.",
    examples: ["draft customer replies", "summarize notes", "create invoice checklists", "organize schedules", "write training guides"],
  },
  education: {
    label: "Education use",
    task: "Start with study plans, assignment breakdowns, note summaries, tutoring prompts, or time management.",
    examples: ["break down assignments", "summarize notes", "make study plans", "create tutoring prompts", "organize due dates"],
  },
  healthcare: {
    label: "Health or care use",
    task: "Start with note summaries, appointment preparation, checklist drafts, reminder planning, or plain-language instructions.",
    examples: ["summarize records", "draft appointment notes", "create checklists", "simplify instructions", "organize follow-up tasks"],
  },
  rehabilitation: {
    label: "Support use",
    task: "Start with goal tracking, appointment reminders, step-by-step planning, coping plans, or support check-ins.",
    examples: ["track goals", "create reminders", "write step-by-step plans", "draft coping plans", "prepare support check-ins"],
  },
};

const supportLevels = [
  {
    max: 44,
    label: "Hands-On Consulting",
    message: "Direct help would make this easier. A consultant can help set up simple tools, forms, prompts, and first workflows with you.",
  },
  {
    max: 59,
    label: "Guided Implementation",
    message: "Step-by-step support is recommended. You may benefit from a guided walkthrough before using AI for bigger tasks.",
  },
  {
    max: 72,
    label: "Light Support",
    message: "You can start small with examples, templates, and occasional check-ins.",
  },
  {
    max: 86,
    label: "Self-Guided",
    message: "You may be ready to try a simple AI task independently while keeping human review in place.",
  },
  {
    max: 100,
    label: "Training Recommended",
    message: "You may be ready for broader use. A short AI basics session can help a team use tools more consistently.",
  },
];

const getSupportLevel = (score, indicatorSummary) => {
  const highNeed = indicatorSummary.some((indicator) =>
    ["cognitive_overload", "support_need", "adoption_barrier"].includes(indicator.id) && indicator.score < 55
  );
  if (highNeed && score < 75) return supportLevels.find((level) => level.label === "Guided Implementation");
  return supportLevels.find((level) => score <= level.max) || supportLevels.at(-1);
};

const getImplementationPath = (assessmentId, indicatorSummary, answerAnalysis = {}) => {
  const start = aiStartingPoints[assessmentId] || aiStartingPoints.business;
  const steps = [
    `Choose one repeated task first, such as ${start.examples.slice(0, 2).join(" or ")}.`,
    "Use AI to make a first draft, summary, checklist, reminder, or plan. Treat it as a helper, not the final answer.",
    "Have a person review the AI suggestion before using it for anything important.",
    "Track simple results: time saved, mistakes reduced, confidence gained, and steps completed.",
  ];

  const firstBarrier = indicatorSummary[0]?.id;
  if (firstBarrier === "trust_sensitivity") {
    steps.splice(2, 0, "Clearly explain how the AI works, what information it uses, and who people can contact for help.");
  } else if (firstBarrier === "cognitive_overload") {
    steps.unshift("Start by simplifying the most frustrating part of the day before adding a new AI tool.");
  } else if (firstBarrier === "workflow_friction") {
    steps.unshift("Pick the task that wastes the most time each week and make that task easier first.");
  }

  if (answerAnalysis.currentAiTools?.includes("I do not use AI tools yet")) {
    steps.unshift("Begin with a simple AI practice task that does not affect clients, grades, records, money, or care decisions.");
  } else if (answerAnalysis.currentAiTools?.length) {
    steps.unshift("Build from the AI tools already being used instead of introducing too many new tools at once.");
  }

  return [...new Set(steps)].slice(0, 5);
};

const getPlainBarrier = (indicatorId) => {
  const barriers = {
    cognitive_overload: "Too many steps, interruptions, or unclear choices may be making the day feel heavier.",
    workflow_friction: "The routine may have confusing steps that should be simplified before adding AI.",
    trust_sensitivity: "People may need clearer explanations before they feel comfortable using AI suggestions.",
    learning_preference: "People may need examples, videos, written steps, or hands-on practice before they feel confident.",
    adoption_barrier: "Trying a new tool may feel easier with setup help and a safe first task.",
    support_need: "A clear support person or help option should be available before the tool is used.",
    environmental_barrier: "Noise, interruptions, unclear priorities, or missing resources may be getting in the way.",
  };
  return barriers[indicatorId] || "Nothing here means failure. It simply points to where support may help most.";
};

// Recommendations are generated from the same result data used for on-screen output and email templates.
const getRecommendation = (assessmentId, score, phaseScores = {}, indicatorSummary = [], answerAnalysis = {}) => {
  const copy = contextCopy[assessmentId] || contextCopy.business;
  const profile = getReadinessLevel(score);
  const topIndicator = indicatorSummary[0]?.id;
  const startingPoint = aiStartingPoints[assessmentId] || aiStartingPoints.business;
  const supportLevel = getSupportLevel(score, indicatorSummary);

  const recommendations = [
    `Start with one simple task, like ${startingPoint.examples.slice(0, 3).join(", ")}.`,
    "People learn differently. Offer examples, written steps, videos, or hands-on practice before expecting full use.",
    "Clearly explain how the AI works, what information it uses, and who users can contact if they need help.",
  ];

  if (topIndicator === "cognitive_overload") {
    recommendations.unshift("Start by simplifying the most frustrating part of the daily routine before adding new AI tools.");
  }
  if (topIndicator === "trust_sensitivity") {
    recommendations.unshift("Use AI suggestions with human review until people feel comfortable trusting the process.");
  }
  if (topIndicator === "workflow_friction") {
    recommendations.unshift("Pick one task that takes extra time each week and make that task easier first.");
  }

  return {
    profile: profile.label,
    description: profileDescriptions[profile.label],
    recommendations: [...new Set(recommendations)].slice(0, 4),
    implementationPath: getImplementationPath(assessmentId, indicatorSummary, answerAnalysis),
    startingPoint,
    supportLevel,
    nextStep: `Start with one simple task, like ${startingPoint.examples[0]} or ${startingPoint.examples[1]}. Try it with ${copy.support} before using it for bigger tasks.`,
    barrier: getPlainBarrier(topIndicator),
    layerSummary: getLayerSummary(phaseScores),
  };
};

const buildAssessmentResult = (assessment, responses, participant = {}) => {
  const score = calculateScore(responses, assessment.questions);
  const readiness = getReadinessLevel(score);
  const phaseScores = calculatePhaseScores(assessment, responses);
  const indicatorSummary = summarizeIndicators(collectIndicators(assessment, responses));
  const answerAnalysis = analyzeSelectedAnswers(responses);
  const recommendation = getRecommendation(assessment.id, score, phaseScores, indicatorSummary, answerAnalysis);
  const answeredCount = assessment.questions.filter((question) => responses[question.id] !== undefined).length;

  return {
    resultId: `${assessment.id}-${Date.now()}`,
    assessmentId: assessment.id,
    assessmentTitle: assessment.title,
    version: assessment.version,
    submittedAt: new Date().toISOString(),
    participant,
    responses,
    score,
    answeredCount,
    questionCount: assessment.questions.length,
    readinessLevel: readiness.label,
    readinessTone: readiness.tone,
    phaseScores,
    indicators: indicatorSummary,
    answerAnalysis,
    profileTags: getProfileTags(score, indicatorSummary),
    recommendation,
  };
};

const calculateAssessmentResult = (values, questionCount, assessment) => {
  const responses = {};
  const questions = assessment?.questions?.slice(0, questionCount) || [];
  values.forEach((value, index) => {
    if (questions[index]) responses[questions[index].id] = value;
  });
  return buildAssessmentResult(assessment, responses);
};

const emailTemplates = {
  client(result) {
    const name = result.participant.firstName || "there";
    return {
      to: result.participant.email,
      subject: `Your CEAM+ ${result.assessmentTitle} Results`,
      body: `Hi ${name},\n\nThank you for completing the ${result.assessmentTitle}.\n\nReadiness profile: ${result.recommendation.profile}\n\n${result.recommendation.description}\n\nWhat your answers point to:\n${result.answerAnalysis.insights.map((item) => `- ${item}`).join("\n") || "- No single pattern stood out yet."}\n\nAI tools already used:\n${result.answerAnalysis.currentAiTools.join(", ") || "None selected"}\n\nRecommended support level: ${result.recommendation.supportLevel.label}\n${result.recommendation.supportLevel.message}\n\nRecommended AI steps:\n${result.recommendation.implementationPath.map((item) => `- ${item}`).join("\n")}\n\nBest starting point:\n${result.recommendation.startingPoint.task}\n\nNext step: ${result.recommendation.nextStep}\n\nYour results will be reviewed if you request follow-up support.\n`,
    };
  },
  admin(result) {
    return {
      to: "briggsfaye@icloud.com",
      subject: `New CEAM+ Assessment: ${result.assessmentTitle}`,
      body: `Client: ${result.participant.firstName} ${result.participant.lastName}\nEmail: ${result.participant.email}\nPhone: ${result.participant.phone || "Not provided"}\nOrganization: ${result.participant.organization || "Not provided"}\nAssessment: ${result.assessmentTitle}\nSubmitted: ${result.submittedAt}\nResult ID: ${result.resultId}\nProfile: ${result.recommendation.profile}\nSupport level: ${result.recommendation.supportLevel.label}\nMain barrier: ${result.recommendation.barrier}\nTop support needs: ${result.profileTags.join(", ")}\nAI tools already used: ${result.answerAnalysis.currentAiTools.join(", ") || "None selected"}\nAnswer insights: ${result.answerAnalysis.insights.join(" | ") || "No single pattern stood out yet."}\n\nRecommended AI steps:\n${result.recommendation.implementationPath.map((item) => `- ${item}`).join("\n")}\n\nResponses:\n${Object.entries(result.responses).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`).join("\n")}`,
    };
  },
  supportAdmin(result, supportRequest) {
    return {
      to: "briggsfaye@icloud.com",
      subject: `CEAM+ Support Request: ${supportRequest.supportOption}`,
      body: `Client: ${supportRequest.firstName} ${supportRequest.lastName}\nEmail: ${supportRequest.email}\nPhone: ${supportRequest.phone}\nOrganization: ${supportRequest.organization}\nAssessment: ${result.assessmentTitle}\nProfile: ${result.recommendation.profile}\nSupport option: ${supportRequest.supportOption}\nMain goal: ${supportRequest.mainGoal}\nBiggest challenge: ${supportRequest.biggestChallenge}\nBest time to contact: ${supportRequest.bestTime}\nResult ID: ${result.resultId}`,
    };
  },
  supportClient(result, supportRequest) {
    return {
      to: supportRequest.email,
      subject: "Your CEAM+ support request was received",
      body: `Hi ${supportRequest.firstName},\n\nThank you. Your request was received. We will review your results and follow up with next steps.\n\nSelected support option: ${supportRequest.supportOption}\nAssessment summary: ${result.recommendation.profile}\nSuggested first AI step: ${result.recommendation.nextStep}\n\nYour results will be reviewed for follow-up support.\n`,
    };
  },
};

const sendAssessmentEmails = async (result) => {
  const payload = {
    clientEmail: emailTemplates.client(result),
    adminEmail: emailTemplates.admin(result),
    result,
  };

  // Zapier receives the payload and sends the actual emails in the Zap.
  // Keep private email/API credentials inside Zapier or a backend, never in this frontend file.
  if (!zapierWebhookUrl) {
    console.info("CEAM+ email payload ready for email service configuration:", payload);
    return { configured: false, payload };
  }

  try {
    const formPayload = new URLSearchParams({
      clientEmail: JSON.stringify(payload.clientEmail),
      adminEmail: JSON.stringify(payload.adminEmail),
      result: JSON.stringify(payload.result),
      assessmentTitle: result.assessmentTitle,
      readinessProfile: result.recommendation.profile,
      clientName: `${result.participant.firstName} ${result.participant.lastName}`.trim(),
      clientEmailAddress: result.participant.email,
      clientPhone: result.participant.phone,
      organization: result.participant.organization,
      submittedAt: result.submittedAt,
    });

    const response = await fetch(zapierWebhookUrl, {
      method: "POST",
      mode: "no-cors",
      body: formPayload,
    });

    return { configured: true, sent: true, status: response.status || "submitted", payload };
  } catch (error) {
    console.error("CEAM+ Zapier submission failed:", error);
    return { configured: true, sent: false, error: error.message, payload };
  }
};

const sendSupportRequest = async (result, supportRequest) => {
  const payload = {
    requestType: "consultant-support-request",
    supportRequest,
    clientEmail: emailTemplates.supportClient(result, supportRequest),
    adminEmail: emailTemplates.supportAdmin(result, supportRequest),
    result,
  };

  try {
    const formPayload = new URLSearchParams({
      requestType: payload.requestType,
      supportRequest: JSON.stringify(payload.supportRequest),
      clientEmail: JSON.stringify(payload.clientEmail),
      adminEmail: JSON.stringify(payload.adminEmail),
      result: JSON.stringify(payload.result),
      clientName: `${supportRequest.firstName} ${supportRequest.lastName}`.trim(),
      clientEmailAddress: supportRequest.email,
      supportOption: supportRequest.supportOption,
      assessmentTitle: result.assessmentTitle,
      readinessProfile: result.recommendation.profile,
      resultId: result.resultId,
    });

    await fetch(zapierWebhookUrl, {
      method: "POST",
      mode: "no-cors",
      body: formPayload,
    });

    return { sent: true, payload };
  } catch (error) {
    console.error("CEAM+ support request submission failed:", error);
    return { sent: false, error: error.message, payload };
  }
};

const supportOptions = [
  "I want to try this myself first",
  "I want step-by-step written instructions",
  "I want a guided walkthrough",
  "I want hands-on setup help",
  "I want training for my team",
  "I want help choosing the best AI tools",
  "I want help creating prompts, templates, or workflows",
  "I want help tracking results and progress",
];

const getIconMarkup = (icon) => {
  const paths = {
    briefcase:
      '<path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"></path><path d="M4 12h16"></path>',
    book:
      '<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z"></path><path d="M5 4v12"></path><path d="M9 8h6"></path>',
    cross:
      '<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3Z"></path>',
    path:
      '<path d="M5 19c5-1 3-7 8-7 4 0 4-5 7-7"></path><path d="M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M20 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M13 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[icon]}</svg>`;
};

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const renderParticipantFields = (assessment) => `
  <fieldset class="participant-fields">
    <legend>Your contact information</legend>
    <p>These details help prepare your result summary and follow-up message.</p>
    <div class="field-grid">
      <label>First name<input name="firstName" autocomplete="given-name" required></label>
      <label>Last name<input name="lastName" autocomplete="family-name" required></label>
      <label>Email address<input type="email" name="email" autocomplete="email" required></label>
      <label>Phone number<input type="tel" name="phone" autocomplete="tel" required></label>
      <label>Business or organization name<input name="organization" autocomplete="organization" required></label>
      <label>Assessment type<input name="assessmentType" value="${assessment.title}" readonly></label>
    </div>
  </fieldset>
`;

const renderQuestion = (question, index) => {
  const wrapper = document.createElement("div");
  wrapper.className = "guided-question";
  wrapper.dataset.questionId = question.id;

  const inputMarkup =
    question.type === "choice"
      ? `<div class="choice-list">${question.options
          .map(
            (option) => `
              <label class="choice-option">
                <input type="checkbox" name="${question.id}" value="${option}">
                <span>${option}</span>
              </label>
            `
          )
          .join("")}</div>`
      : `<input id="${question.id}" name="${question.id}" data-question-id="${question.id}" type="range" min="1" max="5" value="3" step="1">
        <div class="scale-labels" aria-hidden="true">
          <span>${getScale(question).low}</span>
          <span>${getScale(question).high}</span>
        </div>`;

  wrapper.innerHTML = `
    <div class="question-meta">
      <span>Question ${index + 1}</span>
      ${question.type === "scale" ? `<output for="${question.id}" data-output>3</output>` : ""}
    </div>
    ${question.scenario ? `<p class="scenario">${question.scenario}</p>` : ""}
    <label class="question-label" for="${question.id}">${question.label}</label>
    ${inputMarkup}
    ${question.note ? `<label class="optional-note">${question.note}<textarea name="${question.id}_note" rows="2"></textarea></label>` : ""}
    ${question.followUp ? `<div class="follow-up" data-follow-up hidden></div>` : ""}
  `;

  return wrapper;
};

const renderPhase = (phase, phaseQuestions, questionOffset = 0, isOpen = false) => {
  const phaseCard = document.createElement("details");
  phaseCard.className = "phase-card";
  phaseCard.open = isOpen;
  phaseCard.innerHTML = `
    <summary>
      <span>${phase.title}</span>
      <small>${phaseQuestions.length} questions</small>
    </summary>
    <p>${phase.description}</p>
    <div class="phase-questions"></div>
  `;

  const phaseQuestionList = phaseCard.querySelector(".phase-questions");
  phaseQuestions.forEach((question, index) => {
    phaseQuestionList.appendChild(renderQuestion(question, questionOffset + index));
  });

  return phaseCard;
};

const getResponsesFromPanel = (panel, assessment) =>
  assessment.questions.reduce((responses, question) => {
    if (question.type === "choice") {
      const selected = [...panel.querySelectorAll(`input[name="${question.id}"]:checked`)].map((input) => input.value);
      if (selected.length) responses[question.id] = selected;
    } else {
      responses[question.id] = Number(panel.querySelector(`[name="${question.id}"]`)?.value || 3);
    }
    const note = panel.querySelector(`[name="${question.id}_note"]`)?.value.trim();
    if (note) responses[`${question.id}_note`] = note;
    const followUp = [...panel.querySelectorAll(`[name="${question.id}_followup"]:checked`)].map((input) => input.value);
    if (followUp.length) responses[`${question.id}_followup`] = followUp;
    return responses;
  }, {});

const getParticipantFromForm = (formElement) => {
  const formData = new FormData(formElement);
  return {
    firstName: String(formData.get("firstName") || "").trim(),
    lastName: String(formData.get("lastName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    organization: String(formData.get("organization") || "").trim(),
    assessmentType: String(formData.get("assessmentType") || "").trim(),
  };
};

const updateFollowUp = (question, wrapper) => {
  if (!question.followUp) return;
  const selected = [...wrapper.querySelectorAll(`input[name="${question.id}"]:checked`)].map((input) => input.value);
  const followUp = wrapper.querySelector("[data-follow-up]");
  const shouldShow = selected.some((value) => question.followUp.when.includes(value));
  const currentFollowUp = [...wrapper.querySelectorAll(`input[name="${question.id}_followup"]:checked`)].map((input) => input.value);

  followUp.hidden = !shouldShow;
  if (!shouldShow) {
    followUp.innerHTML = "";
    followUp.dataset.rendered = "false";
    return;
  }

  if (followUp.dataset.rendered === "true") return;

  followUp.innerHTML = `
      <p>${question.followUp.label}</p>
      <div class="choice-list compact">
        ${question.followUp.options
          .map(
            (option, index) => `
              <label class="choice-option">
                <input type="checkbox" name="${question.id}_followup" value="${option}" ${currentFollowUp.includes(option) ? "checked" : ""}>
                <span>${option}</span>
              </label>
            `
          )
          .join("")}
      </div>
    `;
  followUp.dataset.rendered = "true";
};

const renderResult = (resultBox, result) => {
  resultBox.hidden = false;
  resultBox.className = `guided-result ${result.readinessTone}`;
  resultBox.innerHTML = `
    <div class="result-heading">
      <span>${result.recommendation.profile}</span>
      <strong>${result.score}% support readiness</strong>
    </div>
    <section class="result-section">
      <h4>Your Readiness Summary</h4>
      <p>${result.answeredCount} of ${result.questionCount} questions answered.</p>
      <p>${result.recommendation.description}</p>
    </section>
    <div class="profile-tags">
      ${result.profileTags.map((tag) => `<span>${tag}</span>`).join("")}
    </div>
    <section class="result-section">
      <h4>What We Noticed</h4>
      <div class="layer-summary">
        ${result.recommendation.layerSummary
          .map(
            (layer) => `
              <article>
                <strong>${layer.title}</strong>
                <span>${layer.score}%</span>
                <p>${layer.message}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
    <section class="result-section">
      <h4>What May Be Making Things Harder</h4>
      <p>${result.recommendation.barrier}</p>
    </section>
    <section class="result-section">
      <h4>What Your Answers Point To</h4>
      ${
        result.answerAnalysis.insights.length
          ? `<ul>${result.answerAnalysis.insights.map((item) => `<li>${item}</li>`).join("")}</ul>`
          : "<p>Your selected answers did not point to one major pattern yet. Answering more questions can make this section more specific.</p>"
      }
      <p><strong>AI tools already used:</strong> ${
        result.answerAnalysis.currentAiTools.length ? result.answerAnalysis.currentAiTools.join(", ") : "None selected yet"
      }</p>
    </section>
    <section class="result-section">
      <h4>Recommended AI Implementation Path</h4>
      <ol>${result.recommendation.implementationPath.map((item) => `<li>${item}</li>`).join("")}</ol>
    </section>
    <section class="result-section">
      <h4>Best Starting Point</h4>
      <p>${result.recommendation.startingPoint.task}</p>
    </section>
    <section class="result-section">
      <h4>Easy AI Tools to Start With</h4>
      <ul>
        <li>ChatGPT for drafts, planning, simple explanations, and checklists.</li>
        <li>Reminder or scheduling tools for appointments, routines, and follow-up tasks.</li>
        <li>Email drafting tools for messages that still need human review.</li>
        <li>Document summarizers for notes, records, instructions, or long information.</li>
        <li>Workflow checklists for repeated steps that are easy to miss.</li>
      </ul>
    </section>
    <section class="result-section support-level">
      <h4>Recommended Support Level</h4>
      <strong>${result.recommendation.supportLevel.label}</strong>
      <p>${result.recommendation.supportLevel.message}</p>
    </section>
    <section class="result-section">
      <h4>Recommended First Steps</h4>
      <ul>${result.recommendation.recommendations.map((item) => `<li>${item}</li>`).join("")}</ul>
      <p><strong>Simple next step:</strong> ${result.recommendation.nextStep}</p>
    </section>
    <section class="consultant-cta">
      <h4>Need Help Getting Started?</h4>
      <p>Want help turning these results into a real implementation plan?</p>
      <div class="result-actions">
        <button class="button primary" type="button" data-show-support>Contact a Consultant</button>
        <button class="button secondary" type="button" data-support-shortcut="I want a guided walkthrough">Guided Setup Help</button>
        <button class="button secondary" type="button" data-support-shortcut="I want training for my team">Team Training</button>
        <button class="button secondary" type="button" data-support-shortcut="I want step-by-step written instructions">Step-by-Step Help</button>
        <button class="button secondary" type="button" data-email-results>Email My Results</button>
        <button class="button secondary" type="button" data-download-results>Download My Results</button>
      </div>
    </section>
    <section class="support-request" data-support-request hidden>
      <h4>Guided Implementation Options</h4>
      <form data-support-form>
        <div class="choice-list">
          ${supportOptions
            .map(
              (option, index) => `
                <label class="choice-option">
                  <input type="radio" name="supportOption" value="${option}" ${index === 0 ? "checked" : ""}>
                  <span>${option}</span>
                </label>
              `
            )
            .join("")}
        </div>
        <div class="field-grid">
          <label>First name<input name="firstName" value="${result.participant.firstName || ""}" required></label>
          <label>Last name<input name="lastName" value="${result.participant.lastName || ""}" required></label>
          <label>Email<input type="email" name="email" value="${result.participant.email || ""}" required></label>
          <label>Phone number<input type="tel" name="phone" value="${result.participant.phone || ""}" required></label>
          <label>Business or organization name<input name="organization" value="${result.participant.organization || ""}" required></label>
          <label>Assessment type<input name="assessmentType" value="${result.assessmentTitle}" readonly></label>
        </div>
        <label>Main goal<textarea name="mainGoal" rows="3" required></textarea></label>
        <label>Biggest challenge<textarea name="biggestChallenge" rows="3" required></textarea></label>
        <label>Best time to contact<input name="bestTime" placeholder="Example: Weekday afternoons" required></label>
        <button class="button primary" type="submit">Request Support</button>
        <p class="form-status" data-support-status role="status"></p>
      </form>
    </section>
  `;

  const supportSection = resultBox.querySelector("[data-support-request]");
  const supportForm = resultBox.querySelector("[data-support-form]");
  const supportStatus = resultBox.querySelector("[data-support-status]");

  const showSupportForm = (option = "") => {
    supportSection.hidden = false;
    if (option) {
      const selected = supportForm.querySelector(`input[name="supportOption"][value="${option}"]`);
      if (selected) selected.checked = true;
    }
    supportSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
  };

  resultBox.querySelector("[data-show-support]")?.addEventListener("click", () => showSupportForm());
  resultBox.querySelectorAll("[data-support-shortcut]").forEach((button) => {
    button.addEventListener("click", () => showSupportForm(button.dataset.supportShortcut));
  });

  resultBox.querySelector("[data-email-results]")?.addEventListener("click", async () => {
    await sendAssessmentEmails(result);
    supportStatus.textContent = "Your results were sent to the email automation.";
  });

  resultBox.querySelector("[data-download-results]")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ceam-results-${result.resultId}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  supportForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(supportForm);
    const supportRequest = Object.fromEntries(formData.entries());
    const response = await sendSupportRequest(result, supportRequest);
    supportStatus.textContent = response.sent
      ? "Thank you. Your request was received. We will review your results and follow up with next steps."
      : "Thank you. Your request was saved on screen, but the email automation needs to be checked.";
    supportForm.reset();
  });
};

const updateGuidedAssessment = (panel, assessment) => {
  const responses = getResponsesFromPanel(panel, assessment);
  const result = buildAssessmentResult(assessment, responses);
  const answered = assessment.questions.filter((question) => responses[question.id] !== undefined).length;
  const progressPercent = Math.min(100, Math.round((answered / assessment.questions.length) * 100));
  const score = panel.querySelector("[data-score]");
  const progress = panel.querySelector("[data-progress]");
  const progressText = panel.querySelector("[data-progress-text]");
  const progressBar = panel.querySelector(".guided-progress");
  const resultBox = panel.querySelector("[data-result]");

  score.textContent = `${result.score}%`;
  progress.style.width = `${progressPercent}%`;
  progressBar.setAttribute("aria-valuenow", progressPercent);
  progressText.textContent = `${Math.min(answered, assessment.questions.length)} of ${assessment.questions.length} questions answered`;

  if (resultBox.dataset.submitted === "true") renderResult(resultBox, result);
};

const renderAssessment = (assessment) => {
  if (!assessmentPanel) return;
  assessmentPanel.hidden = false;
  assessmentPanel.classList.add("is-visible");
  assessmentPanel.innerHTML = `
    <article class="guided-assessment-card ${assessment.id}">
      <header class="guided-assessment-header">
        <span class="category-icon">${getIconMarkup(assessment.icon)}</span>
        <div>
          <h3>${assessment.title}</h3>
          <p>${assessment.description}</p>
        </div>
        <strong data-score>60%</strong>
      </header>
      <div class="guided-progress-wrap">
        <div class="guided-progress" role="progressbar" aria-label="${assessment.title} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <span data-progress></span>
        </div>
        <p data-progress-text>0 of ${assessment.questions.length} questions answered</p>
      </div>
      <form data-assessment-form>
        ${renderParticipantFields(assessment)}
        <div class="guided-questions"></div>
        <button class="button primary" type="submit">Show My CEAM+ Profile</button>
      </form>
      <div class="guided-result" data-result hidden></div>
    </article>
  `;

  const questionList = assessmentPanel.querySelector(".guided-questions");
  let questionOffset = 0;
  phases.forEach((phase, phaseIndex) => {
    const phaseQuestions = assessment.questions.filter((question) => question.phase === phase.id);
    if (!phaseQuestions.length) return;
    questionList.appendChild(renderPhase(phase, phaseQuestions, questionOffset, phaseIndex === 0));
    questionOffset += phaseQuestions.length;
  });

  assessment.questions.forEach((question) => {
    const wrapper = assessmentPanel.querySelector(`[data-question-id="${question.id}"]`);
    if (!wrapper) return;
    updateFollowUp(question, wrapper);
    wrapper.addEventListener("input", () => {
      const output = wrapper.querySelector("[data-output]");
      const slider = wrapper.querySelector('input[type="range"]');
      if (output && slider) output.textContent = slider.value;
      updateFollowUp(question, wrapper);
      updateGuidedAssessment(assessmentPanel, assessment);
    });
    wrapper.addEventListener("change", () => {
      updateFollowUp(question, wrapper);
      updateGuidedAssessment(assessmentPanel, assessment);
    });
  });

  assessmentPanel.querySelector("[data-assessment-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const resultBox = assessmentPanel.querySelector("[data-result]");
    const responses = getResponsesFromPanel(assessmentPanel, assessment);
    const participant = getParticipantFromForm(event.currentTarget);
    const result = buildAssessmentResult(assessment, responses, participant);
    resultBox.dataset.submitted = "true";
    renderResult(resultBox, result);
    await sendAssessmentEmails(result);
    resultBox.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
  });

  updateGuidedAssessment(assessmentPanel, assessment);
};

const handleOrganizationChange = () => {
  const selected = organizationSelect?.value;
  if (startAssessmentButton) startAssessmentButton.disabled = !selected;
  if (assessmentPanel) {
    assessmentPanel.hidden = true;
    assessmentPanel.classList.remove("is-visible");
    assessmentPanel.innerHTML = "";
  }
};

window.CEAMAssessments = {
  assessments,
  phases,
  buildAssessmentResult,
  calculateAssessmentResult,
  calculatePhaseScores,
  calculateScore,
  emailTemplates,
  getAssessmentById,
  getReadinessLevel,
  getRecommendation,
  renderAssessment,
  renderPhase,
  renderQuestion,
  sendAssessmentEmails,
  sendSupportRequest,
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

organizationSelect?.addEventListener("change", handleOrganizationChange);
startAssessmentButton?.addEventListener("click", () => {
  const assessment = getAssessmentById(organizationSelect.value);
  if (!assessment) return;
  renderAssessment(assessment);
  assessmentPanel.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
});

if (contactForm && statusMessage) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "Thanks").trim();
    statusMessage.textContent = `${name}, your inquiry is ready to send once this site is connected to an email or form service.`;
    contactForm.reset();
  });
}
