import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://jghxdyxwzthbmqrtzbrv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaHhkeXh3enRoYm1xcnR6YnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODcyMjcsImV4cCI6MjA4OTM2MzIyN30.qlADJItp_9wWw-oFTUhwxxOHeBqc6SzeLS14vjCrwGM'
)