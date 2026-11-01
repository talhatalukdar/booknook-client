"""Phase 6 end-to-end: Add Book, My Books, edit/delete rules, borrow, return, history, isolation.
Needs: MongoDB, Express server (:5000), this app (:3000, IMGBB_API_KEY=TESTKEY-SECRET-123,
IMGBB_API_URL=http://localhost:9999/1/upload) and `node scripts/e2e/imgbb-stub.js`."""
import base64, json, re, time, urllib.request
from playwright.sync_api import sync_playwright

BASE="http://localhost:3000"; API="http://localhost:5000"
results=[]
def check(name, ok, extra=""):
    results.append((name,bool(ok))); print(("PASS " if ok else "FAIL ")+name, extra)
def api_json(path):
    with urllib.request.urlopen(API+path) as r: return json.load(r)["data"]
PNG=base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
def due(days=5): return time.strftime("%Y-%m-%d",time.gmtime(time.time()+days*86400))

def register(page,name,email):
    page.goto(BASE+"/register"); page.fill("#name",name); page.fill("#email",email); page.fill("#photoUrl","https://example.com/a.png"); page.fill("#password","Secret1")
    page.click("button[type=submit]"); page.wait_for_url(re.compile(r"/login"),timeout=20000)
def login(page,email):
    if "/login" not in page.url: page.goto(BASE+"/login")
    page.fill("#email",email); page.fill("#password","Secret1"); page.click("button[type=submit]")
    page.wait_for_function("!location.pathname.startsWith('/login')",timeout=20000)
def token(page): return page.evaluate("fetch('/api/auth/token').then(r=>r.json()).then(j=>j.token)")
def call(page,method,path,body=None):
    t=token(page)
    return page.evaluate("""async ([m,u,b,t])=>{const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:b?JSON.stringify(b):undefined});return {status:r.status,json:await r.json()}}""",[method,API+path,body,t])
def user_page(br,name,email,w=1440,h=900):
    ctx=br.new_context(viewport={"width":w,"height":h}); pg=ctx.new_page(); register(pg,name,email); time.sleep(4); login(pg,email); time.sleep(4); return pg

stamp=str(int(time.time())); TITLE=f"Phase Six Atlas {stamp}"; EDITED=f"Phase Six Atlas Revised {stamp}"
with sync_playwright() as p:
    br=p.chromium.launch()
    alice=user_page(br,"Alice Owner",f"alice{stamp}@t.dev"); bob=user_page(br,"Bob Reader",f"bob{stamp}@t.dev"); carol=user_page(br,"Carol Third",f"carol{stamp}@t.dev")
    check("three users registered and logged in", all(x.locator("button[aria-label^='Account menu']").count()==1 for x in (alice,bob,carol)))

    # ---- protection
    anon=br.new_context().new_page()
    for path in ("/add-book","/my-books","/my-borrows"):
        anon.goto(BASE+path); anon.wait_for_url(re.compile(r"/login\?callbackUrl="))
        check(f"logged-out {path} -> login with callback", path in anon.url.replace("%2F","/"))
    check("POST /api/upload without session -> 401", anon.evaluate("fetch('/api/upload',{method:'POST',body:new FormData()}).then(r=>r.status)")==401)

    # ---- Add Book: validation and upload checks
    alice.goto(BASE+"/add-book"); alice.wait_for_selector("#title")
    check("account name/email shown read-only", alice.input_value("#acc-name")=="Alice Owner" and alice.get_attribute("#acc-name","readonly") is not None and alice.input_value("#acc-email")==f"alice{stamp}@t.dev")
    alice.click("button:has-text('Add Book')"); alice.wait_for_selector("text=Choose a category")
    check("empty form shows validation errors", alice.locator("[role=alert]").count()>=5, str(alice.locator("[role=alert]").count()))
    alice.set_input_files("#cover",{"name":"a.txt","mimeType":"text/plain","buffer":b"hello"}); alice.wait_for_selector("text=Use a JPG, PNG, WebP or GIF image")
    check("non-image file rejected client-side", True)
    alice.set_input_files("#cover",{"name":"big.png","mimeType":"image/png","buffer":PNG+b"0"*(5*1024*1024)}); alice.wait_for_selector("text=4 MB or smaller")
    check("oversize image rejected", True)
    alice.set_input_files("#cover",{"name":"fake.png","mimeType":"image/png","buffer":b"this is not a png at all"}); alice.wait_for_selector("text=does not look like a valid image",timeout=10000)
    check("fake image (bad signature) rejected by server", True)

    # ---- Add Book: success
    alice.fill("#title",TITLE); alice.fill("#author","Alice Author"); alice.select_option("#category","Science"); alice.fill("#totalCopies","2")
    alice.fill("#description","A book added through the real form to test the whole library workflow end to end.")
    alice.set_input_files("#cover",{"name":"c.png","mimeType":"image/png","buffer":PNG}); alice.wait_for_selector("p:has-text('Cover uploaded')",timeout=15000)
    check("valid cover uploaded through /api/upload (stub host)", True)
    alice.click("button:has-text('Add Book')"); alice.wait_for_url(re.compile(r"/books/[0-9a-f]{24}"),timeout=20000)
    bid=alice.url.rstrip("/").split("/")[-1]
    b=api_json(f"/books/{bid}")
    check("redirected to new book details", TITLE in alice.content())
    check("saved with owner from JWT, stock = total, image from upload", b["addedByName"]=="Alice Owner" and b["addedByEmail"]==f"alice{stamp}@t.dev" and b["availableCopies"]==2 and b["totalCopies"]==2 and b["image"].startswith("https://i.ibb.co/stub/"))

    # ---- appears in All Books and My Books
    bob.goto(BASE+"/books?q="+f"Phase Six Atlas {stamp}"); bob.wait_for_selector("article")
    check("appears in All Books", bob.locator(f"article:has-text('{TITLE}')").count()==1)
    alice.goto(BASE+"/my-books"); alice.wait_for_selector(f"li:has-text('{TITLE}')")
    check("appears in Alice's My Books", True)
    bob.goto(BASE+"/my-books"); bob.wait_for_selector("text=You have not added any books yet")
    check("ownership isolation: Bob's My Books is empty", True)

    # ---- edit
    alice.click(f"li:has-text('{TITLE}') >> text=Edit"); alice.wait_for_selector("text=Save changes")
    alice.fill("[role=dialog] #title",EDITED); alice.fill("[role=dialog] #totalCopies","3"); alice.click("text=Save changes")
    alice.wait_for_selector(f"li:has-text('{EDITED}')",timeout=10000)
    e=api_json(f"/books/{bid}")
    check("edit saved; total 3, available 3, owner & addedAt unchanged", e["title"]==EDITED and e["totalCopies"]==3 and e["availableCopies"]==3 and e["addedByUserId"]==b["addedByUserId"] and e["addedAt"]==b["addedAt"])
    check("edit visible in All Books", bob.goto(BASE+f"/books?q={EDITED}") and (bob.wait_for_selector("article") is not None) and bob.locator(f"article:has-text('{EDITED}')").count()==1)

    # ---- other user cannot edit/delete; ownership fields rejected
    r=call(bob,"PATCH",f"/books/{bid}",{"title":"Hijack"}); check("Bob cannot edit Alice's book (403)", r["status"]==403)
    r=call(bob,"DELETE",f"/books/{bid}"); check("Bob cannot delete Alice's book (403)", r["status"]==403)
    r=call(alice,"PATCH",f"/books/{bid}",{"addedByUserId":"bob","addedByEmail":"x@y.z"}); check("owner cannot change ownership fields (400)", r["status"]==400)
    r=call(alice,"PATCH",f"/books/{bid}",{"availableCopies":99}); check("availableCopies cannot be set directly (400)", r["status"]==400)
    check("book unchanged after attacks", api_json(f"/books/{bid}")["title"]==EDITED)

    # ---- borrow from another account
    bob.goto(BASE+f"/books/{bid}"); bob.click("button:has-text('Borrow This Book')"); bob.click("button:has-text('Confirm Borrow')"); bob.wait_for_selector("text=2 copies available",timeout=15000)
    check("stock after Bob borrows: 3 -> 2", api_json(f"/books/{bid}")["availableCopies"]==2)
    r=call(carol,"POST","/borrows",{"bookId":bid,"returnDate":due()}); check("Carol borrows too; stock 1", r["status"]==201 and api_json(f"/books/{bid}")["availableCopies"]==1)

    # ---- active borrows protect the book
    alice.goto(BASE+"/my-books"); alice.wait_for_selector(f"li:has-text('{EDITED}')")
    check("My Books shows '2 on loan' and disables Delete", alice.locator(f"li:has-text('{EDITED}') >> text=2 on loan").count()==1 and alice.locator(f"li:has-text('{EDITED}') >> button:has-text('Delete')").is_disabled())
    r=call(alice,"DELETE",f"/books/{bid}"); check("API refuses delete with active borrows (409)", r["status"]==409, r["json"]["message"])
    alice.click(f"li:has-text('{EDITED}') >> text=Edit"); alice.fill("[role=dialog] #totalCopies","1"); alice.click("text=Save changes")
    alice.wait_for_selector("text=2 copies are on loan"); check("UI blocks lowering total below copies on loan", True)
    r=call(alice,"PATCH",f"/books/{bid}",{"totalCopies":1}); check("API blocks lowering total below on-loan (409)", r["status"]==409, r["json"]["message"])
    alice.keyboard.press("Escape")
    r=call(alice,"PATCH",f"/books/{bid}",{"totalCopies":5}); a=api_json(f"/books/{bid}")
    check("raising total keeps loans consistent (5 total, 3 available)", r["status"]==200 and a["totalCopies"]==5 and a["availableCopies"]==3)

    # ---- return through My Borrows
    bob.goto(BASE+"/my-borrows"); bob.wait_for_selector(f"li:has-text('{EDITED}')")
    check("Bob's My Borrows lists the active borrow with Borrowed status", bob.locator(f"li:has-text('{EDITED}') >> text=Borrowed").count()>=1)
    alice.goto(BASE+"/my-borrows"); alice.wait_for_selector("text=You have not borrowed anything yet")
    check("ownership isolation: Alice's My Borrows is empty", True)
    bob.click(f"li:has-text('{EDITED}') >> button:has-text('Return Book')"); bob.get_by_role("dialog").get_by_role("button",name="Return Book").click()
    bob.locator(f"li:has-text('{EDITED}') >> span:text-is('Returned')").wait_for(timeout=10000)
    check("return via UI: stock restored exactly once (3 -> 4)", api_json(f"/books/{bid}")["availableCopies"]==4)
    check("history preserved: row stays with Returned status, no Return button", bob.locator(f"li:has-text('{EDITED}') >> button:has-text('Return Book')").count()==0)
    bobs=call(bob,"GET","/borrows")["json"]["data"]; rid=[x for x in bobs if x["status"]=="returned"][0]["_id"]
    r=call(bob,"DELETE",f"/borrows/{rid}"); check("duplicate return rejected (409), stock still 4", r["status"]==409 and api_json(f"/books/{bid}")["availableCopies"]==4, r["json"]["message"])
    cb=call(carol,"GET","/borrows")["json"]["data"][0]["_id"]
    r=call(alice,"DELETE",f"/borrows/{cb}"); check("Alice cannot return Carol's borrow (403)", r["status"]==403 and api_json(f"/books/{bid}")["availableCopies"]==4)
    outs=carol.evaluate("""async ([api,id,t])=>Promise.all([1,2,3].map(()=>fetch(api+'/borrows/'+id,{method:'DELETE',headers:{Authorization:'Bearer '+t}}).then(r=>r.status)))""",[API,cb,token(carol)])
    check("3 simultaneous returns: exactly one succeeds", sorted(outs)==[200,409,409], str(outs))
    a=api_json(f"/books/{bid}"); check("stock exactly total (5/5), never above", a["availableCopies"]==5 and a["availableCopies"]<=a["totalCopies"])
    r=call(bob,"POST","/borrows",{"bookId":bid,"returnDate":due(3)}); check("can borrow again after returning", r["status"]==201)
    bob.goto(BASE+"/my-borrows"); bob.wait_for_selector(f"li:has-text('{EDITED}')")
    check("Bob's history shows both the returned and the new active record", bob.locator(f"li:has-text('{EDITED}')").count()==2)
    call(bob,"DELETE",f"/borrows/{call(bob,'GET','/borrows')['json']['data'][0]['_id']}")

    # ---- delete after everything is returned (UI, custom dialog)
    alice.goto(BASE+"/my-books"); alice.wait_for_selector(f"li:has-text('{EDITED}')")
    alice.click(f"li:has-text('{EDITED}') >> button:has-text('Delete')"); alice.wait_for_selector("text=Delete this book?")
    check("custom confirm dialog shown (no browser alert)", alice.locator("text=This cannot be undone").count()==1)
    alice.get_by_role("dialog").get_by_role("button",name="Delete Book").click(); alice.wait_for_selector(f"li:has-text('{EDITED}')",state="detached",timeout=10000)
    alice.wait_for_selector("text=You have not added any books yet")
    try: urllib.request.urlopen(API+f"/books/{bid}"); gone=False
    except urllib.error.HTTPError as ex: gone=ex.code==404
    check("book deleted from database", gone)
    bob.goto(BASE+"/my-borrows"); bob.wait_for_selector(f"li:has-text('{EDITED}')")
    check("borrow history survives book deletion", bob.locator(f"li:has-text('{EDITED}')").count()==2)

    # ---- responsive
    for name,url in (("add-book","/add-book"),("my-books","/my-books"),("my-borrows","/my-borrows")):
        for w,h in ((390,844),(820,1100)):
            m=user_page(br,"Mia Mobile",f"m{name}{w}{stamp}@t.dev",w,h) if name=="add-book" and w==390 else None
            pg=m or alice if name!="my-borrows" else bob
            pg.set_viewport_size({"width":w,"height":h}); pg.goto(BASE+url); pg.wait_for_timeout(1200)
            check(f"{url} no horizontal overflow at {w}px", pg.evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth"))
            if w==390: pg.screenshot(path=f"/tmp/p6-{name}-mobile.png",full_page=True)
    bob.set_viewport_size({"width":1440,"height":900}); bob.goto(BASE+"/my-borrows"); bob.wait_for_selector("li"); bob.screenshot(path="/tmp/p6-borrows-desktop.png")
    alice.set_viewport_size({"width":1440,"height":1300}); alice.goto(BASE+"/add-book"); alice.wait_for_selector("#title"); alice.screenshot(path="/tmp/p6-add-desktop.png")
    br.close()
bad=[r for r in results if not r[1]]; print(f"\n{len(results)-len(bad)}/{len(results)} passed")
