import {createBrowserClient} from '@supabase/ssr'

export function createSupabaseBrowserClient() {
    return createBrowserClient("https://thioqyqfwvfpolpufmwa.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoaW9xeXFmd3ZmcG9scHVmbXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTE3MDcsImV4cCI6MjA3MDY2NzcwN30.Swu5TT5acjdNEbeaahW8qvdobcJYKXZk6ISTEMiwE3Q")
}