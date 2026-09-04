import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";
import * as clientAdminController from "../controllers/clientAdminController.js";
import * as leadsController from "../controllers/leadsController.js";
import * as dealsController from "../controllers/dealsController.js";
import * as customersController from "../controllers/customersController.js";
import * as chatController from "../controllers/chatController.js";
import * as appointmentsController from "../controllers/appointmentsController.js";
import * as knowledgeController from "../controllers/knowledgeController.js";
import * as webhookController from "../controllers/webhookController.js";
import * as realtimeController from "../controllers/realtimeController.js";
import * as auditController from "../controllers/auditController.js";
import * as enrichmentController from "../controllers/enrichmentController.js";
import * as activitiesController from "../controllers/activitiesController.js";
import * as notificationsController from "../controllers/notificationsController.js";
import * as waContactsCtrl from "../controllers/whatsappContactsController.js";
import * as waGroupsCtrl from "../controllers/whatsappGroupsController.js";
import * as waCampaignsCtrl from "../controllers/whatsappCampaignsController.js";
import * as waReportsCtrl from "../controllers/whatsappReportsController.js";
import * as waSettingsCtrl from "../controllers/whatsappSettingsController.js";
import businessRouter from "../app/api/business/routes/businessRoutes.js";

import { validateRequest } from "../middleware/zodMiddleware.js";
import {
  loginSchema,
  createLeadSchema,
  convertLeadSchema,
  createDealSchema,
  updateDealStageSchema,
  createCustomerSchema
} from "../validators/index.js";

export const router = Router();

// ==========================================
// BUSINESS LEAD FINDER MIDDLEWARE ROUTES
// ==========================================
router.use("/business", businessRouter);

// ==========================================
// PUBLIC & WEBHOOK ROUTES
// ==========================================
router.post("/auth/login", validateRequest({ body: loginSchema }), authController.login);
router.post("/auth/forgot-password", authController.forgotPassword);
router.post("/auth/reset-password", authController.resetPassword);

// Section 16 API Flow mappings (available without version prefixes as well)
router.post("/leads/create", leadsController.captureLead);
router.get("/public/appointments/slots", appointmentsController.getPublicAppointmentSlots);
router.post("/public/appointments", appointmentsController.createPublicAppointment);
router.get("/public/appointments/meta", appointmentsController.getPublicMeta);
router.post("/ai/chat", webhookController.handleAIChat);
router.get("/webhooks/whatsapp", webhookController.verifyWhatsappWebhook);
router.post("/webhooks/whatsapp", webhookController.receiveWhatsappMessage);
router.post("/webhooks/facebook-leads", webhookController.receiveFacebookLead);
router.post("/webhooks/stripe", webhookController.handleStripeWebhook);
router.get("/realtime", realtimeController.subscribe);
router.get("/events", realtimeController.subscribe);
router.get("/realtime/stats", realtimeController.getStats);
router.post("/admin/seed", clientAdminController.seedDatabase);


// ==========================================
// ADMIN ROUTES
// ==========================================

// Dashboard
router.get(
  "/admin/dashboard/stats",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.getDashboardStats
);
router.get(
  "/admin/dashboard/lead-sources",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.getLeadSources
);

// Reports
router.get(
  "/admin/reports",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.getReports
);

// Agents
router.get(
  "/admin/agents",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  clientAdminController.getAgents
);
router.post(
  "/admin/agents",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.createAgent
);
router.patch(
  "/admin/agents/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.updateAgent
);
router.patch(
  "/admin/agents/:id/active",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.toggleAgentActive
);
router.delete(
  "/admin/agents/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.deleteAgent
);
router.get(
  "/admin/routing-policy",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.getRoutingPolicy
);
router.patch(
  "/admin/routing-policy",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.updateRoutingPolicy
);
router.post(
  "/admin/whatsapp/pairing-code",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  clientAdminController.generatePairingCode
);
router.post(
  "/admin/whatsapp/verify",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  clientAdminController.verifyWhatsapp
);
router.get(
  "/admin/meta-forms",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  clientAdminController.getMetaForms
);
router.post(
  "/admin/smtp/verify",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  clientAdminController.verifySMTP
);
router.get(
  "/admin/company/config",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  clientAdminController.getCompanyConfig
);
router.get(
  "/admin/billing/plan",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.getBillingPlan
);
router.get(
  "/admin/billing/plans",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.getSystemPlansForClient
);
router.patch(
  "/admin/billing/plan",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.upgradeBillingPlan
);
router.post(
  "/admin/billing/checkout-session",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.createCheckoutSession
);
router.get(
  "/admin/billing/quotas",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.getBillingQuotas
);
router.get(
  "/admin/billing/invoices",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.getInvoices
);
router.get(
  "/admin/automation-rules",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.getAutomationRules
);
router.post(
  "/admin/automation-rules",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.createAutomationRule
);
router.patch(
  "/admin/automation-rules/:id/status",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.toggleRuleStatus
);
router.delete(
  "/admin/automation-rules/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  clientAdminController.deleteAutomationRule
);

// ==========================================
// CLIENT ADMIN AUDIT MODULES
// ==========================================
router.post(
  "/admin/audits/seo",
  authenticateJWT,
  authorizeRoles(["admin"]),
  auditController.runSEOAudit
);
router.post(
  "/admin/audits/social",
  authenticateJWT,
  authorizeRoles(["admin"]),
  auditController.runSocialAudit
);
router.post(
  "/admin/audits/gmb",
  authenticateJWT,
  authorizeRoles(["admin"]),
  auditController.runGoogleBusinessAudit
);
router.get(
  "/admin/audits",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  auditController.getMyAudits
);
router.delete(
  "/admin/audits/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  auditController.deleteAudit
);

// ==========================================
// CLIENT ADMIN LEAD ENRICHMENT MODULES
// ==========================================
router.post(
  "/admin/enrichments/find-detect",
  authenticateJWT,
  authorizeRoles(["admin"]),
  enrichmentController.runFindDetect
);
router.post(
  "/admin/enrichments/audit",
  authenticateJWT,
  authorizeRoles(["admin"]),
  enrichmentController.runLeadBatchAudit
);
router.post(
  "/admin/enrichments/enrich",
  authenticateJWT,
  authorizeRoles(["admin"]),
  enrichmentController.runEnrichContacts
);
router.post(
  "/admin/enrichments/validate-emails",
  authenticateJWT,
  authorizeRoles(["admin"]),
  enrichmentController.runEmailValidation
);
router.post(
  "/admin/enrichments/outreach",
  authenticateJWT,
  authorizeRoles(["admin"]),
  enrichmentController.runWriteOutreach
);
router.get(
  "/admin/enrichments/batches",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  enrichmentController.getLeadAndEnrichmentBatches
);
router.get(
  "/admin/enrichments/niche-suggestions",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  enrichmentController.getNicheSuggestions
);
router.get(
  "/admin/enrichments/region-suggestions",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  enrichmentController.getRegionSuggestions
);
router.delete(
  "/admin/enrichments/lead-batches/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  enrichmentController.deleteLeadBatch
);
router.delete(
  "/admin/enrichments/enrichment-batches/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  enrichmentController.deleteEnrichmentBatch
);
router.get(
  "/admin/enrichments/validations",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  enrichmentController.getEmailValidationsHistory
);

// ==========================================
// NOTIFICATIONS & ACTIVITIES
// ==========================================
router.get(
  "/notifications",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  notificationsController.getNotifications
);
router.patch(
  "/notifications/:id/read",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  notificationsController.markNotificationAsRead
);
router.patch(
  "/notifications/read-all",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  notificationsController.markAllNotificationsAsRead
);

router.get(
  "/activities",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  activitiesController.getActivities
);
router.post(
  "/activities",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  activitiesController.createActivity
);
router.patch(
  "/activities/:id/status",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  activitiesController.updateActivityStatus
);

router.get(
  "/leads/export",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  leadsController.exportLeadsCSV
);
router.post(
  "/leads/import",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  leadsController.importLeadsCSV
);
router.get(
  "/customers/export",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  customersController.exportCustomersCSV
);
router.post(
  "/customers/import",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  customersController.importCustomersCSV
);
router.get(
  "/deals/export",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  dealsController.exportDealsCSV
);
router.post(
  "/deals/import",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  dealsController.importDealsCSV
);

// ==========================================
// LEADS & CONVERSATIONS (SHARED BY CLIENT ADMIN, SALES MANAGER & SALES EXECUTIVE)
// ==========================================
router.get(
  "/leads",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  leadsController.getLeads
);
router.post(
  "/leads",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  validateRequest({ body: createLeadSchema }),
  leadsController.createLead
);
router.get(
  "/leads/:id",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  leadsController.getLeadById
);
router.post(
  "/leads/:id/convert",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  validateRequest({ body: convertLeadSchema }),
  leadsController.convertLead
);
router.put(
  "/leads/:id",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  leadsController.updateLead
);
router.patch(
  "/leads/:id/priority",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  leadsController.updateLeadPriority
);
router.patch(
  "/leads/:id/status",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  leadsController.updateLeadStatus
);
router.patch(
  "/leads/:id/notes",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  leadsController.updateLeadNotes
);
router.patch(
  "/leads/:id/followup",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  leadsController.updateLeadFollowUp
);
router.patch(
  "/leads/:id/assign",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  leadsController.assignLead
);

// CUSTOMERS
router.get(
  "/customers",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  customersController.getCustomers
);
router.get(
  "/customers/:id",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  customersController.getCustomerById
);
router.post(
  "/customers",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager"]),
  validateRequest({ body: createCustomerSchema }),
  customersController.createCustomer
);
router.patch(
  "/customers/:id",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  customersController.updateCustomer
);
router.delete(
  "/customers/:id",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager"]),
  customersController.deleteCustomer
);

// DEALS & PIPELINE
router.get(
  "/deals",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  dealsController.getDeals
);
router.get(
  "/deals/:id",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  dealsController.getDealById
);
router.post(
  "/deals",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  validateRequest({ body: createDealSchema }),
  dealsController.createDeal
);
router.patch(
  "/deals/:id",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  dealsController.updateDeal
);
router.patch(
  "/deals/:id/stage",
  authenticateJWT,
  authorizeRoles(["admin", "sales-manager", "sales-executive", "team"]),
  validateRequest({ body: updateDealStageSchema }),
  dealsController.updateDealStage
);
router.delete(
  "/deals/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  dealsController.deleteDeal
);

router.get(
  "/conversations",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  chatController.getConversations
);
router.post(
  "/conversations",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  chatController.createThread
);
router.post(
  "/conversations/:leadId/messages",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  chatController.sendMessage
);
router.patch(
  "/conversations/:leadId/auto-reply",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  chatController.toggleAutoReply
);
router.patch(
  "/conversations/:leadId/messages/:messageId",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  chatController.editMessage
);
router.delete(
  "/conversations/:leadId/messages/:messageId",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  chatController.deleteMessage
);

// ==========================================
// APPOINTMENTS
// ==========================================
router.get(
  "/admin/appointments/slots",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  appointmentsController.getAppointmentSlots
);
router.get(
  "/appointments",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  appointmentsController.getAppointments
);
router.post(
  "/appointments",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  appointmentsController.createAppointment
);
router.patch(
  "/appointments/:id/confirm",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  clientAdminController.confirmAppointment
);
router.patch(
  "/appointments/:id/cancel",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  appointmentsController.cancelAppointment
);

// Custom Slots and Services Configs (Client Admin only)
router.get(
  "/admin/appointments/slot-configs",
  authenticateJWT,
  authorizeRoles(["admin"]),
  appointmentsController.getSlotConfigs
);
router.post(
  "/admin/appointments/slot-configs",
  authenticateJWT,
  authorizeRoles(["admin"]),
  appointmentsController.saveSlotConfig
);
router.delete(
  "/admin/appointments/slot-configs/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  appointmentsController.deleteSlotConfig
);
router.get(
  "/admin/appointments/service-configs",
  authenticateJWT,
  authorizeRoles(["admin"]),
  appointmentsController.getServiceConfigs
);
router.post(
  "/admin/appointments/service-configs",
  authenticateJWT,
  authorizeRoles(["admin"]),
  appointmentsController.createServiceConfig
);
router.delete(
  "/admin/appointments/service-configs/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  appointmentsController.deleteServiceConfig
);

// ==========================================
// KNOWLEDGE BASE (SHARED BY CLIENT ADMIN & TEAM AGENTS)
// ==========================================
router.get(
  "/knowledge/faqs",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  knowledgeController.getFAQs
);
router.post(
  "/knowledge/faqs",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  knowledgeController.createFAQ
);
router.delete(
  "/knowledge/faqs/:id",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  knowledgeController.deleteFAQ
);
router.get(
  "/knowledge/documents",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  knowledgeController.getDocuments
);
router.post(
  "/knowledge/documents/upload",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  knowledgeController.uploadDocument
);
router.get(
  "/knowledge/ai-settings",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  knowledgeController.getAISettings
);
router.patch(
  "/knowledge/ai-settings",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  knowledgeController.updateAISettings
);
router.get(
  "/knowledge/whatsapp-templates",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  knowledgeController.getTemplates
);
router.post(
  "/knowledge/whatsapp-templates",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  knowledgeController.createTemplate
);
router.delete(
  "/knowledge/whatsapp-templates/:id",
  authenticateJWT,
  authorizeRoles(["admin", "team"]),
  knowledgeController.deleteTemplate
);

// ==========================================
// WHATSAPP CAMPAIGN MANAGEMENT ROUTES
// ==========================================

// --- Contacts ---
router.get("/admin/whatsapp/contacts", authenticateJWT, authorizeRoles(["admin", "team"]), waContactsCtrl.getContacts);
router.get("/admin/whatsapp/contacts/tags", authenticateJWT, authorizeRoles(["admin", "team"]), waContactsCtrl.getUniqueTags);
router.get("/admin/whatsapp/contacts/export", authenticateJWT, authorizeRoles(["admin"]), waContactsCtrl.exportContacts);
router.get("/admin/whatsapp/contacts/:id", authenticateJWT, authorizeRoles(["admin", "team"]), waContactsCtrl.getContactDetails);
router.post("/admin/whatsapp/contacts", authenticateJWT, authorizeRoles(["admin", "team"]), waContactsCtrl.createContact);
router.patch("/admin/whatsapp/contacts/:id", authenticateJWT, authorizeRoles(["admin", "team"]), waContactsCtrl.updateContact);
router.delete("/admin/whatsapp/contacts/:id", authenticateJWT, authorizeRoles(["admin"]), waContactsCtrl.deleteContact);
router.post("/admin/whatsapp/contacts/bulk-delete", authenticateJWT, authorizeRoles(["admin"]), waContactsCtrl.bulkDeleteContacts);
router.post("/admin/whatsapp/contacts/bulk-tag", authenticateJWT, authorizeRoles(["admin"]), waContactsCtrl.bulkTagContacts);
router.post("/admin/whatsapp/contacts/import", authenticateJWT, authorizeRoles(["admin"]), waContactsCtrl.importContacts);

// --- Contact Groups ---
router.get("/admin/whatsapp/groups", authenticateJWT, authorizeRoles(["admin", "team"]), waGroupsCtrl.getGroups);
router.get("/admin/whatsapp/groups/:id", authenticateJWT, authorizeRoles(["admin", "team"]), waGroupsCtrl.getGroupDetails);
router.post("/admin/whatsapp/groups", authenticateJWT, authorizeRoles(["admin"]), waGroupsCtrl.createGroup);
router.patch("/admin/whatsapp/groups/:id", authenticateJWT, authorizeRoles(["admin"]), waGroupsCtrl.updateGroup);
router.delete("/admin/whatsapp/groups/:id", authenticateJWT, authorizeRoles(["admin"]), waGroupsCtrl.deleteGroup);
router.post("/admin/whatsapp/groups/:id/assign", authenticateJWT, authorizeRoles(["admin"]), waGroupsCtrl.assignContacts);
router.post("/admin/whatsapp/groups/:id/remove", authenticateJWT, authorizeRoles(["admin"]), waGroupsCtrl.removeContacts);

// --- Campaigns ---
router.get("/admin/whatsapp/campaigns", authenticateJWT, authorizeRoles(["admin", "team"]), waCampaignsCtrl.getCampaigns);
router.get("/admin/whatsapp/campaigns/:id", authenticateJWT, authorizeRoles(["admin", "team"]), waCampaignsCtrl.getCampaignDetails);
router.post("/admin/whatsapp/campaigns", authenticateJWT, authorizeRoles(["admin", "team"]), waCampaignsCtrl.createCampaign);
router.patch("/admin/whatsapp/campaigns/:id", authenticateJWT, authorizeRoles(["admin"]), waCampaignsCtrl.updateCampaign);
router.delete("/admin/whatsapp/campaigns/:id", authenticateJWT, authorizeRoles(["admin"]), waCampaignsCtrl.deleteCampaign);
router.post("/admin/whatsapp/campaigns/:id/duplicate", authenticateJWT, authorizeRoles(["admin"]), waCampaignsCtrl.duplicateCampaign);
router.post("/admin/whatsapp/campaigns/:id/send", authenticateJWT, authorizeRoles(["admin"]), waCampaignsCtrl.launchCampaignImmediately);
router.post("/admin/whatsapp/campaigns/:id/cancel", authenticateJWT, authorizeRoles(["admin"]), waCampaignsCtrl.cancelCampaign);
router.post("/admin/whatsapp/campaigns/:id/pause", authenticateJWT, authorizeRoles(["admin"]), waCampaignsCtrl.pauseCampaign);
router.get("/admin/whatsapp/scheduled", authenticateJWT, authorizeRoles(["admin", "team"]), waCampaignsCtrl.getScheduledCampaigns);

// --- Reports & Analytics ---
router.get("/admin/whatsapp/reports/dashboard", authenticateJWT, authorizeRoles(["admin", "team"]), waReportsCtrl.getDashboardStats);
router.get("/admin/whatsapp/reports/campaigns", authenticateJWT, authorizeRoles(["admin", "team"]), waReportsCtrl.getCampaignPerformance);
router.get("/admin/whatsapp/reports/trends", authenticateJWT, authorizeRoles(["admin", "team"]), waReportsCtrl.getMessageTrends);
router.get("/admin/whatsapp/reports/recent", authenticateJWT, authorizeRoles(["admin", "team"]), waReportsCtrl.getRecentActivity);

// --- Settings, API Keys & Billing ---
router.get("/admin/whatsapp/settings", authenticateJWT, authorizeRoles(["admin"]), waSettingsCtrl.getSettings);
router.post("/admin/whatsapp/settings/connect", authenticateJWT, authorizeRoles(["admin"]), waSettingsCtrl.connectAccount);
router.post("/admin/whatsapp/settings/disconnect", authenticateJWT, authorizeRoles(["admin"]), waSettingsCtrl.disconnectAccount);
router.get("/admin/whatsapp/api-keys", authenticateJWT, authorizeRoles(["admin"]), waSettingsCtrl.getApiKey);
router.post("/admin/whatsapp/api-keys/regenerate", authenticateJWT, authorizeRoles(["admin"]), waSettingsCtrl.regenerateApiKey);
router.get("/admin/whatsapp/billing", authenticateJWT, authorizeRoles(["admin"]), waSettingsCtrl.getBillingInfo);

export default router;
