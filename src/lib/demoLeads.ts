export type Lead = {
  id: string;
  name: string;
  company: string;
  country_code: string;
  niche: string;
  response_rate: number | null;
};

export const DEMO_LEADS: Lead[] = [
  { id: "1", name: "Marina Alves", company: "Nexo Digital", country_code: "BR", niche: "Agência", response_rate: 0.62 },
  { id: "2", name: "David Cohen", company: "Brightpath SaaS", country_code: "US", niche: "SaaS", response_rate: 0.41 },
  { id: "3", name: "Sofia Marques", company: "Atlântico Retail", country_code: "PT", niche: "E-commerce", response_rate: null },
  { id: "4", name: "Lucas Herrera", company: "Andes Logistics", country_code: "CL", niche: "Logística", response_rate: 0.28 },
  { id: "5", name: "Anna Weber", company: "Kraft Industrie", country_code: "DE", niche: "Indústria", response_rate: null },
  { id: "6", name: "Rohan Mehta", company: "Vayu Tech", country_code: "IN", niche: "Tecnologia", response_rate: 0.55 },
  { id: "7", name: "Hana Sato", company: "Midori Corp", country_code: "JP", niche: "Serviços", response_rate: null },
  { id: "8", name: "Omar Al Fahim", company: "Gulf Ventures", country_code: "AE", niche: "Consultoria", response_rate: 0.33 },
  { id: "9", name: "Camila Duarte", company: "Café Bogotá", country_code: "CO", niche: "E-commerce", response_rate: null },
  { id: "10", name: "Nora Jansen", company: "Delta Cloud", country_code: "NL", niche: "SaaS", response_rate: 0.47 },
  { id: "11", name: "Ivan Petrov", company: "Baltic Freight", country_code: "LV", niche: "Logística", response_rate: null },
  { id: "12", name: "Emily Clarke", company: "Northgate Legal", country_code: "GB", niche: "Serviços", response_rate: 0.36 },
];
