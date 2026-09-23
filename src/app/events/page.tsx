"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, RefreshCw } from "lucide-react";
import EventCard, { EventCardData } from "@/components/EventCard";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import EventDetailDrawer from "@/components/EventDetailDrawer";
import StaggerGrid from "@/components/StaggerGrid";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  "ALL",
  "Workshop",
  "Hackathon",
  "Cultural",
  "Technical",
  "Sports",
  "Seminar",
  "Competition",
  "Fest",
];

const DATE_FILTERS = [
  { id: "ALL", label: "All Events" },
  { id: "UPCOMING", label: "Upcoming" },
  { id: "TODAY", label: "Today" },
  { id: "TOMORROW", label: "Tomorrow" },
  { id: "THIS_WEEK", label: "This Week" },
  { id: "PAST", label: "Past Events" },
];

export default function EventsExplorePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDateFilter, setSelectedDateFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("soonest");
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [selectedEventForDrawer, setSelectedEventForDrawer] = useState<EventCardData | null>(null);

  // Fetch student's saved event IDs to reflect bookmark state
  const fetchSavedState = async () => {
    if (!user || user.role?.toUpperCase() !== "STUDENT") {
      setSavedEventIds(new Set());
      return;
    }
    try {
      const res = await fetch("/api/saved");
      if (res.ok) {
        const data = await res.json();
        const ids = new Set<string>((data.events || []).map((e: any) => e.id));
        setSavedEventIds(ids);
      }
    } catch {
      // ignore
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (selectedCategory && selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedDateFilter && selectedDateFilter !== "ALL") params.set("dateFilter", selectedDateFilter);
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/events?${params.toString()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedState();
  }, [user]);

  // Debounce only the search text input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Instantly re-fetch when filter pills, date tabs, sort options, or debounced search changes
  useEffect(() => {
    fetchEvents();
  }, [debouncedSearch, selectedCategory, selectedDateFilter, sortBy]);

  const handleSaveToggle = (eventId: string, isSaved: boolean) => {
    setSavedEventIds((prev) => {
      const updated = new Set(prev);
      if (isSaved) updated.add(eventId);
      else updated.delete(eventId);
      return updated;
    });
    setSelectedEventForDrawer((prev) =>
      prev && prev.id === eventId ? { ...prev, isSaved } : prev
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-sans uppercase tracking-widest text-kalvium-coral font-bold bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-3 py-1 rounded-full border border-kalvium-coral/20">
              Campus Discovery
            </span>
            <CampusVerifiedBadge size="sm" animate />
          </div>
          <h1 className="font-display text-display-lg font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
            Everything verified, this semester.
          </h1>
          <p className="text-base text-kalvium-muted dark:text-kalvium-dark-muted mt-2 max-w-xl">
            Every listed event is authenticated by campus staff against original organizer posters.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2.5 text-xs font-sans text-kalvium-text dark:text-kalvium-dark-text bg-white dark:bg-kalvium-dark-surface px-4 py-2.5 rounded-full self-start md:self-auto border border-kalvium-border dark:border-kalvium-dark-border shadow-xs">
          <span className="text-kalvium-muted uppercase tracking-wider font-semibold">SHOWING:</span>
          <span className="font-bold font-display text-sm text-kalvium-text dark:text-kalvium-dark-text">{events.length}</span>
          <span className="text-kalvium-success font-semibold uppercase tracking-wider">APPROVED EVENTS</span>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white dark:bg-kalvium-dark-surface rounded-3xl p-5 sm:p-6 mb-10 space-y-5 border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm">
        {/* Search input and Sort dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full flex items-center gap-3 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl px-4 py-3 focus-within:border-kalvium-coral transition">
            <Search size={18} className="text-kalvium-muted shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title, organizer, venue, or keywords..."
              className="w-full bg-transparent text-sm text-kalvium-text dark:text-kalvium-dark-text placeholder:text-kalvium-muted focus:outline-none"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal size={16} className="text-kalvium-muted shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl px-4 py-3 text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral transition"
            >
              <option value="soonest">Sort: Soonest First</option>
              <option value="latest">Sort: Furthest Date</option>
              <option value="recently_added">Sort: Recently Added</option>
            </select>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-kalvium-muted font-sans text-[11px] uppercase tracking-wider font-semibold shrink-0 mr-2">
            Timeline:
          </span>
          {DATE_FILTERS.map((df) => {
            const active = selectedDateFilter === df.id;
            return (
              <button
                key={df.id}
                onClick={() => setSelectedDateFilter(df.id)}
                className={`relative px-4 py-1.5 rounded-full font-medium transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  active
                    ? "bg-kalvium-coral text-white font-semibold shadow-sm"
                    : "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
                }`}
              >
                {df.label}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-kalvium-muted font-sans text-[11px] uppercase tracking-wider font-semibold shrink-0 mr-2">
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  active
                    ? "bg-kalvium-text dark:bg-kalvium-dark-text text-white dark:text-kalvium-dark-bg font-semibold shadow-sm"
                    : "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl overflow-hidden flex flex-col h-[380px] animate-pulse"
            >
              <div className="h-44 w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt" />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="h-4 w-24 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt rounded-md" />
                  <div className="h-6 w-5/6 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt rounded-md" />
                  <div className="h-3.5 w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt rounded-md" />
                </div>
                <div className="space-y-2 pt-3 border-t border-kalvium-border dark:border-kalvium-dark-border">
                  <div className="h-4 w-1/2 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-kalvium-dark-surface py-16 text-center rounded-3xl p-8 max-w-xl mx-auto border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm animate-fade-in">
          <p className="font-display text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2">No verified events found</p>
          <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted mb-6">
            Try adjusting your search query, timeline filters, or category.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedDateFilter("ALL");
            }}
            className="rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-semibold px-5 py-2.5 transition active:scale-95 shadow-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, idx) => (
            <EventCard
              key={event.id}
              index={idx}
              event={{
                ...event,
                isSaved: savedEventIds.has(event.id),
              }}
              onSaveToggle={handleSaveToggle}
              onSelectEvent={(ev) =>
                setSelectedEventForDrawer({
                  ...ev,
                  isSaved: savedEventIds.has(ev.id),
                })
              }
            />
          ))}
        </div>
      )}

      {/* Slide-over Event Details Drawer */}
      <EventDetailDrawer
        event={selectedEventForDrawer}
        isOpen={Boolean(selectedEventForDrawer)}
        onClose={() => setSelectedEventForDrawer(null)}
        onSaveToggle={handleSaveToggle}
      />
    </div>
  );
}
