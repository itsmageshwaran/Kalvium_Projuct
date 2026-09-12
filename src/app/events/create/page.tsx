"use client";

import React from "react";
import CreateEventStudio from "@/components/CreateEventStudio";

export default function CreateEventStudioPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-sans uppercase tracking-widest text-kalvium-coral font-bold bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-2.5 py-0.5 rounded-full border border-kalvium-coral/20">
            AI Event Creation Studio
          </span>
          <span className="text-kalvium-muted">•</span>
          <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">Zero Manual Data Entry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
          Create an Event with AI Poster Analysis
        </h1>
        <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
          Upload your event poster and let AI extract structured event details, evaluate confidence scores, and format content for campus verification.
        </p>
      </div>

      <CreateEventStudio />
    </div>
  );
}
