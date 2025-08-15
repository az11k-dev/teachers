import {createClient} from '@supabase/supabase-js';

export function createSupabaseServerClient() {
    return createClient(
        "https://thioqyqfwvfpolpufmwa.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoaW9xeXFmd3ZmcG9scHVmbXdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5MTcwNywiZXhwIjoyMDcwNjY3NzA3fQ.N5gUGrb73RkBdxFKXBLvE-NDuNR8oGjDaNXep5Paxm8" || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoaW9xeXFmd3ZmcG9scHVmbXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTE3MDcsImV4cCI6MjA3MDY2NzcwN30.Swu5TT5acjdNEbeaahW8qvdobcJYKXZk6ISTEMiwE3Q"
    );
}
