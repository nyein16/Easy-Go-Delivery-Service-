// Edge Function "create-user": creates Staff and Rider accounts. Runs on the server with the
// secret key that Supabase injects automatically. That key is never in the website code.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!, anon = Deno.env.get("SUPABASE_ANON_KEY")!, svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const caller = createClient(url, anon, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: { user } } = await caller.auth.getUser();
    if (!user) return json({ error: "Not logged in" }, 401);
    const admin = createClient(url, svc);
    const { data: me } = await admin.from("profiles").select("role,status,permissions").eq("id", user.id).single();
    if (!me || me.status !== "active") return json({ error: "Not allowed" }, 403);

    const b = await req.json();
    const role = b.role, email = String(b.email ?? "").trim().toLowerCase(), password = String(b.password ?? "");
    if (!["staff", "rider", "shop"].includes(role)) return json({ error: "Role must be staff, rider or shop" }, 400);
    const allowed = me.role === "admin" || (me.role === "staff" && ((role === "rider" && me.permissions?.rider_management === true) || (role === "shop" && me.permissions?.shop_management === true)));
    if (!allowed) return json({ error: "No permission" }, 403);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Invalid email" }, 400);
    if (password.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);
    const name = String(b.full_name ?? "").trim().slice(0, 100);
    if (!name) return json({ error: "Name required" }, 400);

    const { data: created, error: e1 } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (e1) return json({ error: e1.message }, 400);
    const id = created.user.id;
    try {
      if (role !== "shop") await admin.from("shops").delete().eq("id", id); // sign-up trigger makes a shop row by default; only shops keep it
      const perms = role === "staff" && me.role === "admin" ? (b.permissions ?? {}) : {};
      const { error: e2 } = await admin.from("profiles").update({ role, status: "active", full_name: name, phone: b.phone ?? null, permissions: perms, created_by: user.id }).eq("id", id);
      if (e2) throw e2;
      if (role === "shop") {
        const { error: e4 } = await admin.from("shops").update({ shop_name: String(b.shop_name ?? name), owner_name: name, phone: b.phone ?? null, address: b.address ?? null }).eq("id", id);
        if (e4) throw e4;
      }
      if (role === "rider") {
        const { error: e3 } = await admin.from("riders").insert({ id, rider_name: name, phone: b.phone ?? null, address: b.address ?? null, vehicle: b.vehicle ?? null, created_by: user.id });
        if (e3) throw e3;
      }
    } catch (err) { await admin.auth.admin.deleteUser(id); return json({ error: String((err as Error).message ?? err) }, 400); }
    return json({ ok: true, id });
  } catch (err) { return json({ error: String((err as Error).message ?? err) }, 500); }
});
