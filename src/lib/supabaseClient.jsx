import {createClient} from '@supabase/supabase-js'

// It's best to store these in your environment variables (.env)
const SUPABASE_URL = "https://thioqyqfwvfpolpufmwa.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoaW9xeXFmd3ZmcG9scHVmbXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTE3MDcsImV4cCI6MjA3MDY2NzcwN30.Swu5TT5acjdNEbeaahW8qvdobcJYKXZk6ISTEMiwE3Q"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
