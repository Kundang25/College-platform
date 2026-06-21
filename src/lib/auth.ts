import { redirect } from "next/navigation";
import { createRouteSupabase } from "@/lib/supabase-server";

export const getCurrentUser = async () => {
  const supabase = await createRouteSupabase();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};

export const requireUser = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
};
