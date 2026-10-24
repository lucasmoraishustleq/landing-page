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
    await p.wait_for_timeout(1700)
    late=await p.evaluate('[...document.querySelectorAll(".intro .seq")].every(e=>parseFloat(getComputedStyle(e).opacity)>0.99)')
    below=await p.evaluate('document.querySelector("#faq") && document.querySelectorAll(".rv:not(.in)").length>0')
    rec('hero enters progressively and finishes within 1.7 s; lower sections wait for scroll', early<0.5 and late and below, (early,late,below))
    await p.context.close()
    p=await newpage(b,1440,900,reduce=True); await p.goto(BASE); await p.wait_for_timeout(80)
    allv=await p.evaluate('[...document.querySelectorAll(".intro .seq, .rv:not(.stagger), .rv.stagger > *")].every(e=>parseFloat(getComputedStyle(e).opacity)>0.99)')
    rec('reduced motion: everything visible immediately, no entrance animation', allv)
    await p.context.close()

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
        rec(f'case [{label}]: no photos of people (logo replaces them)', not any(x in html for x in ['frying-smile','frying-acaraje','event-stall']))
        n=await p.evaluate('document.querySelectorAll(".cs-posts img").length'); caps=await p.inner_text('.cs-posts')
        rec(f'case [{label}]: 6 post images, placeholder captions only in preview', n==6 and (('caption placeholder' in caps)==(label=='preview')), (n,caps[:60]))
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
            await layout(b); await links(b); await nav(b); await forms(b); await priority(b); await ux(b); await demo(b); await case(b)
            await b.close()
    finally: srv.terminate()
    real=[e for e in ERRS]
    rec('no JavaScript errors on any page', not real, real[:5])
    f=[r for r in R if not r[1]]; print(f'\n{len(R)-len(f)}/{len(R)} passed'); sys.exit(1 if f else 0)
asyncio.run(main())
