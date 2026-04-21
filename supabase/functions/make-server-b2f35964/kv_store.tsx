// Supabase client utilities for database operations
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://ewyckxscedklztarigha.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for Supabase backend operations.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for common operations
export async function get(table: string, id: string) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function mget(table: string, filters?: Record<string, any>) {
  let query = supabase.from(table).select("*");

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function set(table: string, data: any) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function mset(table: string, data: any[]) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select();

  if (error) throw error;
  return result;
}

export async function del(table: string, id: string) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function mdel(table: string, ids: string[]) {
  const { error } = await supabase
    .from(table)
    .delete()
    .in("id", ids);

  if (error) throw error;
}

export async function update(table: string, id: string, data: any) {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return result;
}
