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
  const emailIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("email")
  );
  const statusIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("status")
  );

  console.log(`Headers found: emailIdx=${emailIdx}, statusIdx=${statusIdx}`);
  console.log(`Header at emailIdx: "${headers[emailIdx]}"`);
  console.log(`Header at statusIdx: "${headers[statusIdx]}"`);

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

  // Accept CSV as raw text in body
  if (body.csv_text) {
    allEmails = extractEmailsFromCsv(body.csv_text);
    console.log(`Extracted ${allEmails.length} emails from csv_text`);
  } else if (body.csv_url) {
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

  const offset = body.offset || 0;
  const limit = body.limit || 50;
  const batch = allEmails.slice(offset, offset + limit);

  console.log(`Creating accounts: offset=${offset}, limit=${limit}, batch=${batch.length}, total=${allEmails.length}`);

  const results: Array<{ email: string; status: string; error?: string }> = [];

  for (const email of batch) {
    const normalized = email.toLowerCase().trim();

    try {
      const tempPassword = crypto.randomUUID() + "Aa1!";
      const { error } = await supabase.auth.admin.createUser({
        email: normalized,
        password: tempPassword,
        email_confirm: true,
      });

      if (error) {
        if (error.message?.includes("already been registered")) {
          results.push({ email: normalized, status: "already_exists" });
        } else {
          results.push({ email: normalized, status: "error", error: error.message });
        }
      } else {
        results.push({ email: normalized, status: "created" });
      }
    } catch (err: any) {
      results.push({ email: normalized, status: "error", error: err.message });
    }

    await new Promise((r) => setTimeout(r, 80));
  }

  const created = results.filter((r) => r.status === "created").length;
  const existed = results.filter((r) => r.status === "already_exists").length;
  const failed = results.filter((r) => r.status === "error").length;

  return new Response(
    JSON.stringify({
      total_emails: allEmails.length,
      batch_offset: offset,
      batch_size: batch.length,
      created,
      already_existed: existed,
      failed,
      next_offset: offset + limit < allEmails.length ? offset + limit : null,
      results,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
