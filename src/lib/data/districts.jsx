import "server-only";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";

export async function getDistricts(regionId) {
    const supabase = createSupabaseServerClient();
    const {data: districts, error} = await supabase
        .from('districts')
        .select('id, name')
        .eq('region_id', regionId);

    if (error) {
        console.error('Error fetching districts:', error);
        throw new Error("Failed to load districts.");
    }

    return districts;
}