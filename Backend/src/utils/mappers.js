// ==========================================
// LeadStatus Mapping
// ==========================================

export function mapLeadStatusToFrontend(status) {
  if (!status) return "New";
  const s = String(status).toUpperCase();
  switch (s) {
    case "NEW":
      return "New";
    case "CONTACTED":
      return "Contacted";
    case "INTERESTED":
      return "Interested";
    case "FOLLOW_UP":
    case "FOLLOW-UP":
      return "Follow-up";
    case "CONVERTED":
      return "Converted";
    case "LOST":
      return "Lost";
    case "NOT_REACHABLE":
    case "NOT REACHABLE":
      return "Not Reachable";
    default:
      return status;
  }
}

export function mapLeadStatus(statusStr) {
  if (!statusStr) return "New";
  switch (statusStr) {
    case "New":
    case "NEW":
      return "New";
    case "Contacted":
    case "CONTACTED":
      return "Contacted";
    case "Interested":
    case "INTERESTED":
      return "Interested";
    case "Follow-up":
    case "FOLLOW_UP":
      return "Follow-up";
    case "Converted":
    case "CONVERTED":
      return "Converted";
    case "Lost":
    case "LOST":
      return "Lost";
    case "Not Reachable":
    case "NOT_REACHABLE":
      return "Not Reachable";
    default:
      return statusStr;
  }
}

// ==========================================
// LeadSource Mapping
// ==========================================

export function mapLeadSourceToFrontend(source) {
  if (!source) return "Manual Entry";
  const s = String(source).toUpperCase();
  switch (s) {
    case "WEBSITE_FORMS":
    case "WEBSITE FORMS":
      return "Website Forms";
    case "LANDING_PAGES":
    case "LANDING PAGES":
      return "Landing Pages";
    case "META_ADS":
    case "META ADS":
      return "Meta Ads";
    case "GOOGLE_ADS":
    case "GOOGLE ADS":
      return "Google Ads";
    case "WHATSAPP":
      return "WhatsApp";
    case "MANUAL_ENTRY":
    case "MANUAL ENTRY":
      return "Manual Entry";
    default:
      return source;
  }
}

export function mapLeadSource(sourceStr) {
  if (!sourceStr) return "Manual Entry";
  switch (sourceStr) {
    case "Website Forms":
    case "WEBSITE_FORMS":
      return "Website Forms";
    case "Landing Pages":
    case "LANDING_PAGES":
      return "Landing Pages";
    case "Meta Ads":
    case "META_ADS":
      return "Meta Ads";
    case "Google Ads":
    case "GOOGLE_ADS":
      return "Google Ads";
    case "WhatsApp":
    case "WHATSAPP":
      return "WhatsApp";
    case "Manual Entry":
    case "MANUAL_ENTRY":
      return "Manual Entry";
    default:
      return sourceStr;
  }
}

// ==========================================
// RuleTrigger Mapping
// ==========================================

export function mapRuleTriggerToFrontend(trigger) {
  if (!trigger) return "New Lead Created";
  const t = String(trigger).toUpperCase();
  switch (t) {
    case "NEW_LEAD_CREATED":
    case "NEW LEAD CREATED":
      return "New Lead Created";
    case "STATUS_UPDATED":
    case "STATUS UPDATED":
      return "Status Updated";
    case "NO_CUSTOMER_RESPONSE":
    case "NO CUSTOMER RESPONSE":
      return "No Customer Response";
    default:
      return trigger;
  }
}

export function mapRuleTrigger(triggerStr) {
  if (!triggerStr) return "New Lead Created";
  switch (triggerStr) {
    case "New Lead Created":
    case "NEW_LEAD_CREATED":
      return "New Lead Created";
    case "Status Updated":
    case "STATUS_UPDATED":
      return "Status Updated";
    case "No Customer Response":
    case "NO_CUSTOMER_RESPONSE":
      return "No Customer Response";
    default:
      return triggerStr;
  }
}
