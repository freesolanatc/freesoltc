import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/security/validation";
import { rateLimitUploadMetadata } from "@/lib/security/rateLimit";
import { isAllowedOrigin } from "@/lib/security/origin";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 60;

const PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

const fieldsSchema = z.object({
  name: z.string().trim().min(1).max(32),
  symbol: z.string().trim().min(1).max(10),
  description: z.string().trim().max(500).default(""),
  social: z
    .object({
      website: z.string().optional(),
      twitter: z.string().optional(),
      telegram: z.string().optional(),
      discord: z.string().optional(),
    })
    .default({}),
});

const PINATA_CALL_TIMEOUT_MS = 25_000;

async function pinFile(file: File, jwt: string): Promise<string> {
  const form = new FormData();
  form.append("file", file, file.name);
  let res: Response;
  try {
    res = await fetch(PINATA_PIN_FILE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: form,
      signal: AbortSignal.timeout(PINATA_CALL_TIMEOUT_MS),
    });
  } catch {
    throw new Error("Image upload to storage timed out. Please try again.");
  }
  if (!res.ok) {
    throw new Error(`Pinata file upload failed (${res.status}).`);
  }
  const data = (await res.json()) as { IpfsHash: string };
  return `${PINATA_GATEWAY}/${data.IpfsHash}`;
}

async function pinJson(json: unknown, jwt: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(PINATA_PIN_JSON_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pinataContent: json }),
      signal: AbortSignal.timeout(PINATA_CALL_TIMEOUT_MS),
    });
  } catch {
    throw new Error("Metadata upload to storage timed out. Please try again.");
  }
  if (!res.ok) {
    throw new Error(`Pinata metadata upload failed (${res.status}).`);
  }
  const data = (await res.json()) as { IpfsHash: string };
  return `${PINATA_GATEWAY}/${data.IpfsHash}`;
}

export async function POST(request: NextRequest) {
  if (!serverEnv.PINATA_JWT) {
    return NextResponse.json(
      { error: "Image/metadata storage is not configured yet." },
      { status: 503 }
    );
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = await rateLimitUploadMetadata(`ip:${ip}`);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const image = form.get("image");
  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Upload a token image first." }, { status: 400 });
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
    return NextResponse.json(
      { error: "Use a PNG, JPEG, WEBP, or GIF image." },
      { status: 400 }
    );
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image must be smaller than 2MB." }, { status: 400 });
  }

  let social: unknown;
  try {
    social = JSON.parse((form.get("social") as string | null) ?? "{}");
  } catch {
    social = {};
  }

  const parsed = fieldsSchema.safeParse({
    name: form.get("name"),
    symbol: form.get("symbol"),
    description: form.get("description") ?? "",
    social,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  try {
    const imageUri = await pinFile(image, serverEnv.PINATA_JWT);

    const properties: Record<string, string> = {};
    if (parsed.data.social.website) properties.website = parsed.data.social.website;
    if (parsed.data.social.twitter) properties.twitter = parsed.data.social.twitter;
    if (parsed.data.social.telegram) properties.telegram = parsed.data.social.telegram;
    if (parsed.data.social.discord) properties.discord = parsed.data.social.discord;

    const metadataUri = await pinJson(
      {
        name: parsed.data.name,
        symbol: parsed.data.symbol,
        description: parsed.data.description,
        image: imageUri,
        properties,
      },
      serverEnv.PINATA_JWT
    );

    return NextResponse.json({ metadataUri });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload token image/metadata." },
      { status: 502 }
    );
  }
}
