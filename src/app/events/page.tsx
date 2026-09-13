"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import EventCard, { EventCardData } from "@/components/EventCard";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import EventDetailDrawer from "@/components/EventDetailDrawer";
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
  { id: "ALL", label: "All Upcoming" },
  { id: "TODAY", label: "Today" },
  { id: "TOMORROW", label: "Tomorrow" },
  { id: "THIS_WEEK", label: "This Week" },
];

export default function EventsExplorePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDateFilter, setSelectedDateFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("soonest");
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [selectedEventForDrawer, setSelectedEventForDrawer] = useState<EventCardData | null>(null);

  const fetchSavedState = async () => {
    if (!user) return;
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
      if (searchQuery) params.set("q", searchQuery);
      if (selectedCategory && selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedDateFilter && selectedDateFilter !== "ALL") params.set("dateFilter", selectedDateFilter);
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/events?${params.toString()}`);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedDateFilter, sortBy]);

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
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#E5391F] font-bold bg-white px-4 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black]">
              Campus Discovery
            </span>
            <CampusVerifiedBadge size="sm" animate />
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">
            Everything verified, this semester.
          </h1>
          <p className="text-base font-medium text-[#777777] mt-2 max-w-xl">
            Every listed event is authenticated by campus staff against original organizer posters.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2.5 text-xs font-sans text-[#111111] dark:text-white bg-white dark:bg-[#111111] px-4 py-2.5 rounded-full self-start md:self-auto border-4 border-black shadow-[6px_6px_0px_0px_black]">
          <span className="text-[#777777] uppercase tracking-wider font-bold">SHOWING:</span>
          <span className="font-black font-display text-base text-[#E5391F] leading-none">{events.length}</span>
          <span className="text-[#111111] dark:text-[#D6D6D2] font-bold uppercase tracking-wider">APPROVED EVENTS</span>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white dark:bg-[#111111] rounded-2xl p-5 sm:p-6 mb-10 space-y-5 border-4 border-black shadow-[6px_6px_0px_0px_black]">
        {/* Search input and Sort dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full flex items-center gap-3 bg-white border-2 border-black rounded-full px-6 py-4 shadow-[4px_4px_0px_0px_black] focus-within:border-[#E5391F] transition-colors">
            <Search size={18} className="text-[#777777] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title, organizer, venue, or keywords..."
              className="w-full bg-transparent text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#777777] focus:outline-none"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal size={16} className="text-[#777777] shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-white border-2 border-black rounded-full px-6 py-4 shadow-[4px_4px_0px_0px_black] text-sm font-semibold text-[#111111] dark:text-white focus:outline-none focus:border-[#E5391F] transition-colors"
            >
              <option value="soonest">Sort: Soonest First</option>
              <option value="latest">Sort: Furthest Date</option>
              <option value="recently_added">Sort: Recently Added</option>
            </select>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#777777] text-[10px] uppercase tracking-widest font-bold shrink-0 mr-2">
            Timeline:
          </span>
          {DATE_FILTERS.map((df) => {
            const active = selectedDateFilter === df.id;
            return (
              <button
                key={df.id}
                onClick={() => setSelectedDateFilter(df.id)}
                className={`relative px-4 py-1.5 rounded-full font-bold transition-all duration-200 active:scale-95 whitespace-nowrap border ${active
                    ? "bg-[#E5391F] text-white border-black shadow-[4px_4px_0px_0px_black]"
                    : "bg-white text-black border-black hover:shadow-[4px_4px_0px_0px_black]"
                  }`}
              >
                {df.label}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#777777] text-[10px] uppercase tracking-widest font-bold shrink-0 mr-2">
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-4 py-1.5 rounded-full font-bold transition-all duration-200 active:scale-95 whitespace-nowrap border ${active
                    ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_black]"
                    : "bg-white text-black border-black hover:shadow-[4px_4px_0px_0px_black]"
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
              className="bg-white dark:bg-[#111111] border border-[#D6D6D2] dark:border-[#444444] rounded-xl overflow-hidden flex flex-col h-[380px] animate-pulse"
            >
              <div className="h-44 w-full bg-[#F7F7F5] dark:bg-[#222222]" />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="h-4 w-24 bg-[#F7F7F5] dark:bg-[#222222] rounded-md" />
                  <div className="h-6 w-5/6 bg-[#F7F7F5] dark:bg-[#222222] rounded-md" />
                  <div className="h-3.5 w-full bg-[#F7F7F5] dark:bg-[#222222] rounded-md" />
                </div>
                <div className="space-y-2 pt-3 border-t border-[#D6D6D2] dark:border-[#444444]">
                  <div className="h-4 w-1/2 bg-[#F7F7F5] dark:bg-[#222222] rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-[#111111] py-16 text-center rounded-2xl p-8 max-w-xl mx-auto border-4 border-black shadow-[6px_6px_0px_0px_black]">
          <p className="font-display text-2xl font-black text-[#111111] dark:text-white mb-2">No verified events found</p>
          <p className="text-sm text-[#777777] font-medium mb-6">
            Try adjusting your search query, timeline filters, or category.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedDateFilter("ALL");
            }}
            className="btn-kalvium-primary"
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
