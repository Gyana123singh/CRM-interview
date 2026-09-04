import {
  Appointment,
  AppointmentSlotConfig,
  AppointmentServiceConfig,
  Lead,
  ChatThread,
  Message,
  Company,
  User,
  AgentProfile,
  AuditLog
} from "../models/index.js";
import { broadcastToCompany } from "../utils/sse.js";

// GET /appointments
export async function getAppointments(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    let appointments = await Appointment.find({ companyId }).sort({ appointmentDate: 1 });

    if (appointments.length === 0) {
      const firstLead = await Lead.findOne({ companyId });
      if (firstLead) {
        await Appointment.insertMany([
          {
            companyId,
            leadId: firstLead._id,
            customerName: "Dr. Sunita Rao",
            phone: "+91 94321 09876",
            email: "sunita.rao@healthclinic.in",
            notes: "Needs automated spa booking slots calendar demonstration.",
            appointmentDate: new Date("2026-06-01"),
            appointmentTime: "11:30 AM",
            service: "Clinic Bot Integration Session",
            status: "confirmed"
          },
          {
            companyId,
            leadId: firstLead._id,
            customerName: "Rahul Mohanty",
            phone: "+91 98765 43210",
            email: "rahul.m@gmail.com",
            notes: "Interested in ready-to-move 2BHK flat near Patia.",
            appointmentDate: new Date("2026-06-02"),
            appointmentTime: "02:00 PM",
            service: "Patia Flat Site Viewing",
            status: "pending"
          }
        ]);
        appointments = await Appointment.find({ companyId }).sort({ appointmentDate: 1 });
      }
    }

    const formatted = appointments.map(a => ({
      id: a._id,
      customerName: a.customerName,
      phone: a.phone,
      email: a.email || "",
      notes: a.notes || "",
      date: a.appointmentDate.toISOString().split("T")[0],
      timeSlot: a.appointmentTime,
      service: a.service,
      status: String(a.status).toLowerCase()
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /appointments
export async function createAppointment(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { customerName, phone, email, notes, date, timeSlot, service } = req.body;
  if (!customerName || !phone || !date || !timeSlot) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  try {
    const matchedLead = await Lead.findOne({ companyId, phone });

    const appointment = await Appointment.create({
      companyId,
      leadId: matchedLead?._id || null,
      customerName,
      phone,
      email: email || null,
      notes: notes || null,
      appointmentDate: new Date(date),
      appointmentTime: timeSlot,
      service: service || "Real Estate Consultation",
      status: "confirmed"
    });

    return res.status(201).json({
      id: appointment._id,
      customerName: appointment.customerName,
      phone: appointment.phone,
      email: appointment.email || "",
      notes: appointment.notes || "",
      date: appointment.appointmentDate.toISOString().split("T")[0],
      timeSlot: appointment.appointmentTime,
      service: appointment.service,
      status: String(appointment.status).toLowerCase()
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /appointments/:id/cancel
export async function cancelAppointment(req, res) {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    return res.status(200).json({ id: appointment._id, status: String(appointment.status).toLowerCase() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/appointments/slots
export async function getAppointmentSlots(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const dateStr = req.query.date || new Date().toISOString().split("T")[0];

  try {
    const targetDate = new Date(dateStr);
    const nextDay = new Date(dateStr);
    nextDay.setDate(nextDay.getDate() + 1);

    const config = await AppointmentSlotConfig.findOne({
      companyId,
      slotDate: { $gte: targetDate, $lt: nextDay }
    });

    const allSlots = config ? config.slotTimes : ["10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];

    const bookedAppointments = await Appointment.find({
      companyId,
      appointmentDate: { $gte: targetDate, $lt: nextDay },
      status: { $in: ["confirmed", "pending"] }
    }).select("appointmentTime");

    const bookedTimes = new Set(bookedAppointments.map(a => a.appointmentTime));

    const slots = allSlots.map(time => ({
      time,
      available: !bookedTimes.has(time)
    }));

    return res.status(200).json(slots);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /public/appointments/slots
export async function getPublicAppointmentSlots(req, res) {
  const { companyId, date } = req.query;
  if (!companyId) return res.status(400).json({ error: "Company ID is required" });

  const dateStr = date || new Date().toISOString().split("T")[0];

  try {
    const targetDate = new Date(dateStr);
    const nextDay = new Date(dateStr);
    nextDay.setDate(nextDay.getDate() + 1);

    const config = await AppointmentSlotConfig.findOne({
      companyId: String(companyId),
      slotDate: { $gte: targetDate, $lt: nextDay }
    });

    const allSlots = config ? config.slotTimes : ["10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];

    const bookedAppointments = await Appointment.find({
      companyId: String(companyId),
      appointmentDate: { $gte: targetDate, $lt: nextDay },
      status: { $in: ["confirmed", "pending"] }
    }).select("appointmentTime");

    const bookedTimes = new Set(bookedAppointments.map(a => a.appointmentTime));

    const slots = allSlots.map(time => ({
      time,
      available: !bookedTimes.has(time)
    }));

    return res.status(200).json(slots);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /public/appointments
export async function createPublicAppointment(req, res) {
  const { companyId, customerName, phone, email, notes, date, timeSlot, service } = req.body;
  if (!companyId || !customerName || !phone || !date || !timeSlot) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  try {
    let matchedLead = await Lead.findOne({ companyId, phone });
    let assignedAgentId = null;

    if (!matchedLead) {
      matchedLead = await Lead.create({
        companyId,
        name: customerName,
        phone,
        email: email || null,
        serviceInterest: service || "Public Booking Session",
        message: notes || "Lead registered via public appointment booking.",
        source: "Landing Pages",
        status: "New"
      });

      const thread = await ChatThread.create({
        leadId: matchedLead._id,
        aiAutoReply: true,
        status: "active"
      });

      const welcomeMsg = await Message.create({
        threadId: thread._id,
        sender: "bot",
        text: `Hi ${customerName}, thank you for scheduling a ${service || "session"} with us! Your appointment is confirmed for ${date} at ${timeSlot}. Our team will connect with you shortly.`,
        channel: "WhatsApp"
      });

      try {
        broadcastToCompany(companyId, "lead_created", {
          id: matchedLead._id,
          name: matchedLead.name,
          phone: matchedLead.phone,
          email: matchedLead.email || "",
          location: "N/A",
          serviceInterest: matchedLead.serviceInterest,
          message: matchedLead.message || "",
          source: "Landing Pages",
          status: "New",
          assignedTo: "Unassigned",
          notes: "",
          createdAt: matchedLead.createdAt.toISOString()
        });

        broadcastToCompany(companyId, "message_created", {
          leadId: matchedLead._id,
          id: welcomeMsg._id,
          sender: "bot",
          text: welcomeMsg.text,
          timestamp: welcomeMsg.timestamp.toISOString(),
          channel: welcomeMsg.channel
        });
      } catch (e) {}

      const activeAgents = await User.find({ companyId, role: "team" });

      if (activeAgents.length > 0) {
        assignedAgentId = activeAgents[0]._id;
        await Lead.findByIdAndUpdate(matchedLead._id, { assignedToId: assignedAgentId });
        await AgentProfile.findOneAndUpdate({ userId: assignedAgentId }, { $inc: { leadsCount: 1 } });
      }

      await AuditLog.create({
        category: "AI Engine",
        event: `Captured Lead ${customerName} via Public Booking, assigned to agent: ${assignedAgentId || "Unassigned"}`,
        user: "Public Booking System",
        ip: req.ip || "127.0.0.1"
      });
    }

    const appointment = await Appointment.create({
      companyId,
      leadId: matchedLead._id,
      customerName,
      phone,
      email: email || null,
      notes: notes || null,
      appointmentDate: new Date(date),
      appointmentTime: timeSlot,
      service: service || "General Meeting",
      status: "confirmed"
    });

    return res.status(201).json({
      id: appointment._id,
      customerName: appointment.customerName,
      phone: appointment.phone,
      email: appointment.email || "",
      notes: appointment.notes || "",
      date: appointment.appointmentDate.toISOString().split("T")[0],
      timeSlot: appointment.appointmentTime,
      service: appointment.service,
      status: String(appointment.status).toLowerCase()
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /public/appointments/meta
export async function getPublicMeta(req, res) {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ error: "Company ID is required" });

  try {
    const slotConfigs = await AppointmentSlotConfig.find({ companyId: String(companyId) }).sort({ slotDate: 1 });
    const serviceConfigs = await AppointmentServiceConfig.find({ companyId: String(companyId) }).sort({ name: 1 });
    const bookedAppointments = await Appointment.find({
      companyId: String(companyId),
      status: { $in: ["confirmed", "pending"] }
    }).select("appointmentDate appointmentTime");

    const bookedByDate = {};
    bookedAppointments.forEach(apt => {
      const dateKey = apt.appointmentDate.toISOString().split("T")[0];
      if (!bookedByDate[dateKey]) {
        bookedByDate[dateKey] = new Set();
      }
      bookedByDate[dateKey].add(apt.appointmentTime);
    });

    const formattedSlots = slotConfigs.map(config => {
      const dateKey = config.slotDate.toISOString().split("T")[0];
      const bookedTimes = bookedByDate[dateKey] || new Set();

      const slotsList = config.slotTimes.map(time => ({
        time,
        available: !bookedTimes.has(time)
      }));

      return {
        date: dateKey,
        slots: slotsList
      };
    });

    return res.status(200).json({
      dates: formattedSlots,
      services: serviceConfigs.map(s => s.name)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/appointments/slot-configs
export async function getSlotConfigs(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const configs = await AppointmentSlotConfig.find({ companyId }).sort({ slotDate: 1 });
    return res.status(200).json(configs.map(c => ({
      id: c._id,
      date: c.slotDate.toISOString().split("T")[0],
      times: c.slotTimes
    })));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /client-admin/appointments/slot-configs
export async function saveSlotConfig(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { date, times } = req.body;
  if (!date || !times || !Array.isArray(times)) {
    return res.status(400).json({ error: "Date and times array are required" });
  }

  try {
    const slotDate = new Date(date);
    
    const config = await AppointmentSlotConfig.findOneAndUpdate(
      { companyId, slotDate },
      { slotTimes: times },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      id: config._id,
      date: config.slotDate.toISOString().split("T")[0],
      times: config.slotTimes
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /client-admin/appointments/slot-configs/:id
export async function deleteSlotConfig(req, res) {
  const { id } = req.params;
  try {
    await AppointmentSlotConfig.findByIdAndDelete(id);
    return res.status(200).json({ message: "Slot configuration deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/appointments/service-configs
export async function getServiceConfigs(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const services = await AppointmentServiceConfig.find({ companyId }).sort({ name: 1 });
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /client-admin/appointments/service-configs
export async function createServiceConfig(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Service name is required" });

  try {
    const service = await AppointmentServiceConfig.findOneAndUpdate(
      { companyId, name },
      { name },
      { upsert: true, new: true }
    );
    return res.status(201).json(service);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /client-admin/appointments/service-configs/:id
export async function deleteServiceConfig(req, res) {
  const { id } = req.params;
  try {
    await AppointmentServiceConfig.findByIdAndDelete(id);
    return res.status(200).json({ message: "Service type deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
