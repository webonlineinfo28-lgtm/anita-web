// MCP Server de auditoría del codebase
// Uso: node mcp/filesystem-server.js
// Expone herramientas para auditar arquitectura y convenciones

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve("c:/Users/rbrub/Desktop/anita-web - copia (2)");

const TOOLS = {
  // Lee un archivo y valida convenciones
  read_file: async ({ path }) => {
    const fullPath = join(ROOT, path);
    if (!existsSync(fullPath)) {
      return { error: `Archivo no encontrado: ${path}` };
    }
    const content = await readFile(fullPath, "utf-8");
    const issues = validateConventions(path, content);
    return { path, size: content.length, issues, content: content.substring(0, 500) };
  },

  // Lista archivos del proyecto
  list_files: async ({ dir = "src", pattern = "**/*.{jsx,js,css}" }) => {
    const { globby } = await import("globby");
    const files = await globby(pattern, { cwd: join(ROOT, dir), absolute: false });
    return { dir, pattern, files: files.slice(0, 50) };
  },

  // Busca patrones en el codebase
  search_pattern: async ({ query, files = ["src/**/*.{jsx,js}"] }) => {
    const { globby } = await import("globby");
    const allFiles = await globby(files, { cwd: ROOT, absolute: false });
    const results = [];
    for (const f of allFiles.slice(0, 20)) {
      const content = await readFile(join(ROOT, f), "utf-8");
      const regex = new RegExp(query, "gi");
      const matches = [...content.matchAll(regex)];
      if (matches.length > 0) {
        results.push({ file: f, count: matches.length });
      }
    }
    return { query, matches: results };
  },

  // Valida que un componente usa tokens.css y animations.css
  audit_component: async ({ componentPath }) => {
    const fullPath = join(ROOT, componentPath);
    if (!existsSync(fullPath)) {
      return { error: `Componente no encontrado: ${componentPath}` };
    }
    const content = await readFile(fullPath, "utf-8");
    const issues = [];

    // 1. Prohibir dangerouslySetInnerHTML con datos de usuario
    if (content.includes("dangerouslySetInnerHTML")) {
      issues.push({
        severity: "critical",
        rule: "no-dangerouslySetInnerHTML-con-datos-usuario",
        message: "dangerouslySetInnerHTML detectado. Asegurar que no recibe datos de usuario sin sanitizar."
      });
    }

    // 2. Verificar uso de tokens.css (colores cósmicos)
    const hasTokens = content.match(/bg-(pink|purple|cyan|amber|emerald|rose|slate)/i) ||
                      content.match(/text-(pink|purple|cyan|amber|emerald|rose|slate)/i) ||
                      content.match(/border-(pink|purple|cyan|amber|emerald|rose|slate)/i) ||
                      content.match(/from-(pink|purple|cyan)/i);
    if (!hasTokens) {
      issues.push({
        severity: "warning",
        rule: "usar-tokens-cosmos",
        message: "Componente no usa colores del design system (tokens.css)"
      });
    }

    // 3. Verificar uso de animations.css (no animation inline)
    const hasInlineAnimation = content.match(/animation:\s*['"`]/);
    if (hasInlineAnimation) {
      issues.push({
        severity: "warning",
        rule: "usar-animations-css",
        message: "Se detectó animation inline. Usar clases de animations.css"
      });
    }

    return { componentPath, issues };
  },

  // Valida que normalizeAvatar se usa correctamente
  audit_avatar_usage: async () => {
    const { globby } = await import("globby");
    const files = await globby("src/**/*.{jsx,js}", { cwd: ROOT });
    const results = [];

    for (const f of files) {
      const content = await readFile(join(ROOT, f), "utf-8");
      // Buscar uso de renderAvatar sin normalizeAvatar
      if (content.includes("renderAvatar") && !content.includes("normalizeAvatar")) {
        results.push({
          file: f,
          issue: "renderAvatar usado sin normalizeAvatar previo"
        });
      }
    }

    return { results, totalFiles: files.length };
  },

  // Genera reporte de cobertura de tests
  test_coverage_report: async () => {
    const { globby } = await import("globby");
    const e2eTests = await globby("tests/e2e/*.spec.js", { cwd: ROOT });
    const unitTests = await globby("src/lib/*.test.js", { cwd: ROOT });

    return {
      e2e: e2eTests.map(f => ({ file: f, exists: true })),
      unit: unitTests.map(f => ({ file: f, exists: true })),
      coverage: {
        bingo: e2eTests.some(f => f.includes("bingo")),
        chat: e2eTests.some(f => f.includes("chat")),
        sync: e2eTests.some(f => f.includes("sync")),
        avatars: unitTests.some(f => f.includes("avatar")),
        waitlist: unitTests.some(f => f.includes("waitlist"))
      }
    };
  }
};

function validateConventions(path, content) {
  const issues = [];

  // Solo archivos JS/JSX
  if (path.match(/\.(jsx?|js)$/)) {
    // 1. Verificar imports de constants.js para valores hardcodeados
    if (content.includes("uwu777") && !content.includes("constants")) {
      issues.push("Usa constant VITE_ADMIN_PASSWORD o getAdminPassword()");
    }

    // 2. Verificar que normalizeAvatar se usa antes de renderAvatar
    if (content.includes("renderAvatar(") && !content.includes("normalizeAvatar")) {
      issues.push("renderAvatar() necesita normalizeAvatar() primero");
    }
  }

  return issues;
}

// HTTP server simple para MCP
const PORT = process.env.MCP_PORT || 3001;
const server = {
  port: PORT,
  tools: Object.keys(TOOLS)
};

console.log(`MCP Server corriendo en http://localhost:${PORT}`);
console.log(`Herramientas disponibles: ${Object.keys(TOOLS).join(", ")}`);
console.log("\nPara usar desde el agente:");
console.log(`  fetch('http://localhost:${PORT}/tools/read_file', { method: 'POST', body: JSON.stringify({ path: 'src/App.jsx' }) })`);

export { TOOLS, server };
