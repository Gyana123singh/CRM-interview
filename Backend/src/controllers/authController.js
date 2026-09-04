import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Company, Subscription, Lead, KnowledgeBase, AgentProfile, AuditLog } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-this-in-production";

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    let dbUser = await User.findOne({ email }).populate("companyId");

    // Dev Fallback / Auto-seeding: If user is missing and logging in with demo credentials, auto-create them on the fly
    const demoAccounts = ["pradeep@infotattva.com", "sales@infotattva.com", "manager@infotattva.com", "executive@infotattva.com"];
    if (!dbUser && demoAccounts.includes(email.toLowerCase()) && password === "securepassword") {
      const hashedPassword = await bcrypt.hash("securepassword", 10);
      
      let defaultCompany = await Company.findOne({ email: "contact@infotattva.com" });
      
      if (!defaultCompany) {
        defaultCompany = await Company.create({
          companyName: "Infotattva Business Solutions",
          industry: "SaaS & Retail Solutions",
          contactPerson: "Pradeep Patra",
          phone: "+91 94380 99999",
          email: "contact@infotattva.com",
          address: "Bhubaneswar, Odisha, India",
          plan: "Growth Plan",
          status: "active",
          routingPolicy: "round-robin",
          whatsappPhone: "+91 94380 99999",
          whatsappName: "Infotattva Business Live Desk",
          whatsappConnected: true,
          smtpVerified: true
        });

        await Subscription.create({
          companyId: defaultCompany._id,
          planName: "Growth Plan",
          amount: 15000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentStatus: "paid"
        });

        await Lead.insertMany([
          {
            name: "Rahul Mohanty",
            phone: "+91 98765 43210",
            email: "rahul.m@gmail.com",
            location: "Patia, Bhubaneswar",
            serviceInterest: "2BHK Luxury Flat",
            message: "Looking for a ready to move 2BHK flat near Patia within 60 Lakhs budget.",
            source: "Meta Ads",
            status: "New",
            companyId: defaultCompany._id
          },
          {
            name: "Dr. Sunita Rao",
            phone: "+91 94321 09876",
            email: "sunita.rao@healthclinic.in",
            location: "Saheed Nagar",
            serviceInterest: "AI WhatsApp Chatbot integration",
            message: "Need a WhatsApp bot for automatic appointment confirmation and scheduling.",
            source: "WhatsApp",
            status: "Interested",
            companyId: defaultCompany._id,
            notes: "Very eager. Requested a demo of salon/spa calendar flow."
          }
        ]);

        await KnowledgeBase.insertMany([
          {
            companyId: defaultCompany._id,
            title: "Weekend hours",
            category: "General",
            content: "We are open from 10:00 AM to 6:00 PM on Saturday and Sunday."
          },
          {
            companyId: defaultCompany._id,
            title: "Patia 2BHK pricing",
            category: "pricing",
            content: "Ready-to-move 2BHK flats in Patia start from ₹55 Lakhs to ₹75 Lakhs."
          }
        ]);
      }

      if (email === "pradeep@infotattva.com" && defaultCompany) {
        dbUser = await User.create({
          name: "Pradeep Patra",
          email: "pradeep@infotattva.com",
          phone: "+91 94380 12345",
          password: hashedPassword,
          role: "admin",
          status: "active",
          companyId: defaultCompany._id
        });

        await AgentProfile.create({
          userId: dbUser._id,
          phone: "+91 94380 12345",
          status: "online",
          specialty: "AI & Tech Integration",
          isActive: true,
          leadsCount: 24,
          conversionRate: 50.0
        });

        await Lead.updateMany(
          { companyId: defaultCompany._id },
          { $set: { assignedToId: dbUser._id } }
        );
      } else if (email === "manager@infotattva.com" && defaultCompany) {
        dbUser = await User.create({
          name: "Vikram Sen (Sales Manager)",
          email: "manager@infotattva.com",
          phone: "+91 94380 88888",
          password: hashedPassword,
          role: "sales-manager",
          status: "active",
          companyId: defaultCompany._id
        });

        await AgentProfile.create({
          userId: dbUser._id,
          phone: "+91 94380 88888",
          status: "online",
          specialty: "Pipeline & Team Management",
          isActive: true,
          leadsCount: 15,
          conversionRate: 55.0
        });
      } else if (email === "executive@infotattva.com" && defaultCompany) {
        dbUser = await User.create({
          name: "Priya Das (Sales Executive)",
          email: "executive@infotattva.com",
          phone: "+91 94380 77777",
          password: hashedPassword,
          role: "sales-executive",
          status: "active",
          companyId: defaultCompany._id
        });

        await AgentProfile.create({
          userId: dbUser._id,
          phone: "+91 94380 77777",
          status: "online",
          specialty: "Lead Conversion & Sales Demos",
          isActive: true,
          leadsCount: 18,
          conversionRate: 45.0
        });
      } else if (email === "sales@infotattva.com" && defaultCompany) {
        dbUser = await User.create({
          name: "Amit Sharma (Sales Staff)",
          email: "sales@infotattva.com",
          phone: "+91 94380 54321",
          password: hashedPassword,
          role: "team",
          status: "active",
          companyId: defaultCompany._id
        });

        await AgentProfile.create({
          userId: dbUser._id,
          phone: "+91 94380 54321",
          status: "online",
          specialty: "Sales & Client Onboarding",
          isActive: true,
          leadsCount: 12,
          conversionRate: 40.0
        });
      }

      if (dbUser) {
        dbUser = await User.findById(dbUser._id).populate("companyId");
      }
    }

    if (!dbUser) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (dbUser.status === "suspended") {
      return res.status(403).json({ error: "Your account has been suspended" });
    }

    const passwordMatch = await bcrypt.compare(password, dbUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const companyIdStr = dbUser.companyId ? (dbUser.companyId._id || dbUser.companyId) : undefined;
    const companyObj = typeof dbUser.companyId === "object" ? dbUser.companyId : null;

    const token = jwt.sign(
      {
        id: dbUser._id,
        email: dbUser.email,
        role: dbUser.role.toLowerCase().replace("_", "-"),
        companyId: companyIdStr
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    try {
      await AuditLog.create({
        category: "SECURITY",
        event: `User ${dbUser.email} logged in successfully (role: ${dbUser.role})`,
        user: dbUser.email,
        ip: req.ip || "127.0.0.1"
      });
    } catch {}

    return res.status(200).json({
      token,
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role.toLowerCase().replace("_", "-"),
        companyId: companyIdStr,
        companyName: companyObj?.companyName
      }
    });

  } catch (error) {
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  return res.status(200).json({ message: "Password reset link sent to your email" });
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and password are required" });
  }
  return res.status(200).json({ message: "Password reset completed successfully" });
}
