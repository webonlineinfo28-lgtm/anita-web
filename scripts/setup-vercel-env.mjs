#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/setup-vercel-env.mjs
// Sincroniza las variables de entorno de producción en Vercel usando la API
// REST oficial. NO crea deployments (el límite de deploys queda intacto).
//
// Uso local:
//   VERCEL_TOKEN=... VERCEL_PROJECT_ID=prj_... \
//   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... VITE_ADMIN_PASSWORD=... \
//   node scripts/setup-vercel-env.mjs
//
// En CI (setup-vercel-env.yml) los valores llegan desde GitHub Secrets.
// ---------------------------------------------------------------------------

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;

const VARS = [
  { key: "VITE_SUPABASE_URL", value: process.env.VITE_SUPABASE_URL },
  { key: "VITE_SUPABASE_ANON_KEY", value: process.env.VITE_SUPABASE_ANON_KEY },
  { key: "VITE_ADMIN_PASSWORD", value: process.env.VITE_ADMIN_PASSWORD },
];

if (!VERCEL_TOKEN || !PROJECT_ID) {
  console.error("Faltan VERCEL_TOKEN o VERCEL_PROJECT_ID");
  process.exit(1);
}

const BASE = `https://api.vercel.com/v9/projects/${PROJECT_ID}/env`;

async function listEnvs() {
  const res = await fetch(BASE, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
  if (!res.ok) throw new Error(`list envs: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.envs || [];
}

async function removeEnv(id) {
  await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
}

async function upsertEnv(key, value) {
  const existing = (await listEnvs()).find((e) => e.key === key);
  if (existing) await removeEnv(existing.id);

  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      value,
      type: "encrypted",
      target: ["production"],
    }),
  });
  if (!res.ok) {
    throw new Error(`upsert ${key}: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Vercel env actualizada: ${key}`);
}

for (const { key, value } of VARS) {
  if (!value) {
    console.warn(`- Omitiendo ${key}: sin valor`);
    continue;
  }
  try {
    await upsertEnv(key, value.trim());
  } catch (e) {
    console.warn(`- ${key} falló:`, e.message);
    process.exitCode = 1;
  }
}
console.log("Listo. (No se creó ningún deployment).");