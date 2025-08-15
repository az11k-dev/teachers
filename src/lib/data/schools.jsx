import "server-only";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";

export async function getSchools(districtId) {
    const supabase = createSupabaseServerClient();
    const {data: schools, error} = await supabase
        .from('schools')
        .select('id, name')
        .eq('district_id', districtId);

    if (error) {
        console.error('Error fetching schools:', error);
        throw new Error("Failed to load schools.");
    }

    return schools;
}