"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendMessage,
  toggleAiAutoReply,
  setActiveThread,
  updateLeadNotes,
  updateLeadFollowUp,
  updateLeadStatus,
  setThreads,
  setLeads,
  addMessage,
  deleteMessageLocal,
  editMessageLocal
} from "@/store";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import axiosInstance, { ENDPOINTS } from "@/utils/api";
import { toast } from "react-toastify";
import {
  MessageSquare,
  Bot,
  User,
  Send,
  Sparkles,
  CheckCheck,
  ToggleLeft,
  ToggleRight,
  Phone,
  Laptop,
  Laptop2,
  FileText,
  Calendar,
  Save,
  CheckSquare,
  AlertCircle,
  Globe,
  ChevronDown,
  RefreshCw,
  X,
  Smile,
  Meh,
  Frown,
  Languages,
  Pencil,
  Trash2
} from "lucide-react";

export default function ConversationsPage() {
  const dispatch = useDispatch();
  const threads = useSelector((state) => state.chat.threads);
  const activeThreadId = useSelector((state) => state.chat.activeThreadId);
  const activeThread = threads.find((t) => t.leadId === activeThreadId) || threads[0];

  const leads = useSelector((state) => state.leads.leads);
  const activeLead = leads.find((l) => l.id === activeThreadId);
  const user = useSelector((state) => state.auth.user);

  const [messageInput, setMessageInput] = useState("");
  const [simulatorInput, setSimulatorInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Column 4 Tab State
  const [sideTab, setSideTab] = useState("simulator");
  const [customerNotes, setCustomerNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [leadStatus, setLeadStatus] = useState("New");

  // AI Assist Feature States
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [summaryBox, setSummaryBox] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);

  // Message Edit State
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editTextInput, setEditTextInput] = useState("");

  // Load initial conversations & leads from database
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [convsRes, leadsRes] = await Promise.all([
          axiosInstance.get(ENDPOINTS.chat.conversations),
          axiosInstance.get(ENDPOINTS.leads.base)
        ]);
        dispatch(setThreads(convsRes.data));
        dispatch(setLeads(leadsRes.data));
      } catch (err) {
        console.error("Error loading chat hub data:", err);
        toast.error("Failed to load real-time conversations from database.");
      }
    }
    loadInitialData();
  }, [dispatch]);

  // Connect to SSE for real-time messages
  useEffect(() => {
    let eventSource = null;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    if (token) {
      const apiURL = axiosInstance.defaults.baseURL || "http://localhost:5000";
      eventSource = new EventSource(`${apiURL}/api/realtime?token=${token}`);

      eventSource.addEventListener("message_created", (event) => {
        try {
          const data = JSON.parse(event.data);
          dispatch(
            addMessage({
              leadId: data.leadId,
              message: {
                id: data.id,
                sender: data.sender, // 'customer' | 'agent' | 'bot'
                text: data.text,
                timestamp: data.timestamp,
                channel: data.channel === "WEB" ? "Web" : data.channel === "SMS" ? "SMS" : "WhatsApp",
              }
            })
          );
        } catch (err) {
          console.error("Error parsing real-time message event:", err);
        }
      });

      eventSource.addEventListener("message_edited", (event) => {
        try {
          const data = JSON.parse(event.data);
          dispatch(
            editMessageLocal({
              leadId: data.leadId,
              messageId: data.messageId,
              text: data.text,
            })
          );
        } catch (err) {
          console.error("Error parsing real-time message_edited event:", err);
        }
      });

      eventSource.addEventListener("message_deleted", (event) => {
        try {
          const data = JSON.parse(event.data);
          dispatch(
            deleteMessageLocal({
              leadId: data.leadId,
              messageId: data.messageId,
            })
          );
        } catch (err) {
          console.error("Error parsing real-time message_deleted event:", err);
        }
      });

      eventSource.onerror = (err) => {
        console.warn("SSE connection encountered an error, reconnecting...", err);
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [dispatch]);

  // Sync Notes & Reminders with Active Lead
  useEffect(() => {
    if (activeLead) {
      setCustomerNotes(activeLead.notes || "");
      
      // Format followUpDate string (YYYY-MM-DD) for HTML5 input date
      let formattedDate = "";
      if (activeLead.followUpDate) {
        try {
          formattedDate = new Date(activeLead.followUpDate).toISOString().split("T")[0];
        } catch (e) {
          formattedDate = activeLead.followUpDate;
        }
      }
      setFollowUpDate(formattedDate);
      setLeadStatus(activeLead.status);
    }
  }, [activeThreadId, activeLead]);

  // Auto scroll to chat bottom
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeThread?.messages, isTyping]);

  // Send manual agent message via REST API
  const handleAgentSend = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThread) return;

    const textToSend = messageInput.trim();
    setMessageInput("");

    try {
      const response = await axiosInstance.post(ENDPOINTS.chat.messages(activeThread.leadId), {
        text: textToSend,
        channel: "WHATSAPP",
      });

      dispatch(
        addMessage({
          leadId: activeThread.leadId,
          message: {
            id: response.data.id,
            sender: "agent",
            text: response.data.text,
            timestamp: response.data.timestamp,
            channel: response.data.channel === "WEB" ? "Web" : response.data.channel === "SMS" ? "SMS" : "WhatsApp",
          }
        })
      );
    } catch (err) {
      console.error("Error sending agent message:", err);
      toast.error("Failed to send message via WhatsApp backend.");
    }
  };

  // Toggle AI Auto-Reply via REST API
  const handleToggleAutoReply = async () => {
    if (!activeThread) return;
    try {
      await axiosInstance.patch(ENDPOINTS.chat.autoReply(activeThread.leadId));
      dispatch(toggleAiAutoReply({ leadId: activeThread.leadId }));
      toast.success("AI auto-reply toggled successfully!");
    } catch (err) {
      console.error("Error toggling auto-reply:", err);
      toast.error("Failed to update auto-reply configuration on server.");
    }
  };

  // Edit message in backend & Redux
  const handleSaveEdit = async (messageId) => {
    if (!activeThread || !editTextInput.trim()) return;

    try {
      const textToSave = editTextInput.trim();
      setEditingMessageId(null);
      setEditTextInput("");

      await axiosInstance.patch(`${ENDPOINTS.chat.conversations}/${activeThread.leadId}/messages/${messageId}`, {
        text: textToSave,
      });

      dispatch(
        editMessageLocal({
          leadId: activeThread.leadId,
          messageId,
          text: textToSave,
        })
      );
      toast.success("Message updated successfully!");
    } catch (err) {
      console.error("Error editing message:", err);
      toast.error("Failed to edit message.");
    }
  };

  // Delete message for everyone in backend & Redux
  const handleDeleteMessage = async (messageId) => {
    if (!activeThread) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this message for everyone?");
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`${ENDPOINTS.chat.conversations}/${activeThread.leadId}/messages/${messageId}`);
      dispatch(
        deleteMessageLocal({
          leadId: activeThread.leadId,
          messageId,
        })
      );
      toast.success("Message deleted for everyone!");
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message.");
    }
  };

  // Simulate Inbound Customer Message
  const handleInboundSimulation = async (e) => {
    e.preventDefault();
    if (!simulatorInput.trim() || !activeThread) return;

    const customerText = simulatorInput.trim();
    // 1. Send customer message locally for immediate UI update
    dispatch(
      sendMessage({
        leadId: activeThread.leadId,
        sender: "customer",
        text: customerText,
      })
    );
    setSimulatorInput("");

    // 2. If AI Auto-reply is active, trigger an automated AI response after a short realistic typing delay!
    if (activeThread.aiAutoReply) {
      setIsTyping(true);
      try {
        const companyId = user?.companyId || "company-infotattva-id";
        const response = await axiosInstance.post(ENDPOINTS.webhook.aiChat, {
          phone: activeThread.phone || "+91 00000 00000",
          text: customerText,
          companyId
        });

        const aiReplyText = response.data.botReply || response.data.aiResponse;

        dispatch(
          sendMessage({
            leadId: activeThread.leadId,
            sender: "bot",
            text: aiReplyText,
          })
        );
      } catch (err) {
        console.error("AI Generation Error:", err);
        const errMsg = err.response?.data?.error || err.message;
        dispatch(
          sendMessage({
            leadId: activeThread.leadId,
            sender: "bot",
            text: `[Error: ${errMsg}]. Please ensure you replaced YOUR_GEMINI_API_KEY_HERE with a valid API key in Backend/.env and restarted the server.`,
          })
        );
      } finally {
        setIsTyping(false);
      }
    }
  };

  // Save Notes & Lead Status updates to database via API
  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!activeThread) return;

    try {
      const updatePromises = [
        axiosInstance.patch(ENDPOINTS.leads.notes(activeThread.leadId), { notes: customerNotes }),
        axiosInstance.patch(ENDPOINTS.leads.status(activeThread.leadId), { status: leadStatus })
      ];

      if (followUpDate) {
        updatePromises.push(
          axiosInstance.patch(ENDPOINTS.leads.followUp(activeThread.leadId), { date: new Date(followUpDate).toISOString() })
        );
      }

      await Promise.all(updatePromises);

      dispatch(updateLeadNotes({ id: activeThread.leadId, notes: customerNotes }));
      dispatch(updateLeadStatus({ id: activeThread.leadId, status: leadStatus }));
      if (followUpDate) {
        dispatch(updateLeadFollowUp({ id: activeThread.leadId, date: followUpDate }));
      }
      toast.success("Representative co-pilot notes successfully synced with the CRM database!");
    } catch (err) {
      console.error("Error saving notes/status:", err);
      toast.error("Failed to save co-pilot records to the database.");
    }
  };

  // AI Assist Feature: Calculate Sentiment dynamically
  const calculateSentiment = () => {
    if (!activeThread || activeThread.messages.length === 0) return { tag: "Neutral", icon: Meh, color: "text-slate-400 bg-slate-100 dark:bg-slate-800" };
    
    const customerMsgs = activeThread.messages.filter(m => m.sender === "customer");
    if (customerMsgs.length === 0) return { tag: "Neutral", icon: Meh, color: "text-slate-400 bg-slate-100 dark:bg-slate-800" };

    const lastMsgText = customerMsgs[customerMsgs.length - 1].text.toLowerCase();

    // Check keywords
    if (
      lastMsgText.includes("thanks") || 
      lastMsgText.includes("great") || 
      lastMsgText.includes("yes") || 
      lastMsgText.includes("excite") || 
      lastMsgText.includes("good") || 
      lastMsgText.includes("interested")
    ) {
      return { tag: "Positive", icon: Smile, color: "text-emerald-500 bg-emerald-500/10" };
    }
    
    if (
      lastMsgText.includes("angry") || 
      lastMsgText.includes("bad") || 
      lastMsgText.includes("no") || 
      lastMsgText.includes("delay") || 
      lastMsgText.includes("frustrated") || 
      lastMsgText.includes("expensive")
    ) {
      return { tag: "Frustrated", icon: Frown, color: "text-rose-500 bg-rose-500/10" };
    }

    return { tag: "Neutral", icon: Meh, color: "text-slate-400 bg-slate-100 dark:bg-slate-800" };
  };

  const sentiment = calculateSentiment();
  const SentimentIcon = sentiment.icon;

  // AI Assist Feature: Canned Smart Replies
  const getSmartReplies = () => {
    if (!activeThread) return [];
    
    const customerMsgs = activeThread.messages.filter(m => m.sender === "customer");
    if (customerMsgs.length === 0) return ["Hello! How can we assist you today?", "Are you looking for commercial space?", "Can we hop on a quick demo call?"];

    const text = customerMsgs[customerMsgs.length - 1].text.toLowerCase();
    
    if (text.includes("2bhk") || text.includes("flat") || text.includes("apartment")) {
      return ["Here are details for our 2BHK listings.", "Would you like a site visit tomorrow?", "What is your target budget for a flat?"];
    }
    if (text.includes("price") || text.includes("pricing") || text.includes("cost") || text.includes("fee")) {
      return ["We can share the detailed pricing plan pdf.", "Our Starter Package begins at ₹5,000.", "Would you like our best discount brochure?"];
    }
    if (text.includes("booking") || text.includes("slot") || text.includes("appointment")) {
      return ["We have free scheduling slots tomorrow afternoon.", "I can text you our calendar booking url.", "Confirming your meeting timing details."];
    }

    return ["Thank you for reaching out!", "May I know your primary business requirement?", "Sure, we can discuss this over a call."];
  };

  const smartReplies = getSmartReplies();

  // AI Assist Operation: Rephrase Professionally
  const handleRephrase = () => {
    if (!messageInput.trim()) return;
    setIsRephrasing(true);
    setShowAiMenu(false);
    setTimeout(() => {
      setIsRephrasing(false);
      setMessageInput(`Dear ${activeThread?.leadName || "Customer"},\n\nThank you for getting in touch. Regarding your inquiry, ${messageInput.trim().replace(/^i /i, "we ")}. We would be delighted to assist you further.\n\nWarm regards,\nSales Representative`);
    }, 1000);
  };

  // AI Assist Operation: Summarize Conversation
  const handleSummarize = () => {
    if (!activeThread) return;
    setShowAiMenu(false);
    
    let summaryText = `* Customer is inquiring regarding ${activeLead?.serviceInterest || "AI CRM Integration"}.\n* Latest message shows sentiment is ${sentiment.tag}.\n* Action Item: Send digital project brochures & confirm follow-up calls schedule.`;
    setSummaryBox(summaryText);
  };

  // AI Assist Operation: Translate
  const handleTranslate = () => {
    if (!activeThread) return;
    setIsTranslating(true);
    setShowAiMenu(false);
    setTimeout(() => {
      setIsTranslating(false);
      toast.info("Multilingual Translation simulation completed! Lead message translates to: 'नमस्ते, क्या आपके पास पटिया में रेडी-टू-मूव 2BHK फ्लैट हैं?'");
    }, 1000);
  };

  return (
    <DashboardWrapper>
      <div className="space-y-6 select-none relative">
        {/* Dynamic Summary Overlay popup */}
        {summaryBox && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-fade-in text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center gap-1.5">
                  AI Co-Pilot Conversation Summary <Sparkles className="h-4.5 w-4.5 text-primary" />
                </h3>
                <button onClick={() => setSummaryBox(null)} className="text-slate-400 hover:text-white">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
              
              <div className="mt-4 p-4 border border-indigo-500/10 bg-indigo-500/5 text-slate-700 dark:text-slate-200 rounded-xl space-y-2 leading-relaxed font-medium">
                {summaryBox.split("\n").map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSummaryBox(null)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            WhatsApp Live Chat Hub <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time chat log stream, manual customer engagement support, and automated AI co-pilot responding.
          </p>
        </div>

        {/* Dynamic Chat split window */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px] border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-xl">
          
          {/* Column 1: Conversations Threads Sidebar */}
          <div className="lg:col-span-1 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full min-h-0 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Channels</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {threads.map((thread) => {
                const lastMsg = thread.messages[thread.messages.length - 1];
                const isActive = thread.leadId === activeThreadId;
                return (
                  <button
                    key={thread.leadId}
                    onClick={() => dispatch(setActiveThread(thread.leadId))}
                    className={`w-full text-left p-3 rounded-2xl flex gap-3 text-xs transition ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-gray-500 text-white shadow-lg shadow-purple-600/10 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold uppercase shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    }`}>
                      {thread.leadName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="truncate">{thread.leadName}</span>
                        {thread.aiAutoReply && (
                          <span className={`text-[8px] px-1 rounded flex items-center gap-0.5 uppercase ${
                            isActive ? "bg-white/30 text-white" : "bg-purple-100 dark:bg-purple-950/50 text-primary"
                          }`}>
                            <Bot className="h-2 w-2 animate-pulse" /> AI
                          </span>
                        )}
                      </div>
                      <p className={`truncate text-[10px] mt-0.5 ${isActive ? "text-purple-200" : "text-slate-400"}`}>
                        {lastMsg ? lastMsg.text : "No messages yet."}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2 & 3: Chat Messages Window */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-0 bg-slate-50/20 dark:bg-slate-900/10 relative justify-between">
            {activeThread ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between z-10 shadow-sm shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm uppercase shrink-0">
                      {activeThread.leadName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-50">{activeThread.leadName}</span>
                        {/* Dynamic Sentiment Badge */}
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase flex items-center gap-1 ${sentiment.color}`}>
                          <SentimentIcon className="h-3 w-3" /> {sentiment.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">{activeThread.phone}</p>
                    </div>
                  </div>

                  {/* Toggle AI Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">AI Responder:</span>
                    <button
                      onClick={handleToggleAutoReply}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      {activeThread.aiAutoReply ? (
                        <ToggleRight className="h-7 w-7 text-primary" />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-slate-300 dark:text-slate-700" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Message Log */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 dark:bg-slate-950/20 relative">
                  {activeThread.messages.map((msg) => {
                    const isBot = msg.sender === "bot";
                    const isAgent = msg.sender === "agent";
                    const isCust = msg.sender === "customer";
                    return (
                      <div
                        key={msg.id}
                        className={`flex w-full ${isCust ? "justify-start" : "justify-end"} group`}
                      >
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs relative ${
                            isCust
                              ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-150 dark:border-slate-800 shadow-sm bubble-in"
                              : isBot
                              ? "bg-gradient-to-tr from-primary to-gray-500 text-white font-medium shadow-md shadow-purple-600/10 bubble-out"
                              : "bg-gradient-to-tr from-primary to-gray-500 text-white font-medium shadow-md shadow-purple-600/10 bubble-out"
                          }`}
                        >
                          {/* Action Overlay on Hover */}
                          {isAgent && editingMessageId !== msg.id && (
                            <div className="absolute -top-3 right-2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-lg p-1 z-20 transition">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setEditTextInput(msg.text);
                                }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-500 rounded transition"
                                title="Edit Message"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500 rounded transition"
                                title="Delete for Everyone"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          {/* Label */}
                          <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase opacity-65 mb-1">
                            {isCust ? (
                              <>
                                <User className="h-2.5 w-2.5" /> Customer
                              </>
                            ) : isBot ? (
                              <>
                                <Bot className="h-2.5 w-2.5 animate-pulse" /> AI Agent
                              </>
                            ) : (
                              <>
                                <Laptop2 className="h-2.5 w-2.5" /> Staff (You)
                              </>
                            )}
                          </div>
                          
                          {editingMessageId === msg.id ? (
                            <div className="space-y-2 mt-2">
                              <textarea
                                value={editTextInput}
                                onChange={(e) => setEditTextInput(e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded-lg bg-black/20 text-white outline-none resize-none placeholder:text-white/50"
                                rows={2}
                              />
                              <div className="flex justify-end gap-1 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setEditingMessageId(null)}
                                  className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded font-bold"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(msg.id)}
                                  className="px-2 py-0.5 bg-indigo-650 hover:bg-indigo-500 rounded font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          )}
                          
                          <div className="flex justify-end items-center gap-1 mt-1 opacity-60 text-[9px]">
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {!isCust && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* AI Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-end">
                      <div className="bg-purple-600/10 border border-purple-500/20 text-purple-600 p-3 rounded-2xl text-xs flex items-center gap-2 shadow-sm animate-pulse-glow">
                        <Bot className="h-3.5 w-3.5 animate-spin" />
                        <span className="font-bold text-[10px] uppercase">AI Chatbot is typing auto-reply...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* AI Assist Smart Replies Bar & Agent Input Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-3 relative">
                  {/* Dynamic Smart Replies Chips */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold select-none">
                    {smartReplies.map((replyText, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMessageInput(replyText)}
                        className="px-2.5 py-1.2 border border-slate-200 dark:border-slate-800 hover:border-primary bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-350 rounded-xl hover:text-primary hover:bg-primary/5 transition duration-200 truncate max-w-[200px]"
                        title={replyText}
                      >
                        ✨ {replyText}
                      </button>
                    ))}
                  </div>

                  {/* Reply Input Form */}
                  <form onSubmit={handleAgentSend} className="flex gap-2 relative">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a manual WhatsApp message to override AI..."
                      className="flex-1 px-5 py-2.5 border rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />

                    {/* AI Assist Dropdown Controls */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAiMenu(!showAiMenu)}
                        className="p-2.5 rounded-2xl border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 flex items-center justify-center transition"
                        title="AI Chat Assist Tools"
                      >
                        <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
                      </button>

                      {showAiMenu && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowAiMenu(false)} />
                          <div className="absolute right-0 bottom-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl w-48 shadow-2xl z-40 animate-fade-in text-[11px] font-bold text-slate-700 dark:text-slate-300 space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-450 block px-2 mb-1.5">AI Assist Toolkit</span>
                            
                            <button
                              type="button"
                              onClick={handleRephrase}
                              disabled={isRephrasing}
                              className="w-full text-left px-2 py-1.8 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 text-indigo-500 ${isRephrasing ? "animate-spin" : ""}`} /> Rephrase Professionally
                            </button>

                            <button
                              type="button"
                              onClick={handleSummarize}
                              className="w-full text-left px-2 py-1.8 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-purple-500" /> Summarize History
                            </button>

                            <button
                              type="button"
                              onClick={handleTranslate}
                              disabled={isTranslating}
                              className="w-full text-left px-2 py-1.8 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition"
                            >
                              <Languages className={`h-3.5 w-3.5 text-teal-500 ${isTranslating ? "animate-pulse" : ""}`} /> Translate Message
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="p-2.5 rounded-2xl bg-gradient-to-r from-primary to-gray-500 hover:scale-102 text-white shadow-lg shadow-primary/10 transition"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                <MessageSquare className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold">Select a conversation thread</p>
              </div>
            )}
          </div>

          {/* Column 4: WhatsApp Inbound Simulator & Customer Notes Controls */}
          <div className="lg:col-span-1 border-l border-slate-100 dark:border-slate-800 flex flex-col h-full min-h-0 bg-slate-50/50 dark:bg-slate-950/20 p-5 space-y-4">
            
            {/* Side Column Tab Switcher */}
            <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold tracking-wider shrink-0">
              <button
                onClick={() => setSideTab("simulator")}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                  sideTab === "simulator"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Laptop className="h-3.5 w-3.5" /> Simulator
              </button>
              <button
                onClick={() => setSideTab("notes")}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                  sideTab === "notes"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> Lead Co-Pilot
              </button>
            </div>

            {/* Sub-Tab 1: Inbound Simulator */}
            {sideTab === "simulator" && (
              <div className="flex-1 flex flex-col justify-between gap-4 animate-fade-in min-h-0 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
                      Inbound Channel
                    </span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Simulate a customer sending a WhatsApp message to this channel.
                    </p>
                  </div>

                  <form onSubmit={handleInboundSimulation} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Inbound Message</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="e.g. Do you have 2BHK ready-to-move flats in Patia?"
                        value={simulatorInput}
                        onChange={(e) => setSimulatorInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-102 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition flex items-center justify-center gap-1"
                    >
                      <Send className="h-3.5 w-3.5" /> Simulate Inbound
                    </button>
                  </form>
                </div>

                <div className="p-3 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 text-[10px] leading-relaxed text-slate-500 space-y-1">
                  <span className="font-bold uppercase text-slate-400 block mb-1">Demo Keywords to Try:</span>
                  <p>• <strong>flat / 2BHK</strong> (Real estate trigger)</p>
                  <p>• <strong>price / pricing / cost</strong> (Retainer rules trigger)</p>
                  <p>• <strong>booking / salon / slot</strong> (Calendar rules trigger)</p>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Lead Notes & Follow-Ups Schedulers */}
            {sideTab === "notes" && (
              <form onSubmit={handleSaveNotes} className="flex-1 flex flex-col justify-between gap-4 animate-fade-in text-xs min-h-0 overflow-y-auto">
                {activeThread ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                          Notes & Reminders
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Update the customer's records directly in the central CRM workspace.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase text-[9px]">Representative Call Notes</label>
                        <textarea
                          rows={5}
                          placeholder="Type notes from your conversation here..."
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-400 uppercase text-[9px]">Lead Status</label>
                        <select
                          value={leadStatus}
                          onChange={(e) => setLeadStatus(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option>New</option>
                          <option>Contacted</option>
                          <option>Interested</option>
                          <option>Follow-up</option>
                          <option>Converted</option>
                          <option>Lost</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase text-[9px] flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Next Follow-up Date</label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition flex items-center justify-center gap-1.5 shrink-0 mt-3"
                    >
                      <Save className="h-3.5 w-3.5" /> Save Records
                    </button>
                  </>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-slate-400 text-center">
                    Select a lead from active threads to edit.
                  </div>
                )}
              </form>
            )}

          </div>

        </div>
      </div>
    </DashboardWrapper>
  );
}
