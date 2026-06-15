(function () {
  const config = window.CEAMPLUS_AUTH_CONFIG || {};
  const requiresApproval = document.body?.dataset.requiresApproval === "true";
  const requestedSections = document.body?.dataset.requestedSections || "Guides, AI Tools";
  const statusNodes = document.querySelectorAll("[data-auth-status]");
  const protectedNodes = document.querySelectorAll("[data-protected-content]");
  const gateNodes = document.querySelectorAll("[data-auth-gate]");
  const loginForm = document.querySelector("[data-login-form]");
  const registerForm = document.querySelector("[data-register-form]");
  const signOutButtons = document.querySelectorAll("[data-sign-out]");
  const requestApprovalButtons = document.querySelectorAll("[data-request-approval]");
  const sessionPanel = document.querySelector("[data-session-panel]");
  const sessionCopy = document.querySelector("[data-session-copy]");

  const setStatus = (message, tone = "info") => {
    statusNodes.forEach((node) => {
      node.textContent = message;
      node.dataset.tone = tone;
    });
  };

  const hasAuthConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase?.createClient);
  const supabaseClient = hasAuthConfig
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
    : null;

  const showLocked = (message) => {
    protectedNodes.forEach((node) => {
      node.hidden = true;
    });
    gateNodes.forEach((node) => {
      node.hidden = false;
    });
    setStatus(message, "warning");
  };

  const showUnlocked = (email) => {
    document.body.dataset.authApproved = "true";
    protectedNodes.forEach((node) => {
      node.hidden = false;
    });
    gateNodes.forEach((node) => {
      node.hidden = true;
    });
    setStatus(`Signed in and approved as ${email}.`, "success");
  };

  const getSelectedSections = (form) => {
    const values = Array.from(form.querySelectorAll('input[name="sections"]:checked')).map((input) => input.value);
    return values.length ? values : requestedSections.split(",").map((section) => section.trim());
  };

  const sendAccessRequestToZapier = async ({ email, fullName, userId, sections }) => {
    if (!config.zapierAccessWebhookUrl) return;

    await fetch(config.zapierAccessWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestType: "registered-access-request",
        requestSource: "CEAM+ Website",
        clientEmail: email,
        clientName: fullName,
        supabaseUserId: userId || "",
        requestedSections: sections.join(", "),
        approvalStatus: "pending",
        adminEmailTo: config.adminEmail || "briggsfaye@clearpathtechnologies.org",
        adminEmailSubject: "CEAM+ access request needs approval",
        adminEmailBody:
          `A CEAM+ visitor requested access.\n\nName: ${fullName}\nEmail: ${email}\nRequested sections: ${sections.join(", ")}\n\nApprove this user through the CEAM+ Supabase approval flow.`,
        clientEmailTo: email,
        clientEmailSubject: "CEAM+ access request received",
        clientEmailBody:
          "Thank you for requesting CEAM+ access. Please verify your email address. Your request will be reviewed before Guides and AI Tools unlock.",
        submittedAt: new Date().toISOString(),
      }),
    });
  };

  const requestSecureApprovalEmail = async (user) => {
    if (!supabaseClient || !user) return;

    const fullName = user.user_metadata?.full_name || "";
    const sections = requestedSections.split(",").map((section) => section.trim()).filter(Boolean);
    const { error } = await supabaseClient.functions.invoke("request-access", {
      body: { fullName, requestedSections: sections },
    });

    if (error) {
      throw error;
    }
  };

  const getApprovalStatus = async (user) => {
    if (!supabaseClient || !user) return "signed-out";
    if (!user.email_confirmed_at && !user.confirmed_at) return "email-unverified";

    const { data, error } = await supabaseClient
      .from("profiles")
      .select("approval_status")
      .eq("id", user.id)
      .single();

    if (error || !data) return "pending";
    return data.approval_status || "pending";
  };

  const refreshSession = async () => {
    if (!hasAuthConfig) {
      const message = "Client login is being configured. Contact a consultant to request access.";
      if (requiresApproval) showLocked(message);
      else setStatus(message, "warning");
      return;
    }

    const { data } = await supabaseClient.auth.getSession();
    const user = data.session?.user;

    if (!user) {
      if (requiresApproval) showLocked("Sign in or request access to unlock this section.");
      else setStatus("Sign in or request access below.");
      if (sessionPanel) sessionPanel.hidden = true;
      return;
    }

    const approvalStatus = await getApprovalStatus(user);
    if (sessionPanel && sessionCopy) {
      sessionPanel.hidden = false;
      sessionCopy.textContent = `Signed in as ${user.email}. Approval status: ${approvalStatus}.`;
    }

    if (approvalStatus === "approved") {
      if (requiresApproval) showUnlocked(user.email);
      else setStatus(`Signed in as ${user.email}. Your account is approved.`, "success");
      document.dispatchEvent(new CustomEvent("ceamplus:auth-approved"));
      return;
    }

    if (approvalStatus === "email-unverified") {
      if (requiresApproval) showLocked("Please verify your email before access can be approved.");
      else setStatus("Please verify your email before access can be approved.", "warning");
      return;
    }

    if (requiresApproval) showLocked("Your account is signed in and waiting for manual approval.");
    else setStatus("Your account is waiting for manual approval.", "warning");
  };

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabaseClient) {
      setStatus("Supabase is not configured yet. Add your public project URL and anon key in auth-config.js.", "error");
      return;
    }

    const formData = new FormData(loginForm);
    setStatus("Signing in...");
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
    });

    if (error) {
      setStatus(error.message, "error");
      return;
    }

    await refreshSession();
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabaseClient) {
      setStatus("Supabase is not configured yet. Add your public project URL and anon key in auth-config.js.", "error");
      return;
    }

    const formData = new FormData(registerForm);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const sections = getSelectedSections(registerForm);

    setStatus("Creating your account...");
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
        data: { full_name: fullName, requested_sections: sections },
      },
    });

    if (error) {
      setStatus(error.message, "error");
      return;
    }

    try {
      await sendAccessRequestToZapier({ email, fullName, userId: data.user?.id, sections });
    } catch (zapierError) {
      console.warn("Access request notification failed", zapierError);
    }

    setStatus("Account request received. Please verify your email. Manual approval is required before full access unlocks.", "success");
    registerForm.reset();
  });

  signOutButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (supabaseClient) await supabaseClient.auth.signOut();
      await refreshSession();
    });
  });

  requestApprovalButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (!supabaseClient) {
        setStatus("Supabase is not configured yet.", "error");
        return;
      }
      const { data } = await supabaseClient.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        setStatus("Please sign in before sending an approval request.", "warning");
        return;
      }

      try {
        setStatus("Sending approval request...");
        await requestSecureApprovalEmail(user);
        setStatus("Approval request sent. Watch for an update after review.", "success");
      } catch (error) {
        setStatus("The secure approval request is not connected yet. Confirm the Supabase Edge Function is deployed.", "error");
      }
    });
  });

  refreshSession();
})();
