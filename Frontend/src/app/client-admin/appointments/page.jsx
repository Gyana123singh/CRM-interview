"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import { Calendar, Plus, Sparkles, Clock, CheckCircle2, User, Phone, Ban, Share2, Check, Trash2, Settings, ListPlus, ChevronUp, ChevronDown, Eye } from "lucide-react";
import axiosInstance, { ENDPOINTS } from "@/utils/api";
import { toast } from "react-toastify";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);

  // Config states
  const [configuredSlots, setConfiguredSlots] = useState([]);
  const [configuredServices, setConfiguredServices] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("2026-06-27");
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [service, setService] = useState("Real Estate Consultation");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedAptDetails, setSelectedAptDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Config form states
  const [configDate, setConfigDate] = useState("");
  const [configTimes, setConfigTimes] = useState("10:00 AM, 11:00 AM, 12:00 PM");
  const [configServiceName, setConfigServiceName] = useState("");
  const [activeSettingsTab, setActiveSettingsTab] = useState("slots");

  // Retrieve company info from Redux
  const companyId = useSelector((state) => state.auth.user?.companyId) || "company-infotattva-id";

  const fetchAppointments = async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.appointments.base);
      setAppointments(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load appointments log");
    }
  };

  const fetchSlots = async (selectedDate) => {
    try {
      const res = await axiosInstance.get(`/api/client-admin/appointments/slots?date=${selectedDate}`);
      setSlots(res.data);
      // Select first available slot by default
      const availableSlot = res.data.find((s) => s.available);
      if (availableSlot) {
        setTimeSlot(availableSlot.time);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConfigs = async () => {
    try {
      const slotsRes = await axiosInstance.get(ENDPOINTS.appointments.slotConfigs);
      setConfiguredSlots(slotsRes.data);

      const servicesRes = await axiosInstance.get(ENDPOINTS.appointments.serviceConfigs);
      setConfiguredServices(servicesRes.data);
    } catch (error) {
      console.error("Failed to load calendar configurations:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (date) {
      fetchSlots(date);
    }
  }, [date]);

  // Set default available date on initial configuration load or changes
  useEffect(() => {
    if (configuredSlots.length > 0) {
      const currentConfig = configuredSlots.find(c => c.date === date);
      const isCurrentAvailable = currentConfig ? (() => {
        const activeBookings = appointments.filter(
          (a) => a.date === date && a.status !== "cancelled"
        );
        const bookedTimes = new Set(activeBookings.map((b) => b.timeSlot));
        return currentConfig.times.some((time) => !bookedTimes.has(time));
      })() : false;

      if (!isCurrentAvailable) {
        const firstAvailableDate = configuredSlots.find(c => {
          const activeBookings = appointments.filter(
            (a) => a.date === c.date && a.status !== "cancelled"
          );
          const bookedTimes = new Set(activeBookings.map((b) => b.timeSlot));
          return c.times.some((time) => !bookedTimes.has(time));
        });
        if (firstAvailableDate) {
          setDate(firstAvailableDate.date);
        } else {
          setDate(configuredSlots[0].date);
        }
      }
    }
  }, [configuredSlots, appointments]);

  // Sync first service as default selection
  useEffect(() => {
    if (configuredServices.length > 0) {
      setService(configuredServices[0].name);
    }
  }, [configuredServices]);

  const handleBookAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phone) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post(ENDPOINTS.appointments.base, {
        customerName,
        phone,
        email,
        notes,
        date,
        timeSlot,
        service
      });
      toast.success("Appointment reservation registered!");
      setAppointments(prev => [res.data, ...prev]);
      setCustomerName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setShowAddForm(false);
      fetchSlots(date);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await axiosInstance.patch(ENDPOINTS.appointments.cancel(id));
      toast.success("Appointment cancelled successfully");
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: "cancelled" } : a));
      fetchSlots(date);
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  const confirmAppointment = async (id) => {
    try {
      await axiosInstance.patch(ENDPOINTS.appointments.confirm(id));
      toast.success("Appointment confirmed successfully");
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: "confirmed" } : a));
      fetchSlots(date);
    } catch (error) {
      toast.error("Failed to confirm appointment");
    }
  };

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/book-appointment?companyId=${companyId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Public booking link copied to clipboard!");
    }
  };

  // Configurations API Submit Handlers
  const handleSaveSlotConfig = async (e) => {
    e.preventDefault();
    if (!configDate || !configTimes) {
      toast.error("Date and time slots are required");
      return;
    }

    const timesArray = configTimes.split(",").map(t => t.trim()).filter(Boolean);
    if (timesArray.length === 0) {
      toast.error("Provide at least one available slot time");
      return;
    }

    try {
      const res = await axiosInstance.post(ENDPOINTS.appointments.slotConfigs, {
        date: configDate,
        times: timesArray
      });
      toast.success(`Slots configured for ${configDate}!`);
      setConfiguredSlots(prev => {
        const filtered = prev.filter(c => c.date !== configDate);
        return [...filtered, res.data].sort((a, b) => a.date.localeCompare(b.date));
      });
      if (configDate === date) {
        fetchSlots(date);
      }
      setConfigDate("");
    } catch (error) {
      toast.error("Failed to save slot settings");
    }
  };

  const handleDeleteSlotConfig = async (id, slotDateStr) => {
    try {
      await axiosInstance.delete(ENDPOINTS.appointments.slotConfigDelete(id));
      toast.success("Date slot settings removed");
      setConfiguredSlots(configuredSlots.filter(c => c.id !== id));
      if (slotDateStr === date) {
        fetchSlots(date);
      }
    } catch (error) {
      toast.error("Failed to delete slot configuration");
    }
  };

  const handleSaveServiceConfig = async (e) => {
    e.preventDefault();
    if (!configServiceName.trim()) return;

    try {
      const res = await axiosInstance.post(ENDPOINTS.appointments.serviceConfigs, {
        name: configServiceName.trim()
      });
      toast.success("Predefined service registered!");
      setConfiguredServices(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setConfigServiceName("");
    } catch (error) {
      toast.error("Failed to register service");
    }
  };

  const handleDeleteServiceConfig = async (id) => {
    try {
      await axiosInstance.delete(ENDPOINTS.appointments.serviceConfigDelete(id));
      toast.success("Service type removed");
      setConfiguredServices(configuredServices.filter(s => s.id !== id));
    } catch (error) {
      toast.error("Failed to remove service");
    }
  };

  return (
    <>
      <DashboardWrapper>
        <div className="space-y-6">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
                Appointment Booking Calendar <Calendar className="h-6 w-6 text-indigo-500" />
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage booking confirmation schedules, WhatsApp auto-reminders, and slot availability calendars.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleShareLink}
                className="flex items-center gap-1.5 px-4 py-2 border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 rounded-xl text-xs font-bold transition-all hover:scale-102"
              >
                <Share2 className="h-4 w-4" /> Share Booking Link
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 hover:shadow-xl text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-all"
              >
                <Plus className="h-4 w-4" /> Book New Slot
              </button>
            </div>
          </div>

          {/* Calendar slots grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Column 1: Appointments List */}
            <div className="lg:col-span-2 space-y-4">
              {showAddForm && (
                <form onSubmit={handleBookAppointmentSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 text-xs shadow-md animate-fade-in">
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide">
                    Schedule Client Reservation
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 uppercase text-[10px]">Customer Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Mohanty"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 uppercase text-[10px]">Phone Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="+91..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 uppercase text-[10px]">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. customer@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="font-bold text-slate-400 uppercase text-[10px] flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Select Booking Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="w-full flex items-center justify-between px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-left text-xs transition"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-500" />
                        {date ? date : "Click to select a date..."}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>

                    {showDatePicker && (
                      <div className="absolute left-0 mt-1.5 z-50 w-full max-w-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-xl p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <MonthCalendar
                          selectedDate={date}
                          onSelectDate={(newDate) => {
                            setDate(newDate);
                            setShowDatePicker(false);
                          }}
                          configuredSlots={configuredSlots}
                          appointments={appointments}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 uppercase text-[10px] flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" /> Choose Available Time Slot
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                      >
                        {slots.filter(s => s.available).map((s) => (
                          <option key={s.time} value={s.time}>{s.time}</option>
                        ))}
                        {slots.filter(s => s.available).length === 0 && (
                          <option disabled>No slots available</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 uppercase text-[10px]">Select Service Type</label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                      >
                        {configuredServices.length > 0 ? (
                          configuredServices.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))
                        ) : (
                          <>
                            <option value="Real Estate Consultation">Real Estate Consultation</option>
                            <option value="Clinic Bot Integration Session">Clinic Bot Integration Session</option>
                            <option value="Patia Flat Site Viewing">Patia Flat Site Viewing</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Additional Notes / Requirements</label>
                    <textarea
                      placeholder="e.g. Budget range, specific property details, or custom consultation preferences..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 text-white rounded-xl font-bold shadow-md shadow-primary/10 transition-all disabled:opacity-50"
                    >
                      {submitting ? "Booking..." : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide">
                  Booking Reservation Log
                </h3>

                <div className="space-y-3.5">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:border-indigo-100 dark:hover:border-indigo-900/40 transition bg-slate-50/20 dark:bg-slate-950/10">
                      <div className="flex gap-3.5 items-start">
                        <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-slate-50 text-sm leading-none">{apt.customerName}</span>
                            {apt.email && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">({apt.email})</span>
                            )}
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${apt.status === "confirmed"
                                ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600"
                                : apt.status === "pending"
                                  ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600"
                                  : "bg-rose-100 dark:bg-rose-950/40 text-rose-600"
                              }`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 font-semibold">{apt.service}</p>
                          {apt.notes && (
                            <p className="text-slate-400 dark:text-slate-500 italic max-w-md">{apt.notes}</p>
                          )}
                          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> Date: {apt.date} • Time Slot: {apt.timeSlot}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => setSelectedAptDetails(apt)}
                          className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <a href={`tel:${apt.phone}`} className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500">
                          <Phone className="h-4 w-4" />
                        </a>
                        {apt.status === "pending" && (
                          <button
                            onClick={() => confirmAppointment(apt.id)}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100 rounded-xl text-[10px] font-bold flex items-center gap-1 border border-emerald-200/50"
                          >
                            <Check className="h-3.5 w-3.5" /> Confirm
                          </button>
                        )}
                        {apt.status !== "cancelled" && (
                          <button
                            onClick={() => cancelAppointment(apt.id)}
                            className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-500 hover:bg-rose-100 rounded-xl text-[10px] font-bold flex items-center gap-1 border border-rose-200/50"
                          >
                            <Ban className="h-3 w-3" /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-center text-slate-400 dark:text-slate-500 py-6">No appointments booked yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Available time slots grid & Settings configurator */}
            <div className="space-y-6">

              {/* Available time slots card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm h-fit">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center gap-1.5">
                  Available Slots <Clock className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                </h3>

                <div className="space-y-3">
                  {slots.map((s, idx) => (
                    <div key={idx} className={`p-3 border rounded-xl flex justify-between items-center text-xs ${s.available
                        ? "border-emerald-100 dark:border-emerald-950/40 bg-emerald-500/5 text-emerald-600"
                        : "border-slate-100 dark:border-slate-800 text-slate-400 line-through"
                      }`}>
                      <span className="font-bold">{s.time}</span>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${s.available ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}>
                        {s.available ? "Available" : "Booked"}
                      </span>
                    </div>
                  ))}
                  {slots.length === 0 && (
                    <p className="text-center text-slate-400 py-4">No slots configured for this date.</p>
                  )}
                </div>
              </div>

              {/* Calendar Settings Configurator Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                  Calendar Settings <Settings className="h-4.5 w-4.5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
                </h3>

                {/* Tab Navigation */}
                <div className="flex border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-[10px] font-bold uppercase">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsTab("slots")}
                    className={`w-1/2 py-2 text-center transition ${activeSettingsTab === "slots" ? "bg-indigo-500 text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"}`}
                  >
                    Dates & Slots
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSettingsTab("services")}
                    className={`w-1/2 py-2 text-center transition ${activeSettingsTab === "services" ? "bg-indigo-500 text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"}`}
                  >
                    Service Types
                  </button>
                </div>

                {/* Tab Content 1: Dates & Slots */}
                {activeSettingsTab === "slots" && (
                  <div className="space-y-4 text-xs">
                    <form onSubmit={handleSaveSlotConfig} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 bg-slate-50/20">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Configure Date Availability</h4>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[9px]">Select Date</span>
                        <input
                          type="date"
                          required
                          value={configDate}
                          onChange={e => setConfigDate(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[9px]">Available Time Slots (Comma-separated)</span>
                        <input
                          type="text"
                          required
                          placeholder="10:00 AM, 11:30 AM, 02:00 PM"
                          value={configTimes}
                          onChange={e => setConfigTimes(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 text-white rounded-xl font-bold shadow transition"
                      >
                        Save Slots Configuration
                      </button>
                    </form>

                    {/* Configured Slot Dates List */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">Configured Dates List</span>
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {configuredSlots.map(c => (
                          <div key={c.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-start bg-slate-50/10">
                            <div className="space-y-1">
                              <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[9px] font-bold">{c.date}</span>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">{c.times.join(" • ")}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSlotConfig(c.id, c.date)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {configuredSlots.length === 0 && (
                          <p className="text-center text-slate-400 py-3 italic">No custom date slots configured. Defaulting to standard slots.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Predefined Services */}
                {activeSettingsTab === "services" && (
                  <div className="space-y-4 text-xs">
                    <form onSubmit={handleSaveServiceConfig} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 bg-slate-50/20">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Add Predefined Service Type</h4>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[9px]">Service Name</span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Real Estate Consultation"
                          value={configServiceName}
                          onChange={e => setConfigServiceName(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 text-white rounded-xl font-bold shadow transition flex items-center justify-center gap-1.5"
                      >
                        <ListPlus className="h-4 w-4" /> Add Service Type
                      </button>
                    </form>

                    {/* Configured Predefined Services List */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">Predefined Services List</span>
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {configuredServices.map(s => (
                          <div key={s.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center bg-slate-50/10">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteServiceConfig(s.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {configuredServices.length === 0 && (
                          <p className="text-center text-slate-400 py-3 italic">No custom services configured. Defaulting to standard services.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      </DashboardWrapper>

      {/* Reservation Details Modal Dialog */}
      {selectedAptDetails && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-xs space-y-5 animate-in scale-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wider">
                Booking Details
              </h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${selectedAptDetails.status === "confirmed"
                  ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600"
                  : selectedAptDetails.status === "pending"
                    ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600"
                    : "bg-rose-100 dark:bg-rose-950/40 text-rose-600"
                }`}>
                {selectedAptDetails.status}
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-start py-1 border-b border-slate-50 dark:border-slate-850/30">
                <span className="text-slate-400 font-bold uppercase">Customer</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold text-right">{selectedAptDetails.customerName}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-50 dark:border-slate-850/30">
                <span className="text-slate-400 font-bold uppercase">Phone</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold text-right">{selectedAptDetails.phone}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-50 dark:border-slate-850/30">
                <span className="text-slate-400 font-bold uppercase">Email</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold text-right">{selectedAptDetails.email || "N/A"}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-50 dark:border-slate-850/30">
                <span className="text-slate-400 font-bold uppercase">Service</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold text-right">{selectedAptDetails.service}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-50 dark:border-slate-850/30">
                <span className="text-slate-400 font-bold uppercase">Date</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold text-right">{selectedAptDetails.date}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-50 dark:border-slate-850/30">
                <span className="text-slate-400 font-bold uppercase">Time Slot</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold text-right">{selectedAptDetails.timeSlot}</span>
              </div>
              <div className="space-y-1.5 py-1">
                <span className="text-slate-400 font-bold uppercase">Notes & Requirements</span>
                <p className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-slate-755 dark:text-slate-350 border border-slate-150 dark:border-slate-850 min-h-16 whitespace-pre-wrap leading-relaxed font-semibold">
                  {selectedAptDetails.notes || "No special requests noted."}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3">
              {selectedAptDetails.status === "pending" && (
                <button
                  onClick={() => {
                    confirmAppointment(selectedAptDetails.id);
                    setSelectedAptDetails(null);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition shadow-sm"
                >
                  Confirm Booking
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedAptDetails(null)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Custom Month Calendar Picker Component
function MonthCalendar({
  selectedDate,
  onSelectDate,
  configuredSlots,
  appointments
}) {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth() || 5); // 0-indexed, June = 5

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Generate Month Grid cells
  const firstDay = new Date(viewYear, viewMonth, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      month: viewMonth - 1,
      year: viewYear
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      isCurrentMonth: true,
      month: viewMonth,
      year: viewYear
    });
  }

  // Fill grid to multiple of 7 (42 cells) to match the image layout
  const targetTotal = 42;
  const currentTotal = cells.length;
  for (let i = 1; i <= (targetTotal - currentTotal); i++) {
    cells.push({
      day: i,
      isCurrentMonth: false,
      month: viewMonth + 1,
      year: viewYear
    });
  }

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="bg-slate-905 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 w-full text-xs shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          {months[viewMonth]} {viewYear}
        </h4>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 dark:text-slate-500 text-[9px] uppercase mb-1.5">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          let y = cell.year;
          let m = cell.month;
          if (m < 0) {
            m = 11;
            y -= 1;
          } else if (m > 11) {
            m = 0;
            y += 1;
          }
          const cellDateStr = `${y}-${pad(m + 1)}-${pad(cell.day)}`;

          // Check if date has available slots
          const config = configuredSlots.find((c) => c.date === cellDateStr);
          let hasAvailableSlots = config ? (() => {
            const activeBookings = appointments.filter(
              (a) => a.date === cellDateStr && a.status !== "cancelled"
            );
            const bookedTimes = new Set(activeBookings.map((b) => b.timeSlot));
            return config.times.some((time) => !bookedTimes.has(time));
          })() : false;

          // Default fallback date availability if configurations are empty
          if (configuredSlots.length === 0 && cellDateStr === "2026-06-27") {
            hasAvailableSlots = true;
          }

          const isSelected = selectedDate === cellDateStr;

          return (
            <button
              key={idx}
              type="button"
              disabled={!hasAvailableSlots}
              onClick={() => onSelectDate(cellDateStr)}
              className={`h-8 w-full flex items-center justify-center rounded-xl text-[11px] transition-all font-bold relative ${!cell.isCurrentMonth
                  ? "text-slate-400 dark:text-slate-600 opacity-20"
                  : "text-slate-700 dark:text-slate-300"
                } ${!hasAvailableSlots
                  ? "text-slate-400 dark:text-slate-650 opacity-40 cursor-not-allowed border border-transparent hover:bg-transparent"
                  : isSelected
                    ? "border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold ring-2 ring-emerald-500/20 shadow-sm scale-102"
                    : "border border-emerald-500/35 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/10"
                }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
