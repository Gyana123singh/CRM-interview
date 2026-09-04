import { z } from "zod";

// AUTH SCHEMAS
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});

// LEAD SCHEMAS
export const createLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  location: z.string().optional(),
  serviceInterest: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  assignedTo: z.string().optional()
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "INTERESTED", "FOLLOW_UP", "CONVERTED", "LOST", "NOT_REACHABLE", "New", "Contacted", "Interested", "Follow-up", "Converted", "Lost", "Not Reachable"])
});

export const convertLeadSchema = z.object({
  dealTitle: z.string().min(2, "Deal title is required"),
  dealValue: z.number().min(0, "Deal value must be non-negative").optional().default(0),
  dealProbability: z.number().min(0).max(100, "Probability must be 0-100").optional().default(50),
  dealStage: z.enum(["QUALIFICATION", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).optional().default("QUALIFICATION"),
  companyName: z.string().optional(),
  notes: z.string().optional()
});

// DEAL SCHEMAS
export const createDealSchema = z.object({
  title: z.string().min(2, "Title is required"),
  dealValue: z.number().min(0, "Deal value must be non-negative").optional().default(0),
  probability: z.number().min(0).max(100, "Probability must be 0-100").optional().default(50),
  stage: z.enum(["QUALIFICATION", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).optional().default("QUALIFICATION"),
  customerId: z.string().optional(),
  leadId: z.string().optional(),
  assignedAgentId: z.string().optional(),
  notes: z.string().optional()
});

export const updateDealStageSchema = z.object({
  stage: z.enum(["QUALIFICATION", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  lossReason: z.string().optional(),
  reopen: z.boolean().optional()
});

export const updateDealSchema = z.object({
  title: z.string().min(2).optional(),
  dealValue: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  assignedAgentId: z.string().optional()
});

// CUSTOMER SCHEMAS
export const createCustomerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  companyName: z.string().optional(),
  notes: z.string().optional()
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(5).optional(),
  email: z.string().email().optional().or(z.literal("")),
  companyName: z.string().optional(),
  notes: z.string().optional()
});

// APPOINTMENT SCHEMAS
export const createAppointmentSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  service: z.string().min(1, "Service selection is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  notes: z.string().optional(),
  leadId: z.string().optional()
});

// WHATSAPP CAMPAIGN SCHEMAS
export const createCampaignSchema = z.object({
  name: z.string().min(2, "Campaign name is required"),
  templateId: z.string().min(1, "Template selection is required"),
  groupIds: z.array(z.string()).min(1, "Select at least one audience contact group"),
  scheduledTime: z.string().optional()
});
