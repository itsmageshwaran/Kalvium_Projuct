import { NextResponse } from "next/server";

const FORMSPREE_ENDPOINT =
  process.env.FORMSPREE_ENDPOINT ||
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ||
  (process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID
    ? `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`
    : "");

export async function POST(request: Request) {
  try {
    if (!FORMSPREE_ENDPOINT) {
      return NextResponse.json(
        { error: "Formspree endpoint is not configured in server environment variables." },
        { status: 500 }
      );
    }
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON payload provided." },
        { status: 400 }
      );
    }

    const { name, email, squad, category, subject, message } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Please fill out all required fields (name, email, subject, and message)." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith("@kalvium.community") && !cleanEmail.endsWith("@kalvium.com")) {
      return NextResponse.json(
        { error: "Please use your official campus email (@kalvium.community or @kalvium.com)." },
        { status: 400 }
      );
    }

    // Server-side forward to Formspree
    const formspreeResponse = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: cleanEmail,
        squad: squad?.trim() || "Not specified",
        category: category || "General Inquiry",
        subject: subject.trim(),
        message: message.trim(),
        _replyto: cleanEmail,
        _subject: `[CampusHub ${category || "Inquiry"}] ${subject.trim()}`,
        submittedAt: new Date().toISOString(),
        source: "CampusHub /contact Desk (Server-Dispatched)",
      }),
    });

    if (!formspreeResponse.ok) {
      const errorData = await formspreeResponse.json().catch(() => null);
      console.error("Formspree server forward error:", errorData);
      return NextResponse.json(
        {
          error:
            errorData?.error ||
            errorData?.errors?.[0]?.message ||
            "Formspree was unable to process the message at this time.",
        },
        { status: formspreeResponse.status || 502 }
      );
    }

    const responseData = await formspreeResponse.json().catch(() => ({ ok: true }));

    return NextResponse.json({
      ok: true,
      data: responseData,
      message: "Direct message delivered successfully to student leads.",
    });
  } catch (error: any) {
    console.error("Server API /api/contact error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while forwarding message to Formspree." },
      { status: 500 }
    );
  }
}
