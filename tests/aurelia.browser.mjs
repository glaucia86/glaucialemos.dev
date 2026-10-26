// User-run only. Start your server, then BASE_URL=http://127.0.0.1:3100 node tests/aurelia.browser.mjs.
// Formspree is always intercepted: this suite cannot send a real message.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
const base=process.env.BASE_URL??'http://127.0.0.1:3100';
const shots='docs/screenshots/aurelia';fs.mkdirSync(shots,{recursive:true});
const services=JSON.parse(fs.readFileSync('src/data/servicos.json','utf8'));
const ids=['garden-bloom','beacon-relay','ring-alignment','seed-vault','greenhouse-dusk','pollination'];
const phrases={pt:['florescer','sinalizador','anéis','sementes','estufa','polinizar'],en:['garden bloom','beacon','rings','seeds','greenhouse','pollinate'],es:['florecer','baliza','anillos','semillas','invernadero','polinizar jardín']};
const browser=await chromium.launch();const failures=[];
async function check(name,run){try{await run();console.log(`ok - ${name}`);}catch(error){failures.push(name);console.error(`not ok - ${name}\n${error.stack}`);}}
async function open(options={},lang='pt',path=''){
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',...options});
  const page=await context.newPage();const errors=[],posts=[];
  page.on('pageerror',error=>errors.push(String(error)));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.route('https://formspree.io/**',async route=>{posts.push(route.request().method());await route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});});
  await page.goto(`${base}/${lang}/servicos${path}`);
  await expect(page.locator('.aurelia-hot--glaucia')).toBeVisible();
  return {context,page,errors,posts};
}
const found=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('galaxia-encantada:eggs:v2')??'[]'));
async function discovered(page,id){await expect.poll(()=>found(page)).toContain(id);}
async function radio(page,phrase){
  await page.locator('.comlink-toggle').click();await page.locator('#comlink-input').fill(phrase);await page.locator('#comlink-input').press('Enter');
}
async function closeRadio(page){const close=page.locator('.comlink[open]');if(await close.count())await page.keyboard.press('Escape');}
async function settleIntro(page){await page.keyboard.press('Escape');await page.waitForFunction(()=>document.documentElement.dataset.boot!=='pending');}
try{
  await check('boot de Aurélia uma vez por sessão, Esc pula',async()=>{
    const {context,page,errors}=await open({reducedMotion:'no-preference'});
    try{await settleIntro(page);await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('aurelia-boot'))).toBe('done');await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.boot!=='pending');assert.deepEqual(errors,[]);}finally{await context.close();}
  });
  for(const lang of ['pt','en','es'])await check(`serviços reais, preço, CTAs e rádio em ${lang}`,async()=>{
    const {context,page,posts,errors}=await open({},lang);
    try{
      await expect(page.locator('#services-title')).toHaveCount(1);await expect(page.locator('.chapter-tag')).toHaveCount(4);
      await expect(page.locator('main')).toHaveAttribute('data-sound-world','aurelia');
      await expect(page.locator('.aurelia-copy .actions a').first()).toHaveAttribute('href','#contato');
      await expect(page.locator('.aurelia-copy .actions a').last()).toHaveAttribute('href',`/${lang}/eventos`);
      for(const service of services){const card=page.locator(`#service-${service.id}`);await expect(card).toContainText(service.titulo[lang]);await expect(card).toContainText(service.descricao[lang]);await expect(card.locator('strong')).not.toBeEmpty();}
      for(let i=0;i<ids.length;i++){await radio(page,phrases[lang][i]);await discovered(page,ids[i]);await closeRadio(page);}
      assert.deepEqual(posts,[]);assert.deepEqual(errors,[]);
      await page.screenshot({path:`${shots}/services-${lang}-1440.png`,fullPage:true});
    }finally{await context.close();}
  });
  await check('mouse/teclado: Glaucia, Prince, anéis, cofre, polinização e luz',async()=>{
    const {context,page,posts}=await open();try{
      await page.locator('.aurelia-hot--glaucia').focus();await page.keyboard.press('Enter');await discovered(page,'garden-bloom');await expect(page.locator('.aurelia-readout')).toBeVisible();await expect(page.locator('.aurelia-readout__title')).toBeFocused();
      await page.getByRole('button',{name:'Fechar descoberta'}).click();
      await page.locator('.aurelia-hot--prince').click();await discovered(page,'beacon-relay');await expect(page.locator('#contato h2')).toBeFocused();
      const rings=page.locator('.orbital-garden__controls button');
      for(let i=0;i<3;i++)for(let j=0;j<3-i;j++){await rings.nth(i).focus();await page.keyboard.press('Space');}
      await discovered(page,'ring-alignment');await expect(page.locator('.orbital-garden')).toHaveAttribute('data-aligned','true');
      await page.locator('.seed-vault summary').click();await discovered(page,'seed-vault');
      const nodes=page.locator('.service-garden__connect');await nodes.nth(2).click();assert.ok(!(await found(page)).includes('pollination'));
      for(let i=0;i<services.length;i++)await nodes.nth(i).click();await discovered(page,'pollination');
      const light=page.locator('.greenhouse input');await light.focus();await page.keyboard.press('Home');await discovered(page,'greenhouse-dusk');await expect(page.locator('main')).toHaveAttribute('data-greenhouse','dusk');await page.keyboard.press('Escape');await expect(page.locator('main')).not.toHaveAttribute('data-greenhouse');
      assert.deepEqual(posts,[]);
    }finally{await context.close();}
  });
  for(const lang of ['pt','en','es'])await check(`frases na página em ${lang}; nenhuma frase dentro do formulário`,async()=>{
    const {context,page,posts,errors}=await open({},lang);try{
      const textarea=page.locator('#contato textarea');
      if(await textarea.isEnabled()){
        // Observe triggers before discovering anything: a replay would not change the saved IDs.
        await page.evaluate(()=>{window.__aureliaPlayed=[];addEventListener('egg:play',event=>window.__aureliaPlayed.push(event.detail));});
        const message=phrases[lang].join(' ');
        await textarea.fill('');await textarea.pressSequentially(message);
        assert.deepEqual(await page.evaluate(()=>window.__aureliaPlayed),[]);
        assert.deepEqual(await found(page),[]);
      }
      for(let i=0;i<ids.length;i++){
        await page.locator('main').focus();
        // Playwright's US keyboard inserts accented characters without keydown.
        // Use real key events for the unaccented aliases; accented keydown is covered below.
        await page.keyboard.type(phrases[lang][i].normalize('NFD').replace(/[\u0300-\u036f]/g,''));
        await discovered(page,ids[i]);
        if(ids[i]==='ring-alignment')await expect(page.locator('.orbital-garden')).toHaveAttribute('data-aligned','true');
        if(ids[i]==='seed-vault')await expect(page.locator('.seed-vault')).toHaveAttribute('open','');
        if(ids[i]==='greenhouse-dusk')await expect(page.locator('main')).toHaveAttribute('data-greenhouse','dusk');
        if(ids[i]==='pollination')await expect(page.locator('.service-garden')).toHaveAttribute('data-complete','true');
      }
      if(await textarea.isEnabled()){
        await expect(textarea).toHaveValue(phrases[lang].join(' '));
        await page.locator('.aurelia-relay').click();await expect(page.locator('#contato h2')).toBeFocused();await expect(textarea).toHaveValue(phrases[lang].join(' '));
      }
      assert.deepEqual(posts,[]);assert.deepEqual(errors,[]);
    }finally{await context.close();}
  });
  await check('frase anéis: keydown acentuado executa o alinhamento e descobre o segredo',async()=>{
    const {context,page,errors}=await open();try{
      await page.locator('main').focus();
      // Synthetic key events exercise the non-US key through AureliaEggs and RingAlignment.
      for(const key of 'anéis')await page.locator('main').dispatchEvent('keydown',{key});
      await discovered(page,'ring-alignment');
      await expect(page.locator('.orbital-garden')).toHaveAttribute('data-aligned','true');
      assert.deepEqual(errors,[]);
    }finally{await context.close();}
  });
  for(const subject of ['workshop','mentoria','palestra'])await check(`pré-preenchimento ${subject} preservado`,async()=>{
    const {context,page,posts}=await open({},'pt',`?assunto=${subject}#contato`);try{
      const text=page.locator('#contato textarea');await expect(text).toHaveValue(subject==='workshop'?'Gostaria de planejar um workshop para o meu time.':subject==='mentoria'?'Gostaria de conversar sobre mentoria.':'Gostaria de convidar você para palestrar.');
      await page.locator('.aurelia-relay').click();await expect(page.locator('#contato h2')).toBeFocused();assert.deepEqual(posts,[]);
    }finally{await context.close();}
  });
  await check('formulário: validação, envio explícito, sucesso e erro (mock)',async()=>{
    const {context,page,posts}=await open();try{
      const form=page.locator('#contato form'),name=form.locator('[name=name]'),email=form.locator('[name=email]'),message=form.locator('[name=message]');
      if(!(await name.isEnabled())){console.log('SKIP submission states: configure NEXT_PUBLIC_FORMSPREE_ID to test the mocked submission');await expect(page.locator('.form-notice')).toBeVisible();return;}
      await form.locator('[type=submit]').click();assert.deepEqual(posts,[]);
      await name.fill('Teste local');await email.fill('teste@example.com');await message.fill('Teste interceptado');await form.locator('[type=submit]').click();await expect(form.getByRole('status')).toHaveText('Mensagem enviada. Obrigada!');assert.equal(posts.length,1);
      await page.unroute('https://formspree.io/**');await page.route('https://formspree.io/**',route=>route.fulfill({status:500,contentType:'application/json',body:'{}'}));
      await name.fill('Teste local');await email.fill('teste@example.com');await message.fill('Teste interceptado');await form.locator('[type=submit]').click();await expect(form.getByRole('alert')).toHaveText('Não foi possível enviar. Tente novamente.');
    }finally{await context.close();}
  });
  for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:1280,height:720},{width:1440,height:900}])await check(`enquadramento ${viewport.width}×${viewport.height}`,async()=>{
    const {context,page,errors}=await open({viewport,hasTouch:viewport.width<1000,isMobile:viewport.width<500});try{
      const scene=page.locator('.hero-scene-layer--aurelia .aurelia-plane'),box=await scene.boundingBox();assert.ok(Math.abs(box.width/box.height-16/9)<.03);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(viewport.width<1000){await page.locator('.aurelia-hot--glaucia').tap();await discovered(page,'garden-bloom');}
      await page.screenshot({path:`${shots}/hero-${viewport.width}.png`});assert.deepEqual(errors,[]);
    }finally{await context.close();}
  });
  await check('sans JS: dados, links, cofre e contato disponíveis',async()=>{
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});try{
      const page=await context.newPage();await page.goto(`${base}/pt/servicos`);
      await expect(page.locator('#services-title')).toBeVisible();await expect(page.locator('.aurelia-cards article')).toHaveCount(services.length);
      await page.locator('.seed-vault summary').click();await expect(page.locator('.seed-vault__body')).toBeVisible();
      await page.locator('.aurelia-copy .actions a[href="#contato"]').click();await expect(page).toHaveURL(/#contato$/);
      await expect(page.locator('#contato')).toHaveCount(1);await expect(page.locator('#contato h2')).toBeVisible();
      const contactLink=page.locator('#contato a');await expect(contactLink).toBeVisible();await expect(contactLink).toHaveAttribute('href','https://www.linkedin.com/in/glaucialemos');await expect(contactLink).not.toBeEmpty();
    }finally{await context.close();}
  });
  await check('pin, resize, pausa fora da cena, preferência alterada e navegação',async()=>{
    const {context,page,errors}=await open({reducedMotion:'no-preference'});try{
      await settleIntro(page);const layer=page.locator('.hero-scene-layer--aurelia');await expect(layer).toHaveAttribute('data-paused','false');
      await expect(page.locator('.pin-spacer .aurelia-hero')).toHaveCount(1);
      await page.locator('#contato').scrollIntoViewIfNeeded();await expect(layer).toHaveAttribute('data-paused','true');
      await page.setViewportSize({width:768,height:1024});await expect(page.locator('.pin-spacer .aurelia-hero')).toHaveCount(0);
      await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.aurelia-hot--glaucia').click();await discovered(page,'garden-bloom');await expect(page.locator('.aurelia-readout')).toBeVisible();
      await page.goto(`${base}/pt/sobre`);await expect(page.locator('.aurelia-hero')).toHaveCount(0);await page.goBack();await expect(page.locator('.aurelia-hot--glaucia')).toBeVisible();assert.deepEqual(errors,[]);
    }finally{await context.close();}
  });
  await check('sinal do epílogo continua exigindo três mundos distintos',async()=>{
    const {context,page}=await open();try{
      await page.evaluate(()=>localStorage.setItem('galaxia-encantada:eggs:v2',JSON.stringify(['garden-bloom','beacon-relay','seed-vault'])));await page.reload();await expect(page.locator('.epilogue-signal button')).toHaveCount(0);
      await page.evaluate(()=>localStorage.setItem('galaxia-encantada:eggs:v2',JSON.stringify(['focus-lens','paw-tracks','rover-scan'])));await page.reload();await expect(page.locator('.epilogue-signal button')).toBeVisible();
    }finally{await context.close();}
  });
}finally{await browser.close();}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
