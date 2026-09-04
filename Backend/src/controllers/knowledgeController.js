import { KnowledgeBase, Company, WhatsAppTemplate } from "../models/index.js";

// GET /knowledge/faqs
export async function getFAQs(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    let faqs = await KnowledgeBase.find({
      companyId,
      category: { $ne: "document" }
    });

    if (faqs.length === 0) {
      await KnowledgeBase.insertMany([
        {
          companyId,
          category: "Services",
          title: "Ready-to-move flats in Patia",
          content: "Yes, we have several prime 2BHK flat options near Patia ranging from ₹55 Lakhs to ₹75 Lakhs with modern amenities like covered parking, high-speed lift, and 24/7 security."
        },
        {
          companyId,
          category: "Pricing",
          title: "Setup and retainer pricing",
          content: "Our software setup cost ranges between ₹25,000 for small businesses to ₹1.5 Lakhs for larger enterprises. Monthly retainers start at ₹5,000 for the Starter Plan, and ₹15,000 for the Growth Plan."
        },
        {
          companyId,
          category: "Policies",
          title: "Refund policy",
          content: "We offer a 100% money-back guarantee within the first 14 days of subscription activation if our integrations fail to meet your specifications."
        }
      ]);

      faqs = await KnowledgeBase.find({ companyId, category: { $ne: "document" } });
    }

    return res.status(200).json(faqs.map(f => ({
      id: f._id,
      category: f.category,
      question: f.title,
      answer: f.content
    })));

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /knowledge/faqs
export async function createFAQ(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { question, answer, category } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "Question and answer are required" });
  }

  try {
    const faq = await KnowledgeBase.create({
      companyId,
      title: question,
      content: answer,
      category: category || "General"
    });

    return res.status(201).json({
      id: faq._id,
      category: faq.category,
      question: faq.title,
      answer: faq.content
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /knowledge/faqs/:id
export async function deleteFAQ(req, res) {
  const { id } = req.params;
  try {
    await KnowledgeBase.findByIdAndDelete(id);
    return res.status(200).json({ message: "FAQ training log deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /knowledge/documents
export async function getDocuments(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    let docs = await KnowledgeBase.find({ companyId, category: "document" });

    if (docs.length === 0) {
      await KnowledgeBase.insertMany([
        { companyId, title: "2BHK_Luxury_Bhubaneswar.pdf", content: "Indexed catalog for Patia Luxury Flats", category: "document", fileUrl: "https://cloudinary.com/infotattva/2BHK_Luxury_Bhubaneswar.pdf" },
        { companyId, title: "CRM_Pricing_Brochure.docx", content: "Setup and subscription details for CRM SaaS", category: "document", fileUrl: "https://cloudinary.com/infotattva/CRM_Pricing_Brochure.docx" }
      ]);
      docs = await KnowledgeBase.find({ companyId, category: "document" });
    }

    return res.status(200).json(docs.map(d => ({
      id: d._id,
      name: d.title,
      size: "1.2 MB",
      status: "Indexed",
      fileUrl: d.fileUrl
    })));

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /knowledge/documents/upload
export async function uploadDocument(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { name, size, fileUrl } = req.body;
  if (!name) return res.status(400).json({ error: "File name is required" });

  try {
    const doc = await KnowledgeBase.create({
      companyId,
      title: name,
      content: `Indexed contents of uploaded file ${name}`,
      category: "document",
      fileUrl: fileUrl || "https://cloudinary.com/uploaded/" + name
    });

    return res.status(201).json({
      id: doc._id,
      name: doc.title,
      size: size || "100 KB",
      status: "Indexed",
      fileUrl: doc.fileUrl
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /knowledge/ai-settings
export async function getAISettings(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const company = await Company.findById(companyId).select(
      "botPersona botModel botTemperature botAutoPilot"
    );

    if (!company) return res.status(404).json({ error: "Company not found" });

    return res.status(200).json({
      botPersona: company.botPersona || "You are a professional, polite, and helpful AI assistant for Infotattva Business Solutions. Answer customer queries based on the FAQs. Be friendly and collect customer contact details to pass to the sales team.",
      botModel: company.botModel || "Google Gemini 1.5 Pro",
      botTemperature: company.botTemperature ?? 0.5,
      botAutoPilot: company.botAutoPilot ?? true
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /knowledge/ai-settings
export async function updateAISettings(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { botPersona, botModel, botTemperature, botAutoPilot } = req.body;

  try {
    const updateData = {};
    if (botPersona !== undefined) updateData.botPersona = botPersona;
    if (botModel !== undefined) updateData.botModel = botModel;
    if (botTemperature !== undefined) updateData.botTemperature = parseFloat(botTemperature);
    if (botAutoPilot !== undefined) updateData.botAutoPilot = !!botAutoPilot;

    const company = await Company.findByIdAndUpdate(companyId, updateData, { new: true });
    return res.status(200).json({
      botPersona: company.botPersona,
      botModel: company.botModel,
      botTemperature: company.botTemperature,
      botAutoPilot: company.botAutoPilot
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /knowledge/whatsapp-templates & POST /knowledge/whatsapp-templates
export async function getTemplates(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    let tpls = await WhatsAppTemplate.find({ companyId });
    if (tpls.length === 0) {
      await WhatsAppTemplate.insertMany([
        {
          companyId,
          name: "meta_ads_welcome_message",
          category: "marketing",
          language: "en_US",
          status: "approved",
          bodyText: "Hi {{1}}! Thank you for your inquiry regarding {{2}}. Our representative will assist you shortly. May I know your preferred budget range or specific requirements?"
        },
        {
          companyId,
          name: "appointment_confirmation_alert",
          category: "utility",
          language: "en_US",
          status: "approved",
          bodyText: "Hi {{1}}, your appointment for {{2}} is confirmed for {{3}} at {{4}}. To reschedule or cancel, reply with Reschedule or Cancel."
        },
        {
          companyId,
          name: "missed_followup_reminder",
          category: "utility",
          language: "en_US",
          status: "approved",
          bodyText: "Hi {{1}}, we haven't heard from you! Are you still interested in exploring {{2}} flat options? Let us know if you want to hop on a quick demo call today."
        }
      ]);
      tpls = await WhatsAppTemplate.find({ companyId });
    }
    return res.status(200).json(tpls);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createTemplate(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { name, category, bodyText } = req.body;
  if (!name || !bodyText) {
    return res.status(400).json({ error: "Template name and body text are required" });
  }

  try {
    const tpl = await WhatsAppTemplate.create({
      companyId,
      name: name.toLowerCase().replace(/\s+/g, "_"),
      category: category ? category.toLowerCase() : "marketing",
      language: "en_US",
      status: "approved",
      bodyText
    });
    return res.status(201).json(tpl);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /knowledge/whatsapp-templates/:id
export async function deleteTemplate(req, res) {
  const { id } = req.params;
  try {
    await WhatsAppTemplate.findByIdAndDelete(id);
    return res.status(200).json({ message: "WhatsApp Template deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
