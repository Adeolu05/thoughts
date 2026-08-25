import { createClient } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      thoughts: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          created_at: string;
          content: string;
          title: string | null;
          source: string;
          theme: string;
          gradient: string;
          mood: string | null;
          spotify_url: string | null;
          tags: string[] | null;
          is_published: boolean;
          photo_data_url: string | null;
          image_data_url: string | null;
          inserted_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          slug: string;
          created_at: string;
          content?: string;
          title?: string | null;
          source: string;
          theme: string;
          gradient: string;
          mood?: string | null;
          spotify_url?: string | null;
          tags?: string[] | null;
          is_published?: boolean;
          photo_data_url?: string | null;
          image_data_url?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          created_at?: string;
          content?: string;
          title?: string | null;
          source?: string;
          theme?: string;
          gradient?: string;
          mood?: string | null;
          spotify_url?: string | null;
          tags?: string[] | null;
          is_published?: boolean;
          photo_data_url?: string | null;
          image_data_url?: string | null;
        };
        Relationships: [];
      };
    };
  };
};

let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  client ??= createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
