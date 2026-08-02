"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { contactFormSchema } from "@/lib/security/validation";
import type { z } from "zod";

type ContactFormValues = z.input<typeof contactFormSchema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", message: "", company: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to send message.");
      }
      setSubmitted(true);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
    }
  });

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-500/40 bg-green-500/5 p-6 text-center text-sm">
        Thanks for reaching out — we&apos;ll get back to you soon.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="contact-name">Name</Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => <Input id="contact-name" className="mt-1.5" {...field} />}
        />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="contact-email">Email</Label>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input id="contact-email" type="email" className="mt-1.5" {...field} />
          )}
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Controller
          control={control}
          name="message"
          render={({ field }) => (
            <Textarea id="contact-message" rows={5} className="mt-1.5" {...field} />
          )}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {/* Honeypot field — hidden from real users via CSS, bots tend to fill every field. */}
      <div className="sr-only" aria-hidden="true">
        <Label htmlFor="contact-company">Company</Label>
        <Controller
          control={control}
          name="company"
          render={({ field }) => (
            <Input id="contact-company" tabIndex={-1} autoComplete="off" {...field} />
          )}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
