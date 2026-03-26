import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function extractEmailsFromCsv(csv: string): string[] {
  const lines = csv.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(";");
  const emailIdx = headers.findIndex((h) => h.toLowerCase().includes("email"));
  const statusIdx = headers.findIndex((h) => h.toLowerCase().includes("status"));

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

  const body = await req.json().catch(() => ({}));

  // Auto-mode: read state from DB if no explicit params
  let csvUrl = body.csv_url;
  let offset = body.offset;
  let limit = body.limit || 10;
  let autoMode = false;

  if (!csvUrl) {
    const { data: state } = await supabase
      .from("email_send_state")
      .select("bulk_send_offset, bulk_send_csv_url, bulk_send_active")
      .single();

    if (!state?.bulk_send_active) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "bulk_send not active" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    csvUrl = state.bulk_send_csv_url;
    offset = state.bulk_send_offset;
    autoMode = true;
  }

  if (!csvUrl) {
    return new Response(
      JSON.stringify({ error: "No CSV URL configured" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Fetch and parse CSV
  const csvResp = await fetch(csvUrl);
  const csvText = await csvResp.text();
  const allEmails = extractEmailsFromCsv(csvText);

  if (!allEmails.length) {
    return new Response(
      JSON.stringify({ error: "No emails found in CSV" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check if we're done
  if (offset >= allEmails.length) {
    if (autoMode) {
      await supabase
        .from("email_send_state")
        .update({ bulk_send_active: false, updated_at: new Date().toISOString() })
        .eq("id", 1);
    }
    return new Response(
      JSON.stringify({ done: true, total_emails: allEmails.length, message: "All emails sent!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const batch = allEmails.slice(offset, offset + limit);
  console.log(`Sending OTP batch: offset=${offset}, limit=${limit}, batch=${batch.length}, total=${allEmails.length}`);

  const results: Array<{ email: string; status: string; error?: string }> = [];

  for (const email of batch) {
    const normalized = email.toLowerCase().trim();
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: { shouldCreateUser: false },
      });

      if (error) {
        results.push({ email: normalized, status: "error", error: error.message });
      } else {
        results.push({ email: normalized, status: "sent" });
      }
    } catch (err: any) {
      results.push({ email: normalized, status: "error", error: err.message });
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  const newOffset = offset + batch.length;

  // Update offset in DB for next cron run
  if (autoMode) {
    const isDone = newOffset >= allEmails.length;
    await supabase
      .from("email_send_state")
      .update({
        bulk_send_offset: newOffset,
        bulk_send_active: !isDone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
  }

  const sent = results.filter((r) => r.status === "sent").length;
  const failed = results.filter((r) => r.status === "error").length;

  return new Response(
    JSON.stringify({
      total_emails: allEmails.length,
      batch_offset: offset,
      batch_size: batch.length,
      sent,
      failed,
      next_offset: newOffset < allEmails.length ? newOffset : null,
      progress: `${newOffset}/${allEmails.length}`,
      results,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
