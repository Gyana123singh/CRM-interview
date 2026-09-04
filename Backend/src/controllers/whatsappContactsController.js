import { WhatsappContact, WhatsappContactGroup, WhatsappMessageLog, WhatsappCampaign } from "../models/index.js";

// GET /api/client-admin/whatsapp/contacts
export async function getContacts(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { search, tag, status, page = "1", limit = "10" } = req.query;
  const pageNum = parseInt(String(page), 10);
  const limitNum = parseInt(String(limit), 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    const filters = { companyId };

    if (status && status !== "All") {
      filters.status = status;
    }

    if (tag && tag !== "All") {
      filters.tags = String(tag);
    }

    if (search) {
      const regex = new RegExp(String(search), "i");
      filters.$or = [
        { firstName: regex },
        { lastName: regex },
        { mobile: regex },
        { email: regex },
      ];
    }

    const [contacts, totalCount] = await Promise.all([
      WhatsappContact.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      WhatsappContact.countDocuments(filters),
    ]);

    return res.status(200).json({
      contacts,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/contacts/:id
export async function getContactDetails(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const contact = await WhatsappContact.findOne({ _id: id, companyId });
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const groups = await WhatsappContactGroup.find({ companyId, contactIds: id }).select("name");
    const logs = await WhatsappMessageLog.find({ contactId: id }).sort({ createdAt: -1 }).limit(20);

    const populatedLogs = await Promise.all(logs.map(async (log) => {
      const campaign = await WhatsappCampaign.findById(log.campaignId).select("name");
      const logObj = log.toObject();
      logObj.campaign = campaign;
      return logObj;
    }));

    const contactObj = contact.toObject();
    contactObj.groups = groups;
    contactObj.logs = populatedLogs;

    return res.status(200).json(contactObj);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/contacts
export async function createContact(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { firstName, lastName, mobile, email, countryCode, tags, notes } = req.body;
  if (!firstName || !mobile) {
    return res.status(400).json({ error: "First Name and Mobile Number are required" });
  }

  try {
    const existing = await WhatsappContact.findOne({ companyId, mobile });
    if (existing) {
      return res.status(409).json({ error: "Contact with this mobile number already exists" });
    }

    const contact = await WhatsappContact.create({
      companyId,
      firstName,
      lastName,
      mobile,
      email,
      countryCode: countryCode || "91",
      tags: tags || [],
      notes,
      status: "active",
    });

    return res.status(201).json(contact);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /api/client-admin/whatsapp/contacts/:id
export async function updateContact(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { firstName, lastName, mobile, email, countryCode, tags, notes, status } = req.body;

  try {
    const existing = await WhatsappContact.findOne({ _id: id, companyId });
    if (!existing) {
      return res.status(404).json({ error: "Contact not found" });
    }

    if (mobile && mobile !== existing.mobile) {
      const dupe = await WhatsappContact.findOne({ companyId, mobile });
      if (dupe) {
        return res.status(409).json({ error: "Mobile number is already assigned to another contact" });
      }
    }

    const updated = await WhatsappContact.findByIdAndUpdate(
      id,
      {
        firstName: firstName !== undefined ? firstName : existing.firstName,
        lastName: lastName !== undefined ? lastName : existing.lastName,
        mobile: mobile !== undefined ? mobile : existing.mobile,
        email: email !== undefined ? email : existing.email,
        countryCode: countryCode !== undefined ? countryCode : existing.countryCode,
        tags: tags !== undefined ? tags : existing.tags,
        notes: notes !== undefined ? notes : existing.notes,
        status: status !== undefined ? status : existing.status,
      },
      { new: true }
    );

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /api/client-admin/whatsapp/contacts/:id
export async function deleteContact(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const existing = await WhatsappContact.findOne({ _id: id, companyId });
    if (!existing) {
      return res.status(404).json({ error: "Contact not found" });
    }

    await WhatsappContact.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/contacts/bulk-delete
export async function bulkDeleteContacts(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "IDs array is required and cannot be empty" });
  }

  try {
    const result = await WhatsappContact.deleteMany({
      companyId,
      _id: { $in: ids },
    });

    return res.status(200).json({ success: true, count: result.deletedCount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/contacts/bulk-tag
export async function bulkTagContacts(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { ids, tags, action } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !tags || !Array.isArray(tags)) {
    return res.status(400).json({ error: "Invalid payload parameters" });
  }

  try {
    if (action === "add") {
      await WhatsappContact.updateMany(
        { companyId, _id: { $in: ids } },
        { $addToSet: { tags: { $each: tags } } }
      );
    } else if (action === "remove") {
      await WhatsappContact.updateMany(
        { companyId, _id: { $in: ids } },
        { $pull: { tags: { $in: tags } } }
      );
    }

    return res.status(200).json({ success: true, count: ids.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/contacts/import
export async function importContacts(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { rows } = req.body;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "Import list 'rows' is required" });
  }

  try {
    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    const errorReport = [];

    const existingContacts = await WhatsappContact.find({ companyId }).select("mobile");
    const existingMobiles = new Set(existingContacts.map((c) => c.mobile));

    const insertData = [];

    rows.forEach((row, idx) => {
      let { Name, Mobile, Email, Tags } = row;
      if (!Name) Name = row.name;
      if (!Mobile) Mobile = row.mobile;
      if (!Email) Email = row.email;
      if (!Tags) Tags = row.tags;

      if (!Name || !Mobile) {
        errors++;
        errorReport.push(`Row ${idx + 1}: Name and Mobile are required.`);
        return;
      }

      const cleanMobile = String(Mobile).replace(/\D/g, "");
      if (cleanMobile.length < 8 || cleanMobile.length > 15) {
        errors++;
        errorReport.push(`Row ${idx + 1} (${Name}): Invalid mobile number length: ${Mobile}`);
        return;
      }

      if (existingMobiles.has(cleanMobile)) {
        duplicates++;
        return;
      }

      let tagsArray = [];
      if (typeof Tags === "string") {
        tagsArray = Tags.split(",").map((t) => t.trim()).filter(Boolean);
      } else if (Array.isArray(Tags)) {
        tagsArray = Tags.map((t) => String(t).trim()).filter(Boolean);
      }

      let countryCode = "91";
      let finalMobile = cleanMobile;
      if (cleanMobile.length > 10) {
        if (cleanMobile.startsWith("91")) {
          countryCode = "91";
          finalMobile = cleanMobile.substring(2);
        } else if (cleanMobile.startsWith("1")) {
          countryCode = "1";
          finalMobile = cleanMobile.substring(1);
        } else {
          countryCode = cleanMobile.substring(0, 2);
          finalMobile = cleanMobile.substring(2);
        }
      }

      const nameParts = String(Name).trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || null;

      insertData.push({
        companyId,
        firstName,
        lastName,
        mobile: finalMobile,
        email: Email ? String(Email).trim() : null,
        countryCode,
        tags: tagsArray,
        status: "active",
      });
      
      existingMobiles.add(cleanMobile);
    });

    if (insertData.length > 0) {
      await WhatsappContact.insertMany(insertData);
      imported = insertData.length;
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalProcessed: rows.length,
        imported,
        duplicates,
        errors,
      },
      errorReport,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/contacts/export
export async function exportContacts(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const contacts = await WhatsappContact.find({ companyId }).sort({ createdAt: -1 });

    const formatted = contacts.map((c) => ({
      Name: `${c.firstName} ${c.lastName || ""}`.trim(),
      Mobile: `${c.countryCode}${c.mobile}`,
      Email: c.email || "",
      Tags: c.tags.join(", "),
      Status: c.status,
      Notes: c.notes || "",
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/contacts/tags
export async function getUniqueTags(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const tags = await WhatsappContact.distinct("tags", { companyId });
    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
