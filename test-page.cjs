const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  page.on("pageerror", err => {
    errors.push(err.message);
  });

  try {
    await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    
    const bodyText = await page.textContent("body");
    const hasLoginScreen = bodyText.includes("Anita") || bodyText.includes("Festival");
    console.log("1. Login screen visible:", hasLoginScreen ? "SI" : "NO");
    
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(1000);
    
    const input = await page.locator('input[type="text"]');
    if (await input.isVisible()) {
      await input.fill("TestUser");
      console.log("2. Nombre ingresado: SI");
      
      const buttons = await page.locator('button');
      for (let i = 0; i < await buttons.count(); i++) {
        const text = await buttons.nth(i).textContent();
        if (text && text.toLowerCase().includes("entrar")) {
          await buttons.nth(i).click();
          break;
        }
      }
      
      await page.waitForTimeout(3000);
      
      const newBodyText = await page.textContent("body");
      const hasApp = newBodyText.includes("Bingo") || newBodyText.includes("DJ") || newBodyText.includes("Chat");
      console.log("3. App despues de login:", hasApp ? "SI" : "NO");
      console.log("   Contenido:", newBodyText.substring(0, 300));
    }
    
    console.log("\nErrores:", errors.length);
    if (errors.length > 0) {
      errors.forEach(e => console.log(" -", e.substring(0, 300)));
    }
    
  } catch (e) {
    console.log("Error:", e.message);
  }
  
  await browser.close();
})();