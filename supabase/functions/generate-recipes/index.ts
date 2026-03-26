import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const restrictions = profile?.restrictions?.length > 0
      ? `Prehrambena ograničenja: ${profile.restrictions.join(", ")}.`
      : "Bez prehrambenih ograničenja.";

    const goal = profile?.goal
      ? `Cilj: ${profile.goal === "bajar" ? "smršavjeti" : profile.goal === "subir" ? "dobiti na težini" : "održavati težinu"}.`
      : "";

    const systemPrompt = `Ti si stručni nutricionistički savjetnik. Generiraj točno 8 zdravih, stvarnih i funkcionalnih recepata.
${goal} ${restrictions}

Svaki recept mora biti stvaran, sa stvarnim sastojcima i detaljnim koracima koje osoba može pratiti.
Uključi raznolikost: doručke, ručkove, večere, međuobroke i napitke.

MORAŠ odgovoriti SAMO s JSON-om koristeći danu funkciju, bez dodatnog teksta.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generiraj 8 raznovrsnih zdravih recepata sa sastojcima i detaljnim koracima." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_recipes",
              description: "Return a list of healthy recipes",
              parameters: {
                type: "object",
                properties: {
                  recipes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Naziv recepta" },
                        emoji: { type: "string", description: "Reprezentativni emoji" },
                        category: { type: "string", enum: ["Doručak", "Ručak", "Večera", "Međuobrok", "Napitak"] },
                        time: { type: "string", description: "Vrijeme pripreme, npr: 15 min" },
                        calories: { type: "number", description: "Približne kalorije" },
                        servings: { type: "number", description: "Porcije" },
                        difficulty: { type: "string", enum: ["Lako", "Srednje", "Napredno"] },
                        ingredients: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              quantity: { type: "string" },
                            },
                            required: ["name", "quantity"],
                            additionalProperties: false,
                          },
                        },
                        steps: {
                          type: "array",
                          items: { type: "string" },
                          description: "Detaljni koraci pripreme",
                        },
                        tips: { type: "string", description: "Nutricionistički savjet ili preporuka" },
                      },
                      required: ["title", "emoji", "category", "time", "calories", "servings", "difficulty", "ingredients", "steps", "tips"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recipes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_recipes" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Previše zahtjeva. Pokušajte ponovo za nekoliko minuta." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Nedovoljno kredita." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call response received");
    }

    const recipes = JSON.parse(toolCall.function.arguments);
    
    return new Response(JSON.stringify(recipes), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recipes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Nepoznata greška" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
