import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all PURCHASE_APPROVED events
    const { data: events, error: fetchError } = await supabase
      .from("webhook_events")
      .select("payload")
      .eq("event_type", "PURCHASE_APPROVED");

    if (fetchError) throw new Error(`Fetch: ${JSON.stringify(fetchError)}`);

    // Extract unique emails
    const emailMap = new Map<string, { name: string; subscriberCode: string; subscriptionId: string; productId: number }>();
    for (const event of events || []) {
      const d = event.payload?.data;
      const email = (d?.buyer?.email || d?.subscriber?.email || "").toLowerCase().trim();
      if (!email) continue;
      if (emailMap.has(email)) continue;
      emailMap.set(email, {
        name: d?.buyer?.name || d?.subscriber?.name || "",
        subscriberCode: d?.subscriber?.code || d?.buyer?.document || "",
        subscriptionId: d?.subscription?.subscriber?.code || d?.purchase?.transaction || "",
        productId: d?.product?.id,
      });
    }

    console.log(`Unique emails to process: ${emailMap.size}`);

    // Load all existing users once (paginated)
    const existingUsers = new Map<string, string>();
    let page = 1;
    while (true) {
      const { data: userPage } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (!userPage?.users?.length) break;
      for (const u of userPage.users) {
        if (u.email) existingUsers.set(u.email.toLowerCase(), u.id);
      }
      if (userPage.users.length < 1000) break;
      page++;
    }

    console.log(`Existing auth users: ${existingUsers.size}`);

    const results = { created: 0, existed: 0, errors: 0, subscriptions: 0 };

    for (const [email, info] of emailMap) {
      try {
        let userId: string;

        if (existingUsers.has(email)) {
          userId = existingUsers.get(email)!;
          results.existed++;
        } else {
          const tempPassword = crypto.randomUUID() + "Aa1!";
          const { data: newUser, error: createError } =
            await supabase.auth.admin.createUser({
              email,
              password: tempPassword,
              email_confirm: true,
              user_metadata: { name: info.name },
            });

          if (createError) {
            console.error(`Create ${email}:`, createError.message);
            results.errors++;
            continue;
          }
          userId = newUser.user.id;
          existingUsers.set(email, userId);
          results.created++;
        }

        // Upsert subscription
        const { error: subError } = await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            hotmart_subscription_id: info.subscriptionId,
            subscriber_code: info.subscriberCode,
            product_id: info.productId,
            status: "ACTIVE",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        if (subError) {
          console.error(`Sub ${email}:`, subError.message);
        } else {
          results.subscriptions++;
        }
      } catch (err) {
        console.error(`Error ${email}:`, err);
        results.errors++;
      }
    }

    console.log("Done:", results);
    return new Response(JSON.stringify({ ok: true, results, totalUnique: emailMap.size }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
