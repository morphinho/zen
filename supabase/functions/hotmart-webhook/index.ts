import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hotmart-hottok",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Hotmart token
    const hottok = req.headers.get("x-hotmart-hottok");
    const expectedToken = Deno.env.get("HOTMART_HOTTOK");

    if (!hottok || hottok !== expectedToken) {
      console.error("Invalid HOTTOK");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const eventType = body.event;
    const eventId = body.id;
    const data = body.data;

    console.log(`Received event: ${eventType} (${eventId})`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check for duplicate event
    if (eventId) {
      const { data: existing } = await supabase
        .from("webhook_events")
        .select("id")
        .eq("event_id", eventId)
        .maybeSingle();

      if (existing) {
        console.log(`Event ${eventId} already processed, skipping`);
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Save webhook event
    await supabase.from("webhook_events").insert({
      event_id: eventId,
      event_type: eventType,
      payload: body,
      processed: false,
    });

    // Process event
    switch (eventType) {
      case "PURCHASE_APPROVED":
        await handlePurchaseApproved(supabase, data);
        break;
      case "SUBSCRIPTION_CANCELLATION":
        await handleCancellation(supabase, data);
        break;
      case "SWITCH_PLAN":
        await handleSwitchPlan(supabase, data);
        break;
      case "UPDATE_SUBSCRIPTION_CHARGE_DATE":
        await handleUpdateChargeDate(supabase, data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    // Mark as processed
    if (eventId) {
      await supabase
        .from("webhook_events")
        .update({ processed: true })
        .eq("event_id", eventId);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handlePurchaseApproved(supabase: any, data: any) {
  // Hotmart sends email in data.buyer.email (not data.subscriber.email)
  const email = data?.buyer?.email || data?.subscriber?.email;
  const name = data?.buyer?.name || data?.subscriber?.name || "";
  const subscriberCode = data?.subscriber?.code || data?.buyer?.document;
  const subscriptionId = data?.subscription?.subscriber?.code || data?.purchase?.transaction;
  const productId = data?.product?.id;
  const planId = data?.plan?.id;
  const planName = data?.plan?.name || "";
  const nextChargeDate = data?.subscription?.date_next_charge;

  if (!email) {
    console.error("No email in PURCHASE_APPROVED payload");
    return;
  }

  console.log(`Processing purchase for: ${email}`);

  // Check if user exists in auth
  const { data: userList } = await supabase.auth.admin.listUsers();
  const existingUser = userList?.users?.find(
    (u: any) => u.email?.toLowerCase() === email.toLowerCase()
  );

  let userId: string;
  let isNewUser = false;

  if (existingUser) {
    userId = existingUser.id;
    console.log(`User already exists: ${userId}`);
  } else {
    // Create user with random password (will need activation later)
    const tempPassword = crypto.randomUUID() + "Aa1!";
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name },
      });

    if (createError) {
      console.error("Error creating user:", createError);
      return;
    }

    userId = newUser.user.id;
    isNewUser = true;
    console.log(`Created new user: ${userId}`);
  }

  // Create or update subscription
  const { error: subError } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      hotmart_subscription_id: subscriptionId,
      subscriber_code: subscriberCode,
      product_id: productId,
      plan_id: planId,
      plan_name: planName,
      status: "ACTIVE",
      next_charge_date: nextChargeDate || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (subError) {
    console.error("Error creating subscription:", subError);
  }

  // Send magic link email via Supabase built-in mailer
  try {
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (magicError) {
      console.error("Error sending magic link email:", magicError);
    } else {
      console.log(`Magic link email sent to ${email}`);

      // Mark needs_activation as false after successful email
      await supabase
        .from("profiles")
        .update({ needs_activation: false })
        .eq("id", userId);
    }
  } catch (mlError) {
    console.error("Magic link error:", mlError);
  }
}

async function handleCancellation(supabase: any, data: any) {
  const subscriberCode = data?.subscriber?.code;
  const nextChargeDate = data?.subscription?.date_next_charge;

  if (!subscriberCode) return;

  await supabase
    .from("subscriptions")
    .update({
      status: "CANCELED",
      next_charge_date: nextChargeDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("subscriber_code", subscriberCode);

  console.log(`Subscription canceled for subscriber: ${subscriberCode}`);
}

async function handleSwitchPlan(supabase: any, data: any) {
  const subscriberCode = data?.subscriber?.code;
  const planId = data?.plan?.id;
  const planName = data?.plan?.name || "";

  if (!subscriberCode) return;

  await supabase
    .from("subscriptions")
    .update({
      plan_id: planId,
      plan_name: planName,
      updated_at: new Date().toISOString(),
    })
    .eq("subscriber_code", subscriberCode);

  console.log(`Plan switched for subscriber: ${subscriberCode}`);
}

async function handleUpdateChargeDate(supabase: any, data: any) {
  const subscriberCode = data?.subscriber?.code;
  const nextChargeDate = data?.subscription?.date_next_charge;

  if (!subscriberCode) return;

  await supabase
    .from("subscriptions")
    .update({
      next_charge_date: nextChargeDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("subscriber_code", subscriberCode);

  console.log(`Charge date updated for subscriber: ${subscriberCode}`);
}
