import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import {
  Company,
  User,
  AgentProfile,
  Lead,
  Customer,
  Deal,
  Activity,
  ChatThread,
  Message,
  AutomationRule,
  Appointment,
  KnowledgeBase,
  Subscription,
  Invoice,
  AuditLog,
  SystemPlanConfig,
  GlobalConfig
} from "./models/index.js";

async function seed() {
  console.log("Connecting to MongoDB...");
  await connectDB();
  console.log("Connected to MongoDB for seeding.");

  console.log("Cleaning existing database collections...");
  await Promise.all([
    Company.deleteMany({}),
    User.deleteMany({}),
    AgentProfile.deleteMany({}),
    Lead.deleteMany({}),
    Customer.deleteMany({}),
    Deal.deleteMany({}),
    Activity.deleteMany({}),
    ChatThread.deleteMany({}),
    Message.deleteMany({}),
    AutomationRule.deleteMany({}),
    Appointment.deleteMany({}),
    KnowledgeBase.deleteMany({}),
    Subscription.deleteMany({}),
    Invoice.deleteMany({}),
    AuditLog.deleteMany({}),
    SystemPlanConfig.deleteMany({}),
    GlobalConfig.deleteMany({})
  ]);
  console.log("Database cleared.");

  // System Plan Configurations
  await SystemPlanConfig.insertMany([
    { name: "Starter Plan", priceMonthly: 5000, maxChannels: 1, maxSeats: 2, maxTokens: 10000 },
    { name: "Growth Plan", priceMonthly: 15000, maxChannels: 5, maxSeats: 5, maxTokens: 50000 },
    { name: "Premium Plan", priceMonthly: 50000, maxChannels: 99, maxSeats: 99, maxTokens: 200000 }
  ]);

  // Global Config
  await GlobalConfig.create({
    _id: "singleton",
    maintenanceMode: false,
    allowRegistration: true,
    globalRateLimit: 100
  });

  // Company
  const company = await Company.create({
    _id: "company-infotattva-id",
    companyName: "Infotattva Business Solutions",
    industry: "SaaS & Retail Solutions",
    contactPerson: "Pradeep Patra",
    phone: "+91 94380 99999",
    email: "contact@infotattva.com",
    address: "Bhubaneswar, Odisha, India",
    plan: "Growth Plan",
    status: "active",
    credits: 1000,
    routingPolicy: "round-robin",
    whatsappPhone: "+91 94380 99999",
    whatsappName: "Infotattva Business Live Desk",
    whatsappConnected: true,
    smtpVerified: true,
    smtpHost: "smtp.infotattva.com",
    smtpPort: "587",
    smtpUser: "alerts@infotattva.com",
    smtpPass: "securepassword",
    smtpEncryption: "SSL/TLS"
  });

  // Subscription
  await Subscription.create({
    companyId: company._id,
    planName: "Growth Plan",
    amount: 15000,
    startDate: new Date("2026-05-28"),
    endDate: new Date("2026-06-28"),
    paymentStatus: "paid"
  });

  const adminEmail = (process.env.ADMIN_EMAIL || "pradeep@infotattva.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "securepassword";
  const adminName = process.env.ADMIN_NAME || "Pradeep Patra";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const hashedPassword = await bcrypt.hash("securepassword", 10);

  // Admin User (Seeded from .env credentials)
  const pradeep = await User.create({
    _id: "user-pradeep-id",
    name: adminName,
    email: adminEmail,
    phone: "+91 94380 12345",
    password: hashedAdminPassword,
    role: "admin",
    status: "active",
    companyId: company._id
  });

  const amit = await User.create({
    _id: "user-amit-id",
    name: "Amit Sharma",
    email: "sales@infotattva.com",
    phone: "+91 94380 54321",
    password: hashedPassword,
    role: "team",
    status: "active",
    companyId: company._id
  });

  const rina = await User.create({
    _id: "user-rina-id",
    name: "Rina Das",
    email: "rina@infotattva.com",
    phone: "+91 88888 99999",
    password: hashedPassword,
    role: "team",
    status: "active",
    companyId: company._id
  });

  const debasish = await User.create({
    _id: "user-debasish-id",
    name: "Debasish Panda",
    email: "debasish@infotattva.com",
    phone: "+91 77777 88888",
    password: hashedPassword,
    role: "team",
    status: "suspended",
    companyId: company._id
  });

  const manager = await User.create({
    _id: "user-manager-id",
    name: "Vikram Sen (Sales Manager)",
    email: "manager@infotattva.com",
    phone: "+91 94380 88888",
    password: hashedPassword,
    role: "sales-manager",
    status: "active",
    companyId: company._id
  });

  const executive = await User.create({
    _id: "user-executive-id",
    name: "Priya Das (Sales Executive)",
    email: "executive@infotattva.com",
    phone: "+91 94380 77777",
    password: hashedPassword,
    role: "sales-executive",
    status: "active",
    companyId: company._id
  });

  // Agent Profiles
  await AgentProfile.insertMany([
    {
      userId: pradeep._id,
      phone: "+91 94380 12345",
      status: "online",
      specialty: "AI & Tech Integration",
      isActive: true,
      leadsCount: 8,
      conversionRate: 52.0,
      joinedDate: new Date("2025-02-15")
    },
    {
      userId: amit._id,
      phone: "+91 94380 54321",
      status: "online",
      specialty: "High-Ticket Real Estate",
      isActive: true,
      leadsCount: 14,
      conversionRate: 48.0,
      joinedDate: new Date("2025-01-10")
    },
    {
      userId: rina._id,
      phone: "+91 88888 99999",
      status: "online",
      specialty: "SaaS & Retail Solutions",
      isActive: true,
      leadsCount: 11,
      conversionRate: 35.0,
      joinedDate: new Date("2025-03-01")
    },
    {
      userId: debasish._id,
      phone: "+91 77777 88888",
      status: "offline",
      specialty: "General Support Desk",
      isActive: false,
      leadsCount: 0,
      conversionRate: 0.0,
      joinedDate: new Date("2025-04-20")
    }
  ]);

  // Leads
  const rahulLead = await Lead.create({
    _id: "lead-rahul-id",
    name: "Rahul Mohanty",
    phone: "+91 98765 43210",
    email: "rahul.m@gmail.com",
    location: "Patia, Bhubaneswar",
    serviceInterest: "2BHK Luxury Flat",
    message: "Looking for a ready to move 2BHK flat near Patia within 60 Lakhs budget.",
    source: "Meta Ads",
    status: "New",
    companyId: company._id,
    assignedToId: amit._id,
    createdAt: new Date("2026-05-30T09:30:00Z")
  });

  const sunitaLead = await Lead.create({
    _id: "lead-sunita-id",
    name: "Dr. Sunita Rao",
    phone: "+91 94321 09876",
    email: "sunita.rao@healthclinic.in",
    location: "Saheed Nagar",
    serviceInterest: "AI WhatsApp Chatbot integration",
    message: "Need a WhatsApp bot for automatic appointment confirmation and scheduling.",
    source: "WhatsApp",
    status: "Interested",
    companyId: company._id,
    assignedToId: pradeep._id,
    notes: "Very eager. Requested a demo of salon/spa calendar flow.",
    followUpDate: new Date("2026-06-01"),
    createdAt: new Date("2026-05-30T10:15:00Z")
  });

  const vikramLead = await Lead.create({
    _id: "lead-vikram-id",
    name: "Vikram Malhotra",
    phone: "+91 88888 77777",
    email: "vikram@malhotragroup.co",
    location: "Cuttack Road",
    serviceInterest: "Premium Enterprise CRM",
    message: "Requirement for lead auto-assignment and multi-channel automation.",
    source: "Website Forms",
    status: "Follow-up",
    companyId: company._id,
    assignedToId: amit._id,
    notes: "Follow up tomorrow with customized quotation.",
    followUpDate: new Date("2026-05-31"),
    createdAt: new Date("2026-05-29T14:20:00Z")
  });

  const anjaliLead = await Lead.create({
    _id: "lead-anjali-id",
    name: "Anjali Mishra",
    phone: "+91 77777 66666",
    email: "anjali.m@outlook.com",
    location: "Jaydev Vihar",
    serviceInterest: "Salon Bridal Package Automation",
    message: "Interested in automated discount offers and follow-up templates.",
    source: "Google Ads",
    status: "Converted",
    companyId: company._id,
    assignedToId: rina._id,
    notes: "Package activated. Successfully paid setup fee.",
    createdAt: new Date("2026-05-28T11:05:00Z")
  });

  const rajeshLead = await Lead.create({
    _id: "lead-rajesh-id",
    name: "Rajesh Kumar",
    phone: "+91 99999 88888",
    email: "rajesh.k@gmail.com",
    location: "Nayapalli",
    serviceInterest: "Coaching Center Auto-responder",
    message: "Inquired about fees structure.",
    source: "Landing Pages",
    status: "Lost",
    companyId: company._id,
    assignedToId: rina._id,
    notes: "Budget too low. Wants free open source alternatives.",
    createdAt: new Date("2026-05-27T08:50:00Z")
  });

  // ChatThreads & Messages
  const rahulThread = await ChatThread.create({
    leadId: rahulLead._id,
    aiAutoReply: true,
    status: "active"
  });
  await Message.insertMany([
    {
      threadId: rahulThread._id,
      sender: "customer",
      text: "Hi, I saw your ad for Patia 2BHK luxury flats.",
      channel: "WhatsApp",
      timestamp: new Date("2026-05-30T09:30:00Z")
    },
    {
      threadId: rahulThread._id,
      sender: "bot",
      text: "Hi Rahul, thank you for your inquiry! We have beautiful 2BHK ready-to-move flats in Patia. May I know your preferred budget range so we can suggest the best options?",
      channel: "WhatsApp",
      timestamp: new Date("2026-05-30T09:30:05Z")
    },
    {
      threadId: rahulThread._id,
      sender: "customer",
      text: "My budget is around 55 to 60 Lakhs maximum.",
      channel: "WhatsApp",
      timestamp: new Date("2026-05-30T09:32:00Z")
    }
  ]);

  const sunitaThread = await ChatThread.create({
    leadId: sunitaLead._id,
    aiAutoReply: false,
    status: "active"
  });
  await Message.insertMany([
    {
      threadId: sunitaThread._id,
      sender: "customer",
      text: "Do you have calendar bookings integrated in WhatsApp?",
      channel: "WhatsApp",
      timestamp: new Date("2026-05-30T10:10:00Z")
    },
    {
      threadId: sunitaThread._id,
      sender: "agent",
      text: "Yes Dr. Sunita, we support full WhatsApp-based booking slots. A client can view open slots and confirm immediately.",
      channel: "WhatsApp",
      timestamp: new Date("2026-05-30T10:14:00Z")
    }
  ]);

  // Invoices
  await Invoice.insertMany([
    { companyId: company._id, invoiceNo: "INV-2026-004", date: new Date("2026-05-28"), amount: "₹15,000", status: "paid", plan: "Growth Plan - Monthly" },
    { companyId: company._id, invoiceNo: "INV-2026-003", date: new Date("2026-04-28"), amount: "₹15,000", status: "paid", plan: "Growth Plan - Monthly" },
    { companyId: company._id, invoiceNo: "INV-2026-002", date: new Date("2026-03-28"), amount: "₹15,000", status: "paid", plan: "Growth Plan - Monthly" },
    { companyId: company._id, invoiceNo: "INV-2026-001", date: new Date("2026-02-28"), amount: "₹25,000", status: "paid", plan: "Starter setup fee" }
  ]);

  // Automation Rules
  await AutomationRule.insertMany([
    {
      companyId: company._id,
      name: "Instant WhatsApp Welcome Flow",
      trigger: "New Lead Created",
      condition: "Source is Meta Ads or Website",
      actions: ["Send Welcome WhatsApp Message", "Auto-Assign to Sales Executive", "Notify Admin via Email"],
      delay: "Instant",
      status: "active"
    },
    {
      companyId: company._id,
      name: "Follow-up Delay Reminder",
      trigger: "Status Updated",
      condition: "Status equals 'Follow-up'",
      actions: ["Send Follow-up Reminder", "Create Pending Task for Assigned Executive"],
      delay: "24 Hours",
      status: "active"
    },
    {
      companyId: company._id,
      name: "Cold Lead Re-engagement",
      trigger: "No Customer Response",
      condition: "Duration is 3 Days",
      actions: ["Send 'Missed You' Discount/Offer Message", "Mark Lead as Cold/Lost"],
      delay: "3 Days",
      status: "paused"
    }
  ]);

  // Appointments
  await Appointment.insertMany([
    {
      companyId: company._id,
      leadId: sunitaLead._id,
      customerName: "Dr. Sunita Rao",
      phone: "+91 94321 09876",
      appointmentDate: new Date("2026-06-01"),
      appointmentTime: "11:30 AM",
      service: "Clinic Bot Integration Session",
      status: "confirmed"
    },
    {
      companyId: company._id,
      leadId: rahulLead._id,
      customerName: "Rahul Mohanty",
      phone: "+91 98765 43210",
      appointmentDate: new Date("2026-06-02"),
      appointmentTime: "02:00 PM",
      service: "Patia Flat Site Viewing",
      status: "pending"
    }
  ]);

  // Knowledge Base
  await KnowledgeBase.insertMany([
    {
      companyId: company._id,
      title: "Weekend hours",
      category: "General",
      content: "We are open from 10:00 AM to 6:00 PM on Saturday and Sunday.",
    },
    {
      companyId: company._id,
      title: "Patia 2BHK pricing",
      category: "pricing",
      content: "Ready-to-move 2BHK flats in Patia start from ₹55 Lakhs to ₹75 Lakhs.",
    }
  ]);

  console.log("Seeding finished successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
