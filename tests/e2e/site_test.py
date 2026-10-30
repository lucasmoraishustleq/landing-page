import asyncio, base64, json, subprocess, sys, time, re
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
    # never call the real Duke API (each profile lookup spends Apify credit); live tests mock DUKE_API_BASE
    await p.route(re.compile(r'https://[^/]*\.railway\.app/.*'), lambda r: r.abort())
    cfg={'DUKE_API_BASE':'', **(cfg or {})}
    await p.add_init_script('window.HQ_CONFIG='+json.dumps(cfg))
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
            imgs=await p.evaluate('''async()=>{document.querySelectorAll('.track').forEach(t=>{t.style.scrollBehavior='auto';t.scrollLeft=t.scrollWidth});for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60))};await Promise.all([...document.images].map(i=>i.complete?0:new Promise(r=>{i.addEventListener('load',r);i.addEventListener('error',r);setTimeout(r,6000)})));window.scrollTo(0,0);document.querySelectorAll('.track').forEach(t=>t.scrollLeft=0);return [...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)}''')
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
        if w < 600:
            await p.click('.menu-btn'); await p.click('#mmenu a[data-path="duke"]')
        else:
            await p.click('header .hcta a.primary')
        await p.wait_for_timeout(900)
        st=await p.evaluate('[document.querySelector("#lead-form [name=path]").value,document.querySelector("#lead-form [name=source]").value]')
        rec(f'header/menu primary CTA -> form path=duke @{w}', st==['duke','header' if w>=600 else 'menu'], st)
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
        rec(f'{path}: no First Access modal while Stripe is pending', not await p.eval_on_selector('#fa-modal',VIS))
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
    PC={'FIRST_ACCESS_CHECKOUT_URL':'https://buy.stripe.test/test_abc','FIRST_ACCESS_STATUS_URL':MOCK+'/status'}
    OKID=J({'ok':True,'signup_id':'s_9','email_sent':True})
    # no modal without a signup id, nor on the partner path
    p,sent=await formp(b,J({'ok':True,'email_sent':True}),PC)
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(500)
    rec('First Access: no modal without signup_id, inline confirmation instead', not await p.eval_on_selector('#fa-modal',VIS) and 'ready for you' in await p.inner_text('#st-ok')); await p.context.close()
    p,sent=await formp(b,OKID,PC,'partner')
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(500)
    rec('First Access: no modal on the partner path', not await p.eval_on_selector('#fa-modal',VIS) and 'Application received' in await p.inner_text('#st-ok')); await p.context.close()
    # modal after confirmed duke signup, three exits keep the registration
    for exit_name in ['stay','close','escape','backdrop']:
        p,sent=await formp(b,OKID,PC)
        await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(600)
        vis=await p.eval_on_selector('#fa-modal',VIS)
        if exit_name=='stay':
            txt=await p.inner_text('#fa-modal')
            rec('First Access: modal shows after saved signup with required copy', vis and "You’re on the list!" in txt and 'Get First Access · $20' in txt and "I’ll stay on the free waitlist" in txt and 'refundable' in txt and 'does not guarantee' in txt, txt[:160])
            rec('First Access: focus moves into the dialog', await p.evaluate('!!document.activeElement.closest(".fa-dialog")'))
            await p.screenshot(path=SHOTS+'first_access_modal_390.png')
            await p.click('#fa-stay')
        elif exit_name=='close': await p.click('#fa-close')
        elif exit_name=='escape': await p.keyboard.press('Escape')
        else: await p.mouse.click(5,5)
        await p.wait_for_timeout(300)
        gone=not await p.eval_on_selector('#fa-modal',VIS); inline=await p.inner_text('#st-ok')
        rec(f'First Access: "{exit_name}" closes modal, registration kept, confirmation shown', gone and 'We’ll email you when Duke is ready for you.' in inline and len(sent)==1, inline)
        if exit_name=='stay':
            await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(600)
            rec('First Access: free-waitlist choice is not prompted again', not await p.eval_on_selector('#fa-modal',VIS) and len(sent)==2)
        await p.context.close()
    # pay -> Stripe Payment Link with client_reference_id
    p,sent=await formp(b,OKID,PC)
    await p.route('https://buy.stripe.test/**', lambda r: r.fulfill(status=200, content_type='text/html', body='<h1>mock checkout</h1>'))
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(600); await p.click('#fa-pay'); await p.wait_for_timeout(800)
    rec('First Access: checkout opens the payment link tied to the signup', p.url.startswith('https://buy.stripe.test/test_abc') and 'client_reference_id=s_9' in p.url and 'prefilled_email=iza%40example.com' in p.url, p.url)
    await p.context.close()
    # server-session variant failing -> error with retry, registration kept
    p,sent=await formp(b,OKID,{'FIRST_ACCESS_SESSION_URL':MOCK+'/checkout','FIRST_ACCESS_STATUS_URL':MOCK+'/status'})
    await p.route(MOCK+'/checkout', J({},500))
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(600); await p.click('#fa-pay'); await p.wait_for_timeout(600)
    t2=await p.inner_text('#fa-state')
    rec('First Access: checkout error keeps the free registration and offers retry', 'Free Waitlist registration is saved' in t2 and await p.eval_on_selector('#fa-state-actions',VIS), t2)
    await p.context.close()
    # return from checkout: status only from the server
    for name, seq, expect in [('pending then confirmed',['pending','pending','confirmed'],'First Access confirmed'),('failed',['failed'],'did not go through'),('abandoned',['abandoned'],'closed before paying'),('never confirmed',['none']*20,'still being confirmed')]:
        p=await newpage(b,390,844,{'APPS_SCRIPT_URL':MOCK+'/exec',**PC,'PRIORITY_POLL_MS':150,'PRIORITY_POLL_MAX':5})
        q=list(seq)
        def mk(q):
            async def st(r):
                s=q.pop(0) if len(q)>1 else q[0]
                await r.fulfill(status=200,content_type='application/json',body=json.dumps({'status':s}))
            return st
        await p.route(re.compile(re.escape(MOCK)+r'/status.*'), mk(q))
        await p.goto(BASE); await p.evaluate("sessionStorage.setItem('hq_signup', JSON.stringify({id:'s_9',path:'duke'}))")
        await p.goto(BASE+'?first_access=return#form'); await p.wait_for_timeout(200)
        first=await p.inner_text('#fa-state')
        await p.wait_for_timeout(1600)
        t3=await p.inner_text('#fa-state')
        rec(f'First Access return: {name}', expect in t3 and 'confirmed.' not in first, (first,t3))
        if name=='failed': rec('First Access: failed payment offers retry', await p.eval_on_selector('#fa-state-actions',VIS))
        await p.context.close()
    p=await newpage(b,390,844,{'APPS_SCRIPT_URL':MOCK+'/exec',**PC}); await p.goto(BASE+'?first_access=return#form'); await p.wait_for_timeout(300)
    rec('First Access: return without a saved signup does not claim payment', 'could not find' in await p.inner_text('#fa-state')); await p.context.close()
    # design preview while Stripe is pending: CTA disabled, never charges
    p=await newpage(b,390,844); await p.goto(BASE+'?preview=first-access#form'); await p.wait_for_timeout(400)
    rec('First Access preview: modal opens with checkout disabled while link is pending', await p.eval_on_selector('#fa-modal',VIS) and await p.evaluate('document.getElementById("fa-pay").disabled') and 'pending' in await p.inner_text('#fa-pay'))
    await p.context.close()
    # idempotent retry: same request_id after a failure, new one after success
    calls=[]
    async def flaky(r):
        calls.append(json.loads(r.request.post_data))
        if len(calls)==1: await r.fulfill(status=500, body='x')
        else: await r.fulfill(status=200, content_type='application/json', body=json.dumps({'ok':True,'signup_id':'s_%d'%len(calls)}))
    p,sent=await formp(b,flaky)
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(500); await p.click('#submit-btn'); await p.wait_for_timeout(500)
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(500)
    rid=[c.get('request_id') for c in calls]
    rec('form: retry reuses request_id, next signup gets a new one', len(rid)==3 and rid[0]==rid[1] and rid[2]!=rid[1] and all(rid), rid)
    await p.context.close()

async def ux(b):
    # outlined star replaces the image next to "We did the work by hand."
    p=await newpage(b); await p.goto(BASE)
    st=await p.evaluate('(()=>{const l=[...document.querySelectorAll(".cline")].find(c=>c.textContent.includes("We did the work by hand"));const u=l&&l.querySelector("svg use");return [!!u, u&&u.getAttribute("fill"), !!l.querySelector("img")]})()')
    rec('"We did the work by hand" uses an outlined star, no image', st==[True,'none',False], st)
    # Section 8 colors
    c=await p.evaluate('[getComputedStyle(document.getElementById("ways-in")).backgroundColor, getComputedStyle(document.getElementById("ways-h")).color, getComputedStyle(document.querySelector(".fpp-dark")).color]')
    rec('Section 8 is deep purple with white title and FPP text', c==['rgb(42, 10, 61)','rgb(255, 255, 255)','rgb(255, 255, 255)'], c)
    dk=await p.evaluate('[getComputedStyle(document.getElementById("way-duke")).color, getComputedStyle(document.querySelector(".way:not(.fpp-dark) li")).color, getComputedStyle(document.querySelector(".way:not(.fpp-dark) .textlink")).color]')
    rec('Section 8: Duke card text stays dark on its white card', all(x=='rgb(42, 10, 61)' for x in dk), dk)
    # serif accent font is declared for selected words only
    n=await p.evaluate('document.querySelectorAll("em.ser").length'); fam=await p.evaluate('getComputedStyle(document.querySelector("em.ser")).fontFamily')
    rec('expressive serif accent used selectively', 3<=n<=10 and 'Instrument Serif' in fam, (n,fam))
    await p.context.close()
    # carousel
    for w in (1440,390):
        p=await newpage(b,w,900 if w>600 else 844); await p.goto(BASE); await p.evaluate('document.getElementById("product").scrollIntoView()'); await p.wait_for_timeout(700)
        pos0=await p.inner_text('#plan-pos'); prevd=await p.evaluate('document.querySelector(".car-btn[data-dir=\'-1\']").disabled')
        await p.click('.car-btn[data-dir="1"]'); await p.wait_for_timeout(700)
        pos1=await p.inner_text('#plan-pos')
        await p.focus('#plan-track'); await p.keyboard.press('ArrowRight'); await p.wait_for_timeout(700)
        pos2=await p.inner_text('#plan-pos')
        hid=await p.evaluate('[...document.querySelectorAll(".slide")].filter(s=>s.closest("[aria-hidden=true]")||s.hidden).length')
        sw=await p.evaluate('document.documentElement.scrollWidth')
        rec(f'carousel @{w}: buttons and arrow keys move, slides stay accessible, no page overflow', pos0.startswith('1 /') and prevd and pos1.startswith('2 /') and pos2.startswith('3 /') and hid==0 and sw<=w, (pos0,pos1,pos2,hid,sw))
        if w==390: await p.locator('.carousel').screenshot(path=SHOTS+'carousel_390.png')
        await p.context.close()
    # anatomy
    p=await newpage(b,390,844); await p.goto(BASE); await p.evaluate('document.getElementById("anatomy").scrollIntoView()'); await p.wait_for_timeout(600)
    await p.click('[data-an="hook"]'); h=await p.inner_text('#an-p')
    await p.focus('[data-an="hook"]'); await p.keyboard.press('ArrowRight'); g=await p.inner_text('#an-p'); foc=await p.evaluate('document.activeElement.dataset.an')
    rec('content item anatomy: tabs switch content, arrow keys move focus', 'Everything you see at an event starts here' in h and 'Awareness' in g and foc=='goal', (h[:40],g[:40],foc))
    await p.locator('#anatomy').screenshot(path=SHOTS+'anatomy_390.png'); await p.context.close()
    # motion: normal reveals, reduced-motion shows everything at once
    p=await newpage(b,1440,900); await p.goto(BASE); await p.wait_for_timeout(60)
    early=await p.evaluate('parseFloat(getComputedStyle(document.querySelector(".intro .s5")).opacity)')
    await p.wait_for_timeout(1000)
    mid=await p.evaluate('parseFloat(getComputedStyle(document.querySelector(".intro .s5")).opacity)')
    await p.wait_for_timeout(900)
    cta=await p.evaluate('parseFloat(getComputedStyle(document.querySelector(".intro .s4")).opacity)')
    await p.wait_for_timeout(450)
    late=await p.evaluate('[...document.querySelectorAll(".intro .seq")].every(e=>parseFloat(getComputedStyle(e).opacity)>0.99)')
    below=await p.evaluate('document.querySelector("#faq") && document.querySelectorAll(".rv:not(.in)").length>0')
    rec('hero sequence lasts about 2.2 s: last line still hidden at 1 s, CTAs visible by 2 s, all done by 2.4 s', early<0.5 and mid<0.5 and cta>0.99 and late and below, (early,mid,cta,late,below))
    await p.context.close()
    # section numbers: each section has its own treatment
    p=await newpage(b,1440,900); await p.goto(BASE)
    kinds=await p.evaluate('[...document.querySelectorAll(".sn")].map(e=>[...e.classList].find(c=>c.startsWith("sn-")))')
    rec('section numbers use varied treatments, no two alike', len(kinds)>=8 and len(set(kinds))==len(kinds), kinds)
    await p.context.close()
    for w in (390,1440):
        p=await newpage(b,w,900); await p.goto(BASE); await p.wait_for_timeout(300)
        await p.evaluate('document.querySelectorAll(".rv,.wipe").forEach(e=>e.classList.add("in"))')
        if w==390: await p.locator('#product').screenshot(path=SHOTS+'section_number_390.png')
        else: await p.locator('#ways-in').screenshot(path=SHOTS+'section_number_1440.png')
        await p.context.close()
    p=await newpage(b,1440,900,reduce=True); await p.goto(BASE); await p.wait_for_timeout(80)
    allv=await p.evaluate('[...document.querySelectorAll(".intro .seq, .rv:not(.stagger), .rv.stagger > *")].every(e=>parseFloat(getComputedStyle(e).opacity)>0.99)')
    rec('reduced motion: everything visible immediately, no entrance animation', allv)
    await p.context.close()

async def content(b):
    # CTA wording and accent color
    bad=[]
    for path in ['', 'meet-duke/', 'work/', 'work/bahia-taste/']:
        p=await newpage(b); await p.goto(BASE+path); await p.wait_for_timeout(200)
        if 'among the first' in (await p.content()): bad.append(path or '/')
        await p.context.close()
    p=await newpage(b); await p.goto(BASE); await p.wait_for_timeout(2600)
    n=await p.evaluate('[...document.querySelectorAll("a")].filter(a=>a.textContent.trim().startsWith("Be the first to try Duke")).length')
    rec('CTA reads "Be the first to try Duke" everywhere, "among" removed', not bad and n>=4, (bad,n))
    col=await p.evaluate('getComputedStyle(document.querySelector("#hero h1 em")).color')
    rec('hero "post" uses the signal orange', col=='rgb(232, 89, 12)', col)
    q=await newpage(b); await q.goto(BASE+'meet-duke/'); c2=await q.evaluate('[!!document.querySelector("#md-h .acc"), getComputedStyle(document.getElementById("md-h")).color]'); await q.context.close()
    rec('demo title "Duke" is back to the deep purple', c2==[False,'rgb(42, 10, 61)'], c2)
    txt=await p.evaluate('document.body.innerText')
    rec('no internal placeholder text in the hero (DUKE_EXAMPLE_01, Illustrative text, [from the profile])', all(x not in txt for x in ['DUKE_EXAMPLE','Illustrative text','[from the profile]']) and 'Real Duke beta output' in txt and 'The Brazilian Dish Everyone’s Curious About' in txt)
    br=await p.evaluate('[!!document.querySelector(".bridge img"), !!document.querySelector(".bridge .process"), document.querySelector(".bridge .pc-cap").textContent]')
    rec('"Before Duke" section uses the process composition, no food photo, labeled as an illustration', br==[False,True,'Illustration of the process'], br)
    fg=await p.evaluate('[parseFloat(getComputedStyle(document.querySelector(".faq-g")).fontSize), parseFloat(getComputedStyle(document.querySelector(".faq summary")).fontSize), getComputedStyle(document.querySelector(".faq-g")).color]')
    rec('FAQ group headings are larger than the questions and in deep purple', fg[0]>fg[1] and fg[2]=='rgb(42, 10, 61)', fg)
    # FAQ
    faq=await p.evaluate('({n:document.querySelectorAll("#faq details").length,g:[...document.querySelectorAll("#faq .faq-g")].map(e=>e.textContent),t:document.getElementById("faq").textContent,open:document.querySelectorAll("#faq details[open]").length})')
    rec('FAQ: 15 questions in 4 groups, no draft brackets left', faq['n']==15 and faq['g']==['Getting to know Duke','How Duke works','Access and pricing','Done for you'] and '[' not in faq['t'], faq['g'])
    t=faq['t']
    rec('FAQ: states no auto-posting, refund terms, $20 separate, no date promise', 'Duke plans your content and tells you how to make each post. You publish it.' in t and 'any time before you get access' in t and 'doesn’t count toward a subscription' in t and 'doesn’t guarantee a specific access date' in t and 'not promising a fixed date' in t)
    rec('FAQ: FPP selective, $750, no acceptance promise', 'starts at $750/month' in t and 'reviewed one by one' in t)
    # real media replaces the placeholders
    ph=await p.evaluate('document.querySelectorAll("#hero .ph, #plan-track .ph").length')
    names=await p.evaluate('[...document.querySelectorAll("#plan-track img, #plan-track video, #hero .rec img")].map(e=>(e.currentSrc||e.getAttribute("src")||e.querySelector("source").getAttribute("src")).split("/").pop())')
    rec('weekly plan and hero use the provided Bahia Taste media, no placeholders left', ph==0 and names==['plate-800.jpg','table-set-800.jpg','event-bites-800.jpg','event-spread.mp4','meal-prep.mp4','menu-tradicional-540.jpg','menu-healthy-540.jpg'], (ph,names))
    alts=await p.evaluate('[...document.querySelectorAll("#plan-track img, #hero .rec img, .shot img")].filter(i=>!i.alt).length + [...document.querySelectorAll("#plan-track video")].filter(v=>!v.getAttribute("aria-label")).length')
    rec('new images have alt text, videos have labels', alts==0, alts)
    shots=await p.evaluate('[...document.querySelectorAll(".shot")].map(f=>[f.querySelector("img").getAttribute("src").split("/").pop(), f.querySelector(".shot-bar .mono").textContent])')
    rec('Duke beta screenshots are the Bahia Taste account and labeled as such', [x[0] for x in shots][:2]==['beta-content-plan-bahia.jpg','beta-strategy-bahia.jpg'] or set(x[0] for x in shots)>={'beta-content-plan-bahia.jpg','beta-strategy-bahia.jpg'} and all('Bahia Taste' in x[1] for x in shots if 'bahia' in x[0]), shots)
    # video: plays when in view, button pauses and resumes
    await p.evaluate('document.getElementById("product").scrollIntoView()'); await p.wait_for_timeout(300)
    await p.evaluate('(()=>{const t=document.getElementById("plan-track");t.style.scrollBehavior="auto";t.scrollLeft=t.querySelectorAll(".slide")[2].offsetLeft-t.offsetLeft;document.querySelectorAll(".vid")[0].scrollIntoView({block:"center"})})()')
    await p.wait_for_timeout(1500)
    playing=await p.evaluate('!document.querySelectorAll(".vid video")[0].paused')
    await p.click('.vid >> nth=0 >> .vid-btn'); await p.wait_for_timeout(200)
    paused=await p.evaluate('document.querySelectorAll(".vid video")[0].paused'); lab=await p.inner_text('.vid >> nth=0 >> .vid-btn')
    rec('weekly plan video plays muted when visible and can be paused', playing and paused and lab=='Play' and await p.evaluate('document.querySelectorAll(".vid video")[0].muted'), (playing,paused,lab))
    await p.locator('.carousel').screenshot(path=SHOTS+'carousel_media_1440.png')
    await p.context.close()
    p=await newpage(b,390,844,reduce=True); await p.goto(BASE); await p.evaluate('document.querySelectorAll(".vid")[0].scrollIntoView({block:"center"})'); await p.wait_for_timeout(1200)
    rec('reduced motion: videos do not autoplay', await p.evaluate('[...document.querySelectorAll(".vid video")].every(v=>v.paused)'))
    await p.context.close()
    p=await newpage(b,390,844); await p.goto(BASE+'#faq-refund'); await p.wait_for_timeout(400)
    rec('refund link opens the refund answer', await p.evaluate('document.getElementById("faq-refund").open'))
    await p.goto(BASE+'?preview=first-access#form'); await p.wait_for_timeout(400)
    rec('First Access offer links to the refund terms', await p.evaluate('(document.querySelector("#fa-refund a")||{}).getAttribute&&document.querySelector("#fa-refund a").getAttribute("href")')=='/#faq-refund')
    await p.context.close()
    # utm attribution reaches the payload
    cfg={'APPS_SCRIPT_URL':MOCK+'/exec','TIMEOUT_MS':2500}
    p=await newpage(b,390,844,cfg); sent=[]
    async def route(r): sent.append(json.loads(r.request.post_data)); await r.fulfill(status=200,content_type='application/json',body=json.dumps({'ok':True,'signup_id':'s_u'}))
    await p.route(MOCK+'/exec', route)
    await p.goto(BASE+'?utm_source=linkedin&utm_medium=social&utm_campaign=fpp2'); await p.wait_for_timeout(200)
    await p.click('a[data-source="hero"]'); await p.wait_for_timeout(300)
    await fill(p); await p.click('#submit-btn'); await p.wait_for_timeout(600)
    pl=sent[0] if sent else {}
    rec('utm source, medium and campaign are sent with the registration', pl.get('utm_source')=='linkedin' and pl.get('utm_medium')=='social' and pl.get('utm_campaign')=='fpp2' and pl.get('source')=='hero', pl)
    await p.context.close()

async def viewer(b):
    for w,h in [(1440,900),(390,844)]:
        p=await newpage(b,w,h); await p.goto(BASE); await p.wait_for_timeout(300)
        await p.evaluate('document.documentElement.style.scrollBehavior="auto";document.getElementById("plan-track").scrollIntoView({block:"center"})'); await p.wait_for_timeout(400)
        await p.click('#plan-track .slide >> nth=0 >> .lb-btn'); await p.wait_for_timeout(300)
        y0=await p.evaluate('scrollY')
        st=await p.evaluate('({open:!document.querySelector(".lb").hidden,count:document.querySelector(".lb-count").textContent,img:!!document.querySelector(".lb-stage img"),locked:document.documentElement.classList.contains("lb-open"),focus:document.activeElement.className,sw:document.documentElement.scrollWidth})')
        rec(f'viewer @{w}: weekly plan image opens full screen as a 6-item gallery, focus on close, page locked', st['open'] and st['count']=='1 / 6' and st['img'] and st['locked'] and st['focus']=='lb-close' and st['sw']<=w, st)
        fit=await p.evaluate('(()=>{const i=document.querySelector(".lb-stage img");const r=i.getBoundingClientRect();return [r.width<=innerWidth+1, r.height<=innerHeight+1, Math.abs(r.width/r.height - i.naturalWidth/i.naturalHeight)<0.02]})()')
        rec(f'viewer @{w}: image fits the screen without cropping or stretching', fit==[True,True,True], fit)
        await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.wait_for_timeout(200)
        v=await p.evaluate('(()=>{const v=document.querySelector(".lb-stage video");return v?[v.controls, document.querySelector(".lb-count").textContent]:null})()')
        rec(f'viewer @{w}: arrow keys move to the video, which has playback controls', v==[True,'3 / 6'], v)
        if w==1440: await p.screenshot(path=SHOTS+'viewer_video_1440.png')
        else: await p.screenshot(path=SHOTS+'viewer_390.png')
        await p.keyboard.press('Escape'); await p.wait_for_timeout(200)
        st2=await p.evaluate('({closed:document.querySelector(".lb").hidden,locked:document.documentElement.classList.contains("lb-open"),y:scrollY,focus:document.activeElement.className})')
        rec(f'viewer @{w}: Escape closes, scroll position and focus restored', st2['closed'] and not st2['locked'] and abs(st2['y']-y0)<4 and y0>200 and st2['focus']=='lb-btn', (st2,y0))
        await p.click('.shot >> nth=0 >> .lb-btn'); await p.wait_for_timeout(200)
        ok=await p.evaluate('!document.querySelector(".lb").hidden && document.querySelector(".lb-stage img").getAttribute("src").includes("beta-content-plan-bahia")')
        await p.click('.lb-close'); await p.wait_for_timeout(150)
        rec(f'viewer @{w}: Duke beta screenshot expands and the close button works', ok and await p.evaluate('document.querySelector(".lb").hidden'))
        await p.context.close()
    p=await newpage(b,390,844); await p.goto(BASE+'work/bahia-taste/'); await p.wait_for_timeout(400)
    await p.click('.cs-posts .cs-fig >> nth=0 >> .lb-btn'); await p.wait_for_timeout(300)
    c=await p.inner_text('.lb-count')
    await p.keyboard.press('ArrowRight'); await p.wait_for_timeout(200)
    vid=await p.evaluate('!!document.querySelector(".lb-stage video[controls]")')
    await p.mouse.click(195,420); await p.wait_for_timeout(100)
    rec('case: a post carousel opens all its slides, including videos with controls', c=='1 / 5' and vid, (c,vid))
    await p.keyboard.press('Escape'); await p.wait_for_timeout(150)
    await p.click('.cs-pair .cs-frame >> nth=0 >> img'); await p.wait_for_timeout(200)
    src=await p.evaluate('document.querySelector(".lb-stage img") && document.querySelector(".lb-stage img").getAttribute("src")')
    rec('case: tapping a photo opens it full screen', src and 'cook-event-1400' in src, src)
    await p.screenshot(path=SHOTS+'viewer_case_390.png')
    await p.context.close()

async def demo(b):
    async def text(p,v,timeout=8000):
        await p.wait_for_selector('#in', timeout=timeout); await p.fill('#in', v); await p.click('#go')
    async def chip(p,t):
        sel=f'.chips button:text-is("{t}")'
        await p.wait_for_selector(sel, timeout=8000); await p.click(sel)
    async def pick(p,label):
        await p.wait_for_selector('#nsel', timeout=8000); await p.select_option('#nsel', label=label); await p.click('#go')
    async def run(p, handle='bahiataste', reject_first=False, niche='Restaurants & food trucks'):
        await text(p,'@'+handle)
        if reject_first:
            await chip(p,"No, that's not my profile")
            await text(p,'@'+handle+'2')
        await chip(p,"Yes, that's my business")
        await pick(p,niche)
        await text(p,'catering trays'); await chip(p,'Hosting an event')
        await p.wait_for_selector('.result section:nth-of-type(3)', timeout=15000)
    # first frame: device, avatar, explanation, first question, no splash
    for w,h,kind in [(390,844,'phone'),(1440,900,'window')]:
        p=await newpage(b,w,h,{'APPS_SCRIPT_URL':''}); await p.goto(BASE+'meet-duke/'); await p.wait_for_timeout(150)
        info=await p.evaluate("""(()=>{const f=document.querySelector('.frame');const cs=getComputedStyle(f);
          return {radius:parseFloat(cs.borderTopLeftRadius),win:getComputedStyle(document.querySelector('.winbar')).display!=='none',
          status:getComputedStyle(document.querySelector('.statusbar')).display!=='none',side:getComputedStyle(document.querySelector('.side')).display!=='none',
          fw:f.getBoundingClientRect().width,cover:!!document.querySelector('.cover,#start'),
          headAv:!!document.querySelector('.chat .head .av img[src*="duke-avatar"]'),rowAv:document.querySelectorAll('.row.duke .av img[src*="duke-avatar"]').length,
          star:!!document.querySelector('.chat .head .av svg'),log:document.getElementById('log').innerText,input:!!document.getElementById('in'),
          focus:document.activeElement===document.getElementById('in'),sw:document.documentElement.scrollWidth}})()""")
        if kind=='phone': shape=info['radius']>=30 and info['status'] and not info['win'] and not info['side'] and info['fw']<=410
        else: shape=info['win'] and info['side'] and not info['status'] and info['fw']>600
        rec(f'demo @{w}: {kind} frame from the first frame, no splash', shape and not info['cover'], info)
        rec(f'demo @{w}: Duke avatar image in header and beside messages, no star avatar', info['headAv'] and info['rowAv']>=1 and not info['star'], info)
        lg=info['log']
        rec(f'demo @{w}: first frame explains the demo and asks for the Instagram handle first', "I'm Duke" in lg and 'few questions' in lg and 'content idea' in lg and "First, what's your business's Instagram handle?" in lg and info['input'] and not info['focus'], lg[:200])
        rec(f'demo @{w}: no horizontal overflow', info['sw']<=w, info['sw'])
        await p.screenshot(path=SHOTS+f'demo_first_frame_{w}.png', full_page=False)
        await p.context.close()
    for w in (360,375,1024):
        p=await newpage(b,w,800 if w<900 else 768,{'APPS_SCRIPT_URL':''}); await p.goto(BASE+'meet-duke/'); await p.wait_for_timeout(150)
        sw=await p.evaluate('document.documentElement.scrollWidth'); fw=await p.evaluate('document.querySelector(".frame").getBoundingClientRect().right')
        rec(f'demo @{w}: frame fits, no overflow', sw<=w and fw<=w, (sw,fw))
        await p.context.close()
    # handle validation and normalization
    p=await newpage(b,390,844,{'APPS_SCRIPT_URL':''}); await p.goto(BASE+'meet-duke/')
    await text(p,'not a handle!'); await p.wait_for_timeout(100)
    err=await p.inner_text('#err'); rec('demo: invalid handle is rejected with a message', 'Instagram handle' in err, err)
    await p.fill('#in','https://www.instagram.com/Bahia.Taste/?hl=en'); await p.click('#go'); await p.wait_for_timeout(900)
    lg=await p.inner_text('#log')
    rec('demo: instagram URL is normalized to the handle', '@Bahia.Taste' in lg, lg[-160:])
    card=await p.inner_text('.ig')
    rec('demo preview: profile card shows handle, followers, following and a sample label', '@Bahia.Taste' in card and 'followers' in card and 'following' in card and 'Sample profile' in card and 'Demo preview' in card, card)
    rec('demo preview: no photo invented for the account', not await p.evaluate('!!document.querySelector(".ig img")'))
    await p.locator('.ig').screenshot(path=SHOTS+'demo_profile_preview.png')
    rec('demo: confirmation is asked explicitly', "Is this your business's Instagram profile?" in await p.inner_text('#log') and await p.is_visible('''.chips button:text-is("Yes, that's my business")'''))
    await chip(p,"No, that's not my profile"); await p.wait_for_selector('#in', timeout=5000)
    rec('demo: rejecting the profile returns to the handle input', await p.is_visible('#in') and not await p.query_selector('.chips'))
    await text(p,'@anotherbiz'); await p.wait_for_timeout(900)
    cards=await p.evaluate('[...document.querySelectorAll(".ig .ig-user")].map(e=>e.textContent)')
    rec('demo: preview refreshes for the corrected handle', cards==['@Bahia.Taste','@anotherbiz'], cards)
    await chip(p,"Yes, that's my business"); await p.wait_for_selector('#nsel', timeout=8000)
    opts=await p.evaluate('[...document.querySelectorAll("#nsel option:not([disabled])")].map(o=>o.textContent)')
    rec('demo: niche is a select with the 18 niches and no "Other"', len(opts)==18 and 'Other' not in opts and 'Pet services' in opts, opts)
    rec('demo: Send stays disabled until a niche is chosen', await p.is_disabled('#go'))
    await pick(p,'Pet services'); await p.wait_for_timeout(700)
    lg=await p.inner_text('#log')
    i_focus=lg.find('What is your business focusing on right now?')
    rec('demo: current focus comes after niche', i_focus>lg.find('Pet services')>0, lg[-200:])
    await text(p,'grooming packages'); await p.wait_for_timeout(700)
    lg=await p.inner_text('#log')
    rec('demo: upcoming month comes after current focus', lg.find('anything in mind for the upcoming month')>i_focus)
    await chip(p,'Nothing planned yet'); await p.wait_for_selector('.result section:nth-of-type(3)', timeout=15000)
    res=await p.inner_text('.result'); chk=await p.inner_text('.checks')
    rec('demo: chosen niche is used downstream', 'pet services business' in res and 'pet services' in chk, (res[-200:],chk[:120]))
    rec('demo preview: result labeled as sample, no profile insight invented', 'Sample idea' in res and 'Your profile' not in res and 'Reading @' not in chk)
    side=await p.inner_text('#ctx'); rec('demo @390: sidebar hidden on phone, context still tracked', 'Pet services' in side)
    await p.wait_for_selector('#join', timeout=8000); lg=await p.inner_text('#log')
    rec('demo: final message invites to tag HustleQ with a copyable handle', "If you decide to post this idea, tag @hustleq.tech" in lg and await p.get_attribute('a.handle','href')=='https://www.instagram.com/hustleq.tech/', lg[-260:])
    jb=await p.evaluate("""(()=>{const b=document.getElementById('join'),m=b.closest('.msg'),r=b.getBoundingClientRect();return {inmsg:!!m&&m.textContent.includes('Join the Free Waitlist. Access opens in groups'),label:b.textContent,h:r.height,input:!!document.getElementById('in')}})()""")
    rec('demo: "Join the Free Waitlist" button sits under the waitlist message, email asked only after it', jb['inmsg'] and jb['label']=='Join the Free Waitlist' and jb['h']>=44 and not jb['input'], jb)
    await p.screenshot(path=SHOTS+'demo_final_cta_390.png', full_page=False)
    await p.click('#join'); await text(p,'a@b.co'); await p.wait_for_timeout(1500)
    lg=await p.inner_text('#log'); rec('demo preview: waitlist not connected is said plainly', "can't save signups from this preview" in lg, lg[-200:])
    await p.screenshot(path=SHOTS+'demo_result_390.png', full_page=False)
    await p.context.close()
    # live mode with mocked HustleQ API + Apps Script + First Access
    cfg={'DUKE_API_BASE':MOCK+'/duke','APPS_SCRIPT_URL':MOCK+'/exec','FIRST_ACCESS_CHECKOUT_URL':'https://buy.stripe.test/test_abc','FIRST_ACCESS_STATUS_URL':MOCK+'/status'}
    p=await newpage(b,1440,900,cfg); sent=[]; prof=[]
    async def pr(r):
        prof.append(json.loads(r.request.post_data)); await asyncio.sleep(1.2)
        await r.fulfill(status=200,content_type='application/json',body=json.dumps({'ok':True,'profile':{'username':'bahiataste','name':'Bahia <i>Taste</i>','biography':'Baianas <b>food</b>\nBrooklyn, NY','followers':1520,'following':310,'totalPosts':12345,'image_url':'javascript:alert(1)'},'insight':'Your last Reel was <b>3</b> weeks ago.'}))
    await p.route(MOCK+'/duke/demo/profile', pr)
    await p.route(MOCK+'/duke/demo/niches', J({'ok':True,'niches':[{'key':'restaurants','label':'Restaurants & food trucks'},{'key':'bbq','label':'BBQ <b>joints</b>'}]}))
    ideas=[]
    async def ir(r):
        ideas.append(json.loads(r.request.post_data))
        await r.fulfill(status=200,content_type='application/json',body=json.dumps({'ok':True,'idea':{'trend':{'name':'Real kitchen sound','what':'Close-ups.','signal':'shared more'},'format':'Reel','hook':'Hook <img src=x onerror=alert(1)>','film':'Film it','caption':'Cap','time':''}}))
    await p.route(MOCK+'/duke/demo/idea', ir)
    async def ex(r): sent.append(json.loads(r.request.post_data)); await r.fulfill(status=200,content_type='application/json',body=json.dumps({'ok':True,'signup_id':'s_d','email_sent':True}))
    await p.route(MOCK+'/exec', ex)
    await p.goto(BASE+'meet-duke/')
    hb=await p.evaluate("getComputedStyle(document.querySelector('.chat .head')).backgroundColor")
    rec('demo: chat header uses the soft lilac #EDE1F6', hb=='rgb(237, 225, 246)', hb)
    await text(p,'@bahiataste'); await p.wait_for_selector('.lookup', timeout=2000)
    ld=await p.evaluate("""(()=>({t:document.querySelector('.lookup').innerText,bar:!!document.querySelector('.lookup .bar'),busy:document.getElementById('busy')?.disabled,send:!!document.getElementById('in')}))()""")
    rec('demo live: lookup shows a loading message in the chat and blocks a second send', 'Looking up @bahiataste on Instagram' in ld['t'] and ld['bar'] and ld['busy'] is True and not ld['send'], ld)
    await p.screenshot(path=SHOTS+'demo_lookup_loading_1440.png', full_page=False)
    await p.wait_for_selector('.ig', timeout=6000)
    rec('demo live: loading message is removed when the profile arrives', not await p.query_selector('.lookup') and not await p.query_selector('#busy'))
    card=await p.inner_html('.ig'); ctext=await p.inner_text('.ig')
    rec('demo live: card shows posts and biography from the API, escaped', '12.3K' in ctext and 'posts' in ctext and 'Brooklyn, NY' in ctext and '&lt;b&gt;food' in card, ctext)
    rec('demo live: profile lookup goes to the HustleQ API, not Apify', prof==[{'handle':'bahiataste'}], prof)
    rec('demo live: profile card uses API data, escaped, no unsafe image', 'Bahia &lt;i&gt;Taste&lt;/i&gt;' in card and 'javascript:' not in card and '1,520' in ctext and '310' in ctext and 'From Instagram' in ctext and 'Sample' not in ctext, ctext)
    p2=await newpage(b,390,844,cfg)
    async def pr2(r): await r.fulfill(status=200,content_type='application/json',body=json.dumps({'ok':True,'profile':{'username':'bahiataste','name':'Bahia','followers':1,'following':2,'totalPosts':3,'image_url':'https://scontent.cdninstagram.com/x.jpg'}}))
    pics=[]
    async def img(r): pics.append(r.request.url); await r.fulfill(status=200,content_type='image/png',body=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='))
    await p2.route(MOCK+'/duke/demo/profile', pr2); await p2.route(MOCK+'/duke/demo/profile-image/**', img)
    await p2.goto(BASE+'meet-duke/'); await text(p2,'@bahiataste'); await p2.wait_for_selector('.ig img', timeout=6000); await p2.wait_for_timeout(300)
    ok=await p2.evaluate("(()=>{const i=document.querySelector('.ig img');return i&&i.complete&&i.naturalWidth>0})()")
    rec('demo live: profile photo loads through the Duke API, never straight from Instagram', ok and pics==[MOCK+'/duke/demo/profile-image/bahiataste'], pics)
    await p2.locator('.ig').screenshot(path=SHOTS+'demo_profile_live_390.png')
    await p2.context.close()
    p2=await newpage(b,390,844,cfg)
    await p2.route(MOCK+'/duke/demo/profile', pr2); await p2.route(MOCK+'/duke/demo/profile-image/**', J({},404))
    await p2.goto(BASE+'meet-duke/'); await text(p2,'@bahiataste'); await p2.wait_for_selector('.ig', timeout=6000); await p2.wait_for_timeout(500)
    rec('demo live: missing photo falls back to the initial, no broken image', not await p2.query_selector('.ig img') and (await p2.inner_text('.ig-pic')).strip()=='B')
    await p2.context.close()
    rec('demo live: ownership still has to be confirmed with real data', await p.is_visible('''.chips button:text-is("Yes, that's my business")'''))
    await chip(p,"Yes, that's my business"); await p.wait_for_selector('#nsel', timeout=8000)
    opts=await p.evaluate('[...document.querySelectorAll("#nsel option:not([disabled])")].map(o=>[o.value,o.textContent,o.innerHTML])')
    rec('demo live: niche list comes from the API, escaped', [o[1] for o in opts]==['Restaurants & food trucks','BBQ <b>joints</b>'] and '&lt;b&gt;' in opts[1][2], opts)
    await pick(p,'Restaurants & food trucks'); await text(p,'catering trays'); await chip(p,'Hosting an event')
    await p.wait_for_selector('.result section:nth-of-type(3)', timeout=15000)
    a=ideas[0]['answers'] if ideas else {}
    rec('demo live: idea request sends the niche key and the answers', a.get('niche')=='restaurants' and a.get('offer')=='catering trays' and a.get('month')=='event' and a.get('profile_confirmed') is True, a)
    res=await p.inner_text('.result'); html=await p.inner_html('.result')
    rec('demo live: no sample label, profile reason from API', 'Sample idea' not in res and 'Your profile' in res and 'Reading @' in await p.inner_text('.checks'))
    rec('demo live: API text is escaped', '<img' not in html and '&lt;img' in html)
    side=await p.inner_text('#ctx'); steps=await p.evaluate('[...document.querySelectorAll("#steps li.done")].length')
    rec('demo @1440: sidebar shows progress and what Duke knows', '@bahiataste · confirmed' in side and 'catering trays' in side and steps>=5, (side,steps))
    await p.screenshot(path=SHOTS+'demo_live_1440.png', full_page=False)
    await p.click('#join', timeout=8000); await text(p,'a@b.co'); await p.wait_for_timeout(1800)
    pl=sent[0] if sent else {}
    rec('demo live: waitlist payload has source, handle, confirmation and answers', pl.get('source')=='meet-duke' and pl.get('instagram')=='@bahiataste' and pl.get('business_name')=='Bahia <i>Taste</i>' and pl.get('demo',{}).get('month')=='event' and pl.get('demo',{}).get('instagram_confirmed') is True and pl.get('demo',{}).get('profile_simulated') is False, pl)
    vis=await p.eval_on_selector('#fa-modal',VIS); txt=await p.inner_text('#fa-modal') if vis else ''
    rec('demo: Duke First Access offered after a saved demo signup', vis and 'Get First Access · $20' in txt and "You’re on the list!" in txt, txt[:120])
    await p.click('#fa-stay'); await p.wait_for_timeout(700)
    rec('demo: staying free closes the offer and confirms in the chat', not await p.eval_on_selector('#fa-modal',VIS) and "You're on the list! I'll email you when Duke is ready for you." in await p.inner_text('#log'))
    await p.context.close()
    # save failure
    p=await newpage(b,390,844,{'APPS_SCRIPT_URL':MOCK+'/exec'})
    await p.route(MOCK+'/exec', J({},500)); await p.goto(BASE+'meet-duke/'); await run(p)
    await p.click('#join', timeout=8000); await text(p,'a@b.co'); await p.wait_for_timeout(1500)
    lg=await p.inner_text('#log'); rec('demo: save failure says not on the list and allows retry', "not on the list yet" in lg and await p.is_visible('#in'), lg[-160:])
    await p.context.close()
    # lookup failures: private, unavailable, timeout -> could not verify, ask again, never continue
    for name,h in [('HTTP 500',J({},500)),('ok:false (private)',J({'ok':False,'error':'private'})),('no profile',J({'ok':True})),('timeout','hang')]:
        async def hang(r): await asyncio.sleep(4)
        p=await newpage(b,390,844,{'DUKE_API_BASE':MOCK+'/duke','TIMEOUT_MS':1500,'PROFILE_TIMEOUT_MS':1500})
        await p.route(MOCK+'/duke/demo/profile', hang if h=='hang' else h)
        await p.goto(BASE+'meet-duke/'); await text(p,'@privatebiz')
        try: await p.wait_for_function('document.getElementById("log").innerText.includes("couldn\'t verify")', timeout=5000); await p.wait_for_timeout(200)
        except Exception: pass
        lg=await p.inner_text('#log')
        rec(f'demo: lookup {name} says it could not verify and asks for the handle again', "couldn't verify that profile" in lg and await p.is_visible('#in') and not await p.query_selector('.ig') and 'What kind of business' not in lg, lg[-160:])
        await p.context.close()
    # reduced motion: the flow still works with no animation
    p=await newpage(b,390,844,{'APPS_SCRIPT_URL':''},reduce=True); await p.goto(BASE+'meet-duke/'); await run(p, niche='Hair salon & barbershop')
    rec('demo reduced motion: full flow completes', 'Sample idea' in await p.inner_text('.result'))
    await p.context.close()

async def case(b):
    for cfg,label in [(None,'preview'),({'SHOW_DEV_BAR':False},'production')]:
        p=await newpage(b,1440,900,cfg); await p.goto(BASE+'work/bahia-taste/'); await p.wait_for_timeout(500)
        html=await p.content()
        rec(f'case [{label}]: opens directly by URL with title and h1', await p.title()=='Bahia Taste · The Work · HustleQ' and await p.inner_text('h1')=='Bahia Taste')
        rec(f'case [{label}]: noindex kept', await p.evaluate('!!document.querySelector("meta[name=robots][content=noindex]")'))
        rec(f'case [{label}]: no dining-room image', 'dining' not in html)
        first=await p.evaluate('document.querySelector(".cs-pair img").getAttribute("src")')
        rec(f'case [{label}]: first photo is the cook at the event, acarajé close-up moved out', 'cook-event' in first and 'acaraje-closeup' not in await p.evaluate('document.querySelector(".cs-pair").innerHTML'), first)
        rec(f'case [{label}]: closing image removed, closing text kept', not await p.query_selector('.cs-closing') and await p.is_visible('.cs-end p'))
        n=await p.evaluate('document.querySelectorAll(".cs-posts img").length'); caps=await p.inner_text('.cs-posts')
        rec(f'case [{label}]: Posts shows the 4 provided Bahia Taste posts with real captions', n==4 and 'Carousel · Weekly meal prep' in caps and 'placeholder' not in caps and await p.evaluate('[...document.querySelectorAll(".cs-label")].some(e=>e.textContent==="04 · Posts")'), (n,caps[:80]))
        h2=await p.evaluate('[...document.querySelectorAll("main h2")].length'); h1=await p.evaluate('document.querySelectorAll("h1").length')
        rec(f'case [{label}]: one h1 and section h2s', h1==1 and h2>=2, (h1,h2))
        alts=await p.evaluate('[...document.querySelectorAll("main img")].filter(i=>!i.getAttribute("alt")).length')
        rec(f'case [{label}]: every image has alt text', alts==0, alts)
        ph=await p.evaluate('document.querySelectorAll("main .todo").length')
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
            await layout(b); await links(b); await nav(b); await forms(b); await priority(b); await ux(b); await content(b); await viewer(b); await demo(b); await case(b)
            await b.close()
    finally: srv.terminate()
    real=[e for e in ERRS]
    rec('no JavaScript errors on any page', not real, real[:5])
    f=[r for r in R if not r[1]]; print(f'\n{len(R)-len(f)}/{len(R)} passed'); sys.exit(1 if f else 0)
asyncio.run(main())
