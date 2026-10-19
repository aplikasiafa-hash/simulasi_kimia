/* Periksa sprite teks yang jatuh di luar bingkai atau tertutup bilah judul. */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
const AKAR = '/home/claude/simkimia';
const src = fs.readFileSync(path.join(AKAR, 'assets/js/katalog.js'), 'utf8');
const sandbox = { window: {} };
new Function('window', src)(sandbox.window);
const KATALOG = sandbox.window.KATALOG;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1440, height: 860 } });
const alamat = 'file://' + path.join(AKAR, 'index.html');
for (let i = 1; ; i++) { try { await p.goto(alamat, { timeout: 90000, waitUntil: 'domcontentloaded' }); break; }
  catch (e) { if (i >= 3) throw e; await p.waitForTimeout(2000); } }
await p.waitForFunction(() => window.App && window.Sim3D, null, { timeout: 60000 });

for (const sim of KATALOG) {
  await p.evaluate(s => window.App.mulai(s), sim.slug);
  await p.waitForTimeout(900);
  const hasil = await p.evaluate(() => {
    const T = window.THREE;
    const kam = window.App.kamera, sc = window.App.scene;
    if (!kam || !sc) return null;
    kam.updateMatrixWorld(); 
    const v = new T.Vector3();
    const keluar = [];
    sc.traverse(o => {
      const panel = o.userData && o.userData.hadapKamera;
      if ((!o.isSprite && !panel) || !o.visible) return;
      let tampak = true; let q = o;
      while (q) { if (!q.visible) { tampak = false; break; } q = q.parent; }
      if (!tampak) return;
      o.getWorldPosition(v);
      const tinggi = o.isSprite ? o.scale.y
        : ((o.geometry && o.geometry.parameters && o.geometry.parameters.height) || 0) * o.scale.y;
      v.y += tinggi / 2;                     // tepi atas
      v.project(kam);
      const py = (1 - v.y) / 2 * 860;
      if (v.z < 1 && py < 86) keluar.push((o.isSprite ? 'label' : 'PANEL') + '@' + Math.round(py));
    });
    return keluar;
  });
  if (hasil && hasil.length) console.log(sim.slug.padEnd(24), 'y=', hasil.join(','));
}
await b.close();
console.log('selesai');
