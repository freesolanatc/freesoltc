import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/security/validation";
import { rateLimitContact } from "@/lib/security/rateLimit";
import { serverEnv } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(siteConfig.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = await rateLimitContact(`ip:${ip}`);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  // Honeypot: bots fill every field, including this hidden one that real users leave blank.
  if (parsed.data.company) {
    return NextResponse.json({ success: true });
  }

  const { name, email, message } = parsed.data;

  if (serverEnv.RESEND_API_KEY && serverEnv.CONTACT_RECEIVER_EMAIL) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${siteConfig.name} <noreply@${new URL(siteConfig.url).hostname}>`,
          to: serverEnv.CONTACT_RECEIVER_EMAIL,
          reply_to: email,
          subject: `New contact form submission from ${name}`,
          text: message,
        }),
      });
    } catch {
      return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 502 });
    }
  }

  return NextResponse.json({ success: true });
}
