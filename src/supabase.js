import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pqwjrasdemihucqwqxro.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxd2pyYXNkZW1paHVjcXdxeHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODU3MDMsImV4cCI6MjA5NTA2MTcwM30.yYnezA1OCBzrSZt_zyLuZyKrhNoxki8YaFNTv6jX0ms'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
