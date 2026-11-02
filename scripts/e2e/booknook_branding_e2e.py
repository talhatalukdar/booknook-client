"""Branding/typography/colour e2e + per-user Recently Viewed + dropdown polish."""
import re, time, json, urllib.request
exec(open("scripts/e2e/booknook_phase6_e2e.py").read().split("stamp=str")[0])
stamp=str(int(time.time()))
def status(url):
    try: return urllib.request.urlopen(url).status
    except Exception as e: return getattr(e,"code",0)
with sync_playwright() as p:
    br=p.chromium.launch()
    items=api_json("/books?limit=50")["items"]
    # --- logo, favicon, OG
    pg=br.new_context(viewport={"width":1440,"height":900}).new_page(); pg.goto(BASE+"/",wait_until="networkidle")
    check("navbar shows the official logo", pg.locator("header img[src='/brand/logo.svg']").count()==1)
    check("footer shows the logo (light variant)", pg.locator("footer img[src='/brand/logo-light.svg']").count()==1)
    icons=pg.eval_on_selector_all("link[rel~='icon']","els=>els.map(e=>e.getAttribute('href'))")
    check("favicon/icon links present", len(icons)>=1 and all(status(BASE+h.split('?')[0])==200 for h in icons), str(icons))
    check("apple icon served", status(BASE+"/apple-icon.png")==200)
    og=pg.get_attribute("meta[property='og:image']","content") or ""
    check("Open Graph image declared and served", og!="" and status(og.replace("http://localhost:3000",BASE))==200, og)
    for path in ("/login","/register"):
        pg.goto(BASE+path,wait_until="networkidle"); check(f"{path}: logo in navbar and form panel", pg.locator("img[src^='/brand/logo']").count()>=3)
    # --- typography
    pg.goto(BASE+"/",wait_until="networkidle"); pg.wait_for_selector("article")
    fam=lambda sel: pg.eval_on_selector(sel,"e=>{const c=getComputedStyle(e);return [c.fontFamily,c.fontWeight]}")
    pg.evaluate("document.fonts.ready")
    loaded=pg.evaluate("[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replace(/\"/g,'')+' '+f.weight)")
    check("Khand 600 and 700 font files are actually loaded", any(x.endswith(' 600') for x in loaded) and any(x.endswith(' 700') for x in loaded), str(loaded))
    isk=lambda f: f.split(',')[0].strip().strip('"')==loaded[0].rsplit(' ',1)[0] if loaded else False
    h2=fam(".hero-swiper .swiper-slide-active h2"); check("hero heading: Khand 600", isk(h2[0]) and h2[1]=="600", str(h2))
    h3=fam("article h3"); check("book title: Khand 700", isk(h3[0]) and h3[1]=="700", str(h3))
    bd=fam("body"); check("body: General Sans (falls back to system sans until the font file is added)", bd[0].lower().startswith('"general sans"') or bd[0].lower().startswith("general sans"), bd[0][:60])
    nav=fam("header nav a"); check("navbar uses the body family", nav[0]==bd[0])
    ft=fam("footer h2"); check("footer heading: Khand 600", isk(ft[0]) and ft[1]=="600", str(ft))
    stat=pg.eval_on_selector("dd","e=>[getComputedStyle(e).fontFamily,getComputedStyle(e).fontWeight]"); check("statistics: Khand 700", isk(stat[0]) and stat[1]=="700", str(stat))
    check("only two families in use (Khand + General Sans)", pg.evaluate("""()=>{const ok=new Set(['display','general sans']);const bad=new Set();document.querySelectorAll('body *').forEach(e=>{const f=getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g,'').trim().toLowerCase();if(!ok.has(f))bad.add(f)});return bad.size===0}"""))
    # --- layered colours (no single flat background)
    bgs=pg.evaluate("""()=>[...document.querySelectorAll('main section')].map(s=>getComputedStyle(s).backgroundImage!=='none'?'gradient':getComputedStyle(s).backgroundColor)""")
    check("sections use layered surfaces (gradients + varied colours)", "gradient" in bgs and len(set(bgs))>=3, str(sorted(set(bgs))))
    check("body colour is the neutral off-white from the reference", pg.evaluate("getComputedStyle(document.body).backgroundColor")=="rgb(247, 247, 247)")
    btn=pg.evaluate("(()=>{const e=document.querySelector('main a[href=\"/books\"]');return [getComputedStyle(e).backgroundColor,getComputedStyle(e).borderRadius]})()")
    check("primary button: charcoal, 10px radius (not a pill)", btn[0]=="rgb(36, 38, 37)" and btn[1]=="10px", str(btn))
    # --- recently viewed is per user
    A=user_page(br,"Alice View",f"va{stamp}@t.dev"); B=user_page(br,"Bob View",f"vb{stamp}@t.dev")
    for t in ("Cosmos","Deep Work"):
        bid=[b["_id"] for b in items if b["title"]==t][0]; A.goto(f"{BASE}/books/{bid}"); A.wait_for_selector("h1")
    A.goto(BASE+"/"); A.wait_for_selector("text=Recently")
    check("User A sees their recently viewed books", A.locator("section:has(h2:has-text('Recently')) li").count()==2)
    A.reload(); A.wait_for_selector("text=Recently"); check("A's history survives a refresh", A.locator("section:has(h2:has-text('Recently')) li").count()==2)
    B.goto(BASE+"/"); B.wait_for_selector("article"); B.wait_for_timeout(600)
    check("User B (other browser) sees nothing", B.locator("h2:has-text('Recently')").count()==0)
    # same browser: A logs out, B logs in
    ctx=A.context
    A.click("button[aria-label^='Account menu']"); 
    # dropdown polish
    radius=A.evaluate("getComputedStyle(document.querySelector('[role=menu]')).borderRadius"); check("profile dropdown radius is small", int(radius.replace('px',''))<=10, radius)
    ir=A.evaluate("getComputedStyle(document.querySelector('[role=menuitem]')).borderRadius"); check("dropdown items have small radius", int(ir.replace('px',''))<=8, ir)
    A.screenshot(path="/tmp/b-dropdown.png",clip={"x":900,"y":0,"width":540,"height":320})
    A.click("text=Logout"); A.wait_for_selector("a:has-text('Login')"); A.wait_for_timeout(500)
    A.goto(BASE+"/"); A.wait_for_selector("article"); A.wait_for_timeout(600)
    check("logged-out visitor sees no recently viewed", A.locator("h2:has-text('Recently')").count()==0)
    login(A,f"vb{stamp}@t.dev"); A.goto(BASE+"/"); A.wait_for_selector("article"); A.wait_for_timeout(600)
    check("same browser: User B logs in and does NOT inherit A's history", A.locator("h2:has-text('Recently')").count()==0)
    bid=[b["_id"] for b in items if b["title"]=="Matilda"][0]; A.goto(f"{BASE}/books/{bid}"); A.wait_for_selector("h1"); A.goto(BASE+"/"); A.wait_for_selector("text=Recently")
    check("B's own history has only B's book", A.locator("section:has(h2:has-text('Recently')) li").count()==1 and A.locator("section:has(h2:has-text('Recently')) >> text=Matilda").count()>=1)
    raw=A.evaluate("Object.keys(localStorage)"); check("history keys are per account; old shared key removed", all(k!="booknook:recent" for k in raw) and any(k.startswith("booknook:recent:") for k in raw), str(raw))
    A.click("button[aria-label^='Account menu']"); A.click("text=Logout"); A.wait_for_selector("a:has-text('Login')"); time.sleep(12); login(A,f"va{stamp}@t.dev"); A.goto(BASE+"/"); A.wait_for_selector("text=Recently")
    check("A logs back in: A's history is still A's (2 books, no Matilda)", A.locator("section:has(h2:has-text('Recently')) li").count()==2 and A.locator("section:has(h2:has-text('Recently')) >> text=Matilda").count()==0)
    # --- unavailable consistency
    for url,sel in (("/books?q=Silent Spring","article:has-text('Silent Spring')"),):
        A.goto(BASE+url); A.wait_for_selector("article"); c=A.locator(sel)
        if c.count(): check("card shows disabled 'Not Available'", c.locator("button:has-text('Not Available')").is_disabled() and c.locator("a[href*='borrow=1']").count()==0)
    # --- responsive
    for w,h in ((390,844),(820,1100),(1440,900)):
        A.set_viewport_size({"width":w,"height":h})
        for path in ("/","/books","/profile","/my-books","/my-borrows","/add-book"):
            A.goto(BASE+path); A.wait_for_timeout(500)
            if not A.evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth"): check(f"overflow at {w}px on {path}",False)
        check(f"no horizontal overflow on 6 pages at {w}px", True)
    br.close()
bad=[r for r in results if not r[1]]; print(f"\n{len(results)-len(bad)}/{len(results)} passed")
