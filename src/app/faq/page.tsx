"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Copy,
  Check,
  Github,
  Clock,
  Users,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Calendar,
  ShieldCheck,
  User,
  ArrowRight,
  Send,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "General" | "Account & Settings" | "Event Organizers & Squad Leads";
  question: string;
  answer: React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    id: "who-can-join",
    category: "General",
    question: "Who can join CampusHub?",
    answer: (
      <div className="space-y-2">
        <p>
          CampusHub is exclusively open to verified students, mentors, and faculty belonging to the{" "}
          <strong className="text-kalvium-text dark:text-kalvium-dark-text">
            Artificial Intelligence & Future Technologies (AIFT)
          </strong>{" "}
          squads at SRM University-AP in the Kalvium program.
        </p>
        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
          Registration is domain-restricted: only email accounts ending with{" "}
          <code className="bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-1.5 py-0.5 rounded font-mono text-[11px]">
            @kalvium.community
          </code>{" "}
          or{" "}
          <code className="bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-1.5 py-0.5 rounded font-mono text-[11px]">
            @kalvium.com
          </code>{" "}
          are permitted.
        </p>
      </div>
    ),
  },
  {
    id: "how-to-register",
    category: "General",
    question: "How do I register for an event?",
    answer: (
      <div className="space-y-2">
        <p>
          Navigate to the <strong className="text-kalvium-text dark:text-kalvium-dark-text">Events</strong> tab on your dashboard, browse the verified campus events, click on any event card to view the agenda, prerequisites, and location, and select <strong className="text-kalvium-coral">"Register"</strong> or <strong className="text-kalvium-coral">"Save to Schedule"</strong>.
        </p>
        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
          Once registered, the event will appear in your Personal Schedule, and you will receive automated reminders and schedule conflict alerts if another event overlaps.
        </p>
      </div>
    ),
  },
  {
    id: "update-squad-profile",
    category: "Account & Settings",
    question: "Can I update my squad details or profile info?",
    answer: (
      <div className="space-y-2">
        <p>
          Yes. Head over to your <strong className="text-kalvium-text dark:text-kalvium-dark-text">Profile</strong> page via the top navigation bar. From there, you can update your squad number (e.g. Squad 83), display name, technical bio, tech stack tags, and external portfolio links (such as GitHub, LinkedIn, or personal website).
        </p>
        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
          Your squad affiliation helps teammates find you for hackathon teams and project collaboration.
        </p>
      </div>
    ),
  },
  {
    id: "cannot-login",
    category: "Account & Settings",
    question: "What should I do if I cannot log into my account?",
    answer: (
      <div className="space-y-2">
        <p>
          Make sure you are authenticating with your registered official Kalvium email address (<code className="font-mono text-[11px]">@kalvium.community</code> or <code className="font-mono text-[11px]">@kalvium.com</code>). If you forgot your password, use the <Link href="/forgot-password" className="text-kalvium-coral font-semibold hover:underline">Forgot Password</Link> link to receive a secure reset link.
        </p>
        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
          If you encounter persistent session drops, permissions errors, or domain rejection, please contact the admin leads directly using the{" "}
          <a href="#contact-staff" className="text-kalvium-coral font-semibold hover:underline">
            "Contact Staff"
          </a>{" "}
          section below.
        </p>
      </div>
    ),
  },
  {
    id: "publish-event",
    category: "Event Organizers & Squad Leads",
    question: "How do I publish a new event or workshop?",
    answer: (
      <div className="space-y-2">
        <p>
          Go to the <strong className="text-kalvium-text dark:text-kalvium-dark-text">Events</strong> section or your <strong className="text-kalvium-text dark:text-kalvium-dark-text">Organizer Studio</strong>, click <strong className="text-kalvium-coral">"+ Create Event"</strong>, enter your event title, relevant technical tags, schedule (date, start time, end time), venue or virtual meeting link, and squad participation limits.
        </p>
        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
          You can also drag and drop an event flyer in the AI Poster Studio to extract event parameters automatically. Once submitted, your event enters the verification queue and will appear live on the cohort board upon review by a Campus Manager.
        </p>
      </div>
    ),
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "who-can-join": true,
    "how-to-register": true,
    "update-squad-profile": true,
    "cannot-login": true,
    "publish-event": true,
  });
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2000);
    }
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === "ALL" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-3 font-medium">
          <Link href="/" className="hover:text-kalvium-coral transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-kalvium-text dark:text-kalvium-dark-text font-semibold">Support</span>
          <span>/</span>
          <span className="text-kalvium-coral font-semibold">Help Center & FAQ</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-kalvium-border dark:border-kalvium-dark-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint border border-kalvium-coral/20 text-kalvium-coral text-xs font-bold mb-2">
              <HelpCircle size={13} />
              <span>AIFT Knowledgebase & Student Support</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
              Help Center & FAQ
            </h1>
            <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1 max-w-2xl leading-relaxed">
              Find instant answers to common questions about accounts, event registration, hosting workshops, and platform features.
            </p>
          </div>

          <a
            href="#contact-staff"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-kalvium-coral text-white text-xs font-semibold hover:bg-kalvium-coral-dark transition shadow-soft-xs self-start sm:self-center"
          >
            <Mail size={13} />
            <span>Contact Staff</span>
          </a>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-kalvium-muted dark:text-kalvium-dark-muted w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface text-xs text-kalvium-text dark:text-kalvium-dark-text placeholder:text-kalvium-muted focus:outline-none focus:border-kalvium-coral transition shadow-soft-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "General", "Account & Settings", "Event Organizers & Squad Leads"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-kalvium-coral text-white shadow-soft-xs"
                  : "bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text"
              }`}
            >
              {cat === "ALL" ? "All Questions" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4 mb-16">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-8">
            <p className="text-sm font-semibold text-kalvium-text dark:text-kalvium-dark-text">No questions found</p>
            <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
              Try a different keyword or contact the staff leads below.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = Boolean(openItems[faq.id]);
            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl overflow-hidden shadow-soft-xs transition hover:border-kalvium-coral/30"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 select-none"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-coral">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-kalvium-text dark:text-kalvium-dark-text">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt flex items-center justify-center text-kalvium-muted shrink-0">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed border-t border-kalvium-border/40 dark:border-kalvium-dark-border/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Contact Staff Section */}
      <section id="contact-staff" className="scroll-mt-24">
        <div className="bg-gradient-to-br from-white via-kalvium-surface-alt to-kalvium-coral-tint/30 dark:from-kalvium-dark-surface dark:via-kalvium-dark-surface-alt dark:to-kalvium-dark-coral-tint/20 border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-10 shadow-kalvium-sm">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-kalvium-coral text-white text-xs font-bold w-fit mb-4">
            <Mail size={13} />
            <span>Support Desk</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight mb-2">
            Contact Staff
          </h2>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted max-w-2xl leading-relaxed mb-8">
            Need help with your account, reporting a bug, requesting event hosting access, or resolving squad permissions? Reach out to the student development leads or raise a trackable issue.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Student Leads & Emails */}
            <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                <Users size={16} className="text-kalvium-coral" />
                <span>Student Leads & Support Emails</span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    name: "Udeep Chowdary",
                    email: "udeep.chowdary.s83@kalvium.community",
                  },
                  {
                    name: "Mageshwaran T",
                    email: "mageshwaran.t.s83@kalvium.community",
                  },
                ].map((lead) => (
                  <div
                    key={lead.email}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-xs font-mono"
                  >
                    <div className="truncate mr-2">
                      <span className="font-sans font-semibold text-kalvium-text dark:text-kalvium-dark-text block text-[11px]">
                        {lead.name}
                      </span>
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-coral transition truncate block"
                      >
                        {lead.email}
                      </a>
                    </div>
                    <button
                      onClick={() => copyToClipboard(lead.email)}
                      className="p-1.5 rounded-lg text-kalvium-muted hover:text-kalvium-coral transition shrink-0"
                      title="Copy email"
                    >
                      {copiedEmail === lead.email ? (
                        <Check size={14} className="text-kalvium-success" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Squad & SLA Metadata */}
            <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-1">
                  Cohort / Squad
                </span>
                <p className="text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text">
                  Squad 83 — Kalvium, AIFT, SRM University-AP
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-1">
                  Response Time SLA
                </span>
                <div className="flex items-center gap-2 text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text">
                  <Clock size={14} className="text-kalvium-coral" />
                  <span>Typically within 24 hours during working academic days.</span>
                </div>
              </div>

              <div className="pt-2 border-t border-kalvium-border/40 dark:border-kalvium-dark-border/40 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact#direct-message-form"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-kalvium-coral text-white text-xs font-semibold hover:bg-kalvium-coral-dark transition shadow-soft-xs"
                >
                  <Send size={12} />
                  <span>Send Direct Message</span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-coral font-medium"
                >
                  <span>Full Contact Desk</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* GitHub Issue Tracker Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                <Github size={16} />
                <span>Bug Reports & Feature Requests</span>
              </div>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                Open an issue directly with reproduction steps, error logs, and screenshots.
              </p>
            </div>
            <a
              href="https://github.com/UdeepChowdary/CampusHub/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kalvium-ink dark:bg-white text-white dark:text-kalvium-ink text-xs font-semibold hover:opacity-90 transition shadow-soft-xs shrink-0"
            >
              <span>GitHub Issues</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
