type GeneratedLead = {
  name: string;
  role?: string;
  company: string;
  website?: string;
  country_code: string;
  city?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  note?: string;
};

export type ProspectInput = {
  niche: string;
  countries: string[];
  quantity: number;
  extra?: string;
};

const SYSTEM = `Você é um analista de prospecção B2B. Gere uma lista de empresas/leads plausíveis e verificáveis para o nicho e países pedidos.
Regras:
- Prefira empresas reais e conhecidas do nicho/país quando você tiver conhecimento delas; nesse caso use o site oficial real.
- Nunca invente e-mail ou telefone pessoal: deixe o campo vazio se não tiver certeza. Pode usar padrões públicos de contato (ex.: contato@dominio.com) apenas se for o canal público da empresa.
- Distribua os leads entre os países pedidos.
- country_code deve ser ISO-3166 alpha-2 em maiúsculas.
- Responda apenas com a função/ferramenta fornecida.`;

export async function generateLeads(input: ProspectInput): Promise<GeneratedLead[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada");

  const prompt = `Nicho: ${input.niche}
Países (ISO alpha-2): ${input.countries.join(", ")}
Quantidade de leads: ${input.quantity}
${input.extra ? `Critérios extra: ${input.extra}` : ""}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "entregar_leads",
            description: "Entrega a lista de leads encontrados",
            parameters: {
              type: "object",
              properties: {
                leads: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      role: { type: "string" },
                      company: { type: "string" },
                      website: { type: "string" },
                      country_code: { type: "string" },
                      city: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      linkedin: { type: "string" },
                      note: { type: "string" },
                    },
                    required: ["name", "company", "country_code"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["leads"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "entregar_leads" } },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("Limite de uso da IA atingido. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA insuficientes no workspace.");
    throw new Error(`Falha na IA [${res.status}]: ${body}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
  };
  const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("A IA não retornou leads.");
  const parsed = JSON.parse(args) as { leads?: GeneratedLead[] };
  return (parsed.leads ?? []).filter((l) => l.name && l.company && l.country_code);
}

export function normalizeLead(lead: GeneratedLead) {
  const clean = (v?: string) => {
    const t = (v ?? "").trim();
    return t.length ? t : null;
  };
  return {
    name: lead.name.trim(),
    role: clean(lead.role),
    company: lead.company.trim(),
    website: clean(lead.website),
    country_code: lead.country_code.trim().toUpperCase().slice(0, 2),
    city: clean(lead.city),
    email: clean(lead.email),
    phone: clean(lead.phone),
    linkedin: clean(lead.linkedin),
    note: clean(lead.note),
  };
}
