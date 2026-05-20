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
  if (question.type === "choice") {
    const index = question.options.indexOf(value);
    const scores = question.score || question.options.map(() => 4);
    if (Math.max(...scores) <= 3) return 3;
    return scores[index] || 3;
  }

  const number = Number(value || 3);
  return question.reverse ? 6 - number : number;
};

const calculateScore = (responses, questions = []) => {
  const scoredQuestions = questions.filter((question) => question.type !== "text");
  if (!scoredQuestions.length) return 0;
  const total = scoredQuestions.reduce((sum, question) => sum + getQuestionScore(question, responses[question.id]), 0);
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
    const current = indicators[question.indicator] || { total: 0, count: 0 };
    indicators[question.indicator] = { total: current.total + score, count: current.count + 1 };
    return indicators;
  }, {});

const summarizeIndicators = (indicators) =>
  Object.entries(indicators)
    .map(([id, value]) => ({ id, score: Math.round((value.total / (value.count * 5)) * 100) }))
    .sort((a, b) => a.score - b.score);

const indicatorLabels = {
  cognitive_overload: "Cognitive overload may be present",
  workflow_friction: "Workflow friction may be present",
  trust_sensitivity: "Trust and transparency matter here",
  learning_preference: "Learning preferences are important",
  adoption_barrier: "Adoption may need extra support",
  support_need: "Support needs should be planned",
  growth_potential: "Long-term growth potential is present",
  environmental_barrier: "Environmental barriers may be affecting progress",
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
        ? "This area looks fairly supported."
        : phaseScores[phase.id] >= 55
          ? "This area may work better with clearer support."
          : "This area may need simplification before adding AI or a new tool.",
  }));

// Recommendations are generated from the same result data used for on-screen output and email templates.
const getRecommendation = (assessmentId, score, phaseScores = {}, indicatorSummary = []) => {
  const copy = contextCopy[assessmentId] || contextCopy.business;
  const profile = getReadinessLevel(score);
  const topIndicator = indicatorSummary[0]?.id;

  const recommendations = [
    `Start with one small part of the ${copy.setting} instead of changing everything at once.`,
    `Use the person's preferred learning style and give time to practice before expecting full use.`,
    `Make privacy, human help, and the reason for each AI suggestion easy to see.`,
  ];

  if (topIndicator === "cognitive_overload") {
    recommendations.unshift("Reduce the number of steps, choices, or interruptions before adding another tool.");
  }
  if (topIndicator === "trust_sensitivity") {
    recommendations.unshift("Explain how the tool works and who can review or correct it.");
  }
  if (topIndicator === "workflow_friction") {
    recommendations.unshift("Fix the confusing part of the routine before asking people to rely on AI.");
  }

  return {
    profile: profile.label,
    description: profileDescriptions[profile.label],
    recommendations: [...new Set(recommendations)].slice(0, 4),
    nextStep: `Choose one low-pressure task and review it with ${copy.support}.`,
    barrier: indicatorSummary[0] ? indicatorLabels[indicatorSummary[0].id] : "No major barrier stood out.",
    layerSummary: getLayerSummary(phaseScores),
  };
};

const buildAssessmentResult = (assessment, responses, participant = {}) => {
  const score = calculateScore(responses, assessment.questions);
  const readiness = getReadinessLevel(score);
  const phaseScores = calculatePhaseScores(assessment, responses);
  const indicatorSummary = summarizeIndicators(collectIndicators(assessment, responses));
  const recommendation = getRecommendation(assessment.id, score, phaseScores, indicatorSummary);

  return {
    assessmentId: assessment.id,
    assessmentTitle: assessment.title,
    version: assessment.version,
    submittedAt: new Date().toISOString(),
    participant,
    responses,
    score,
    readinessLevel: readiness.label,
    readinessTone: readiness.tone,
    phaseScores,
    indicators: indicatorSummary,
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
      body: `Hi ${name},\n\nThank you for completing the ${result.assessmentTitle}.\n\nReadiness profile: ${result.recommendation.profile}\n\n${result.recommendation.description}\n\nTop recommendations:\n${result.recommendation.recommendations.map((item) => `- ${item}`).join("\n")}\n\nNext step: ${result.recommendation.nextStep}\n\nFor follow-up support, reply to this message or contact CEAM+ directly.\n`,
    };
  },
  admin(result) {
    return {
      to: "briggsfaye@icloud.com",
      subject: `New CEAM+ Assessment: ${result.assessmentTitle}`,
      body: `Client: ${result.participant.firstName} ${result.participant.lastName}\nEmail: ${result.participant.email}\nPhone: ${result.participant.phone || "Not provided"}\nOrganization: ${result.participant.organization || "Not provided"}\nAssessment: ${result.assessmentTitle}\nSubmitted: ${result.submittedAt}\nProfile: ${result.recommendation.profile}\nMain barrier: ${result.recommendation.barrier}\nTop support needs: ${result.profileTags.join(", ")}\n\nResponses:\n${Object.entries(result.responses).map(([key, value]) => `${key}: ${value}`).join("\n")}`,
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
            (option, optionIndex) => `
              <label class="choice-option">
                <input type="radio" name="${question.id}" value="${option}" ${optionIndex === 0 ? "checked" : ""}>
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
      responses[question.id] = panel.querySelector(`input[name="${question.id}"]:checked`)?.value || question.options[0];
    } else {
      responses[question.id] = Number(panel.querySelector(`[name="${question.id}"]`)?.value || 3);
    }
    const note = panel.querySelector(`[name="${question.id}_note"]`)?.value.trim();
    if (note) responses[`${question.id}_note`] = note;
    const followUp = panel.querySelector(`[name="${question.id}_followup"]:checked`)?.value;
    if (followUp) responses[`${question.id}_followup`] = followUp;
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
  const selected = wrapper.querySelector(`input[name="${question.id}"]:checked`)?.value;
  const followUp = wrapper.querySelector("[data-follow-up]");
  const shouldShow = question.followUp.when.includes(selected);
  followUp.hidden = !shouldShow;
  followUp.innerHTML = shouldShow
    ? `
      <p>${question.followUp.label}</p>
      <div class="choice-list compact">
        ${question.followUp.options
          .map(
            (option, index) => `
              <label class="choice-option">
                <input type="radio" name="${question.id}_followup" value="${option}" ${index === 0 ? "checked" : ""}>
                <span>${option}</span>
              </label>
            `
          )
          .join("")}
      </div>
    `
    : "";
};

const renderResult = (resultBox, result) => {
  resultBox.hidden = false;
  resultBox.className = `guided-result ${result.readinessTone}`;
  resultBox.innerHTML = `
    <div class="result-heading">
      <span>${result.recommendation.profile}</span>
      <strong>${result.score}% support readiness</strong>
    </div>
    <p>${result.recommendation.description}</p>
    <div class="profile-tags">
      ${result.profileTags.map((tag) => `<span>${tag}</span>`).join("")}
    </div>
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
    <div>
      <h4>Helpful next steps</h4>
      <ul>${result.recommendation.recommendations.map((item) => `<li>${item}</li>`).join("")}</ul>
      <p><strong>Suggested next step:</strong> ${result.recommendation.nextStep}</p>
      <p class="email-note">Email templates were prepared for the client and CEAM+ admin. Connect an email service to send them automatically.</p>
    </div>
  `;
};

const updateGuidedAssessment = (panel, assessment) => {
  const responses = getResponsesFromPanel(panel, assessment);
  const result = buildAssessmentResult(assessment, responses);
  const answered = Object.values(responses).filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((answered / assessment.questions.length) * 100));
  const score = panel.querySelector("[data-score]");
  const progress = panel.querySelector("[data-progress]");
  const progressText = panel.querySelector("[data-progress-text]");
  const progressBar = panel.querySelector(".guided-progress");
  const resultBox = panel.querySelector("[data-result]");

  score.textContent = `${result.score}%`;
  progress.style.width = `${progressPercent}%`;
  progressBar.setAttribute("aria-valuenow", progressPercent);
  progressText.textContent = `${Math.min(answered, assessment.questions.length)} of ${assessment.questions.length} responses started`;

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
        <p data-progress-text>0 of ${assessment.questions.length} responses started</p>
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
