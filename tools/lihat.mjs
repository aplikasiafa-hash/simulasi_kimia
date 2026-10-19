import { chromium } from 'playwright';
import path from 'path';
const AKAR='/home/claude/simkimia';
const daftar = process.argv.slice(2);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1440,height:860}});
p.on('pageerror',e=>console.log('ERR',e.message));
const alamat='file://'+path.join(AKAR,'index.html');
for(let i=1;;i++){ try{ await p.goto(alamat,{timeout:90000,waitUntil:'domcontentloaded'}); break; }
  catch(e){ if(i>=3) throw e; await p.waitForTimeout(2000); } }
await p.waitForFunction(()=>window.App&&window.Sim3D,null,{timeout:60000});
for (const slug of daftar) {
  await p.evaluate(s=>window.App.mulai(s), slug);
  await p.waitForTimeout(3200);
  await p.screenshot({path:path.join(AKAR,'tools/foto','_v_'+slug+'.png')});
  console.log('  ·', slug);
}
await b.close();
console.log('ok');
