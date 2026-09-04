"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { CreditCard, ShieldCheck, ArrowLeft, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

function SandboxCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planName = searchParams.get("planName") || "Starter Plan";
  const billingPeriod = searchParams.get("billingPeriod") || "monthly";
  const price = searchParams.get("price") || "5000";
  const companyId = searchParams.get("companyId") || "";

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Format Card Number (space every 4 digits)
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setExpiry(value);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc || !name || !email) {
      toast.warning("Please fill in all card details");
      return;
    }

    setLoading(true);
    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Trigger backend Stripe webhook simulation directly
      const webhookPayload = {
        type: "checkout.session.completed",
        data: {
          object: {
            metadata: {
              companyId,
              planName,
              billingPeriod,
              price: String(price),
            },
          },
        },
      };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000");
      await axios.post(`${backendUrl}/api/webhooks/stripe`, webhookPayload);

      setPaymentSuccess(true);
      toast.success("Payment authorized successfully!");

      // Wait a bit before redirecting
      setTimeout(() => {
        router.push(
          `/admin/billing/success?session_id=sb_session_${Date.now()}&planName=${encodeURIComponent(
            planName
          )}&billingPeriod=${billingPeriod}&price=${price}`
        );
      }, 1500);
    } catch (error) {
      console.error("Sandbox checkout error:", error);
      toast.error(error.response?.data?.error || "Failed to process sandbox payment");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.05),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 relative z-10">
        
        {/* Left Side: Order Summary */}
        <div className="md:col-span-5 bg-slate-950/80 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <button
              onClick={() => router.push("/admin/billing")}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mb-8 font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="h-4.5 w-4.5" /> Back to Dashboard
            </button>

            <span className="text-[10px] px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-md font-bold uppercase tracking-wide">
              Stripe Sandbox Checkout
            </span>
            <h2 className="text-xl font-black text-white mt-4 uppercase tracking-wide">
              {planName}
            </h2>
            <p className="text-xs text-slate-400 mt-1 capitalize font-semibold">
              {planName.toLowerCase().includes("credits") 
                ? "One-time credits top-up"
                : billingPeriod === "annually" ? "Annual Billing Cycle (20% Off)" : "Monthly Billing Cycle"}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold border-b border-slate-800 pb-3">
                <span className="text-slate-400">Subtotal</span>
                <span>₹{Number(price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold border-b border-slate-800 pb-3">
                <span className="text-slate-400">Sandbox Tax (Simulated)</span>
                <span className="text-emerald-500">₹0.00</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-black text-white">Amount Due</span>
                <span className="text-xl font-black text-orange-500">₹{Number(price).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-2.5 text-[10px] text-slate-500 font-semibold leading-relaxed border-t border-slate-850 pt-6">
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              Secure Checkout via Simulated Gateway.
            </p>
            <p>You can use any mock card details to test checkout flows without charges.</p>
          </div>
        </div>

        {/* Right Side: Card Form */}
        <div className="md:col-span-7 p-8">
          {paymentSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 animate-fade-in">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
              <h3 className="text-lg font-black text-white uppercase tracking-wide">Payment Authorized</h3>
              <p className="text-xs text-slate-400 font-semibold">
                {planName.toLowerCase().includes("credits")
                  ? "Adding credits to workspace. You will be redirected shortly..."
                  : "Upgrading workspace plan. You will be redirected shortly..."}
              </p>
              <Loader2 className="h-5 w-5 text-orange-500 animate-spin mt-4" />
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <h3 className="text-sm font-black uppercase text-white tracking-wide">Payment Details</h3>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Billing Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="billing@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-bold transition"
                />
              </div>

              {/* Name on Card */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Name on Card
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-bold transition"
                />
              </div>

              {/* Card Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-bold transition font-mono tracking-widest"
                  />
                  <CreditCard className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>

              {/* Expiry & CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-bold transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    CVC / CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="•••"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-bold transition font-mono"
                  />
                </div>
              </div>

              {/* Pay button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition hover:scale-101 hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Authorizing...
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Pay ₹{Number(price).toLocaleString()}
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default function SandboxCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-bold">Loading Checkout...</div>}>
      <SandboxCheckoutContent />
    </Suspense>
  );
}
