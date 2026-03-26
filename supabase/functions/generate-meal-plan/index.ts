import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { questionnaire } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const goalMap: Record<string, string> = {
      emagrecer: "smršavjeti na zdrav način",
      inchaco: "smanjiti nadutost i upalu",
      energia: "povećati razinu energije",
      alimentacion: "poboljšati kvalitetu prehrane općenito",
    };

    const systemPrompt = `Ti si stručni nutricionistički savjetnik koji govori hrvatski. Generiraj personalizirani dnevni plan prehrane I 3 tjedne varijacije.

PODACI O KORISNIKU:
- Dob: ${questionnaire.age} godina
- Visina: ${questionnaire.height} cm
- Trenutna težina: ${questionnaire.current_weight} kg
- Željena težina: ${questionnaire.desired_weight} kg
- Cilj: ${goalMap[questionnaire.goal] || questionnaire.goal}
- Razina aktivnosti: ${questionnaire.activity_level}
- Ograničenja: ${questionnaire.restrictions?.length > 0 ? questionnaire.restrictions.join(", ") : "Nema"}
- Prehrambene preferencije: ${questionnaire.food_preferences?.length > 0 ? questionnaire.food_preferences.join(", ") : "Bez posebnih preferencija"}
- Razina težine pripreme: ${questionnaire.difficulty_level}

UPUTE:
1. Izračunaj preporučeni dnevni unos kalorija na temelju podataka.
2. Generiraj dnevni plan s 4 obroka: Doručak, Ručak, Međuobrok, Večera.
3. Svaki obrok mora imati namirnice s količinama i stvarnim kalorijama.
4. Generiraj 3 varijacije tjednog jelovnika (svaka s 4 različita obroka).
5. Također generiraj 6 jednostavnih recepata kompatibilnih s planom.
6. Svi recepti moraju uključivati sastojke, način pripreme, vrijeme i kalorije.
7. Sve na hrvatskom jeziku.`;

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
          { role: "user", content: "Generiraj potpuni personalizirani plan prehrane s varijacijama i receptima." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_meal_plan",
              description: "Return a personalized meal plan with weekly variations and recipes",
              parameters: {
                type: "object",
                properties: {
                  daily_calories: { type: "number", description: "Preporučene dnevne kalorije" },
                  daily_plan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        meal_name: { type: "string", description: "Naziv obroka: Doručak, Ručak, Međuobrok, Večera" },
                        emoji: { type: "string" },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              food: { type: "string" },
                              quantity: { type: "string" },
                              calories: { type: "number" },
                            },
                            required: ["food", "quantity", "calories"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["meal_name", "emoji", "items"],
                      additionalProperties: false,
                    },
                  },
                  weekly_variations: {
                    type: "array",
                    description: "3 varijacije tjednog jelovnika",
                    items: {
                      type: "object",
                      properties: {
                        variation_name: { type: "string", description: "Npr: Varijacija 1, Varijacija 2, Varijacija 3" },
                        meals: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              meal_name: { type: "string" },
                              emoji: { type: "string" },
                              items: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    food: { type: "string" },
                                    quantity: { type: "string" },
                                    calories: { type: "number" },
                                  },
                                  required: ["food", "quantity", "calories"],
                                  additionalProperties: false,
                                },
                              },
                            },
                            required: ["meal_name", "emoji", "items"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["variation_name", "meals"],
                      additionalProperties: false,
                    },
                  },
                  recipes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        emoji: { type: "string" },
                        category: { type: "string", enum: ["Doručak", "Ručak", "Večera", "Međuobrok", "Napitak"] },
                        time: { type: "string" },
                        calories: { type: "number" },
                        servings: { type: "number" },
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
                        steps: { type: "array", items: { type: "string" } },
                        tips: { type: "string" },
                      },
                      required: ["title", "emoji", "category", "time", "calories", "servings", "difficulty", "ingredients", "steps", "tips"],
                      additionalProperties: false,
                    },
                  },
                  nutritional_tip: { type: "string", description: "Personalizirani nutricionistički savjet za korisnika" },
                },
                required: ["daily_calories", "daily_plan", "weekly_variations", "recipes", "nutritional_tip"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_meal_plan" } },
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
    if (!toolCall?.function?.arguments) throw new Error("No tool call response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Nepoznata greška" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
