const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const assessmentsHtml = fs.readFileSync(path.join(root, "assessments.html"), "utf8");
const applicationsHtml = fs.readFileSync(path.join(root, "applications.html"), "utf8");
const missionHtml = fs.readFileSync(path.join(root, "mission.html"), "utf8");
const workflowHtml = fs.readFileSync(path.join(root, "workflow.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

const sandbox = {
  console,
  FormData: class {},
  window: {
    addEventListener() {},
    fetch() {
      return Promise.resolve({ status: 200 });
    },
    matchMedia() {
      return { matches: false };
    },
  },
  document: {
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return {
        className: "",
        dataset: {},
        hidden: false,
        innerHTML: "",
        setAttribute() {},
        appendChild() {},
        addEventListener() {},
        querySelector() {
          return {
            appendChild() {},
          };
        },
        querySelectorAll() {
          return [];
        },
      };
    },
  },
};

sandbox.globalThis = sandbox;
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;

vm.runInNewContext(script, sandbox);

const api = sandbox.window.CEAMAssessments;
const expectedAssessmentIds = ["personal", "business", "education", "healthcare", "rehabilitation"];
const expectedPhaseIds = ["cognitive", "trust", "adoption", "plus", "environment"];

assert(api, "script exposes CEAMAssessments API");
[
  "assessments",
  "buildZapierAssessmentFields",
  "buildZapierSupportFields",
  "buildAssessmentResult",
  "calculatePhaseScores",
  "calculateScore",
  "emailTemplates",
  "formatResponsesForEmail",
  "getAssessmentById",
  "getReadinessLevel",
  "getRecommendation",
  "phases",
  "renderAssessment",
  "renderPhase",
  "renderQuestion",
  "sendAssessmentEmails",
  "sendSupportRequest",
].forEach((key) => assert(key in api, `${key} is exposed`));

assert.strictEqual(api.assessments.length, 5, "five assessment contexts are defined");
assert.strictEqual(JSON.stringify(api.assessments.map((assessment) => assessment.id)), JSON.stringify(expectedAssessmentIds));
assert.strictEqual(JSON.stringify(api.phases.map((phase) => phase.id)), JSON.stringify(expectedPhaseIds));

api.assessments.forEach((assessment) => {
  assert(assessment.version, `${assessment.id} has a version`);
  assert(assessment.questions.length >= 25, `${assessment.id} has detailed behavior questions`);
  assert.strictEqual(JSON.stringify(assessment.phases), JSON.stringify(expectedPhaseIds), `${assessment.id} covers each layer`);

  const ids = new Set();
  assessment.questions.forEach((question) => {
    assert(question.id, `${assessment.id} question has an id`);
    assert(!ids.has(question.id), `${question.id} is unique`);
    ids.add(question.id);
    assert(expectedPhaseIds.includes(question.phase), `${question.id} uses a known layer`);
    assert(["scale", "choice"].includes(question.type), `${question.id} uses a supported input type`);
    assert(question.label.length < 130, `${question.id} is short enough to read comfortably`);
    assert(!/\bdiagnos|disorder|evaluated|tested|interrogated\b/i.test(question.label), `${question.id} avoids diagnostic wording`);
    if (question.type === "choice") {
      assert(question.options.length >= 4, `${question.id} has meaningful choices`);
    }
  });
});

const makeResponses = (assessment, mode) =>
  Object.fromEntries(
    assessment.questions.map((question) => {
      if (question.type === "choice") {
        const scores = question.score || question.options.map(() => 3);
        const bestIndex = scores.indexOf(Math.max(...scores));
        const worstIndex = scores.indexOf(Math.min(...scores));
        return [question.id, [question.options[mode === "low" ? worstIndex : bestIndex]]];
      }
      if (mode === "low") return [question.id, question.reverse ? 5 : 0];
      return [question.id, question.reverse ? 0 : 5];
    })
  );

const personal = api.getAssessmentById("personal");
const business = api.getAssessmentById("business");
const education = api.getAssessmentById("education");
const healthcare = api.getAssessmentById("healthcare");
const rehab = api.getAssessmentById("rehabilitation");
assert(personal && business && education && healthcare && rehab, "key assessments can be selected");

const lowScore = api.calculateScore(makeResponses(business, "low"), business.questions);
const highScore = api.calculateScore(makeResponses(business, "high"), business.questions);
assert(lowScore < 55, "low-support responses produce a lower score");
assert(highScore > 75, "well-supported responses produce a high score");

const result = api.buildAssessmentResult(rehab, makeResponses(rehab, "high"), {
  firstName: "Faye",
  lastName: "Briggs",
  email: "faye@example.com",
  phone: "555-0100",
  organization: "CEAM+",
});

assert.strictEqual(result.assessmentId, "rehabilitation");
assert.strictEqual(result.answeredCount, rehab.questions.length, "result stores answered question count");
assert(result.profileTags.length >= 1, "result includes readiness profile tags");
assert(result.recommendation.layerSummary.length === expectedPhaseIds.length, "result includes layer summary");
assert(result.recommendation.layerNarratives.length === expectedPhaseIds.length, "result includes detailed layer narratives");
assert(result.recommendation.observations.length >= 3, "result includes personalized observations");
assert(result.recommendation.barriers.length >= 3, "result includes personalized barriers");
assert(result.recommendation.recommendations.length >= 3, "result includes recommendations");
assert(result.recommendation.implementationPath.length >= 3, "result includes AI implementation path");
assert(result.recommendation.implementationPlan.length === 3, "result includes a three-week plan");
assert(result.recommendation.aiTools.length >= 1, "result includes AI tool suggestions");
assert(result.recommendation.startingPoint.task.includes("Start with"), "result includes category starting point");
assert(result.recommendation.supportLevel.label, "result includes support level");
assert(result.indicators.length >= 1, "result includes behavior indicators");
assert(result.answerAnalysis.selectedAnswerCount >= 1, "result analyzes selected answers");
assert(Array.isArray(result.answerAnalysis.insights), "result includes answer insights");

assert(/student|administrator|staff member/i.test(education.description), "education assessment names a student or administrator");
assert(
  education.questions.some((question) => /administrators|school setting|student/i.test(question.label)),
  "education questions are aimed at students and administrators"
);
assert(
  education.questions.some((question) => question.id === "education_admin_ai_tasks"),
  "education assessment includes an administration-focused AI task question"
);
assert(
  education.questions.some((question) => question.id === "education_student_ai_tasks"),
  "education assessment includes a student-focused AI task question"
);
assert(
  education.questions.some((question) => /day-to-day education tasks/i.test(question.label)),
  "education assessment asks about day-to-day education tasks"
);
assert(
  education.questions.some((question) => question.options?.includes("Grading or feedback")),
  "education assessment includes grading and feedback tasks"
);
assert(
  education.questions.some((question) => question.options?.includes("LMS updates")),
  "education assessment includes LMS tasks"
);
assert(
  education.questions.some((question) => question.options?.includes("Attendance tracking")),
  "education assessment includes attendance tasks"
);
const educationQuestionCopy = JSON.stringify(education.questions);
assert(!/\bpeople\b/i.test(educationQuestionCopy), "education assessment avoids broad people wording");
assert(!/\bstudents\b/i.test(educationQuestionCopy), "education assessment uses student instead of students");
assert(
  !/students or administrators|students or staff|students, administrators/i.test(educationQuestionCopy),
  "education assessment avoids plural role groups in question wording"
);
assert(
  education.questions.some((question) => /\byou\b|a student|an administrator|administrative/i.test(question.label)),
  "education assessment speaks to one student or administrator at a time"
);

assert(
  personal.questions.some((question) => question.options?.includes("Bills or budgeting")),
  "personal assessment includes daily-life money and bill tasks"
);
assert(
  personal.questions.some((question) => question.id === "personal_personal_routine_barriers"),
  "personal assessment includes personal routine barriers"
);
assert(
  business.questions.some((question) => question.options?.includes("Invoices") && question.options?.includes("Estimates")),
  "business assessment includes invoice and estimate tasks"
);
assert(
  business.questions.some((question) => question.id === "business_business_staff_communication"),
  "business assessment includes staff communication breakdowns"
);
assert(
  business.questions.some((question) => question.options?.includes("Customer details") && question.options?.includes("Employee hours")),
  "business assessment includes operational data entry tasks"
);
assert(
  business.questions.some((question) => question.id === "business_business_current_systems"),
  "business assessment asks what company systems are already used"
);
assert(
  business.questions.some((question) => question.options?.includes("QuickBooks or accounting software")),
  "business assessment includes non-AI business tools"
);
assert(script.includes("Completing customer requests"), "business wording uses completing customer requests");
assert(!script.includes("Competing customer demands"), "old competing customer demands wording is removed");
assert(
  healthcare.questions.some((question) => question.options?.includes("Patient messages") && question.options?.includes("Insurance forms")),
  "healthcare assessment includes patient communication and insurance tasks"
);
assert(
  healthcare.questions.some((question) => question.id === "healthcare_healthcare_patient_followup"),
  "healthcare assessment includes patient follow-up questions"
);
assert(
  healthcare.questions.some((question) => question.options?.includes("Clinical summaries") && question.options?.includes("Care plan drafts")),
  "healthcare assessment includes human review for care-specific AI work"
);
assert(
  rehab.questions.some((question) => question.options?.includes("Coping plans") && question.options?.includes("Caregiver communication")),
  "rehabilitation assessment includes support routines and caregiver communication"
);
assert(
  rehab.questions.some((question) => question.id === "rehabilitation_rehab_reminder_fit"),
  "rehabilitation assessment includes reminder fit and stress questions"
);
assert(
  rehab.questions.some((question) => question.options?.includes("Choice and control")),
  "rehabilitation assessment keeps choice and control visible"
);

const aiUseQuestion = business.questions.find((question) => question.id === "business_current_ai_tools");
assert(aiUseQuestion, "assessment asks what AI tools are already used");
assert(aiUseQuestion.options.includes("I do not use AI tools yet"), "AI use question includes no-current-use option");

const aiUseResult = api.buildAssessmentResult(
  business,
  {
    [aiUseQuestion.id]: ["ChatGPT or another AI chat tool", "Email writing or reply suggestions"],
  },
  {}
);
assert(aiUseResult.answerAnalysis.currentAiTools.includes("ChatGPT or another AI chat tool"), "analysis includes selected AI tools");
assert(
  aiUseResult.recommendation.implementationPath.some((step) => /already being used/i.test(step)),
  "implementation path uses current AI tool answers"
);

const clientEmail = api.emailTemplates.client(result);
const adminEmail = api.emailTemplates.admin(result);
const readableAnswers = api.formatResponsesForEmail(result);
const zapierFields = api.buildZapierAssessmentFields(result);
const supportRequest = {
  firstName: "Faye",
  lastName: "Briggs",
  email: "faye@example.com",
  phone: "555-0100",
  organization: "CEAM+",
  supportOption: "I want a guided walkthrough",
  mainGoal: "Start safely",
  biggestChallenge: "Too many options",
  bestTime: "Afternoons",
};
const supportClientEmail = api.emailTemplates.supportClient(result, supportRequest);
const supportAdminEmail = api.emailTemplates.supportAdmin(result, supportRequest);
const supportZapierFields = api.buildZapierSupportFields(result, supportRequest);
assert(clientEmail.to === "faye@example.com", "client email uses participant email");
assert(adminEmail.to === "briggsfaye@icloud.com", "admin email goes to CEAM+ owner");
assert(clientEmail.fromName === "ClearPathway Systems", "client email includes ClearPathway sender name");
assert(adminEmail.fromName === "ClearPathway Systems", "admin email includes ClearPathway sender name");
assert(supportClientEmail.fromName === "ClearPathway Systems", "support client email includes ClearPathway sender name");
assert(supportAdminEmail.fromName === "ClearPathway Systems", "support admin email includes ClearPathway sender name");
assert(clientEmail.subject.includes("ClearPathway Systems"), "client email subject includes ClearPathway branding");
assert(adminEmail.subject.includes("ClearPathway Systems"), "admin email subject includes ClearPathway branding");
assert(clientEmail.body.includes("ClearPathway Systems | CEAM+"), "client email includes ClearPathway signature");
assert(adminEmail.body.includes("ClearPathway Systems | CEAM+"), "admin email includes ClearPathway signature");
assert(clientEmail.body.includes("Thank you for completing your CEAM+ assessment with ClearPathway Systems."), "client email opening names ClearPathway Systems");
assert(/Readiness profile/i.test(clientEmail.body), "client email includes profile");
assert(/Full assessment responses|Responses/i.test(adminEmail.body), "admin email includes responses");
assert(/Your full answers/i.test(clientEmail.body), "client email includes the participant's full answers");
assert(clientEmail.body.includes(rehab.questions[0].label), "client email uses readable question labels");
assert(adminEmail.body.includes(rehab.questions[0].label), "admin email uses readable question labels");
assert(readableAnswers.includes(rehab.questions[0].label), "response formatter uses question labels");
assert(zapierFields.clientEmailTo === "faye@example.com", "Zapier fields include the client email recipient");
assert(zapierFields.adminEmailTo === "briggsfaye@icloud.com", "Zapier fields include the admin email recipient");
assert(zapierFields.clientEmailFromName === "ClearPathway Systems", "Zapier fields include client sender display name");
assert(zapierFields.adminEmailFromName === "ClearPathway Systems", "Zapier fields include admin sender display name");
assert(zapierFields.fullAnswers.includes(rehab.questions[0].label), "Zapier fields include readable full answers");
assert(zapierFields.score === result.score, "Zapier fields include the assessment score");
assert(zapierFields.resultId === result.resultId, "Zapier fields include the result ID");
assert(supportZapierFields.supportClientEmailFromName === "ClearPathway Systems", "support Zapier fields include client sender display name");
assert(supportZapierFields.supportAdminEmailFromName === "ClearPathway Systems", "support Zapier fields include admin sender display name");
assert(/Recommended AI steps/i.test(clientEmail.body), "client email includes implementation steps");
assert(/AI tools already used/i.test(clientEmail.body), "client email includes current AI use");
assert(supportAdminEmail.body.includes("Support option"), "support admin email includes selected option");
assert(script.includes("https://hooks.zapier.com/hooks/catch/27676700/4oizoy6/"), "Zapier webhook is configured");
assert(script.includes('type="checkbox" name="${question.id}"'), "assessment choice questions allow multiple answers");
assert(!script.includes('type="radio" name="${question.id}"'), "assessment choice questions are not single-select radios");
assert(script.includes('type="checkbox" name="supportOption"'), "guided implementation options allow multiple selections");
assert(!script.includes('type="radio" name="supportOption"'), "guided implementation options are not single-select radios");
assert(script.includes('formData.getAll("supportOption")'), "support request collects every selected support option");
assert(script.includes("Fear of something going wrong"), "tool concern wording uses softer language");
assert(!script.includes("Fear of breaking something"), "old tool concern wording is removed");
assert(
  applicationsHtml.includes("Understanding how people and organizations adopt, resist, and sustain change in an increasingly AI-driven world."),
  "framework page preserves the stable CEAM+ research identity"
);
assert(applicationsHtml.includes("Foundational Anchors"), "framework page includes foundational anchors");
assert(applicationsHtml.includes("Research Library"), "framework page includes research library");
assert(applicationsHtml.includes("Explorations"), "framework page includes explorations");
assert(applicationsHtml.includes("Research Agenda"), "framework page includes research agenda");
assert(applicationsHtml.includes("Conditions for Change"), "framework page introduces Conditions for Change");
["Time", "Resources", "Cognitive Capacity", "Emotional Readiness", "Social Environment", "Habits & Routine", "Agency"].forEach((dimension) =>
  assert(applicationsHtml.includes(dimension), `Conditions for Change includes ${dimension}`)
);
assert(applicationsHtml.includes("Agency is not the absence of barriers"), "framework page includes the agency definition");
assert(applicationsHtml.includes("Conditions for Change &rarr; Agency &rarr; Choices &rarr; Actions &rarr; Learning &rarr; Adaptation &rarr; Sustained Change"), "framework page includes the agency sequence");
assert(applicationsHtml.includes("Level 1 - Timeless Questions"), "research agenda includes timeless questions");
assert(applicationsHtml.includes("Level 2 - Decade Questions"), "research agenda includes decade questions");
assert(applicationsHtml.includes("Level 3 - Emerging Questions"), "research agenda includes emerging questions");
assert(missionHtml.includes("The purpose of CEAM+ is understanding before intervention."), "mission page preserves the CEAM+ philosophy");
assert(workflowHtml.includes("Conditions for Change"), "workflow begins from conditions");
assert(script.includes("Conditions for Change Layer"), "assessment language includes Conditions for Change");
assert(script.includes("Agency and Choice Layer"), "assessment language treats agency as a defining concept");
assert(script.includes("CEAM+ does not tell people what to choose"), "assessment results preserve the CEAM+ choice philosophy");

const unanswered = api.buildAssessmentResult(business, {}, {});
assert.strictEqual(unanswered.score, 0, "unanswered choice questions do not create a fake default score");
assert.strictEqual(unanswered.answeredCount, 0, "unanswered result tracks zero answered questions");

assert(assessmentsHtml.includes("data-organization-select"), "assessment page keeps dropdown selector");
assert(assessmentsHtml.includes("data-start-assessment"), "assessment page keeps start assessment button");
assert(assessmentsHtml.includes("data-assessment-panel"), "assessment page keeps dynamic assessment panel");
assert(html.includes("assessments.html"), "home page links to the assessment page");
assert(assessmentsHtml.includes("script.js?v=20260603-clearpathway-email-branding"), "assessment page cache-busts the redesigned script");
assert(script.includes('min="0" max="5" value="0"'), "sliders use a 0 to 5 scale");
assert(script.includes("Selected: 0"), "slider output has clear selected value text");
