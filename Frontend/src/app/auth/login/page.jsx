"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser, setActiveRole } from "@/store/slices/authSlice";
import { Bot, KeyRound, Mail, Sparkles, Shield, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import axiosInstance, { ENDPOINTS } from "@/utils/api";
import { toast } from "react-toastify";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);

  // Field validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateEmail = (val) => {
    if (!val || !val.trim()) {
      return "Email address is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return "Please enter a valid email address (e.g. user@company.com).";
    }
    return "";
  };

  const validatePassword = (val) => {
    if (!val) {
      return "Password is required.";
    }
    if (val.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    return "";
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(val) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    }
    if (field === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Run full validation on submit
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailErr, password: passwordErr });

    if (emailErr || passwordErr) {
      toast.warning("Please correct the errors in the form before proceeding.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(ENDPOINTS.auth.login, {
        email: email.trim(),
        password,
      });

      const data = response.data;
      
      // Strict Role Tab Validation Check
      const actualRole = data.user.role ? data.user.role.toLowerCase().replace("_", "-") : "team";
      
      const normalizeRoleForTab = (role) => {
        if (role === "client-admin" || role === "super-admin" || role === "admin") return "admin";
        if (role === "sales-manager" || role === "manager") return "sales-manager";
        if (role === "sales-executive" || role === "executive" || role === "team") return "sales-executive";
        return role;
      };

      const userTabRole = normalizeRoleForTab(actualRole);

      const ROLE_LABELS = {
        "admin": "Admin",
        "sales-manager": "Sales Manager",
        "sales-executive": "Sales Executive"
      };

      if (selectedRole && selectedRole !== userTabRole) {
        const selectedLabel = ROLE_LABELS[selectedRole] || selectedRole;
        const actualLabel = ROLE_LABELS[userTabRole] || userTabRole;

        toast.error(`Access Denied! Credentials belong to [${actualLabel}], but [${selectedLabel}] role tab was selected. Please select the [${actualLabel}] tab.`);
        setIsLoading(false);
        return;
      }

      const userObject = {
        ...data.user,
        role: actualRole
      };

      // Save token and user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("crm_token", data.token);
      localStorage.setItem("user", JSON.stringify(userObject));

      // Dispatch user & active role to Redux
      dispatch(setUser(userObject));
      dispatch(setActiveRole(actualRole));
      
      const roleName = actualRole.replace("-", " ").toUpperCase();
      toast.success(`Welcome back, ${userObject.name}! Logged in as [${roleName}]`);
      router.push("/");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || "An unexpected error occurred during sign in.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Mesh Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl" />

      {/* Main Glassmorphic Card Container */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-2xl space-y-6 z-10">

        {/* Brand Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-gray-500 flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Bot className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent uppercase tracking-wider">
            CRM Sales Management System
          </h1>
          <p className="text-xs text-slate-400">
            Streamline leads, sales pipelines, and customer management.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} noValidate className="space-y-4 text-xs">

          {/* Email */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wide flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-primary" /> Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur("email")}
              placeholder="name@company.com"
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-950/80 text-slate-200 placeholder:text-slate-500 outline-none transition ${
                errors.email && touched.email
                  ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/30"
                  : "border-slate-800 focus:ring-2 focus:ring-primary/30 focus:border-primary"
              }`}
            />
            {errors.email && touched.email && (
              <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" /> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wide flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-primary" /> Security Password *
              </label>
              <Link href="/auth/forgot-password" className="text-[10px] text-purple-400 hover:text-purple-300 font-bold transition">
                Forgot?
              </Link>
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••"
                className={`w-full pl-4 pr-10 py-2.5 rounded-xl border bg-slate-950/80 text-slate-200 placeholder:text-slate-500 outline-none transition ${
                  errors.password && touched.password
                    ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/30"
                    : "border-slate-800 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {errors.password && touched.password && (
              <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" /> {errors.password}
              </p>
            )}
          </div>

          {/* Sandbox Role Switcher Selector */}
          <div className="space-y-2 pt-1">
            <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wide flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-teal-400" /> Active Role Selector Sandbox
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { role: "admin", label: "Admin", color: "hover:border-indigo-500/50" },
                { role: "sales-manager", label: "Sales Mgr", color: "hover:border-blue-500/50" },
                { role: "sales-executive", label: "Sales Exec", color: "hover:border-emerald-500/50" }
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleRoleSelect(item.role)}
                  className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition flex flex-col items-center justify-center gap-1 ${
                    selectedRole === item.role
                      ? "border-primary bg-primary/10 text-slate-100 shadow"
                      : `border-slate-800 bg-slate-950/50 text-slate-400 ${item.color}`
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400 font-medium">
              💡 <strong>Role Sandbox Switching</strong>: Enter the Email & Password created by Admin for your assigned role.
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 transition disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-1.5 mt-2"
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Initialize Session <Sparkles className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-[10px] text-slate-500">
          <span>CRM Sales Management System Gateway</span>
        </div>
      </div>
    </div>
  );
}
