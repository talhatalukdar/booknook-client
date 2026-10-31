// TEST-ONLY stand-in for api.imgbb.com so the upload flow can be exercised offline.
// Real imgbb is NOT contacted by the automated tests.
const http = require("http");
let n = 0;
http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    res.setHeader("Content-Type", "application/json");
    if (req.method !== "POST" || url.pathname !== "/1/upload" || url.searchParams.get("key") !== "TESTKEY-SECRET-123") {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false }));
    }
    req.resume();
    req.on("end", () => res.end(JSON.stringify({ success: true, data: { display_url: `https://i.ibb.co/stub/cover-${++n}.png` } })));
  })
  .listen(9999);
