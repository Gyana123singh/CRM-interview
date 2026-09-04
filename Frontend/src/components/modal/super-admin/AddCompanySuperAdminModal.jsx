"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Eye, EyeOff, Upload, Globe, Phone, Mail, Building, ShieldAlert, MapPin, CreditCard, Languages } from "lucide-react";
import { toast } from "react-toastify";

export default function AddCompanyModal({
  isOpen,
  onClose,
  onAdd,
  mode = "add",
  company,
  plans = []
}) {
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountUrl, setAccountUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [planName, setPlanName] = useState("Starter Plan");
  const [planType, setPlanType] = useState("Monthly");
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("English");
  const [status, setStatus] = useState("active");
  const [credits, setCredits] = useState(1000);

  // View password states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync state with selected company if mode is edit/view
  useEffect(() => {
    if (isOpen) {
      if (company && (mode === "edit" || mode === "view")) {
        setName(company.name || "");
        setEmail(company.email || "");
        setAccountUrl(company.accountUrl || "");
        setPhone(company.phone || "");
        setWebsite(company.website || "");
        setAddress(company.address || "");
        if (company.plan) {
          const match = company.plan.match(/(.+?)\s*\((.+?)\)/);
          if (match) {
            setPlanName(match[1]);
            setPlanType(match[2]);
          } else {
            setPlanName(company.plan);
            setPlanType("Monthly");
          }
        } else {
          setPlanName("Advanced");
          setPlanType("Monthly");
        }
        setStatus(company.status || "active");
        setAvatar(company.logo || "");
        setCredits(company.credits !== undefined ? company.credits : 1000);
        setPassword("••••••••");
        setConfirmPassword("••••••••");
      } else {
        handleReset();
      }
    }
  }, [isOpen, company, mode]);

  if (!isOpen || !mounted) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error("Image size should be below 4MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCancelAvatar = () => {
    setAvatar("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "view") {
      onClose();
      return;
    }
    if (!name || !phone) {
      toast.warning("Please fill in all required fields marked with *");
      return;
    }
    if (mode === "add") {
      if (!password || !confirmPassword) {
        toast.warning("Password is required for new company creation");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    const companyData = {
      name,
      email: email || "info@example.com",
      accountUrl: accountUrl || `${name.toLowerCase().replace(/\s+/g, "")}.example.com`,
      phone,
      website,
      address,
      status: status,
      logo: avatar || undefined,
      password,
      credits: Number(credits) || 0,
    };

    onAdd(companyData);
    onClose();
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setAccountUrl("");
    setPhone("");
    setWebsite("");
    setPassword("");
    setConfirmPassword("");
    setAddress("");
    setPlanName("Starter Plan");
    setPlanType("Monthly");
    setCurrency("INR");
    setLanguage("English");
    setStatus("active");
    setAvatar("");
    setCredits(1000);
  };

  const defaultSvgAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23cbd5e1"><circle cx="50" cy="35" r="20"/><path d="M15,85 C15,65 30,55 50,55 C70,55 85,65 85,85 Z"/></svg>`;

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl relative overflow-hidden animate-fade-in flex flex-col max-h-[calc(100vh-2rem)] md:max-h-[85vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            {mode === "view" ? "Company Profile Details" : mode === "edit" ? "Edit Company Settings" : "Add New Company"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        {mode === "view" ? (
          <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
            {/* Visual Header / Avatar Banner */}
            <div className="p-5 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-950/40 dark:to-slate-950/10 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4.5">
              <div className="h-16 w-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex items-center justify-center shadow-inner">
                <img
                  src={avatar || defaultSvgAvatar}
                  alt="Company Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">{name}</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${status === "active"
                      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                      : "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40"
                    }`}>
                    {status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight">{accountUrl}</p>
              </div>
            </div>

            {/* Read-Only Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-4 w-4" />
                  <span className="font-extrabold uppercase text-[9px] tracking-wider">Email Address</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">{email || "Not Provided"}</p>
              </div>

              {/* Phone */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="h-4 w-4" />
                  <span className="font-extrabold uppercase text-[9px] tracking-wider">Phone Number</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{phone}</p>
              </div>

              {/* Website */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe className="h-4 w-4" />
                  <span className="font-extrabold uppercase text-[9px] tracking-wider">Website URL</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                  {website ? (
                    <a href={website} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">
                      {website}
                    </a>
                  ) : "Not Provided"}
                </p>
              </div>

              {/* Plan Information */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-extrabold uppercase text-[9px] tracking-wider">Subscription Tier</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs capitalize">
                  {planName} ({planType})
                </p>
              </div>

              {/* Plan Price */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-455">
                  <CreditCard className="h-4 w-4 text-orange-500" />
                  <span className="font-extrabold uppercase text-[9px] tracking-wider">Plan Price</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {company?.planPrice !== undefined && company?.planPrice !== null ? `₹${Number(company.planPrice).toLocaleString("en-IN")}` : "N/A"}
                </p>
              </div>

              {/* Available Credits */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-455">
                  <CreditCard className="h-4 w-4 text-teal-500" />
                  <span className="font-extrabold uppercase text-[9px] tracking-wider">Available Credits</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {credits !== undefined && credits !== null ? Number(credits).toLocaleString() : "1,000"}
                </p>
              </div>

              {/* Plan Upgraded Date */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Languages className="h-4 w-4 text-purple-500" />
                  <span className="font-extrabold uppercase text-[9px] tracking-wider">Plan Upgraded Date</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {company?.planUpgradedDate ? new Date(company.planUpgradedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recently"}
                </p>
              </div>

              {/* Language & Currency */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Languages className="h-4 w-4" />
                  <span className="font-extrabold uppercase text-[9px] tracking-wider">Locale / Language</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{language} ({currency})</p>
              </div>

              {/* Created Date info if exists */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Building className="h-4 w-4" />
                  <span className="font-extrabold uppercase text-[9px] tracking-wider">Representative Contact</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{company?.contactPerson || "Admin"}</p>
              </div>

              {/* Address */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1 md:col-span-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-4 w-4" />
                  <span className="font-extrabold uppercase text-[9px] tracking-wider">HQ Address Location</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-normal">{address || "Not Provided"}</p>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 hover:shadow-md text-white rounded-xl font-bold shadow-md transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">

            {/* Upload Profile Image Area */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex items-center justify-center">
                <img
                  src={avatar || defaultSvgAvatar}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Upload Profile Image</p>
                <p className="text-[10px] text-slate-400">Image should be below 4 mb</p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 text-white rounded-lg text-[10px] font-bold shadow-md transition"
                  >
                    <Upload className="h-3 w-3" /> Upload
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleCancelAvatar}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Form Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Company Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                />
              </div>

              {/* Account URL (Full width spans) */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  Account URL
                </label>
                <input
                  type="text"
                  placeholder="Account URL (e.g. bwi.example.com)"
                  value={accountUrl}
                  onChange={(e) => setAccountUrl(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                />
              </div>

              {/* Website */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  Website
                </label>
                <input
                  type="url"
                  placeholder="Website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                />
              </div>

              {/* Password controls - hidden in Edit mode to prevent locking admin out */}
              {mode === "add" && (
                <>
                  {/* Password */}
                  <div className="space-y-1 relative">
                    <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required={mode === "add"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none pr-10 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1 relative">
                    <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required={mode === "add"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none pr-10 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </>
              )}

              {/* Address */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                />
              </div>

              {/* Language */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none cursor-pointer font-bold"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none cursor-pointer font-bold"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Credits */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  Available Credits
                </label>
                <input
                  type="number"
                  placeholder="Credits (e.g. 1000)"
                  value={credits}
                  onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                />
              </div>

            </div>

            {/* Form Actions */}
            <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 hover:shadow-lg text-white rounded-xl font-bold shadow-md transition"
              >
                {mode === "edit" ? "Save Changes" : "Add Company"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
