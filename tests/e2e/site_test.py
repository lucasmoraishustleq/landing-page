import asyncio, json, subprocess, sys, time, re
from playwright.async_api import async_playwright
import os
HERE=os.path.dirname(os.path.abspath(__file__))
SITE=os.path.join(HERE,'..','..','dist')
SHOTS=os.environ.get('SHOTS_DIR', os.path.join(HERE,'shots'))+'/'
os.makedirs(SHOTS, exist_ok=True)
BASE='http://127.0.0.1:8765/'
R=[]; ERRS=[]
def rec(n,ok,info=''): R.append((n,ok)); print(('PASS ' if ok else 'FAIL ')+n+((' · '+str(info)[:220]) if (info!='' and not ok) or (info!='' and 'shot' in n) else ''))
VIS='el=>getComputedStyle(el).display!=="none" && !el.hidden'

async def newpage(b, w=1440, h=900, cfg=None, reduce=False):
    ctx = await b.new_context(viewport={'width':w,'height':h}, reduced_motion='reduce' if reduce else 'no-preference')
    p = await ctx.new_page()
    p.on('pageerror', lambda e: ERRS.append(str(e)))
    await p.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda r: r.abort())
    # never send test data to the real Apps Script
    await p.route(re.compile(r'https://script\.google\.com/.*'), lambda r: r.abort())
    if cfg: await p.add_init_script('window.HQ_CONFIG='+json.dumps(cfg))
    return p

async def layout(b):
    for path in ['', 'meet-duke/', 'work/', 'work/bahia-taste/']:
        for w,h in [(1440,900),(1024,768),(390,844),(375,667),(360,740)]:
            p=await newpage(b,w,h); await p.goto(BASE+path); await p.wait_for_timeout(500)
            sw=await p.evaluate('document.documentElement.scrollWidth')
            rec(f'[{path or "/"}] no horizontal overflow @{w}', sw<=w, sw)
            small=await p.evaluate('[...document.querySelectorAll("input,select,textarea")].filter(e=>e.offsetParent&&parseFloat(getComputedStyle(e).fontSize)<16).length')
            rec(f'[{path or "/"}] inputs >=16px @{w}', small==0, small)
            tiny=await p.evaluate('''()=>{const s=[];document.querySelectorAll('main *').forEach(e=>{if(e.children.length===0&&e.offsetParent&&e.textContent.trim().length>20&&parseFloat(getComputedStyle(e).fontSize)<11)s.push(e.textContent.trim().slice(0,30))});return s.slice(0,4)}''')
            rec(f'[{path or "/"}] no long text under 11px @{w}', not tiny, tiny)
            imgs=await p.evaluate('''async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60))};await Promise.all([...document.images].map(i=>i.complete?0:new Promise(r=>{i.addEventListener('load',r);i.addEventListener('error',r);setTimeout(r,6000)})));window.scrollTo(0,0);return [...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)}''')
            rec(f'[{path or "/"}] all images load @{w}', not imgs, imgs)
            if w in (1440,390): await p.screenshot(path=f'{SHOTS}{(path or "home").strip("/").replace("/","_") or "home"}_{w}.png', full_page=True)
            await p.context.close()

async def links(b):
    p=await newpage(b); seen=set(); bad=[]
    for path in ['', 'meet-duke/', 'work/', 'work/bahia-taste/']:
        await p.goto(BASE+path); await p.wait_for_timeout(300)
        hrefs=await p.evaluate('[...document.querySelectorAll("a[href]")].map(a=>a.href)')
        for h in hrefs:
            if not h.startswith(BASE): continue
            u=h.split('#')[0]; frag=h.split('#')[1] if '#' in h else None
            if u not in seen:
                seen.add(u); r=await p.request.get(u)
                if r.status!=200: bad.append((u,r.status))
            if frag:
                p2=await newpage(b); await p2.goto(u); ok=await p2.evaluate(f'!!document.getElementById("{frag}")'); await p2.context.close()
                if not ok: bad.append((h,'missing anchor'))
    rec('no broken internal links or anchors', not bad, bad)
    await p.context.close()

async def nav(b):
    for w in (1440,390):
        p=await newpage(b,w,900 if w>600 else 844); await p.goto(BASE); await p.wait_for_timeout(300)
        for hid in ['#product','#work','#ways-in']:
            if w<900: await p.click('.menu-btn'); await p.click(f'#mmenu a[href="{hid}"]')
            else: await p.click(f'nav.main a[href="{hid}"]')
            await p.wait_for_timeout(1000)
            top=await p.evaluate(f'document.querySelector("{hid}").getBoundingClientRect().top')
            rec(f'nav {hid} @{w}', -5<=top<=120, round(top))
        if w>=900:
            await p.click('nav.main a[href="#work"]'); await p.wait_for_timeout(1000)
            act=await p.evaluate('[...document.querySelectorAll("nav.main a.active")].map(a=>a.dataset.sec)')
            rec('section indicator marks The Work', act==['work'], act)
            rec('compact header after scroll', await p.evaluate('document.getElementById("top-header").classList.contains("compact")'))
        await p.goto(BASE); await p.wait_for_timeout(200)
        await p.click('header .hcta a.primary'); await p.wait_for_timeout(900)
        st=await p.evaluate('[document.querySelector("#lead-form [name=path]").value,document.querySelector("#lead-form [name=source]").value]')
        rec(f'header "Join the waitlist" -> form path=duke @{w}', st==['duke','header'], st)
        await p.goto(BASE); await p.wait_for_timeout(200)
        await p.click('.hero a.btn.primary'); await p.wait_for_timeout(900)
        st=await p.evaluate('[document.querySelector("#lead-form [name=path]").value,document.querySelector("#lead-form [name=source]").value, document.getElementById("form").getBoundingClientRect().top]')
        rec(f'hero primary -> form duke @{w}', st[0]=='duke' and st[1]=='hero' and st[2]<200, st)
        await p.click('.way.secondary a.btn'); await p.wait_for_timeout(900)
        st=await p.evaluate('[document.querySelector("#lead-form [name=path]").value,document.querySelector("#lead-form [name=source]").value,document.getElementById("submit-label").textContent]')
        rec(f'FPP apply -> form partner @{w}', st==['partner','ways-in','Send application'], st)
        await p.goto(BASE); await p.wait_for_timeout(200)
        await p.click('.hero a[href="meet-duke/"]'); await p.wait_for_load_state(); await p.wait_for_timeout(300)
        rec(f'hero "Meet Duke" opens /meet-duke/ @{w}', p.url.endswith('/meet-duke/') and await p.title()=='Meet Duke · HustleQ', p.url)
        await p.goto(BASE); await p.wait_for_timeout(300)
        await p.click('#work-grid a.tile'); await p.wait_for_load_state(); await p.wait_for_timeout(300)
        rec(f'portfolio tile opens /work/bahia-taste/ @{w}', p.url.endswith('/work/bahia-taste/'), p.url)
        await p.context.close()
    for alias,exp in [('#waitlist','duke'),('#fpp','partner')]:
        p=await newpage(b); await p.goto(BASE+alias); await p.wait_for_timeout(700)
        v=await p.evaluate('document.querySelector("#lead-form [name=path]").value')
        rec(f'alias {alias} -> path={exp}', v==exp, v); await p.context.close()
    # keyboard
    p=await newpage(b); await p.goto(BASE); await p.keyboard.press('Tab')
    f=await p.evaluate('[document.activeElement.className, getComputedStyle(document.activeElement).top]')
    rec('first Tab reaches visible skip link', f[0]=='skip' and f[1]=='8px', f)
    for _ in range(3): await p.keyboard.press('Tab')
    ol=await p.evaluate('getComputedStyle(document.activeElement).outlineStyle')
    rec('focus outline visible on nav links', ol!='none', ol)
    await p.focus('#tab-duke'); await p.keyboard.press('ArrowRight')
    rec('arrow keys switch form tabs', await p.evaluate('document.querySelector("#lead-form [name=path]").value')=='partner')
    await p.context.close()
    # rotator
    p=await newpage(b,390,844); await p.goto(BASE)
    h0=await p.evaluate('document.querySelector(".rot-line").getBoundingClientRect().height'); t0=await p.evaluate('document.querySelector("#rotator .on").textContent')
    await p.wait_for_timeout(3200)
    h1=await p.evaluate('document.querySelector(".rot-line").getBoundingClientRect().height'); t1=await p.evaluate('document.querySelector("#rotator .on").textContent')
    rec('rotator changes phrase', t0!=t1, (t0,t1)); rec('rotator causes no layout shift @390', h0==h1, (h0,h1)); await p.context.close()
    p=await newpage(b,390,844,reduce=True); await p.goto(BASE); t0=await p.evaluate('document.querySelector("#rotator .on").textContent'); await p.wait_for_timeout(3200)
    t1=await p.evaluate('document.querySelector("#rotator .on").textContent')
    rec('reduced motion: rotator stays still', t0==t1); await p.context.close()

MOCK='https://api.mock.test'
async def formp(b, script_handler, cfg_extra=None, path='duke'):
    cfg={'APPS_SCRIPT_URL':MOCK+'/exec','TIMEOUT_MS':2500,'PRIORITY_POLL_MS':200,'PRIORITY_POLL_MAX':5}
    if cfg_extra: cfg.update(cfg_extra)
    p=await newpage(b,390,844,cfg); sent=[]
    async def route(r):
        if r.request.post_data: sent.append(json.loads(r.request.post_data))
        await script_handler(r)
    await p.route(MOCK+'/exec', route)
    await p.goto(BASE); await p.wait_for_timeout(200); await p.click(f'[data-tab="{path}"]')
    return p, sent
def J(body,status=200): 
    async def h(r): await r.fulfill(status=status, content_type='application/json', body=json.dumps(body))
    return h
async def fill(p, ig='', web=''):
    await p.fill('#f-name','Iza'); await p.fill('#f-email','iza@example.com'); await p.fill('#f-bname','Test Biz')
    if ig: await p.fill('#f-instagram',ig)
    if web: await p.fill('#f-website',web)

async def forms(b):
    p,sent=await formp(b,J({'ok':True}))
    await p.click('#submit-btn'); await p.wait_for_timeout(300)
    inv=await p.evaluate('[...document.querySelectorAll(".f.invalid")].map(f=>f.dataset.field)')
    rec('empty submit flags name, email, business name; nothing sent', inv==['name','email','business_name'] and not sent, inv)
    await fill(p, ig='not a handle!', web='nope'); await p.click('#submit-btn'); await p.wait_for_timeout(300)
    inv=await p.evaluate('[...document.querySelectorAll(".f.invalid")].map(f=>f.dataset.field)')
    rec('invalid instagram and website flagged separately', inv==['instagram','website'] and not sent, inv)
    await p.context.close()
    for path in ('duke','partner'):
        p,sent=await formp(b,J({'ok':True,'signup_id':'s_123','email_sent':True}),None,path)
        await fill(p, ig='@testbiz', web='testbiz.com'); await p.click('#submit-btn'); await p.wait_for_timeout(500)
        pl=sent[0] if sent else {}
        keys=['path','name','email','business_name','business','marketing','hardest','instagram','website','source','page_version']
        rec(f'{path}: payload has all fields, instagram and website separate', all(k in pl for k in keys) and pl['path']==path and pl['instagram']=='@testbiz' and pl['website']=='testbiz.com', pl)
        ok=await p.eval_on_selector('#st-ok',VIS); txt=await p.inner_text('#st-ok')
        rec(f'{path}: success after ok:true with email confirmation line', ok and 'confirmation' in txt, txt)
        rec(f'{path}: no priority offer when priority endpoints not configured', not await p.eval_on_selector('#priority',VIS))
        await p.context.close()
    p,sent=await formp(b,J({'ok':True,'signup_id':'s_1','email_sent':False}))
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(500)
    txt=await p.inner_text('#st-ok'); rec('email failure shown separately from saved signup', 'saved' in txt and 'could not send' in txt, txt)
    await p.context.close()
    for name,h in [('ok:false',J({'ok':False})),('HTTP 500',J({},500)),('non-JSON',None),('timeout','hang')]:
        async def nonjson(r): await r.fulfill(status=200, content_type='text/html', body='<html>ok</html>')
        async def hang(r): await asyncio.sleep(4)
        hh = nonjson if h is None else hang if h=='hang' else h
        p,sent=await formp(b,hh); await fill(p); await p.fill('#f-hardest','keep me'); await p.click('#submit-btn')
        if h=='hang':
            await p.wait_for_timeout(150); lab=await p.inner_text('#submit-label'); dis=await p.evaluate('document.getElementById("submit-btn").disabled')
            rec('sending state disables button', lab.startswith('Sending') and dis, lab)
            await p.wait_for_timeout(3000)
        else: await p.wait_for_timeout(600)
        rec(f'{name}: error shown, no success, answers kept', (not await p.eval_on_selector('#st-ok',VIS)) and await p.eval_on_selector('#st-bad',VIS) and await p.input_value('#f-hardest')=='keep me')
        await p.context.close()
    p=await newpage(b,390,844,{'APPS_SCRIPT_URL':''}); await p.goto(BASE); await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(300)
    rec('no Apps Script -> "not connected", no success', 'not connected' in await p.inner_text('#st-bad-msg') and not await p.eval_on_selector('#st-ok',VIS)); await p.context.close()

async def priority(b):
    PC={'PRIORITY_CHECKOUT_URL':MOCK+'/checkout','PRIORITY_STATUS_URL':MOCK+'/status'}
    # offer only after confirmed signup with id
    p,sent=await formp(b,J({'ok':True,'email_sent':True}),PC)
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(500)
    rec('no priority offer without signup_id', not await p.eval_on_selector('#priority',VIS)); await p.context.close()
    p,sent=await formp(b,J({'ok':True,'signup_id':'s_9','email_sent':True}),PC,'partner')
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(500)
    rec('no priority offer on partner path', not await p.eval_on_selector('#priority',VIS)); await p.context.close()
    # checkout fails
    p,sent=await formp(b,J({'ok':True,'signup_id':'s_9','email_sent':True}),PC)
    await p.route(MOCK+'/checkout', J({},500))
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(500)
    shown=await p.eval_on_selector('#priority',VIS)
    rec('priority offer appears after confirmed duke signup', shown)
    await p.screenshot(path=SHOTS+'priority_offer_390.png')
    await p.click('#pr-pay'); await p.wait_for_timeout(500)
    t=await p.inner_text('#pr-state'); rec('checkout error keeps free signup message and retry', 'still saved' in t and await p.eval_on_selector('#pr-actions',VIS), t)
    await p.context.close()
    # checkout ok -> navigates to provider with signup_id
    p,sent=await formp(b,J({'ok':True,'signup_id':'s_9','email_sent':True}),PC)
    body={}
    async def co(r):
        body.update(json.loads(r.request.post_data)); await r.fulfill(status=200,content_type='application/json',body=json.dumps({'checkout_url':'https://checkout.mock.test/pay/abc'}))
    await p.route(MOCK+'/checkout', co)
    await p.route('https://checkout.mock.test/**', lambda r: r.fulfill(status=200, content_type='text/html', body='<h1>mock checkout</h1>'))
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(500); await p.click('#pr-pay'); await p.wait_for_timeout(800)
    rec('checkout sends signup_id and opens provider URL from server', body.get('signup_id')=='s_9' and p.url.startswith('https://checkout.mock.test/'), (body,p.url))
    await p.context.close()
    # return flows
    for name, seq, expect in [('pending then confirmed',['pending','pending','confirmed'],'confirmed'),('failed',['failed'],'did not go through'),('abandoned',['abandoned'],'closed before'),('never confirmed',['none']*20,'still being confirmed')]:
        p=await newpage(b,390,844,{'APPS_SCRIPT_URL':MOCK+'/exec',**PC,'PRIORITY_POLL_MS':150,'PRIORITY_POLL_MAX':5})
        q=list(seq)
        def mk(q):
            async def st(r):
                s=q.pop(0) if len(q)>1 else q[0]
                await r.fulfill(status=200,content_type='application/json',body=json.dumps({'status':s}))
            return st
        await p.route(re.compile(re.escape(MOCK)+r'/status.*'), mk(q))
        await p.goto(BASE); await p.evaluate("sessionStorage.setItem('hq_signup', JSON.stringify({id:'s_9',path:'duke'}))")
        await p.goto(BASE+'?priority=return#form'); await p.wait_for_timeout(200)
        first=await p.inner_text('#pr-state')
        await p.wait_for_timeout(1600)
        t=await p.inner_text('#pr-state')
        rec(f'return URL: {name}', expect in t and 'confirmed.' not in first, (first,t))
        if name=='failed': rec('failed payment offers retry', await p.eval_on_selector('#pr-actions',VIS))
        await p.context.close()
    p=await newpage(b,390,844,{'APPS_SCRIPT_URL':MOCK+'/exec',**PC}); await p.goto(BASE+'?priority=return#form'); await p.wait_for_timeout(300)
    rec('return URL without saved signup does not claim payment', 'could not find' in await p.inner_text('#pr-state')); await p.context.close()

async def demo(b):
    async def run(p, handle='bahiataste', confirm=False, reject_first=False):
        await p.click('#start')
        async def text(v):
            await p.wait_for_selector('#in', timeout=8000); await p.fill('#in', v); await p.click('#go')
        async def chip(t):
            await p.wait_for_selector(f'.chips button:has-text("{t}")', timeout=8000); await p.click(f'.chips button:has-text("{t}")')
        await text('Bahia Taste'); await chip('Food and drinks'); await text('catering trays'); await text('families'); await chip('Hosting an event'); await text('@'+handle)
        if reject_first:
            await chip('No, change the handle'); await text('@'+handle)
        if confirm: await chip("Yes, that's me")
        await p.wait_for_selector('.result section:nth-of-type(3)', timeout=15000)
    # preview mode
    p=await newpage(b,390,844,{'APPS_SCRIPT_URL':''}); await p.goto(BASE+'meet-duke/'); await run(p)
    res=await p.inner_text('.result')
    rec('demo preview: result labeled as sample', 'Sample idea' in res, res[:80])
    rec('demo preview: no fabricated profile insight', 'Your profile' not in res and 'Reading @' not in await p.inner_text('.checks'))
    await p.wait_for_selector('#in', timeout=8000); await p.fill('#in','a@b.co'); await p.click('#go'); await p.wait_for_timeout(1500)
    log=await p.inner_text('#log'); rec('demo preview: waitlist not connected is said plainly', "can't save signups from this preview" in log, log[-200:])
    await p.screenshot(path=SHOTS+'demo_preview_390.png', full_page=False)
    await p.context.close()
    # live mode with mocked HustleQ API + Apps Script
    cfg={'DUKE_API_BASE':MOCK+'/duke','APPS_SCRIPT_URL':MOCK+'/exec'}
    p=await newpage(b,1440,900,cfg); sent=[]
    await p.route(MOCK+'/duke/demo/profile', J({'ok':True,'profile':{'username':'bahiataste','name':'Bahia <i>Taste</i>','bio':'Test bio','image_url':'javascript:alert(1)'},'insight':'Your last Reel was <b>3</b> weeks ago.'}))
    await p.route(MOCK+'/duke/demo/idea', J({'ok':True,'idea':{'trend':{'name':'Real kitchen sound','what':'Close-ups.','signal':'shared more'},'format':'Reel','hook':'Hook <img src=x onerror=alert(1)>','film':'Film it','caption':'Cap','time':''}}))
    async def ex(r): sent.append(json.loads(r.request.post_data)); await r.fulfill(status=200,content_type='application/json',body=json.dumps({'ok':True,'signup_id':'s_d','email_sent':True}))
    await p.route(MOCK+'/exec', ex)
    await p.goto(BASE+'meet-duke/'); await run(p, confirm=True)
    log=await p.inner_html('#log')
    rec('demo live: profile confirmation shows API data escaped, no unsafe image', 'Bahia &lt;i&gt;Taste&lt;/i&gt;' in log and 'javascript:' not in log)
    res=await p.inner_text('.result'); html=await p.inner_html('.result')
    rec('demo live: no sample label, profile reason from API', 'Sample idea' not in res and 'Your profile' in res and 'Reading @' in await p.inner_text('.checks'))
    rec('demo live: API text is escaped', '<img' not in html and '&lt;img' in html)
    await p.wait_for_selector('#in', timeout=8000); await p.fill('#in','a@b.co'); await p.click('#go'); await p.wait_for_timeout(1800)
    pl=sent[0] if sent else {}
    rec('demo live: waitlist payload source=meet-duke with handle and answers', pl.get('source')=='meet-duke' and pl.get('instagram')=='@bahiataste' and pl.get('business_name')=='Bahia Taste' and pl.get('demo',{}).get('month')=='event', pl)
    rec('demo live: "on the list" only after ok', "You're on the list" in await p.inner_text('#log'))
    await p.screenshot(path=SHOTS+'demo_live_1440.png', full_page=False)
    await p.context.close()
    p=await newpage(b,390,844,{'APPS_SCRIPT_URL':MOCK+'/exec'})
    await p.route(MOCK+'/exec', J({},500)); await p.goto(BASE+'meet-duke/'); await run(p)
    await p.wait_for_selector('#in', timeout=8000); await p.fill('#in','a@b.co'); await p.click('#go'); await p.wait_for_timeout(1500)
    log=await p.inner_text('#log'); rec('demo: save failure says not on the list and allows retry', "not on the list yet" in log and await p.is_visible('#in'), log[-160:])
    await p.context.close()

    p=await newpage(b,390,844,{'DUKE_API_BASE':MOCK+'/duke','APPS_SCRIPT_URL':''})
    await p.route(MOCK+'/duke/demo/profile', J({},500)); await p.route(MOCK+'/duke/demo/idea', J({},500))
    await p.goto(BASE+'meet-duke/'); await run(p)
    log=await p.inner_text('#log'); res=await p.inner_text('.result')
    rec('demo: profile lookup failure continues without profile data', "couldn't look up that profile" in log and 'Your profile' not in res and 'Sample idea' in res)
    await p.context.close()
    p=await newpage(b,390,844,{'DUKE_API_BASE':MOCK+'/duke'})
    await p.route(MOCK+'/duke/demo/profile', J({'ok':True,'profile':{'username':'other'}}))
    await p.route(MOCK+'/duke/demo/idea', J({},500))
    await p.goto(BASE+'meet-duke/'); await run(p, reject_first=True, confirm=True)
    rec('demo: rejecting the profile asks for the handle again', (await p.inner_text('#log')).count('Is this your business?')==2)
    await p.context.close()

async def case(b):
    for cfg,label in [(None,'preview'),({'SHOW_DEV_BAR':False},'production')]:
        p=await newpage(b,1440,900,cfg); await p.goto(BASE+'work/bahia-taste/'); await p.wait_for_timeout(500)
        html=await p.content()
        rec(f'case [{label}]: opens directly by URL with title and h1', await p.title()=='Bahia Taste · The Work · HustleQ' and await p.inner_text('h1')=='Bahia Taste')
        rec(f'case [{label}]: noindex kept', await p.evaluate('!!document.querySelector("meta[name=robots][content=noindex]")'))
        rec(f'case [{label}]: no dining-room image', 'dining' not in html)
        h2=await p.evaluate('[...document.querySelectorAll("main h2")].length'); h1=await p.evaluate('document.querySelectorAll("h1").length')
        rec(f'case [{label}]: one h1 and section h2s', h1==1 and h2>=2, (h1,h2))
        alts=await p.evaluate('[...document.querySelectorAll("main img")].filter(i=>!i.getAttribute("alt")).length')
        rec(f'case [{label}]: every image has alt text', alts==0, alts)
        ph=await p.evaluate('document.querySelectorAll("main .todo, main .cs-posts").length')
        rec(f'case [{label}]: placeholders {"shown" if label=="preview" else "hidden"}', (ph>0) if label=='preview' else ph==0, ph)
        await p.context.close()
    p=await newpage(b,390,844); await p.goto(BASE+'work/bahia-taste/'); await p.wait_for_timeout(300)
    await p.click('.cs-nav a[href="../../work/"]'); await p.wait_for_load_state()
    rec('case: "All work" returns to /work/', p.url.endswith('/work/'))
    await p.click('a.tile'); await p.wait_for_load_state()
    rec('work index: tile opens the case', p.url.endswith('/work/bahia-taste/'))
    await p.context.close()
    p=await newpage(b); r=await p.goto(BASE+'nope/'); rec('unknown route returns 404 page', r.status==404 and 'does not exist' in await p.content()); await p.context.close()

async def main():
    srv=subprocess.Popen(['node',os.path.join(HERE,'..','..','scripts','serve.mjs'),SITE,'8765'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        async with async_playwright() as pw:
            b=await pw.chromium.launch()
            await layout(b); await links(b); await nav(b); await forms(b); await priority(b); await demo(b); await case(b)
            await b.close()
    finally: srv.terminate()
    real=[e for e in ERRS]
    rec('no JavaScript errors on any page', not real, real[:5])
    f=[r for r in R if not r[1]]; print(f'\n{len(R)-len(f)}/{len(R)} passed'); sys.exit(1 if f else 0)
asyncio.run(main())
