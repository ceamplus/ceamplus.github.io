const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-contact-form]");
const statusMessage = document.querySelector("[data-form-status]");
const organizationSelect = document.querySelector("[data-organization-select]");
const startAssessmentButton = document.querySelector("[data-start-assessment]");
const assessmentPanel = document.querySelector("[data-assessment-panel]");
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const phases = [
  {
    id: "assess_context",
    title: "Assess Context",
    description: "Name the goal, people affected, practical limits, information needs, and signs that people are ready.",
  },
  {
    id: "map_cognitive_load",
    title: "Map Cognitive Load",
    description: "Notice where people feel overwhelmed, confused, rushed, or unsure.",
  },
  {
    id: "apply_ethical_checks",
    title: "Apply Ethical Checks",
    description: "Make risks, privacy needs, fairness, human review, and help paths visible.",
  },
  {
    id: "pilot_and_learn",
    title: "Pilot and Learn",
    description: "Try AI in a small way, listen to feedback, measure human impact, and improve the plan.",
  },
];

const phaseIds = phases.map((phase) => phase.id);

const readinessLevels = [
  {
    max: 49,
    level: "Needs Structure",
    tone: "low",
  },
  {
    max: 74,
    level: "Developing Readiness",
    tone: "medium",
  },
  {
    max: 100,
    level: "Ready for Guided Implementation",
    tone: "high",
  },
];

const recommendationTemplates = {
  business: {
    low: {
      nextStep: "Begin with one work task. Clarify the goal, affected people, data source, and readiness signal before testing AI.",
      risk: "The main risk is hidden workload. AI may add pressure if the task owner, oversight path, or decision rule is unclear.",
      implementation: "Run a small pilot with one owner, one feedback channel, and one pause rule. Review whether the tool reduces effort before expanding.",
    },
    medium: {
      nextStep: "Choose the workflow with the clearest value. Define one outcome that would show lower overload or better decision quality.",
      risk: "Adoption may stall if people do not know when to trust, question, or override AI output.",
      implementation: "Use a short pilot guide. Include the purpose, data limits, review role, feedback method, and adjustment schedule.",
    },
    high: {
      nextStep: "Move into guided implementation for one work or business use case. Keep ownership, oversight, and feedback visible.",
      risk: "Scaling too quickly can hide confusion from quieter users or people with heavier workload pressure.",
      implementation: "Use CEAM+ checkpoint reviews to monitor workload, communication friction, operational risk, and stakeholder confidence.",
    },
  },
  education: {
    low: {
      nextStep: "Start with the learning goal. Identify the learner, access need, privacy limit, and support plan before AI is introduced.",
      risk: "The main risk is confusion. Students or faculty may not know what AI use is allowed or how to ask for help.",
      implementation: "Use a low-stakes pilot. Provide examples, privacy guidance, accessibility support, and a feedback channel.",
    },
    medium: {
      nextStep: "Pilot one learning-support activity. Define the learning outcome and the support format before using AI.",
      risk: "Readiness may vary by learner. Some people need examples, checklists, discussion, or practice before AI feels safe.",
      implementation: "Use short feedback cycles during the term. Revise instructions, examples, accessibility supports, and communication norms.",
    },
    high: {
      nextStep: "Move toward guided implementation across a course, program, or personal learning goal.",
      risk: "High readiness can still create uneven experiences if privacy, accessibility, and academic integrity expectations are not visible.",
      implementation: "Schedule recurring CEAM+ reviews for learning impact, faculty workload, student confidence, and ethical use.",
    },
  },
  healthcare: {
    low: {
      nextStep: "Start with one low-risk care task. Clarify the goal, user, privacy limit, and oversight owner before AI use.",
      risk: "The main risk is unsafe ambiguity. Patient trust can drop when privacy limits, clinical oversight, or escalation rules are not visible.",
      implementation: "Run a bounded pilot with a clear human reviewer, privacy rule, escalation path, and feedback check.",
    },
    medium: {
      nextStep: "Test one workflow with the people who will use it. Confirm the oversight rule before broader use.",
      risk: "Privacy or accountability may fail during busy moments if the clinical review process is not practiced.",
      implementation: "Use realistic scenarios to review usability, documentation burden, escalation behavior, and patient trust.",
    },
    high: {
      nextStep: "Begin guided implementation with safety checks, privacy controls, and clinical oversight visible.",
      risk: "A tool can be accurate and still increase stress, patient confusion, or documentation burden.",
      implementation: "Track patient trust, staff workload, privacy fit, risk signals, and human impact throughout the pilot.",
    },
  },
  rehabilitation: {
    low: {
      nextStep: "Start with one support goal. Talk through the person's needs, privacy concerns, comfort level, and preferred way to receive help.",
      risk: "The main risk is that the person may feel pushed, confused, or watched instead of supported.",
      implementation: "Try one small support tool with a clear pause plan, a trusted helper, and a simple way for the person to share how it feels.",
    },
    medium: {
      nextStep: "Choose one daily task where AI support may help. Match the support to the person's communication style and learning needs.",
      risk: "Support may fail if reminders, tracking, or helper involvement feels stressful in real life.",
      implementation: "Review comfort, progress, stress, and feedback before adding more AI support.",
    },
    high: {
      nextStep: "Move forward with one clearly explained support plan. Keep the person's choices visible at every step.",
      risk: "Even helpful tools can become frustrating if the support stops fitting the person's needs.",
      implementation: "Use regular check-ins to adjust reminders, instructions, helper roles, and support choices.",
    },
  },
};

const assessments = [
  {
    id: "business",
    version: "1.0",
    title: "Work / Business AI Readiness Assessment",
    icon: "briefcase",
    description:
      "Evaluate AI opportunities, job fit, workflow efficiency, personal capacity, and stakeholder readiness before scaling.",
    phases: phaseIds,
    recommendations: recommendationTemplates.business,
    questions: [
      { id: "business_context_work_goal", phase: "assess_context", label: "Can the business goal for AI be named?", low: "Unclear goal", high: "Clear goal" },
      { id: "business_context_affected_employees", phase: "assess_context", label: "Can the employees affected by AI be named?", low: "Unclear employees", high: "Clear employees" },
      { id: "business_context_affected_customers", phase: "assess_context", label: "Can the customers affected by AI be named?", low: "Unclear customers", high: "Clear customers" },
      { id: "business_context_workflow_constraint", phase: "assess_context", label: "Can you tell what parts of the job might make AI hard to use?", low: "Hard to tell", high: "Easy to tell" },
      { id: "business_context_data_source", phase: "assess_context", label: "Can you tell what information AI would need?", low: "Unclear info", high: "Clear info" },
      { id: "business_context_readiness_signal", phase: "assess_context", label: "Can you tell if people are ready to try AI?", low: "Hard to tell", high: "Easy to tell" },
      { id: "business_load_overload_source", phase: "map_cognitive_load", label: "Can busy points in the workday be named?", low: "Not named", high: "Clearly named" },
      { id: "business_load_repeated_approvals", phase: "map_cognitive_load", label: "Do repeated approvals slow people down?", low: "Not clear", high: "Very clear" },
      { id: "business_load_unclear_priorities", phase: "map_cognitive_load", label: "Do unclear priorities create stress?", low: "Not clear", high: "Very clear" },
      { id: "business_load_system_switching", phase: "map_cognitive_load", label: "Do people get frustrated switching between apps?", low: "Not clear", high: "Very clear" },
      { id: "business_load_urgent_messages", phase: "map_cognitive_load", label: "Do urgent messages interrupt important work?", low: "Not clear", high: "Very clear" },
      { id: "business_load_mental_stress", phase: "map_cognitive_load", label: "Can stressful tasks be named?", low: "Not named", high: "Clearly named" },
      { id: "business_load_written_training", phase: "map_cognitive_load", label: "Can step-by-step training be provided?", low: "Not available", high: "Ready to use" },
      { id: "business_load_visual_examples", phase: "map_cognitive_load", label: "Can visual examples be provided?", low: "Not available", high: "Ready to use" },
      { id: "business_load_live_practice", phase: "map_cognitive_load", label: "Can live practice be provided?", low: "Not available", high: "Ready to use" },
      { id: "business_load_private_testing", phase: "map_cognitive_load", label: "Can people test the tool privately before rollout?", low: "No private test", high: "Private test ready" },
      { id: "business_load_learning_preferences", phase: "map_cognitive_load", label: "Can training fit different learning needs?", low: "One-size training", high: "Flexible training" },
      { id: "business_ethics_customer_privacy", phase: "apply_ethical_checks", label: "Are customer privacy risks reviewed before AI testing?", low: "Not reviewed", high: "Reviewed" },
      { id: "business_ethics_employee_privacy", phase: "apply_ethical_checks", label: "Are employee privacy risks reviewed before AI testing?", low: "Not reviewed", high: "Reviewed" },
      { id: "business_ethics_vendor_privacy", phase: "apply_ethical_checks", label: "Are vendor privacy risks reviewed before AI testing?", low: "Not reviewed", high: "Reviewed" },
      { id: "business_ethics_operational_risk", phase: "apply_ethical_checks", label: "Are real work risks reviewed before AI testing?", low: "Not reviewed", high: "Reviewed" },
      { id: "business_ethics_communication_style", phase: "apply_ethical_checks", label: "Are different communication styles considered during rollout?", low: "Not considered", high: "Considered" },
      { id: "business_ethics_decision_explanation", phase: "apply_ethical_checks", label: "Do people understand how AI suggestions are made?", low: "Unclear", high: "Clear" },
      { id: "business_ethics_ai_ability", phase: "apply_ethical_checks", label: "Do people understand what AI can do?", low: "Unclear", high: "Clear" },
      { id: "business_ethics_ai_limits", phase: "apply_ethical_checks", label: "Do people understand what AI cannot do?", low: "Unclear", high: "Clear" },
      { id: "business_ethics_oversight_owner", phase: "apply_ethical_checks", label: "Do people know who checks AI output?", low: "No reviewer", high: "Clear reviewer" },
      { id: "business_ethics_help_path", phase: "apply_ethical_checks", label: "Do people know where to ask for help?", low: "Unclear help", high: "Clear help" },
      { id: "business_pilot_prior_improvement", phase: "pilot_and_learn", label: "Have past work improvement attempts been discussed?", low: "Not discussed", high: "Discussed" },
      { id: "business_pilot_successful_change", phase: "pilot_and_learn", label: "Has the team discussed what made work smoother?", low: "Not discussed", high: "Discussed" },
      { id: "business_pilot_failed_change", phase: "pilot_and_learn", label: "Has the team discussed what failed to make work easier?", low: "Not discussed", high: "Discussed" },
      { id: "business_pilot_employee_frustrations", phase: "pilot_and_learn", label: "Have employees shared current work frustrations?", low: "Not shared", high: "Clearly shared" },
      { id: "business_pilot_support_contact", phase: "pilot_and_learn", label: "Is there a clear support contact during the AI test?", low: "No contact", high: "Clear contact" },
      { id: "business_pilot_confusion_plan", phase: "pilot_and_learn", label: "Is there a plan for employee confusion during the AI test?", low: "No plan", high: "Clear plan" },
      { id: "business_pilot_pause_plan", phase: "pilot_and_learn", label: "Is there a plan to pause work if overload increases?", low: "No plan", high: "Clear plan" },
      { id: "business_pilot_technical_issues", phase: "pilot_and_learn", label: "Is there a process for technical issues during testing?", low: "No process", high: "Clear process" },
      { id: "business_pilot_employee_feedback", phase: "pilot_and_learn", label: "Can employee feedback be collected during the AI test?", low: "No channel", high: "Clear channel" },
      { id: "business_pilot_customer_feedback", phase: "pilot_and_learn", label: "Can customer feedback be collected during the AI test?", low: "No channel", high: "Clear channel" },
      { id: "business_pilot_human_impact", phase: "pilot_and_learn", label: "Can feedback show how AI affects people?", low: "Hard to show", high: "Easy to show" },
      { id: "business_pilot_process_revision", phase: "pilot_and_learn", label: "Can work steps be changed after feedback?", low: "Hard to change", high: "Easy to change" },
      { id: "business_pilot_training_update", phase: "pilot_and_learn", label: "Can training materials be updated after feedback?", low: "Hard to update", high: "Easy to update" },
      { id: "business_pilot_revision", phase: "pilot_and_learn", label: "Can instructions be improved after feedback?", low: "Hard to improve", high: "Easy to improve" },
    ],
  },
  {
    id: "education",
    version: "1.0",
    title: "Learning / Education AI Readiness Assessment",
    icon: "book",
    description:
      "Support responsible learning tools, study habits, faculty adoption, accessibility, and student-centered safeguards.",
    phases: phaseIds,
    recommendations: recommendationTemplates.education,
    questions: [
      { id: "education_context_learning_goal", phase: "assess_context", label: "Can the learning goal be named?", low: "Unclear goal", high: "Clear goal" },
      { id: "education_context_affected_users", phase: "assess_context", label: "Can the students affected by AI be named?", low: "Unclear students", high: "Clear students" },
      { id: "education_context_affected_faculty", phase: "assess_context", label: "Can the teachers affected by AI be named?", low: "Unclear teachers", high: "Clear teachers" },
      { id: "education_context_accessibility_needs", phase: "assess_context", label: "Can student access needs be named?", low: "Unclear needs", high: "Clear needs" },
      { id: "education_context_data_conditions", phase: "assess_context", label: "Can you tell what class information AI would use?", low: "Unclear info", high: "Clear info" },
      { id: "education_context_privacy_limits", phase: "assess_context", label: "Can privacy limits be explained?", low: "Unclear limits", high: "Clear limits" },
      { id: "education_context_readiness_signals", phase: "assess_context", label: "Can you tell if the class is ready to try AI?", low: "Hard to tell", high: "Easy to tell" },
      { id: "education_load_faculty_overload", phase: "map_cognitive_load", label: "Can teachers name what feels overwhelming?", low: "Not named", high: "Clearly named" },
      { id: "education_load_student_overload", phase: "map_cognitive_load", label: "Can students name what feels overwhelming?", low: "Not named", high: "Clearly named" },
      { id: "education_load_platform_switching", phase: "map_cognitive_load", label: "Do students get frustrated switching between platforms?", low: "Not clear", high: "Very clear" },
      { id: "education_load_unclear_ai_rules", phase: "map_cognitive_load", label: "Do unclear AI rules confuse students?", low: "Not clear", high: "Very clear" },
      { id: "education_load_assignment_anxiety", phase: "map_cognitive_load", label: "Do assignments create anxiety?", low: "Not clear", high: "Very clear" },
      { id: "education_load_confusing_instructions", phase: "map_cognitive_load", label: "Do too many instructions confuse students?", low: "Not clear", high: "Very clear" },
      { id: "education_load_examples", phase: "map_cognitive_load", label: "Does the learner get examples?", low: "No examples", high: "Clear examples" },
      { id: "education_load_checklists", phase: "map_cognitive_load", label: "Does the learner get checklists?", low: "No checklist", high: "Clear checklist" },
      { id: "education_load_demonstrations", phase: "map_cognitive_load", label: "Does the learner get demonstrations?", low: "No demo", high: "Clear demo" },
      { id: "education_load_discussion_support", phase: "map_cognitive_load", label: "Does the learner get discussion support?", low: "No discussion", high: "Clear support" },
      { id: "education_load_practice_prompts", phase: "map_cognitive_load", label: "Does the learner get practice prompts?", low: "No prompts", high: "Useful prompts" },
      { id: "education_load_student_private_practice", phase: "map_cognitive_load", label: "Can students try AI privately before class use?", low: "No private try", high: "Private try ready" },
      { id: "education_load_teacher_private_practice", phase: "map_cognitive_load", label: "Can teachers try AI privately before class use?", low: "No private try", high: "Private try ready" },
      { id: "education_load_student_questions", phase: "map_cognitive_load", label: "Can students ask questions before using AI?", low: "No question time", high: "Question time ready" },
      { id: "education_load_teacher_questions", phase: "map_cognitive_load", label: "Can teachers ask questions before using AI?", low: "No question time", high: "Question time ready" },
      { id: "education_ethics_privacy", phase: "apply_ethical_checks", label: "Are privacy rules explained before AI use?", low: "Not explained", high: "Explained" },
      { id: "education_ethics_accessibility", phase: "apply_ethical_checks", label: "Are access needs explained before AI use?", low: "Not explained", high: "Explained" },
      { id: "education_ethics_fairness", phase: "apply_ethical_checks", label: "Are fair-use expectations explained before AI use?", low: "Not explained", high: "Explained" },
      { id: "education_ethics_transparency", phase: "apply_ethical_checks", label: "Do students know when AI is being used?", low: "Not clear", high: "Very clear" },
      { id: "education_ethics_bias", phase: "apply_ethical_checks", label: "Are bias concerns explained before AI use?", low: "Not explained", high: "Explained" },
      { id: "education_ethics_attribution", phase: "apply_ethical_checks", label: "Do students know how to cite AI help?", low: "Not clear", high: "Very clear" },
      { id: "education_ethics_academic_integrity", phase: "apply_ethical_checks", label: "Are honesty rules clear before AI use?", low: "Unclear", high: "Clear" },
      { id: "education_pilot_reduce_confusion", phase: "pilot_and_learn", label: "Have teachers discussed what reduced confusion?", low: "Not discussed", high: "Discussed" },
      { id: "education_pilot_improve_feedback", phase: "pilot_and_learn", label: "Have teachers discussed what improved feedback?", low: "Not discussed", high: "Discussed" },
      { id: "education_pilot_support_struggling_learners", phase: "pilot_and_learn", label: "Have teachers discussed what helped struggling learners?", low: "Not discussed", high: "Discussed" },
      { id: "education_pilot_student_confusion_plan", phase: "pilot_and_learn", label: "Is there a plan if AI confuses students?", low: "No plan", high: "Clear plan" },
      { id: "education_pilot_faculty_questions_plan", phase: "pilot_and_learn", label: "Is there a plan if AI increases teacher questions?", low: "No plan", high: "Clear plan" },
      { id: "education_pilot_assignment_support_plan", phase: "pilot_and_learn", label: "Is there a plan if assignment help needs change?", low: "No plan", high: "Clear plan" },
      { id: "education_pilot_pause_plan", phase: "pilot_and_learn", label: "Is there a plan to pause if overload increases?", low: "No plan", high: "Clear plan" },
      { id: "education_pilot_learner_feedback", phase: "pilot_and_learn", label: "Can learner feedback be collected during class?", low: "No channel", high: "Clear channel" },
      { id: "education_pilot_faculty_feedback", phase: "pilot_and_learn", label: "Can teacher feedback be collected during class?", low: "No channel", high: "Clear channel" },
      { id: "education_pilot_human_impact", phase: "pilot_and_learn", label: "Can feedback show how AI affects people?", low: "Hard to show", high: "Easy to show" },
      { id: "education_pilot_revise_instructions", phase: "pilot_and_learn", label: "Can AI instructions be improved after feedback?", low: "Hard to improve", high: "Easy to improve" },
      { id: "education_pilot_revise_examples", phase: "pilot_and_learn", label: "Can examples be improved after feedback?", low: "Hard to improve", high: "Easy to improve" },
      { id: "education_pilot_revise_accessibility", phase: "pilot_and_learn", label: "Can access supports be improved after feedback?", low: "Hard to improve", high: "Easy to improve" },
      { id: "education_pilot_revise_communication", phase: "pilot_and_learn", label: "Can class communication be improved after feedback?", low: "Hard to improve", high: "Easy to improve" },
    ],
  },
  {
    id: "healthcare",
    version: "1.0",
    title: "Health / Care AI Readiness Assessment",
    icon: "cross",
    description:
      "Map personal, clinical, or administrative AI use against privacy, risk, usability, compliance, and accountability needs.",
    phases: phaseIds,
    recommendations: recommendationTemplates.healthcare,
    questions: [
      { id: "healthcare_context_care_goal", phase: "assess_context", label: "Can the care goal be named?", low: "Unclear goal", high: "Clear goal" },
      { id: "healthcare_context_affected_patient", phase: "assess_context", label: "Can the patients affected by AI be named?", low: "Unclear patients", high: "Clear patients" },
      { id: "healthcare_context_affected_staff", phase: "assess_context", label: "Can the staff affected by AI be named?", low: "Unclear staff", high: "Clear staff" },
      { id: "healthcare_context_clinical_constraint", phase: "assess_context", label: "Can you tell what care rules might make AI hard to use?", low: "Hard to tell", high: "Easy to tell" },
      { id: "healthcare_context_data_condition", phase: "assess_context", label: "Can you tell what patient information AI would use?", low: "Unclear info", high: "Clear info" },
      { id: "healthcare_context_readiness_signal", phase: "assess_context", label: "Can you tell if the care team is ready to try AI?", low: "Hard to tell", high: "Easy to tell" },
      { id: "healthcare_load_alert_fatigue", phase: "map_cognitive_load", label: "Do too many alerts wear people down?", low: "Not clear", high: "Very clear" },
      { id: "healthcare_load_documentation_burden", phase: "map_cognitive_load", label: "Does paperwork take too much time?", low: "Not clear", high: "Very clear" },
      { id: "healthcare_load_unclear_help", phase: "map_cognitive_load", label: "Do people know when to ask for help?", low: "Unclear", high: "Clear" },
      { id: "healthcare_load_wellbeing_pressure", phase: "map_cognitive_load", label: "Can staff stress points be named?", low: "Not named", high: "Clearly named" },
      { id: "healthcare_load_training_format", phase: "map_cognitive_load", label: "Can the best training format be named?", low: "Not known", high: "Known" },
      { id: "healthcare_ethics_privacy", phase: "apply_ethical_checks", label: "Are patient privacy rules explained before AI use?", low: "Not explained", high: "Explained" },
      { id: "healthcare_ethics_consent", phase: "apply_ethical_checks", label: "Are patient permission rules explained before AI use?", low: "Not explained", high: "Explained" },
      { id: "healthcare_ethics_oversight_owner", phase: "apply_ethical_checks", label: "Do people know who reviews AI output?", low: "No reviewer", high: "Clear reviewer" },
      { id: "healthcare_ethics_help_path", phase: "apply_ethical_checks", label: "Do people know where to report a concern?", low: "Unclear", high: "Clear" },
      { id: "healthcare_ethics_accountability_rule", phase: "apply_ethical_checks", label: "Do people know who is responsible for final decisions?", low: "Unclear", high: "Clear" },
      { id: "healthcare_pilot_prior_burden_reduction", phase: "pilot_and_learn", label: "Have past burden-reduction attempts been discussed?", low: "Not discussed", high: "Discussed" },
      { id: "healthcare_pilot_pause_on_risk", phase: "pilot_and_learn", label: "Is there a plan to pause if risk increases?", low: "No plan", high: "Clear plan" },
      { id: "healthcare_pilot_staff_feedback", phase: "pilot_and_learn", label: "Can staff feedback be collected during the AI test?", low: "No channel", high: "Clear channel" },
      { id: "healthcare_pilot_patient_trust", phase: "pilot_and_learn", label: "Can patient trust be checked during the AI test?", low: "Not checked", high: "Clearly checked" },
      { id: "healthcare_pilot_refine_plan", phase: "pilot_and_learn", label: "Can the care plan be improved after feedback?", low: "Hard to improve", high: "Easy to improve" },
    ],
  },
  {
    id: "rehabilitation",
    version: "1.0",
    title: "Rehabilitation / Adaptive Support AI Readiness Assessment",
    icon: "path",
    description:
      "Shape support tools around personal goals, daily needs, communication style, and trusted care.",
    phases: phaseIds,
    recommendations: recommendationTemplates.rehabilitation,
    questions: [
      { id: "rehab_context_personal_goal", phase: "assess_context", label: "Can the personal goal be explained clearly?", low: "Unclear goal", high: "Clear goal" },
      { id: "rehab_context_affected_person", phase: "assess_context", label: "Can the person affected by AI support be named?", low: "Unclear person", high: "Clear person" },
      { id: "rehab_context_therapy_barrier", phase: "assess_context", label: "Can therapy needs that may make AI hard be named?", low: "Not named", high: "Clearly named" },
      { id: "rehab_context_work_barrier", phase: "assess_context", label: "Can work needs that may make AI hard be named?", low: "Not named", high: "Clearly named" },
      { id: "rehab_context_daily_life_barrier", phase: "assess_context", label: "Can daily life needs that may make AI hard be named?", low: "Not named", high: "Clearly named" },
      { id: "rehab_context_privacy_concern", phase: "assess_context", label: "Can privacy concerns be named before AI is used?", low: "Not named", high: "Clearly named" },
      { id: "rehab_context_person_ready", phase: "assess_context", label: "Can you tell if the person is ready to try new support tools?", low: "Hard to tell", high: "Easy to tell" },
      { id: "rehab_load_overwhelming_situations", phase: "map_cognitive_load", label: "Can stressful situations be named?", low: "Not named", high: "Clearly named" },
      { id: "rehab_load_sensory_triggers", phase: "map_cognitive_load", label: "Can sensory overload triggers be named?", low: "Not named", high: "Clearly named" },
      { id: "rehab_load_memory_difficulties", phase: "map_cognitive_load", label: "Can memory difficulties be named?", low: "Not named", high: "Clearly named" },
      { id: "rehab_load_frustration_points", phase: "map_cognitive_load", label: "Can frustration points be named?", low: "Not named", high: "Clearly named" },
      { id: "rehab_load_reminder_stress", phase: "map_cognitive_load", label: "Can stressful reminders be noticed?", low: "Hard to notice", high: "Easy to notice" },
      { id: "rehab_load_demonstrations", phase: "map_cognitive_load", label: "Can support be explained through demonstrations?", low: "Not available", high: "Ready to use" },
      { id: "rehab_load_repetition", phase: "map_cognitive_load", label: "Can support include repetition when needed?", low: "Not available", high: "Ready to use" },
      { id: "rehab_load_visual_examples", phase: "map_cognitive_load", label: "Can visual examples be provided?", low: "Not available", high: "Ready to use" },
      { id: "rehab_load_verbal_coaching", phase: "map_cognitive_load", label: "Can verbal coaching be provided?", low: "Not available", high: "Ready to use" },
      { id: "rehab_load_written_steps", phase: "map_cognitive_load", label: "Can written steps be provided?", low: "Not available", high: "Ready to use" },
      { id: "rehab_load_caregiver_modeling", phase: "map_cognitive_load", label: "Can caregivers demonstrate tasks if needed?", low: "Not available", high: "Ready to use" },
      { id: "rehab_ethics_privacy", phase: "apply_ethical_checks", label: "Are privacy concerns explained before AI support is used?", low: "Not explained", high: "Explained" },
      { id: "rehab_ethics_risk", phase: "apply_ethical_checks", label: "Are risks explained clearly?", low: "Not explained", high: "Explained" },
      { id: "rehab_ethics_ai_suggestions", phase: "apply_ethical_checks", label: "Does the person understand how AI gives suggestions?", low: "Unclear", high: "Clear" },
      { id: "rehab_ethics_permission", phase: "apply_ethical_checks", label: "Is permission discussed before AI support is used?", low: "Not discussed", high: "Discussed" },
      { id: "rehab_ethics_person_choices", phase: "apply_ethical_checks", label: "Can the person still make their own choices?", low: "Unclear choice", high: "Clear choice" },
      { id: "rehab_ethics_staff_review", phase: "apply_ethical_checks", label: "Can staff review AI suggestions when needed?", low: "No review", high: "Clear review" },
      { id: "rehab_ethics_caregiver_review", phase: "apply_ethical_checks", label: "Can caregivers review AI suggestions when needed?", low: "No review", high: "Clear review" },
      { id: "rehab_ethics_communication_preference", phase: "apply_ethical_checks", label: "Are communication preferences discussed before AI support?", low: "Not discussed", high: "Discussed" },
      { id: "rehab_ethics_prompt_clarity", phase: "apply_ethical_checks", label: "Can prompts be explained in a way the person understands?", low: "Hard to explain", high: "Easy to explain" },
      { id: "rehab_ethics_feedback_clarity", phase: "apply_ethical_checks", label: "Can feedback be given in a way the person understands?", low: "Hard to explain", high: "Easy to explain" },
      { id: "rehab_ethics_choice_control", phase: "apply_ethical_checks", label: "Can the person adjust support choices?", low: "Hard to adjust", high: "Easy to adjust" },
      { id: "rehab_pilot_prior_support", phase: "pilot_and_learn", label: "Has the team discussed what has already been tried?", low: "Not discussed", high: "Discussed" },
      { id: "rehab_pilot_helpful_strategies", phase: "pilot_and_learn", label: "Has the team discussed what helped?", low: "Not discussed", high: "Discussed" },
      { id: "rehab_pilot_unhelpful_strategies", phase: "pilot_and_learn", label: "Has the team discussed what did not help?", low: "Not discussed", high: "Discussed" },
      { id: "rehab_pilot_stressful_strategies", phase: "pilot_and_learn", label: "Has the team discussed what caused stress?", low: "Not discussed", high: "Discussed" },
      { id: "rehab_pilot_reminder_plan", phase: "pilot_and_learn", label: "Is there a plan if reminders become stressful?", low: "No plan", high: "Clear plan" },
      { id: "rehab_pilot_tracking_plan", phase: "pilot_and_learn", label: "Is there a plan if tracking feels overwhelming?", low: "No plan", high: "Clear plan" },
      { id: "rehab_pilot_caregiver_stress_plan", phase: "pilot_and_learn", label: "Is there a plan if helper involvement creates stress?", low: "No plan", high: "Clear plan" },
      { id: "rehab_pilot_suggestion_plan", phase: "pilot_and_learn", label: "Is there a plan if AI suggestions feel upsetting?", low: "No plan", high: "Clear plan" },
      { id: "rehab_pilot_backup_plan", phase: "pilot_and_learn", label: "Is there a backup plan if the support is not helping?", low: "No backup", high: "Clear backup" },
      { id: "rehab_pilot_progress_review", phase: "pilot_and_learn", label: "Can progress be reviewed over time?", low: "Not reviewed", high: "Reviewed" },
      { id: "rehab_pilot_person_feedback", phase: "pilot_and_learn", label: "Can the person share how the support feels?", low: "No channel", high: "Clear channel" },
      { id: "rehab_pilot_caregiver_feedback", phase: "pilot_and_learn", label: "Can caregivers share feedback?", low: "No channel", high: "Clear channel" },
      { id: "rehab_pilot_staff_feedback", phase: "pilot_and_learn", label: "Can staff share feedback?", low: "No channel", high: "Clear channel" },
      { id: "rehab_pilot_refine_support", phase: "pilot_and_learn", label: "Can support plans be changed after feedback?", low: "Hard to change", high: "Easy to change" },
      { id: "rehab_pilot_preserve_choice", phase: "pilot_and_learn", label: "Can changes keep the person's choices in place?", low: "Hard to keep", high: "Easy to keep" },
    ],
  },
];

const getAssessmentById = (id) => assessments.find((assessment) => assessment.id === id);

const getReadinessLevel = (score) => readinessLevels.find((level) => score <= level.max) || readinessLevels.at(-1);

const calculateScore = (responses, questions = null) => {
  const values = questions
    ? questions.map((question) => Number(responses[question.id] ?? 3))
    : Object.values(responses).map((value) => Number(value));

  if (!values.length) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / (values.length * 5)) * 100);
};

const calculatePhaseScores = (assessment, responses) =>
  phases.reduce((scores, phase) => {
    const phaseQuestions = assessment.questions.filter((question) => question.phase === phase.id);
    scores[phase.id] = calculateScore(responses, phaseQuestions);
    return scores;
  }, {});

const getRecommendation = (assessmentId, score) => {
  const assessment = getAssessmentById(assessmentId);
  const readiness = getReadinessLevel(score);
  return assessment?.recommendations?.[readiness.tone] || {
    nextStep: "Clarify the immediate goal before expanding AI use.",
    risk: "The main risk is moving forward without visible assumptions or oversight.",
    implementation: "Use a small pilot with feedback, review, and a clear pause rule.",
  };
};

const buildAssessmentResult = (assessment, responses) => {
  const score = calculateScore(responses, assessment.questions);
  const readiness = getReadinessLevel(score);
  const phaseScores = calculatePhaseScores(assessment, responses);

  return {
    assessmentId: assessment.id,
    version: assessment.version,
    responses,
    score,
    readinessLevel: readiness.level,
    readinessTone: readiness.tone,
    phaseScores,
    recommendation: getRecommendation(assessment.id, score, phaseScores),
  };
};

const calculateAssessmentResult = (values, questionCount, assessment) => {
  const responses = {};
  const questions = assessment?.questions?.slice(0, questionCount) || [];

  values.forEach((value, index) => {
    const questionId = questions[index]?.id || `question_${index + 1}`;
    responses[questionId] = value;
  });

  const score = calculateScore(responses, questions.length ? questions : null);
  const readiness = getReadinessLevel(score);
  return {
    score,
    level: readiness.level,
    tone: readiness.tone,
    ...getRecommendation(assessment?.id, score),
  };
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

const renderQuestion = (question, index) => {
  const wrapper = document.createElement("div");
  wrapper.className = "guided-question";
  wrapper.innerHTML = `
    <div class="question-meta">
      <span>Question ${index + 1}</span>
      <output for="${question.id}" data-output>3</output>
    </div>
    <label for="${question.id}">${question.label}</label>
    <input id="${question.id}" name="${question.id}" data-question-id="${question.id}" type="range" min="1" max="5" value="3" step="1">
    <div class="scale-labels" aria-hidden="true">
      <span>${question.low}</span>
      <span>${question.high}</span>
    </div>
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

const getResponsesFromPanel = (panel) =>
  [...panel.querySelectorAll('input[type="range"][data-question-id]')].reduce((responses, input) => {
    responses[input.dataset.questionId] = Number(input.value);
    return responses;
  }, {});

const updateGuidedAssessment = (panel, assessment) => {
  const responses = getResponsesFromPanel(panel);
  const result = buildAssessmentResult(assessment, responses);
  const answered = Object.values(responses).filter((value) => Number(value) !== 3).length;
  const progressPercent = Math.round((answered / assessment.questions.length) * 100);
  const score = panel.querySelector("[data-score]");
  const progress = panel.querySelector("[data-progress]");
  const progressText = panel.querySelector("[data-progress-text]");
  const progressBar = panel.querySelector(".guided-progress");
  const resultBox = panel.querySelector("[data-result]");

  score.textContent = `${result.score}%`;
  progress.style.width = `${progressPercent}%`;
  progressBar.setAttribute("aria-valuenow", progressPercent);
  progressText.textContent = `${answered} of ${assessment.questions.length} responses adjusted`;

  if (resultBox.dataset.submitted === "true") {
    resultBox.hidden = false;
    resultBox.className = `guided-result ${result.readinessTone}`;
    resultBox.innerHTML = `
      <div>
        <span>${result.readinessLevel}</span>
        <strong>${result.score}% readiness</strong>
      </div>
      <dl>
        <dt>Practical next step</dt>
        <dd>${result.recommendation.nextStep}</dd>
        <dt>Risk or barrier observation</dt>
        <dd>${result.recommendation.risk}</dd>
        <dt>Implementation suggestion</dt>
        <dd>${result.recommendation.implementation}</dd>
      </dl>
    `;
  }
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
        <p data-progress-text>0 of ${assessment.questions.length} responses adjusted</p>
      </div>
      <form>
        <div class="guided-questions"></div>
        <button class="button primary" type="submit">Calculate Readiness</button>
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

  assessmentPanel.querySelectorAll('input[type="range"]').forEach((input) => {
    const output = input.closest(".guided-question").querySelector("[data-output]");
    input.addEventListener("input", () => {
      output.textContent = input.value;
      updateGuidedAssessment(assessmentPanel, assessment);
    });
  });

  assessmentPanel.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const resultBox = assessmentPanel.querySelector("[data-result]");
    resultBox.dataset.submitted = "true";
    updateGuidedAssessment(assessmentPanel, assessment);
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
  getAssessmentById,
  getReadinessLevel,
  getRecommendation,
  renderAssessment,
  renderPhase,
  renderQuestion,
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

if (form && statusMessage) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get("name") || "Thanks").trim();
    statusMessage.textContent = `${name}, your inquiry is ready to send once this site is connected to an email or form service.`;
    form.reset();
  });
}
