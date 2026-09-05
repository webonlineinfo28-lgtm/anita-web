const fs = require("fs");
const c = fs.readFileSync("src/lib/avatars.js", "utf8");
const oldPet = `function pet(c) {
  const emoji = PETS[c.pet];
  return emoji
    ? \`<text x="82" y="26" font-size="17" text-anchor="middle">\${emoji}</text>\`
    : "";
}`;
const newPet = `function pet(c) {
  const emoji = PETS[c.pet];
  if (!emoji) return "";
  return \`<g transform="translate(72, 8)">
    <circle cx="14" cy="14" r="12" fill="rgba(0,0,0,0.5)"/>
    <text x="14" y="18" font-size="14" text-anchor="middle">\${emoji}</text>
  </g>\`;
}`;
const updated = c.replace(oldPet, newPet);
fs.writeFileSync("src/lib/avatars.js", updated);
console.log(updated.includes("circle cx") ? "✅ avatars.js pet() fixed" : "❌ Replace failed");
