import json, re, subprocess, time, urllib.request
from playwright.sync_api import sync_playwright, expect

BASE="http://localhost:3000"; API="http://localhost:5000"
results=[]
def check(name, ok, extra=""):
    results.append((name, bool(ok), extra)); print(("PASS " if ok else "FAIL ")+name, extra)

def api_json(path):
    with urllib.request.urlopen(API+path) as r: return json.load(r)["data"]

def register(page, name, email):
    page.goto(BASE+"/register"); page.fill("#name",name); page.fill("#email",email)
    page.fill("#photoUrl","https://example.com/a.png"); page.fill("#password","Secret1")
    page.click("button[type=submit]"); page.wait_for_url(re.compile(r"/login"), timeout=20000)

def login(page, email, expect_url=None):
    if "/login" not in page.url: page.goto(BASE+"/login")
    page.fill("#email",email); page.fill("#password","Secret1"); page.click("button[type=submit]")
    page.wait_for_function("!location.pathname.startsWith('/login')", timeout=20000)

def token(page):
    return page.evaluate("fetch('/api/auth/token').then(r=>r.json()).then(j=>j.token)")

def call(page, method, path, body=None):
    tok=token(page)
    return page.evaluate("""async ([m,u,b,t])=>{const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:b?JSON.stringify(b):undefined});return {status:r.status,json:await r.json()}}""",[method,API+path,body,tok])

stamp=str(int(time.time()))
A=f"alice{stamp}@test.dev"; B=f"bob{stamp}@test.dev"
with sync_playwright() as p:
    br=p.chromium.launch()
    ctxA=br.new_context(viewport={"width":1440,"height":900}); pa=ctxA.new_page()
    register(pa,"Alice Owner",A); check("register redirects to login", "/login" in pa.url)
    # bad password blocked on the client and the server
    pa.goto(BASE+"/register"); pa.fill("#name","X Y"); pa.fill("#email","x@y.dev"); pa.fill("#photoUrl","https://e.com/a.png"); pa.fill("#password","alllower1"); pa.click("button[type=submit]")
    check("weak password blocked (no uppercase)", pa.locator("text=uppercase letter").count()>0 and "/register" in pa.url)
    pa.goto(BASE+"/login"); login(pa,A); check("login works, session established", pa.locator("button[aria-label^='Account menu']").count()==1)
    pa.reload(); check("session persists after reload", pa.locator("button[aria-label^='Account menu']").count()==1)
    # seed 14 books as Alice through the real API with her real JWT
    cats=["Fiction","Science","History","Kids","Others"]; ids={}
    for i in range(14):
        title=f"Salt Road {i}" if i<3 else f"Quiet Orchard {i}"
        r=call(pa,"POST","/books",{"title":title,"author":"Amina Rahman" if i%2 else "D. K. Mercer","category":cats[i%5],"image":"https://invalid.example/c.jpg","description":"A seeded test book for the integration run, long enough to pass validation.","totalCopies":3 if i else 1})
        assert r["status"]==201, r
        ids[i]=r["json"]["data"]["_id"]
    check("seeded 14 books via POST /books (JWT)", len(ids)==14)
    tok_bad=pa.evaluate("fetch('%s/books',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(r=>r.status)"%API)
    check("POST /books without token -> 401", tok_bad==401)

    # ---- public All Books (logged out)
    anon=br.new_context(viewport={"width":1440,"height":900}); pg=anon.new_page()
    pg.goto(BASE+"/books"); pg.wait_for_selector("article")
    n1=pg.locator("article").count(); check("All Books loads 12 on page 1", n1==12, f"{n1}")
    check("pagination shows Page 1 of 2", pg.locator("text=Page 1 of 2").count()==1)
    pg.click("text=Next"); pg.wait_for_selector("text=Page 2 of 2"); pg.wait_for_function("document.querySelectorAll('article').length==2")
    check("page 2 has the remaining 2 books", pg.locator("article").count()==2)
    pg.goto(BASE+"/books"); pg.wait_for_selector("article"); pg.fill("input[type=search]","Salt Road"); pg.wait_for_function("document.querySelectorAll('article').length==3", timeout=8000)
    check("search by title -> 3 results", pg.locator("article").count()==3 and "q=Salt" in pg.url)
    pg.goto(BASE+"/books"); pg.wait_for_selector("article"); pg.click("button:has-text('Science')"); pg.wait_for_function("location.search.includes('category=Science')")
    pg.wait_for_timeout(800); cn=pg.locator("article").count()
    check("category filter Science", cn==len([i for i in range(14) if cats[i%5]=='Science']), f"{cn}")
    pg.fill("input[type=search]","Nothing matches zzz"); pg.wait_for_selector("text=No books match your search", timeout=8000)
    check("empty state shown", True)
    pg.click("text=Clear filters >> nth=0"); pg.wait_for_selector("article")
    check("clear filters restores the list", pg.locator("article").count()==12)
    pg.fill("input[type=search]","Amina"); pg.wait_for_timeout(1200)
    check("search by author", pg.locator("article").count()==7, f"{pg.locator('article').count()}")

    # ---- logged-out borrow protection
    bid=ids[1]
    pg.goto(f"{BASE}/books/{bid}"); pg.wait_for_url(re.compile(r"/login\?callbackUrl="))
    check("logged-out details -> /login?callbackUrl", f"/books/{bid}" in pg.url.replace("%2F","/"))

    # ---- register + login Bob, returns to the book
    register(pg,"Bob Reader",B); pg.goto(f"{BASE}/books/{bid}")
    pg.wait_for_url(re.compile(r"/login")); login(pg,B)
    pg.wait_for_url(f"{BASE}/books/{bid}", timeout=20000); check("after login returns to original book page", True)
    check("details title is dynamic", "Book Details" in pg.title(), pg.title())
    pg.wait_for_selector("text=Available: 3 copies"); check("details show real availability 3/3", True)
    for label in ["Total copies","Available copies","Added by","Added on"]: assert pg.locator(f"dt:has-text('{label}')").count()==1
    check("details show copies, added-by and date", pg.locator("dd:has-text('Alice Owner')").count()==1)

    # ---- successful borrow
    pg.click("button:has-text('Borrow This Book')"); pg.wait_for_selector("text=Confirm Borrow")
    check("modal shows read-only name/email", pg.input_value("#bn-name")=="Bob Reader" and pg.input_value("#bn-email")==B)
    pg.click("button:has-text('Confirm Borrow')"); pg.wait_for_selector("text=You have borrowed this book", timeout=15000)
    pg.wait_for_selector("text=Available: 2 copies", timeout=15000)
    check("borrow succeeded; availability refreshed 3 -> 2", True)
    check("DB availableCopies is 2", api_json(f"/books/{bid}")["availableCopies"]==2)
    # ---- duplicate active borrow
    d=call(pg,"POST","/borrows",{"bookId":bid,"returnDate":time.strftime("%Y-%m-%d",time.gmtime(time.time()+5*86400))})
    check("duplicate active borrow rejected (409)", d["status"]==409, d["json"].get("message",""))
    check("stock unchanged after duplicate", api_json(f"/books/{bid}")["availableCopies"]==2)
    pg.reload(); check("button disabled for already-borrowed book after reload", pg.locator("button:has-text('You have borrowed this book')").is_disabled())

    # ---- out of stock (book 0 has 1 copy): Bob takes it, Alice sees Not Available
    one=ids[0]; pg.goto(f"{BASE}/books/{one}"); pg.click("button:has-text('Borrow This Book')"); pg.click("button:has-text('Confirm Borrow')")
    pg.wait_for_selector("text=Not Available", timeout=15000)
    check("last copy borrowed -> availability 0", api_json(f"/books/{one}")["availableCopies"]==0)
    pa.goto(f"{BASE}/books/{one}"); pa.wait_for_selector("h1")
    check("out-of-stock: Borrow button disabled with 'Not Available'", pa.locator("button:has-text('Not Available')").is_disabled())
    r=call(pa,"POST","/borrows",{"bookId":one,"returnDate":time.strftime("%Y-%m-%d",time.gmtime(time.time()+5*86400))})
    check("out-of-stock borrow rejected by API (409)", r["status"]==409, r["json"].get("message",""))
    check("stock stays 0 (never negative)", api_json(f"/books/{one}")["availableCopies"]==0)
    r=call(pa,"POST","/borrows",{"bookId":bid,"returnDate":"2020-01-01"}); check("past return date -> 400", r["status"]==400)
    check("Alice cannot see Bob's borrows", len(call(pa,"GET","/borrows")["json"]["data"])==0)
    check("Bob sees his 2 borrows", len(call(pg,"GET","/borrows")["json"]["data"])==2)

    # ---- 404 for unknown id
    pg.goto(f"{BASE}/books/64b7f0f4f4d3a2b1c0e9d8a7"); check("unknown book id -> custom 404", pg.locator("text=Back to Home").count()==1)
    pg.goto(f"{BASE}/books/not-an-id"); check("invalid id -> custom 404", pg.locator("text=Back to Home").count()==1)

    # ---- responsive
    for name,(w,h) in {"mobile":(390,844),"tablet":(820,1100)}.items():
        mc=br.new_context(viewport={"width":w,"height":h}); mp=mc.new_page(); mp.goto(BASE+"/books"); mp.wait_for_selector("article")
        mp.screenshot(path=f"/tmp/books-{name}.png",full_page=True)
        check(f"/books no horizontal overflow at {w}px", mp.evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth"))
    pg.set_viewport_size({"width":390,"height":844}); pg.goto(f"{BASE}/books/{bid}"); pg.wait_for_selector("h1")
    check("details no overflow at 390px", pg.evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth"))
    pg.screenshot(path="/tmp/details-mobile.png", full_page=True)
    pg.set_viewport_size({"width":1440,"height":900}); pg.goto(f"{BASE}/books/{ids[2]}"); pg.wait_for_selector("h1"); pg.click("button:has-text('Borrow This Book')"); pg.wait_for_selector("text=Confirm Borrow"); pg.screenshot(path="/tmp/modal.png")
    pg.keyboard.press("Escape")
    pa.goto(BASE+"/books"); pa.wait_for_selector("article"); pa.screenshot(path="/tmp/books-desktop.png")
    pa.goto(f"{BASE}/books/{ids[2]}"); pa.wait_for_selector("h1"); pa.screenshot(path="/tmp/details-desktop.png")
    br.close()
bad=[r for r in results if not r[1]]; print(f"\n{len(results)-len(bad)}/{len(results)} passed")
