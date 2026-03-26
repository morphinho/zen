import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { MagicLinkEmail } from "../_shared/email-templates/magic-link.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function extractEmailsFromCsv(csv: string): string[] {
  const lines = csv.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(";");
  const emailIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("email")
  );
  const statusIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("status")
  );

  if (emailIdx === -1) return [];

  const emails = new Set<string>();
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    const status = statusIdx >= 0 ? cols[statusIdx]?.trim() : "Aprovado";
    if (status !== "Aprovado") continue;
    const email = cols[emailIdx]?.trim().toLowerCase();
    if (email && email.includes("@")) {
      emails.add(email);
    }
  }
  return Array.from(emails);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const body = await req.json();
  let allEmails: string[] = body.emails || [];

  // If csv_url is provided, fetch and parse the CSV
  if (body.csv_url) {
    const csvResp = await fetch(body.csv_url);
    const csvText = await csvResp.text();
    allEmails = extractEmailsFromCsv(csvText);
  }

  if (!allEmails.length) {
    return new Response(
      JSON.stringify({ error: "No emails found" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Pagination
  const offset = body.offset || 0;
  const limit = body.limit || 50;
  const batch = allEmails.slice(offset, offset + limit);

  console.log(`Processing batch: offset=${offset}, limit=${limit}, batch_size=${batch.length}, total=${allEmails.length}`);

  const results: Array<{ email: string; success?: boolean; error?: string }> = [];
  const SITE_URL = "https://zenlifeapp.lovable.app";

  for (const email of batch) {
    const normalizedEmail = email.toLowerCase().trim();
    try {
      const { data: linkData, error: linkError } =
        await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: normalizedEmail,
          options: {
            redirectTo: SITE_URL + "/dashboard",
          },
        });

      if (linkError) {
        console.error(`Error for ${normalizedEmail}:`, linkError.message);
        results.push({ email: normalizedEmail, error: linkError.message });
        continue;
      }

      const actionLink = linkData?.properties?.action_link;
      if (!actionLink) {
        results.push({ email: normalizedEmail, error: "No action link" });
        continue;
      }

      const html = await renderAsync(
        React.createElement(MagicLinkEmail, {
          siteName: "ZenLife",
          confirmationUrl: actionLink,
        })
      );
      const text = await renderAsync(
        React.createElement(MagicLinkEmail, {
          siteName: "ZenLife",
          confirmationUrl: actionLink,
        }),
        { plainText: true }
      );

      const messageId = crypto.randomUUID();

      const { error: queueError } = await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          run_id: crypto.randomUUID(),
          to: normalizedEmail,
          from: "ZenLife <noreply@zenlifeapp.site>",
          sender_domain: "notify.zenlifeapp.site",
          subject: "Vaš pristup ZenLife 🌿",
          html,
          text,
          purpose: "transactional",
          label: "bulk-access",
          message_id: messageId,
          queued_at: new Date().toISOString(),
        },
      });

      if (queueError) {
        results.push({ email: normalizedEmail, error: queueError.message });
      } else {
        results.push({ email: normalizedEmail, success: true });
      }
    } catch (err: any) {
      results.push({ email: normalizedEmail, error: err.message });
    }

    await new Promise((r) => setTimeout(r, 150));
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => r.error).length;

  return new Response(
    JSON.stringify({
      total_emails: allEmails.length,
      batch_offset: offset,
      batch_size: batch.length,
      succeeded,
      failed,
      next_offset: offset + limit < allEmails.length ? offset + limit : null,
      results,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
