export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface FieldConfidence {
  field: string;
  level: ConfidenceLevel;
  reason?: string;
}

export interface ExtractedEventData {
  title: string;
  date: string;           // YYYY-MM-DD
  startTime: string;      // e.g. "10:00 AM"
  endTime: string;        // e.g. "01:00 PM"
  venue: string;
  organizerName: string;
  category: string;
  description: string;
  summary: string;
  tags: string[];
  registrationUrl: string;
  contactInfo: string;
  confidences: Record<string, ConfidenceLevel>;
  confidenceDetails: FieldConfidence[];
  disclaimer: string;
}

export interface DuplicateCheckResult {
  hasPotentialDuplicate: boolean;
  matchedEvent?: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    venue: string;
    organizerName?: string | null;
  };
  reason?: string;
}

/**
 * Pre-defined rich demo posters with real campus scenarios
 * allowing immediate 1-click test uploads if the user doesn't have an image ready.
 */
export const SAMPLE_POSTERS = [
  {
    id: "sample-ai-robotics",
    name: "AI & Robotics Workshop",
    category: "Workshop",
    filename: "poster-ai-workshop.png",
    previewUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    extractedData: {
      title: "AI & Robotics Hands-on Workshop",
      date: "2026-09-11",
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      venue: "Innovation Lab, 3rd Floor Engineering Block",
      organizerName: "Robotics & AI Society",
      category: "Workshop",
      summary: "A practical 3-hour deep dive into autonomous robotic navigation and edge AI deployment.",
      description: "Join the Robotics & AI Society for an intensive, hands-on workshop on building and programming autonomous mobile robots. Participants will implement computer vision tracking algorithms on edge microcontrollers and test their bots on our custom obstacle course. All microcontrollers and sensor kits provided on site.",
      tags: ["Artificial Intelligence", "Robotics", "Hardware", "Edge Computing", "Open Source"],
      registrationUrl: "https://campus-hub.edu/register/robotics-2026",
      contactInfo: "robotics-leads@campus.edu | Lab Coordinator: Room E-304",
      confidences: {
        title: "HIGH",
        date: "HIGH",
        startTime: "HIGH",
        endTime: "MEDIUM",
        venue: "HIGH",
        organizerName: "HIGH",
        category: "HIGH",
        registrationUrl: "MEDIUM",
        contactInfo: "LOW",
      },
    }
  },
  {
    id: "sample-hackathon",
    name: "Campus Hack 2026 (Clash Candidate)",
    category: "Hackathon",
    filename: "poster-hackathon.png",
    previewUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
    extractedData: {
      title: "Campus Hack 2026: 24h Build Sprint",
      date: "2026-09-11", // Same date as Workshop (for testing clash!)
      startTime: "11:30 AM", // 11:30 AM clashes with 10:00 AM - 1:00 PM!
      endTime: "05:00 PM",
      venue: "Main Auditorium & Innovation Foyer",
      organizerName: "Developer Student Club",
      category: "Hackathon",
      summary: "24-hour university hackathon focused on AI agents, civic tech, and sustainable computing.",
      description: "Campus Hack 2026 brings together over 200 student developers, designers, and thinkers to craft high-impact solutions across AI, decentralized networks, and campus climate tools. Mentorship from alumni engineers, high-speed WiFi, and 24-hour food stations provided.",
      tags: ["Hackathon", "Coding", "Innovation", "Startups", "Prizes"],
      registrationUrl: "https://campushack2026.dev",
      contactInfo: "hackathon@campus.edu",
      confidences: {
        title: "HIGH",
        date: "HIGH",
        startTime: "HIGH",
        endTime: "MEDIUM",
        venue: "HIGH",
        organizerName: "HIGH",
        category: "HIGH",
        registrationUrl: "HIGH",
        contactInfo: "MEDIUM",
      }
    }
  },
  {
    id: "sample-cultural-fest",
    name: "Campus Cultural Fest: Harmony 2026",
    category: "Cultural",
    filename: "poster-harmony-fest.png",
    previewUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    extractedData: {
      title: "Harmony 2026: Annual Inter-College Fest",
      date: "2026-09-15",
      startTime: "05:00 PM",
      endTime: "10:00 PM",
      venue: "University Open-Air Amphitheatre",
      organizerName: "Campus Cultural Board",
      category: "Cultural",
      summary: "The flagship campus music and arts celebration featuring live student bands, food stalls, and creative exhibitions.",
      description: "Harmony 2026 is our annual signature cultural evening featuring student acoustic ensembles, indie rock bands, theatrical skits, and student art installations across the amphitheatre lawn. Free admission for all students with valid campus ID.",
      tags: ["Music", "Dance", "Arts", "Festival", "Live Performance"],
      registrationUrl: "Not specified",
      contactInfo: "cultural@campus.edu",
      confidences: {
        title: "HIGH",
        date: "HIGH",
        startTime: "HIGH",
        endTime: "LOW",
        venue: "HIGH",
        organizerName: "MEDIUM",
        category: "HIGH",
        registrationUrl: "LOW",
        contactInfo: "MEDIUM",
      }
    }
  },
  {
    id: "sample-design-sprint",
    name: "UI/UX Product Design Sprint",
    category: "Technical",
    filename: "poster-design-sprint.png",
    previewUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
    extractedData: {
      title: "UI/UX Product Design Sprint: Crafting High-Taste UIs",
      date: "2026-09-12",
      startTime: "02:00 PM",
      endTime: "05:00 PM",
      venue: "Design Studio Room 402",
      organizerName: "Design & UX Guild",
      category: "Technical",
      summary: "Hands-on product design sprint exploring design systems, micro-interactions, and Figma to code pipelines.",
      description: "Learn how to build editorial-grade digital interfaces with a focus on hierarchy, spacing systems, and interactive prototypes. Students will design a live product screen from scratch and receive direct critiques.",
      tags: ["UI/UX", "Product Design", "Figma", "Design Systems"],
      registrationUrl: "https://campus-hub.edu/design-sprint",
      contactInfo: "uxguild@campus.edu",
      confidences: {
        title: "HIGH",
        date: "HIGH",
        startTime: "HIGH",
        endTime: "HIGH",
        venue: "MEDIUM",
        organizerName: "HIGH",
        category: "HIGH",
        registrationUrl: "HIGH",
        contactInfo: "LOW",
      }
    }
  }
];
