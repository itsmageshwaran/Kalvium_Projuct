"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, User, Mail, Lock, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT"); // STUDENT or ORGANIZER
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await register(name, email, password, role);
    setLoading(false);
    if (res.success) {
      if (role === "ORGANIZER") {
        router.push("/dashboard/organizer");
      } else {
        router.push("/events");
      }
    } else {
      setError(res.error || "Registration failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-[#FFF8E1] border-4 border-black shadow-[4px_4px_0px_0px_black] text-black flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-black text-black uppercase tracking-tighter mt-4">Create Your Account</h1>
        <p className="text-[10px] font-bold text-black uppercase tracking-widest mt-4">
          Join the campus event ecosystem as a student or club organizer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] rounded-3xl p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-[#FDEAE7] border-2 border-[#E5391F] text-[#E5391F] text-[10px] font-black uppercase tracking-widest">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${role === "STUDENT"
                  ? "bg-black text-white border-black shadow-none translate-y-0.5"
                  : "bg-white text-black border-black shadow-[2px_2px_0px_0px_black] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_black]"
                }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setRole("ORGANIZER")}
              className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${role === "ORGANIZER"
                  ? "bg-black text-white border-black shadow-none translate-y-0.5"
                  : "bg-white text-black border-black shadow-[2px_2px_0px_0px_black] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_black]"
                }`}
            >
              🏛 Club Organizer
            </button>
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
            * Campus Manager access is restricted to appointed deans & faculty.
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">
            {role === "ORGANIZER" ? "Club / Society Name" : "Full Name"}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === "ORGANIZER" ? "e.g. Robotics & AI Society" : "e.g. Alex Johnson"}
              className="w-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] rounded-xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-black focus:outline-none focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_0px_black] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">
            Campus Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@campus.edu"
              className="w-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] rounded-xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-black focus:outline-none focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_0px_black] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] rounded-xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-black focus:outline-none focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_0px_black] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-[#EF321F] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_black] border-2 border-black transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_black] active:translate-y-0 active:shadow-[2px_2px_0px_0px_black] disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Complete Registration"}
        </button>

        <p className="text-center text-[10px] font-black text-black uppercase tracking-widest pt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#EF321F] hover:text-black hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
