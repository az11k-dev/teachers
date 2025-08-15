import "server-only";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";

export const revalidate = 60;

export async function getRegions() {
    const supabase = createSupabaseServerClient();
    const {data: regions, error} = await supabase
        .from("regions")
        .select("id, name")
        .order("name", {ascending: true});

    if (error) {
        console.error("Error fetching regions:", error);
        throw new Error("Failed to load regions.");
    }

    return regions;
}