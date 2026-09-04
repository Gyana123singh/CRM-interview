import { WhatsappContactGroup, WhatsappContact } from "../models/index.js";

// GET /api/client-admin/whatsapp/groups
export async function getGroups(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const groups = await WhatsappContactGroup.find({ companyId }).sort({ createdAt: -1 });

    const formattedGroups = await Promise.all(
      groups.map(async (group) => {
        if (group.isDynamic && group.dynamicRules) {
          const rules = group.dynamicRules;
          const filters = { companyId, status: "active" };
          
          if (rules.tags && Array.isArray(rules.tags) && rules.tags.length > 0) {
            filters.tags = { $in: rules.tags };
          }
          if (rules.countryCode) {
            filters.countryCode = rules.countryCode;
          }

          const dynamicCount = await WhatsappContact.countDocuments(filters);
          return {
            ...group.toObject(),
            contactCount: dynamicCount,
          };
        }

        const count = group.contactIds ? group.contactIds.length : 0;
        return {
          ...group.toObject(),
          contactCount: count,
        };
      })
    );

    return res.status(200).json(formattedGroups);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/groups/:id
export async function getGroupDetails(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const group = await WhatsappContactGroup.findOne({ _id: id, companyId });

    if (!group) {
      return res.status(404).json({ error: "Contact group not found" });
    }

    let contacts = [];
    if (group.isDynamic && group.dynamicRules) {
      const rules = group.dynamicRules;
      const filters = { companyId, status: "active" };

      if (rules.tags && Array.isArray(rules.tags) && rules.tags.length > 0) {
        filters.tags = { $in: rules.tags };
      }
      if (rules.countryCode) {
        filters.countryCode = rules.countryCode;
      }

      contacts = await WhatsappContact.find(filters).sort({ firstName: 1 }).limit(100);
    } else if (group.contactIds && group.contactIds.length > 0) {
      contacts = await WhatsappContact.find({ _id: { $in: group.contactIds } }).sort({ firstName: 1 }).limit(100);
    }

    return res.status(200).json({
      group,
      contacts,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/groups
export async function createGroup(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { name, description, isDynamic, dynamicRules, contactIds } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Group name is required" });
  }

  try {
    const data = {
      companyId,
      name,
      description,
      isDynamic: !!isDynamic,
      dynamicRules: isDynamic ? dynamicRules || {} : null,
      contactIds: !isDynamic && Array.isArray(contactIds) ? contactIds : []
    };

    const group = await WhatsappContactGroup.create(data);

    return res.status(201).json(group);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /api/client-admin/whatsapp/groups/:id
export async function updateGroup(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { name, description, isDynamic, dynamicRules } = req.body;

  try {
    const existing = await WhatsappContactGroup.findOne({ _id: id, companyId });
    if (!existing) {
      return res.status(404).json({ error: "Group not found" });
    }

    const updated = await WhatsappContactGroup.findByIdAndUpdate(
      id,
      {
        name: name !== undefined ? name : existing.name,
        description: description !== undefined ? description : existing.description,
        isDynamic: isDynamic !== undefined ? !!isDynamic : existing.isDynamic,
        dynamicRules: isDynamic !== undefined 
          ? (isDynamic ? dynamicRules || {} : null)
          : (existing.isDynamic ? dynamicRules || existing.dynamicRules : null),
      },
      { new: true }
    );

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /api/client-admin/whatsapp/groups/:id
export async function deleteGroup(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const existing = await WhatsappContactGroup.findOne({ _id: id, companyId });
    if (!existing) {
      return res.status(404).json({ error: "Group not found" });
    }

    await WhatsappContactGroup.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Group deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/groups/:id/assign
export async function assignContacts(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  const { contactIds } = req.body;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });
  if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
    return res.status(400).json({ error: "contactIds array is required" });
  }

  try {
    const group = await WhatsappContactGroup.findOne({ _id: id, companyId });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.isDynamic) {
      return res.status(400).json({ error: "Cannot manually assign contacts to a dynamic group" });
    }

    await WhatsappContactGroup.findByIdAndUpdate(id, {
      $addToSet: { contactIds: { $each: contactIds } }
    });

    return res.status(200).json({ success: true, message: "Contacts assigned to group successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/groups/:id/remove
export async function removeContacts(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  const { contactIds } = req.body;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });
  if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
    return res.status(400).json({ error: "contactIds array is required" });
  }

  try {
    const group = await WhatsappContactGroup.findOne({ _id: id, companyId });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.isDynamic) {
      return res.status(400).json({ error: "Cannot manually remove contacts from a dynamic group" });
    }

    await WhatsappContactGroup.findByIdAndUpdate(id, {
      $pull: { contactIds: { $in: contactIds } }
    });

    return res.status(200).json({ success: true, message: "Contacts removed from group successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
