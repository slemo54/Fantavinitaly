import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a dummy client or handle appropriately for SSR/build
    // For now, we'll just let it call createBrowserClient and let Supabase handle it
    // or return a proxy that logs a warning.
    console.warn('Supabase credentials missing')
  }

  return createBrowserClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder-key'
  )
}
