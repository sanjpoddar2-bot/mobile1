# Billing Alert SPA — Full Protection Stack

## File Structure
```
billing-alert-spa/
├── index.html          ← Hardened shell
├── robots.txt          ← Blocks 40+ copier tools & all bots
├── .htaccess           ← Apache server-level bot blocking + security headers
├── _headers            ← Netlify / Cloudflare Pages security headers
├── README.md
└── src/
    ├── main.js         ← Entry point + bot/headless detection
    ├── App.js          ← UI (strings obfuscated via charCode)
    ├── protection.js   ← 6 client-side protection layers
    ├── styles.css.js   ← CSS as chunked Base64 (NOT plain CSS)
    └── bgImage.js      ← Background image as Base64 data URI
```

## Protection Layers

### Server-Side (robots.txt + .htaccess)
| What | How |
|------|-----|
| robots.txt | Declares 40+ blocked User-Agents including HTTrack, WebCopier, wget, curl, Scrapy |
| .htaccess | Hard-blocks those User-Agents at the server — request never reaches the page |
| .htaccess | Blocks direct URL access to /src/*.js files |
| .htaccess | Disables directory listing |
| .htaccess | Sets X-Frame-Options: DENY (no iframe embedding) |
| .htaccess | Content-Security-Policy (only your domain can load scripts) |
| _headers | Same headers for Netlify/Cloudflare |

### Client-Side (JS modules)
| Layer | File | What |
|-------|------|------|
| 1 | protection.js | Right-click blocked |
| 2 | protection.js | F12, Ctrl+Shift+I/J/C, Ctrl+U/S/A/P blocked |
| 3 | protection.js | Text select, drag, copy, cut blocked |
| 4 | protection.js | DevTools detection (timing + window size + print) |
| 5 | protection.js | Console poisoned |
| 6 | styles.css.js | CSS served as Base64 blob, never as plain CSS |
| + | App.js | Phone number as String.fromCharCode() |
| + | main.js | Headless/bot UA detection → blank page |
| + | index.html | noindex, no-cache, no referrer meta tags |

## How to Run
```bash
npx serve .
# or
python3 -m http.server 3000
```

## Honest Note on robots.txt
robots.txt is a **polite request**, not a technical block.
Legitimate tools (Google, Bing) respect it. Malicious copiers may ignore it.
That is why .htaccess provides the hard technical block at the server level.
Together they cover both cooperative and uncooperative tools.
