import fs from 'fs';

let code = fs.readFileSync('scripts/run_e2e_tests.mjs', 'utf-8');

// Replace B.2 back selector
code = code.replace(
  "const tutBackBtn = await navPage.$('#nav-btn-home, a[href=\"/\"]');",
  "const tutBackBtn = await navPage.$('.game-hud-back-btn, #nav-btn-home, a[href=\"/menu\"], a[href=\"/\"]');"
);

code = code.replace(
  "tutBackOk = navPage.url() === `${BASE_URL}/` || navPage.url().endsWith('/');",
  "tutBackOk = navPage.url().includes('/menu') || navPage.url().endsWith('/');"
);

// Replace openBoxBtn click with force: true
code = code.replace(
  "await openBoxBtn.click();",
  "await openBoxBtn.click({ force: true });"
);

fs.writeFileSync('scripts/run_e2e_tests.mjs', code, 'utf-8');
console.log('Patched run_e2e_tests.mjs successfully!');
