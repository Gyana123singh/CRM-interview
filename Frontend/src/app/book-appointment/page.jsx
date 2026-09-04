"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, AlertCircle, Sparkles, Building, Briefcase, ChevronUp, ChevronDown } from "lucide-react";
import axiosInstance from "@/utils/api";
import { toast } from "react-toastify";

function BookingForm() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");

  const [meta, setMeta] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch available slots/services metadata from backend
  useEffect(() => {
    if (!companyId) return;

    const fetchMeta = async () => {
      setLoadingMeta(true);
      try {
        const res = await axiosInstance.get(`/api/public/appointments/meta?companyId=${companyId}`);
        setMeta(res.data);

        // Pre-select first available date if available
        if (res.data.dates && res.data.dates.length > 0) {
          const firstAvailable = res.data.dates.find((d) => d.slots.some((s) => s.available));
          if (firstAvailable) {
            setSelectedDate(firstAvailable.date);
          } else {
            setSelectedDate(res.data.dates[0].date);
          }
        } else {
          setSelectedDate(new Date().toISOString().split("T")[0]);
        }

        // Pre-select first service if available
        if (res.data.services && res.data.services.length > 0) {
          setService(res.data.services[0]);
        } else {
          setService("AI Consultation");
        }
      } catch (err) {
        console.error("Failed to load booking metadata:", err);
        toast.error("Could not fetch calendar configurations");
      } finally {
        setLoadingMeta(false);
      }
    };

    fetchMeta();
  }, [companyId]);

  // Compute current slots based on selected date
  const currentSlots = React.useMemo(() => {
    if (!meta) return [];

    const config = meta.dates.find(d => d.date === selectedDate);
    if (config) {
      return config.slots;
    }

    // Default fallback slots if no custom date configuration is registered
    if (meta.dates.length === 0) {
      return [
        { time: "10:00 AM", available: true },
        { time: "11:30 AM", available: true },
        { time: "01:00 PM", available: true },
        { time: "02:30 PM", available: true },
        { time: "04:00 PM", available: true }
      ];
    }

    return [];
  }, [meta, selectedDate]);

  // Select first available slot automatically when date/slots change
  useEffect(() => {
    const firstAvailable = currentSlots.find(s => s.available);
    if (firstAvailable) {
      setSelectedSlot(firstAvailable.time);
    } else {
      setSelectedSlot(null);
    }
  }, [currentSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyId) {
      toast.error("Invalid booking link: Missing company token");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please choose a time slot");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/api/public/appointments", {
        companyId,
        customerName,
        phone,
        email,
        notes,
        date: selectedDate,
        timeSlot: selectedSlot,
        service
      });
      setBookingSuccess(res.data);
      toast.success("Your appointment is reserved!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to confirm reservation. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!companyId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">Invalid Booking Link</h2>
          <p className="text-sm text-slate-400">
            This reservation calendar link is missing a valid company workspace identifier. Please request the full link from your provider.
          </p>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-850 p-8 rounded-3xl text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="h-16 w-16 rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">Appointment Scheduled!</h2>
            <p className="text-sm text-slate-400">
              Your appointment slot has been confirmed in our calendar. A confirmation prompt and details will be shared soon.
            </p>
          </div>

          <div className="p-5 bg-slate-950/50 border border-slate-850 rounded-2xl text-left text-xs space-y-3.5">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
              <span className="text-slate-500 font-bold uppercase">Customer</span>
              <span className="text-slate-200 font-bold">{bookingSuccess.customerName}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
              <span className="text-slate-500 font-bold uppercase">Service</span>
              <span className="text-slate-200 font-bold">{bookingSuccess.service}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
              <span className="text-slate-500 font-bold uppercase">Date</span>
              <span className="text-slate-200 font-bold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" /> {bookingSuccess.date}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500 font-bold uppercase">Time Slot</span>
              <span className="text-slate-200 font-bold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-indigo-400" /> {bookingSuccess.timeSlot}
              </span>
            </div>
          </div>

          <button
            onClick={() => setBookingSuccess(null)}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all hover:scale-102"
          >
            Book Another Slot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Direct Scheduling
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-100 uppercase">
            Book Appointment
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Choose an available date and select your preferred time slot to reserve your appointment instantly.
          </p>
        </div>

        {/* Booking Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs">
            
            <div className="space-y-5">
              {/* Service Selection */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" /> Service Category
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                >
                  {meta && meta.services.length > 0 ? (
                    meta.services.map((srv) => (
                      <option key={srv} value={srv}>{srv}</option>
                    ))
                  ) : (
                    <>
                      <option value="AI Consultation">AI Consultation</option>
                      <option value="Real Estate Consultation">Real Estate Consultation</option>
                      <option value="General Meeting">General Meeting</option>
                    </>
                  )}
                </select>
              </div>

              {/* Date Selection (Calendar Grid) */}
              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> 1. Select Date
                </label>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-left transition"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    {selectedDate ? selectedDate : "Click to select a date..."}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {showDatePicker && (
                  <div className="absolute left-0 mt-1.5 z-50 w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <MonthCalendar
                      selectedDate={selectedDate}
                      onSelectDate={(newDate) => {
                        setSelectedDate(newDate);
                        setShowDatePicker(false);
                      }}
                      dates={meta ? meta.dates : []}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> 2. Choose Time Slot
              </label>
              
              {loadingMeta ? (
                <div className="py-4 text-center text-slate-500 font-bold">Checking slot availability...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {currentSlots.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setSelectedSlot(s.time)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        !s.available
                          ? "border-slate-950 bg-slate-950/25 text-slate-600 line-through cursor-not-allowed"
                          : selectedSlot === s.time
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold ring-2 ring-indigo-500/20 scale-102"
                          : "border-slate-850 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-slate-100"
                      }`}
                    >
                      <div className="font-bold">{s.time}</div>
                      <div className="text-[7px] uppercase mt-0.5 opacity-80 font-bold">
                        {s.available ? "Open" : "Booked"}
                      </div>
                    </button>
                  ))}
                  {currentSlots.length === 0 && (
                    <div className="col-span-full py-4 text-center text-slate-500 font-semibold border border-dashed border-slate-800 rounded-2xl">
                      No availability settings configured for this date.
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr className="border-slate-850 my-6" />

            {/* Customer Details Form */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> 3. Fill Personal Information
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Your Name *</span>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Rahul Mohanty"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Phone Number *</span>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Email Address</span>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="rahul.m@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Inquiry Notes / Request Details</span>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <textarea
                      placeholder="Provide any additional requests, budget details, or background information..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all hover:scale-101 disabled:opacity-50 mt-4"
            >
              {submitting ? "Booking Appointment..." : "Confirm Schedule Reservation"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-bold">
        Loading Appointment Booking System...
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}

// Custom Month Calendar Picker Component for Public Booking
function MonthCalendar({
  selectedDate,
  onSelectDate,
  dates
}) {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth() || 5); // 0-indexed, default to June

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
    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 w-full text-xs shadow-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">
          {months[viewMonth]} {viewYear}
        </h4>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-550 text-[9px] uppercase mb-1.5">
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

          // Find date config from public metadata
          const dConfig = dates.find((d) => d.date === cellDateStr);
          const hasAvailableSlots = dConfig ? dConfig.slots.some((s) => s.available) : false;

          const isSelected = selectedDate === cellDateStr;

          return (
            <button
              key={idx}
              type="button"
              disabled={!hasAvailableSlots}
              onClick={() => onSelectDate(cellDateStr)}
              className={`h-8 w-full flex items-center justify-center rounded-xl text-[11px] transition-all font-bold relative ${
                !cell.isCurrentMonth
                  ? "text-slate-600 opacity-20"
                  : "text-slate-300"
              } ${
                !hasAvailableSlots
                  ? "text-slate-700 opacity-30 cursor-not-allowed border border-transparent hover:bg-transparent"
                  : isSelected
                  ? "border-2 border-emerald-500 bg-emerald-500/25 text-emerald-400 font-extrabold ring-2 ring-emerald-500/20 shadow-sm scale-102"
                  : "border border-emerald-500/35 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/10"
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
