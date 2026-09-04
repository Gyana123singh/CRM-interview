import { Customer, Lead, Deal, Activity, AuditLog } from "../models/index.js";

// GET /api/customers
export async function getCustomers(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Tenant Company ID is missing" } });
  }

  const { page = "1", limit = "20", search, assignedAgentId, dealStatus, startDate, endDate, sortBy = "createdAt", sortOrder = "desc" } = req.query;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  try {
    const where = { companyId };

    if (assignedAgentId && assignedAgentId !== "ALL") {
      where.assignedAgentId = String(assignedAgentId);
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.$gte = new Date(startDate);
      if (endDate) where.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      const searchRegex = new RegExp(String(search), "i");
      where.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { companyName: searchRegex }
      ];
    }

    const sortObj = { [String(sortBy)]: String(sortOrder).toLowerCase() === "asc" ? 1 : -1 };

    const [total, items] = await Promise.all([
      Customer.countDocuments(where),
      Customer.find(where)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
    ]);

    const populatedItems = await Promise.all(items.map(async (c) => {
      const [lead, deals] = await Promise.all([
        c.leadId ? Lead.findById(c.leadId).select("name source") : null,
        Deal.find({ customerId: c._id }).select("title dealValue stage")
      ]);
      const obj = c.toObject();
      obj.lead = lead;
      obj.deals = deals;
      return obj;
    }));

    return res.status(200).json({
      success: true,
      data: {
        items: populatedItems,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// GET /api/customers/:id
export async function getCustomerById(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;

  try {
    const customer = await Customer.findOne({ _id: id, companyId });
    if (!customer) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Customer not found" } });
    }

    const [lead, deals, activities] = await Promise.all([
      customer.leadId ? Lead.findById(customer.leadId) : null,
      Deal.find({ customerId: id }).sort({ createdAt: -1 }),
      Activity.find({ customerId: id }).sort({ createdAt: -1 })
    ]);

    const custObj = customer.toObject();
    custObj.lead = lead;
    custObj.deals = deals;
    custObj.activities = activities;

    return res.status(200).json({ success: true, data: custObj });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// POST /api/customers
export async function createCustomer(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Tenant Company ID is missing" } });
  }

  const { name, phone, email, companyName, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Name and phone number are required" } });
  }

  try {
    const customer = await Customer.create({
      companyId,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : null,
      companyName: companyName ? String(companyName).trim() : null,
      notes: notes || null
    });

    await AuditLog.create({
      category: "Tenants",
      event: `Customer "${customer.name}" created`,
      user: req.user?.email || "System",
      ip: req.ip || "127.0.0.1"
    });

    return res.status(201).json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /api/customers/:id
export async function updateCustomer(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  const { name, phone, email, companyName, notes } = req.body;

  try {
    const existing = await Customer.findOne({ _id: id, companyId });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Customer not found" } });
    }

    const updated = await Customer.findByIdAndUpdate(
      id,
      {
        name: name ? String(name).trim() : existing.name,
        phone: phone ? String(phone).trim() : existing.phone,
        email: email !== undefined ? (email ? String(email).trim() : null) : existing.email,
        companyName: companyName !== undefined ? (companyName ? String(companyName).trim() : null) : existing.companyName,
        notes: notes !== undefined ? notes : existing.notes
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// DELETE /api/customers/:id
export async function deleteCustomer(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;

  try {
    const existing = await Customer.findOne({ _id: id, companyId });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Customer not found" } });
    }

    await Customer.findByIdAndDelete(id);

    await AuditLog.create({
      category: "Tenants",
      event: `Customer "${existing.name}" deleted`,
      user: req.user?.email || "System",
      ip: req.ip || "127.0.0.1"
    });

    return res.status(200).json({ success: true, data: { message: "Customer deleted successfully" } });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// GET /api/customers/export
export async function exportCustomersCSV(req, res) {
  let companyId = req.user?.companyId || "company-infotattva-id";
  try {
    const custCount = await Customer.countDocuments({ companyId });
    if (custCount === 0) {
      const firstCust = await Customer.findOne({});
      if (firstCust) companyId = firstCust.companyId;
    }

    const customers = await Customer.find({ companyId }).sort({ createdAt: -1 });
    let csv = "ID,Name,Phone,Email,Company Name,Notes,Created At\n";
    customers.forEach((c) => {
      csv += `"${c._id}","${c.name || ""}","${c.phone || ""}","${c.email || ""}","${c.companyName || ""}","${c.notes || ""}","${c.createdAt ? c.createdAt.toISOString() : ""}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="customers_export_${Date.now()}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/customers/import (Import CSV / Excel Rows)
export async function importCustomersCSV(req, res) {
  let companyId = req.user?.companyId || "company-infotattva-id";
  const { items, csvText } = req.body;

  try {
    let customersToInsert = [];

    if (Array.isArray(items) && items.length > 0) {
      customersToInsert = items.map((item) => ({
        companyId,
        name: item.name || item.Name || "Imported Customer",
        phone: item.phone || item.Phone || "+91 90000 00000",
        email: item.email || item.Email || "",
        companyName: item.companyName || item["Company Name"] || item.Company || "N/A",
        notes: item.notes || item.Notes || "Imported via CSV Data Import",
        assignedToId: req.user?.id || req.user?._id || "system"
      }));
    } else if (typeof csvText === "string" && csvText.trim().length > 0) {
      const lines = csvText.trim().split("\n");
      if (lines.length > 1) {
        const headers = lines[0].split(",").map((h) => h.replace(/["\r]/g, "").trim());
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.replace(/["\r]/g, "").trim());
          if (values.length >= 1 && values[0]) {
            const rowObj = {};
            headers.forEach((h, idx) => {
              rowObj[h] = values[idx] || "";
            });
            customersToInsert.push({
              companyId,
              name: rowObj["Name"] || rowObj["name"] || values[0] || "Imported Customer",
              phone: rowObj["Phone"] || rowObj["phone"] || values[1] || "+91 90000 00000",
              email: rowObj["Email"] || rowObj["email"] || values[2] || "",
              companyName: rowObj["Company Name"] || rowObj["companyName"] || rowObj["Company"] || values[3] || "N/A",
              notes: rowObj["Notes"] || rowObj["notes"] || "Imported via CSV Data Import",
              assignedToId: req.user?.id || req.user?._id || "system"
            });
          }
        }
      }
    }

    if (customersToInsert.length === 0) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "No valid customer rows found to import." } });
    }

    const createdCustomers = await Customer.insertMany(customersToInsert);

    try {
      broadcastToCompany(companyId, "customer_created", { count: createdCustomers.length });
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${createdCustomers.length} customers.`,
      data: createdCustomers
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}
