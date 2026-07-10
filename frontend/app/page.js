"use client";

import Image from "next/image";
import { useState } from "react";
import UploadModal from "@/components/UploadModal";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Default import stats — 12 total, 8 imported, 4 skipped (66.7% success rate)
  const [importStats, setImportStats] = useState({
    total: 12,
    imported: 8,
    skipped: 4,
    successRate: "66.7"
  });

  const [selectedLead, setSelectedLead] = useState(null);
  const [visibleCount, setVisibleCount] = useState(7);

  // 12 clean default leads matching the sample CSV (8 valid + 4 skipped)
  const [leads, setLeads] = useState([
    {
      name: "John Doe",
      email: "john.doe@example.com",
      country_code: "+91",
      mobile_without_country_code: "9876543210",
      created_at: "2026-07-10 09:00:00",
      company: "GrowEasy",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "GOOD_LEAD_FOLLOW_UP",
      data_source: "leads_on_demand",
      description: "Interested in plot"
    },
    {
      name: "Sarah Johnson",
      email: "sarah.j@techsol.com",
      country_code: "+91",
      mobile_without_country_code: "9876543211",
      created_at: "2026-07-10 09:15:00",
      company: "Tech Solutions",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "SALE_DONE",
      data_source: "eden_park",
      description: "Referred by agent"
    },
    {
      name: "Rajesh Patel",
      email: "rajesh.p@startup.com",
      country_code: "+91",
      mobile_without_country_code: "9876543212",
      created_at: "2026-07-10 09:30:00",
      company: "Startup Inc",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "DID_NOT_CONNECT",
      data_source: "varah_swamy",
      description: "No reply to calls"
    },
    {
      name: "Priya Singh",
      email: "priya.s@enterprise.com",
      country_code: "+91",
      mobile_without_country_code: "9876543213",
      created_at: "2026-07-10 09:45:00",
      company: "Enterprise Corp",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "BAD_LEAD",
      data_source: "sarjapur_plots",
      description: "Invalid contact details"
    },
    {
      name: "Amit Verma",
      email: "amit.v@marketing.com",
      country_code: "+91",
      mobile_without_country_code: "9876543214",
      created_at: "2026-07-10 10:00:00",
      company: "Marketing Pro",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "GOOD_LEAD_FOLLOW_UP",
      data_source: "meridian_tower",
      description: "Callback tomorrow"
    },
    {
      name: "Vikram Rao",
      email: "vikram.r@fintech.com",
      country_code: "+91",
      mobile_without_country_code: "9876543215",
      created_at: "2026-07-10 10:15:00",
      company: "Fintech Ltd",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "SALE_DONE",
      data_source: "leads_on_demand",
      description: "Purchased plot"
    },
    {
      name: "Neha Sharma",
      email: "neha.s@webagency.com",
      country_code: "+91",
      mobile_without_country_code: "9876543216",
      created_at: "2026-07-10 10:30:00",
      company: "Web Agency",
      city: "Kolkata",
      state: "West Bengal",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "DID_NOT_CONNECT",
      data_source: "eden_park",
      description: "Follow up next week"
    },
    {
      name: "Rohan Mehta",
      email: "rohan.m@retail.com",
      country_code: "+91",
      mobile_without_country_code: "9876543217",
      created_at: "2026-07-10 10:45:00",
      company: "Retail Corp",
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "GOOD_LEAD_FOLLOW_UP",
      data_source: "varah_swamy",
      description: "Very interested"
    },
    {
      name: "",
      email: "",
      country_code: "",
      mobile_without_country_code: "",
      created_at: "2026-07-10 11:00:00",
      company: "No Contact Co",
      city: "City A",
      state: "State A",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "SKIPPED",
      data_source: "leads_on_demand",
      crm_note: "Skipped: both email and phone number are missing.",
      description: "Skipped - no email or phone"
    },
    {
      name: "",
      email: "",
      country_code: "",
      mobile_without_country_code: "",
      created_at: "2026-07-10 11:15:00",
      company: "No Info Co",
      city: "City B",
      state: "State B",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "SKIPPED",
      data_source: "eden_park",
      crm_note: "Skipped: both email and phone number are missing.",
      description: "Skipped - no contact info"
    },
    {
      name: "",
      email: "",
      country_code: "",
      mobile_without_country_code: "",
      created_at: "2026-07-10 11:30:00",
      company: "No Data Co",
      city: "City C",
      state: "State C",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "SKIPPED",
      data_source: "varah_swamy",
      crm_note: "Skipped: both email and phone number are missing.",
      description: "Skipped - no email or phone"
    },
    {
      name: "",
      email: "",
      country_code: "",
      mobile_without_country_code: "",
      created_at: "2026-07-10 11:45:00",
      company: "No Name Co",
      city: "City D",
      state: "State D",
      country: "India",
      lead_owner: "Arul Nandhi",
      crm_status: "SKIPPED",
      data_source: "sarjapur_plots",
      crm_note: "Skipped: both email and phone number are missing.",
      description: "Skipped - no contact info"
    }
  ]);


  const menuItems = [
    "Dashboard",
    "Generate Leads",
    "Manage Leads",
    "Engage Leads",
  ];

  const controlItems = [
    "Team Members",
    "Lead Sources",
    "Ad Accounts",
    "WhatsApp Account",
    "CRM Fields",
    "API Center",
  ];

  // Callback when uploader modal completes mapping successfully
  const handleImportLeads = (newLeads, stats) => {
    const preparedLeads = newLeads.map(l => ({
      ...l,
      created_at: l.created_at || new Date().toISOString().replace("T", " ").substring(0, 19)
    }));

    setLeads((prevLeads) => [...preparedLeads, ...prevLeads]);
    
    const total = stats.totalRecords;
    const skipped = newLeads.filter(l => l.crm_status === "SKIPPED").length;
    const imported = total - skipped;
    const rate = total > 0 ? ((imported / total) * 100).toFixed(1) : 0;

    setImportStats({
      total,
      imported,
      skipped,
      successRate: rate
    });

    setActiveTab("Manage Leads"); // Switch tabs automatically to show leads list
  };

  const filteredLeads = leads.filter(lead => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (lead.name || "").toLowerCase().includes(q) ||
      (lead.email || "").toLowerCase().includes(q) ||
      (lead.mobile_without_country_code || "").includes(q)
    );
  });

  const totalLeads = leads.filter(l => l.crm_status !== "SKIPPED").length;
  const goodLeadsCount = leads.filter(l => l.crm_status === "GOOD_LEAD_FOLLOW_UP").length;
  const salesCompletedCount = leads.filter(l => l.crm_status === "SALE_DONE").length;

  // Export current leads table list to CSV file
  const handleDownloadLeadsCSV = () => {
    const headers = "created_at,name,email,country_code,mobile_without_country_code,company,crm_status,data_source,description\n";
    const rows = leads.map(lead => {
      return `"${lead.created_at || ""}","${lead.name || ""}","${lead.email || ""}","${lead.country_code || ""}","${lead.mobile_without_country_code || ""}","${lead.company || ""}","${lead.crm_status || ""}","${lead.data_source || ""}","${lead.description || ""}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "groweasy_crm_leads_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Utility to format date display in the list table
  const formatLeadDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  };

  const renderCRMStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "GOOD_LEAD_FOLLOW_UP") {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Good Lead</span>;
    } else if (s === "DID_NOT_CONNECT") {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20">Not Dialed</span>;
    } else if (s === "BAD_LEAD") {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">Bad Lead</span>;
    } else if (s === "SALE_DONE") {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">Sale Done</span>;
    } else if (s === "SKIPPED") {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-600/10 text-rose-600 border border-rose-600/20">Skipped</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20">{status || "Not Dialed"}</span>;
  };

  return (
    <main
      className={`min-h-screen transition-all duration-300 ${darkMode
          ? "bg-slate-950 text-white"
          : "bg-gradient-to-br from-cyan-50 via-sky-100 to-blue-200"
        }`}
    >
      {/* Mobile Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Header */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b ${darkMode
            ? "bg-slate-900 border-slate-700"
            : "bg-white/70 border-cyan-200"
          }`}
      >
        <div className="px-6 py-4 flex items-center gap-3 ml-0 lg:ml-2">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 rounded-xl transition ${
              darkMode ? "hover:bg-slate-800 text-white" : "hover:bg-cyan-50 text-cyan-700"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Image
            src="/logo.png"
            alt="GrowEasy"
            width={30}
            height={30}
            priority
          />

          <h1 className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            GrowEasy
          </h1>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static
            top-0 left-0
            h-screen
            w-64
            z-50
            transform
            transition-transform
            duration-300
            ${menuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
            }
            ${darkMode
              ? "bg-slate-900 text-white border-r border-slate-800"
              : "bg-white border-r border-cyan-100"
            }
            shadow-xl lg:shadow-none
          `}
        >
          {/* Mobile Close Section */}
          <div className={`p-4 flex items-center justify-between border-b lg:hidden ${
            darkMode ? "border-slate-800" : "border-cyan-100"
          }`}>
            <span className="font-semibold text-xs tracking-wider uppercase opacity-60">Menu</span>
            <button
              onClick={() => setMenuOpen(false)}
              className={`p-1.5 rounded-lg transition ${
                darkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-cyan-50 text-cyan-700"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Account */}
          <div
            className={`p-4 border-b ${darkMode
                ? "border-slate-800"
                : "border-cyan-100"
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                  AK
                </div>

                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Arul Nandhi
                  </h3>

                  <p className="text-xs opacity-60">
                    Employee
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-800 text-amber-400 hover:bg-slate-700 hover:scale-105"
                    : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:scale-105"
                }`}
                aria-label="Toggle Theme"
              >
                {darkMode ? (
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4">
            <p className="text-xs font-bold tracking-wider uppercase opacity-40 mb-3">
              Main
            </p>

            <div className="space-y-1">
              {menuItems.map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    setMenuOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-sm cursor-pointer transition ${
                    activeTab === item
                      ? "bg-cyan-600 text-white font-medium shadow-md shadow-cyan-600/10"
                      : darkMode
                        ? "hover:bg-slate-800 text-slate-300"
                        : "hover:bg-cyan-50 text-slate-700"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            <p className="text-xs font-bold tracking-wider uppercase opacity-40 mt-8 mb-3">
              Control Center
            </p>

            <div className="space-y-1">
              {controlItems.map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    setMenuOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-sm cursor-pointer transition ${
                    activeTab === item
                      ? "bg-cyan-600 text-white font-medium shadow-md shadow-cyan-600/10"
                      : darkMode
                        ? "hover:bg-slate-800 text-slate-300"
                        : "hover:bg-cyan-50 text-slate-700"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {activeTab === "Manage Leads" ? (
            <section className="max-w-6xl mx-auto px-6 py-12">
              
              {/* Header and Download CSV Button */}
              <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">Manage Your Leads</h2>
                  <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Monitor lead status, assign tasks, and close deals faster.
                  </p>
                </div>

                <button
                  onClick={handleDownloadLeadsCSV}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-[0.98] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download CSV
                </button>
              </div>

              {/* Stats Summary Cards (Dual-Mode: Shows Import Results if file was imported) */}
              {importStats ? (
                /* Mode A: Import Results Summary Cards (Matching new layout) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Records */}
                  <div className={`p-5 rounded-2xl border flex items-center gap-4 transition shadow-xs ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-sky-50/40 border-sky-100/50"
                  }`}>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? "bg-slate-800 text-sky-400" : "bg-sky-100 text-sky-600"
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-sky-850/60"}`}>Total Records</p>
                      <p className={`text-2xl font-black mt-0.5 ${darkMode ? "text-white" : "text-sky-950"}`}>{importStats.total}</p>
                    </div>
                  </div>

                  {/* Imported */}
                  <div className={`p-5 rounded-2xl border flex items-center gap-4 transition shadow-xs ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-emerald-50/40 border-emerald-100/50"
                  }`}>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? "bg-slate-800 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-emerald-800/60"}`}>Imported</p>
                      <p className={`text-2xl font-black mt-0.5 ${darkMode ? "text-white" : "text-emerald-950"}`}>{importStats.imported}</p>
                    </div>
                  </div>

                  {/* Skipped */}
                  <div className={`p-5 rounded-2xl border flex items-center gap-4 transition shadow-xs ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-rose-50/40 border-rose-100/50"
                  }`}>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? "bg-slate-800 text-rose-400" : "bg-rose-100 text-rose-600"
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-rose-800/60"}`}>Skipped</p>
                      <p className={`text-2xl font-black mt-0.5 ${darkMode ? "text-white" : "text-rose-950"}`}>{importStats.skipped}</p>
                    </div>
                  </div>

                  {/* Success Rate */}
                  <div className={`p-5 rounded-2xl border flex items-center gap-4 transition shadow-xs ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-cyan-50/40 border-cyan-100/50"
                  }`}>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? "bg-slate-800 text-cyan-400" : "bg-cyan-100 text-cyan-600"
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.195-.39.73-.39.926 0l3.03 6.14 6.772.985c.43.063.602.592.29.9l-4.9 4.777 1.157 6.745c.074.431-.382.762-.766.559L12 19.347l-6.059 3.184c-.384.203-.84-.128-.766-.56l1.157-6.744-4.9-4.778c-.312-.307-.14-.836.29-.899l6.772-.984 3.03-6.14z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-cyan-850/60"}`}>Success Rate</p>
                      <p className={`text-2xl font-black mt-0.5 ${darkMode ? "text-white" : "text-cyan-950"}`}>{importStats.successRate}%</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode B: Default Database Summary Cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Leads */}
                  <div className={`p-5 rounded-2xl border flex items-center gap-4 transition shadow-xs ${
                    darkMode ? "bg-slate-950 border-slate-800" : "bg-sky-50/40 border-sky-100/50"
                  }`}>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? "bg-slate-800 text-sky-400" : "bg-sky-100 text-sky-600"
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-sky-800/60"}`}>Total Leads</p>
                      <p className={`text-2xl font-black mt-0.5 ${darkMode ? "text-white" : "text-sky-950"}`}>{totalLeads}</p>
                    </div>
                  </div>

                  {/* Good Leads */}
                  <div className={`p-5 rounded-2xl border flex items-center gap-4 transition shadow-xs ${
                    darkMode ? "bg-slate-950 border-slate-800" : "bg-emerald-50/40 border-emerald-100/50"
                  }`}>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? "bg-slate-800 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-emerald-800/60"}`}>Good Leads</p>
                      <p className={`text-2xl font-black mt-0.5 ${darkMode ? "text-white" : "text-emerald-950"}`}>{goodLeadsCount}</p>
                    </div>
                  </div>

                  {/* Sales Completed */}
                  <div className={`p-5 rounded-2xl border flex items-center gap-4 transition shadow-xs ${
                    darkMode ? "bg-slate-950 border-slate-800" : "bg-blue-50/40 border-blue-100/50"
                  }`}>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? "bg-slate-800 text-blue-400" : "bg-blue-100 text-blue-600"
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007m-.007 3h.007m-.007 3h.007m-2.25 9h19.5M3 7.5h18M3 12h18M3 16.5h18" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-blue-800/60"}`}>Sales Done</p>
                      <p className={`text-2xl font-black mt-0.5 ${darkMode ? "text-white" : "text-blue-950"}`}>{salesCompletedCount}</p>
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className={`p-5 rounded-2xl border flex items-center gap-4 transition shadow-xs ${
                    darkMode ? "bg-slate-950 border-slate-800" : "bg-cyan-50/40 border-cyan-100/50"
                  }`}>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? "bg-slate-800 text-cyan-400" : "bg-cyan-100 text-cyan-600"
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21a7.5 7.5 0 0013.5-3v7.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-cyan-850/60"}`}>Conversion Rate</p>
                      <p className={`text-2xl font-black mt-0.5 ${darkMode ? "text-white" : "text-cyan-950"}`}>{totalLeads > 0 ? ((salesCompletedCount / totalLeads) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Table Card (Table at the bottom) */}
              <div className={`rounded-3xl p-6 border transition-all ${
                darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-cyan-100 shadow-sm"
              }`}>
                {/* Table Header and Search */}
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                  <h3 className="text-xl font-bold tracking-tight">Your Leads</h3>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter email or phone number..."
                        className={`w-full md:w-72 pl-10 pr-4 py-2.5 rounded-xl text-sm border transition outline-none ${
                          darkMode 
                            ? "bg-slate-950 border-slate-800 focus:border-cyan-500 text-white" 
                            : "bg-white border-slate-200 focus:border-cyan-500 text-slate-700 shadow-sm"
                        }`}
                      />
                      <div className="absolute left-3.5 top-3 text-slate-400">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSearchQuery("")}
                      className={`p-2.5 rounded-xl border transition ${
                        darkMode ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300" : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm text-slate-500"
                      }`}
                      title="Clear search"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "border-slate-800 text-slate-400" : "border-cyan-100 text-cyan-800/60"
                      }`}>
                        <th className="p-4 text-left font-bold">Lead Name</th>
                        <th className="p-4 text-left font-bold">Email</th>
                        <th className="p-4 text-left font-bold">Contact</th>
                        <th className="p-4 text-left font-bold">Date Created</th>
                        <th className="p-4 text-left font-bold">Company</th>
                        <th className="p-4 text-left font-bold">Status</th>
                        <th className="p-4 text-right font-bold">Actions</th>
                      </tr>
                    </thead>

                    <tbody className={`divide-y text-sm ${
                      darkMode ? "divide-slate-800/60" : "divide-cyan-50/60"
                    }`}>
                      {filteredLeads.length > 0 ? (
                        filteredLeads.slice(0, visibleCount).map((lead, idx) => (
                          <tr key={idx} className={`transition ${
                            darkMode ? "hover:bg-slate-800/30 text-slate-300" : "hover:bg-cyan-50/10 text-slate-700"
                          }`}>
                            <td className="p-4 font-semibold whitespace-nowrap">{lead.name}</td>
                            <td className="p-4 whitespace-nowrap">{lead.email}</td>
                            <td className="p-4 whitespace-nowrap font-mono">{lead.country_code ? `${lead.country_code}${lead.mobile_without_country_code}` : lead.mobile_without_country_code}</td>
                            <td className="p-4 whitespace-nowrap">{formatLeadDate(lead.created_at)}</td>
                            <td className="p-4 whitespace-nowrap text-slate-400">{lead.company || "—"}</td>
                            <td className="p-4 whitespace-nowrap">{renderCRMStatusBadge(lead.crm_status)}</td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                  darkMode 
                                    ? "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300" 
                                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 shadow-xs"
                                }`}
                              >
                                More &gt;
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400 italic">
                            No leads matching search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Load More Button (Only shows if visibleCount is less than filteredLeads length) */}
                {visibleCount < filteredLeads.length && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 10)}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition active:scale-[0.98] ${
                        darkMode 
                          ? "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300" 
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
                      }`}
                    >
                      Load more
                    </button>
                  </div>
                )}

              </div>
            </section>
          ) : activeTab === "Lead Sources" ? (
            /* Lead Channels Connect Page */
            <section className="max-w-6xl mx-auto px-6 py-12">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight">Lead Sources</h2>
                <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Connect, manage, and control all your lead channels from one dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-cyan-100 shadow-sm"
                }`}>
                  <div>
                    <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-semibold">Meta Channels</span>
                    <h3 className="text-xl font-bold mt-4">Facebook Lead Ads</h3>
                    <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Directly import leads collected from your Facebook Instant Forms.
                    </p>
                  </div>
                  <button className="mt-8 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold w-fit">
                    Connect Campaign
                  </button>
                </div>

                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-cyan-100 shadow-sm"
                }`}>
                  <div>
                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-semibold">Google Ecosystem</span>
                    <h3 className="text-xl font-bold mt-4">Google Search Lead Form</h3>
                    <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Capture leads searching for services directly using Google Ads forms.
                    </p>
                  </div>
                  <button className="mt-8 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold w-fit">
                    Connect Webhook
                  </button>
                </div>
              </div>
            </section>
          ) : (
            /* Dashboard Home landing page we built previously */
            <section className="max-w-6xl mx-auto px-6 py-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left */}
                <div>
                  <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    darkMode 
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                      : "bg-cyan-100 text-cyan-800"
                  }`}>
                    ✦ AI Powered CSV Processing
                  </span>

                  <h2 className="mt-6 text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
                    Import Leads From <br/>
                    <span className="bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 bg-clip-text text-transparent">
                      Any CSV Format
                    </span>
                  </h2>

                  <p
                    className={`mt-6 text-base md:text-lg leading-relaxed ${darkMode
                        ? "text-slate-300"
                        : "text-slate-600"
                      }`}
                  >
                    Upload Facebook Leads, Google Ads exports,
                    Excel sheets, Real Estate CRM exports,
                    marketing CSV files and custom lead data.
                    Our AI intelligently maps every field into
                    GrowEasy CRM format.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="rounded-xl bg-cyan-600 px-6 py-3.5 text-white font-semibold shadow-lg hover:bg-cyan-700 hover:shadow-cyan-600/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Import Leads via CSV
                      </button>

                      <button className={`rounded-xl px-6 py-3.5 font-semibold shadow transition-all hover:shadow-md cursor-pointer ${
                        darkMode
                          ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                          : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}>
                        Learn More
                      </button>
                    </div>
                  <div className="mt-10 flex flex-wrap gap-3">
                    {[
                      "Facebook Leads",
                      "Google Ads",
                      "Excel Sheets",
                      "CRM Exports",
                      "Marketing Reports",
                    ].map((item) => (
                      <span
                        key={item}
                        className={`px-4 py-2.5 rounded-2xl shadow-xs text-sm font-medium transition ${
                          darkMode
                            ? "bg-slate-900 border border-slate-800 text-slate-300"
                            : "bg-white/80 border border-cyan-100/50 text-slate-700"
                        }`}
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right */}
                <div>
                  <div
                    className={`rounded-3xl p-8 shadow-2xl transition ${darkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white/80 backdrop-blur-md border border-cyan-100"
                      }`}
                  >
                    <h3 className="text-xl font-bold mb-6 tracking-tight">
                      Why GrowEasy Importer?
                    </h3>

                    <div className="space-y-4">
                      <div className={`rounded-2xl p-5 border transition ${
                        darkMode ? "bg-slate-800/30 border-slate-700/50" : "bg-cyan-50/50 border-cyan-100/20"
                      }`}>
                        <h4 className={`font-semibold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                          Upload Any CSV
                        </h4>

                        <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          Supports Facebook, Google Ads,
                          Excel and custom CSV formats.
                        </p>
                      </div>

                      <div className={`rounded-2xl p-5 border transition ${
                        darkMode ? "bg-slate-800/30 border-slate-700/50" : "bg-cyan-50/50 border-cyan-100/20"
                      }`}>
                        <h4 className={`font-semibold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                          AI Field Mapping
                        </h4>

                        <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          Automatically identifies and maps
                          fields into CRM columns.
                        </p>
                      </div>

                      <div className={`rounded-2xl p-5 border transition ${
                        darkMode ? "bg-slate-800/30 border-slate-700/50" : "bg-cyan-50/50 border-cyan-100/20"
                      }`}>
                        <h4 className={`font-semibold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                          Smart Validation
                        </h4>

                        <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          Skips invalid records and prepares
                          clean CRM-ready data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Selected Lead Details Modal (Displays all CRM details when "More >" is clicked) */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[110] transition-opacity duration-300">
          <div className={`rounded-3xl p-6 w-[90%] max-w-2xl shadow-2xl transition-all duration-300 transform scale-100 max-h-[85vh] overflow-y-auto ${
            darkMode 
              ? "bg-slate-900 border border-slate-800 text-white" 
              : "bg-white text-slate-800 border border-cyan-100"
          }`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-700/25 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Lead Detailed Profile</h3>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Comprehensive registration records from CRM database</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className={`p-1.5 rounded-lg transition ${
                  darkMode ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-cyan-50 text-cyan-700"
                }`}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Name</p>
                <p className="font-bold mt-1 text-base">{selectedLead.name || "—"}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Email</p>
                <p className="font-semibold mt-1">{selectedLead.email || "—"}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Phone Contact</p>
                <p className="font-semibold mt-1 font-mono">
                  {selectedLead.country_code ? `${selectedLead.country_code} ${selectedLead.mobile_without_country_code}` : (selectedLead.mobile_without_country_code || "—")}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Company</p>
                <p className="font-semibold mt-1">{selectedLead.company || "—"}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Created Date</p>
                <p className="font-semibold mt-1">{formatLeadDate(selectedLead.created_at)}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Lead Owner</p>
                <p className="font-semibold mt-1">{selectedLead.lead_owner || "—"}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">CRM Status</p>
                <div className="mt-1">{renderCRMStatusBadge(selectedLead.crm_status)}</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Campaign Source</p>
                <p className={`px-2 py-0.5 rounded-md text-xs font-semibold border w-fit capitalize mt-1 ${
                  darkMode ? "bg-cyan-950/30 text-cyan-400 border-cyan-500/20" : "bg-cyan-50 text-cyan-700 border-cyan-100"
                }`}>
                  {selectedLead.data_source ? selectedLead.data_source.replace(/_/g, " ") : "leads_on_demand"}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">City / Region</p>
                <p className="font-semibold mt-1">{selectedLead.city || "—"}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">State</p>
                <p className="font-semibold mt-1">{selectedLead.state || "—"}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Country</p>
                <p className="font-semibold mt-1">{selectedLead.country || "—"}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Possession Time</p>
                <p className="font-semibold mt-1">{selectedLead.possession_time || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">CRM Note</p>
                <p className={`mt-1 text-xs p-3 rounded-xl leading-relaxed border ${
                  darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  {selectedLead.crm_note || "No notes registered."}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Inquiry Description</p>
                <p className={`mt-1 text-xs p-3 rounded-xl leading-relaxed border ${
                  darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  {selectedLead.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        darkMode={darkMode}
        onImport={handleImportLeads}
      />
    </main>
  );
}