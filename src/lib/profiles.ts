import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryTimeProfile } from "./timeIntel";

export const DEFAULT_CODE = "DEFAULT";

export const profilesQueryOptions = queryOptions({
  queryKey: ["country_time_profiles"],
  staleTime: 1000 * 60 * 60,
  queryFn: async (): Promise<CountryTimeProfile[]> => {
    const { data, error } = await supabase
      .from("country_time_profiles")
      .select("*")
      .order("country_name");
    if (error) throw error;
    return (data ?? []) as unknown as CountryTimeProfile[];
  },
});

export function pickProfile(
  profiles: CountryTimeProfile[],
  code: string | null | undefined,
): CountryTimeProfile | undefined {
  return (
    profiles.find((p) => p.country_code === code) ??
    profiles.find((p) => p.country_code === DEFAULT_CODE)
  );
}
