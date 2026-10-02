# Stellora Travels

Four-page Angular website with a PHP email enquiry endpoint, prepared for Hostinger.

## Included

- Home, About Us, Services and Contact Us routes, prerendered to static HTML at build time (Angular `outputMode: static`) with hydration. Unknown URLs fall back to `index.csr.html`, which renders the 404 page.
- Lenis smooth scroll (`src/app/smooth-scroll.ts`) driven by GSAP's ticker and synced to ScrollTrigger; disabled for `prefers-reduced-motion`.
- Pinned "coast road" journey on the home page (Kanyakumari to Varkala, south to north): an SVG route draws on scroll while a car follows it and each stop's photo wipes in. Mobile, reduced motion and no-JS get a plain card grid.
- "How it works" steps and an FAQ (native `<details>`, no JS) on the home page. FAQ answers use only facts already on the site; FAQPage and TravelAgency JSON-LD is added to `<head>` so it is in the prerendered HTML. Update `faqs` in `src/app/data.ts` and the schema follows.
- Quick-form "Prefer WhatsApp?" link that builds the message from the typed details.
- Layered animated hero, desktop pinned horizontal service cards, stacked service spotlights, scroll reveals and reduced-motion alternatives.
- Service filters, destination links with prefilled enquiries, phone and optional WhatsApp links.
- PHP validation, honeypot, same-origin checks, rate limiting and authenticated SMTP through PHPMailer 7.1.1.
- Local fonts, optimised destination photography and generated vehicle illustrations.
- Source code in this folder. Compiled upload files in `release/`.

## Current status

- Angular production compilation passes and prerenders 4 routes. Initial JS/CSS estimated transfer: approximately 139 kB, excluding fonts and images.
- PHP syntax check passes in PHP 8.3 (WebAssembly runtime).
- 12 PHP request checks passed: method/content type, malformed JSON, empty payload, invalid/past dates, invalid email, header injection, honeypot, missing SMTP and service-specific fields.
- Browser visual, mobile interaction and animation QA could not be completed: the managed preview failed because Angular's memory telemetry is unsupported in its restricted runtime. This does not occur during the successful ordinary production compilation. Test the deployed site in desktop and mobile browsers before launch.
- No live email was sent. SMTP delivery, rate-limit persistence and Hostinger Apache routing must be verified on the target host.
- Not deployed to your Hostinger account. No hosting or email credentials were provided.

## Local frontend development

Use Node.js 22.12+ or 24.x.

```bash
npm ci
npm start
```

Angular runs on port 4173. PHP requests are proxied to port 8080; start PHP separately if testing the endpoint locally. Without PHP/SMTP the form reports a failure instead of pretending to send.

```bash
npm run build
php -S 127.0.0.1:8080 -t release/public_html
```

Put local email configuration in `release/stellora-private/config.php`. The local form origin must match the configured origin exactly. Never share or commit that file. Do not use `config.example.php` as live configuration without completing it.

The optional `npm run dev` wrapper supports supervised preview flags. Normal local work should use `npm start`.

## Deploy to Hostinger

Use a hosting plan supporting PHP 8.2 or later and HTTPS. This website needs no Node.js server in production.

1. Back up an existing website before replacing its files. Do not overwrite another project's configuration without review.
2. Upload the **contents** of `release/public_html/` to the domain's `public_html/`. Include the hidden `.htaccess` file.
3. Upload the `release/stellora-private/` directory alongside `public_html/`, not inside it:

```text
domain-directory/
  public_html/
    index.html
    .htaccess
    assets/
    media/
    api/enquiry.php
    main-....js
    styles-....css
  stellora-private/
    config.php
    vendor/phpmailer/src/
```

4. Copy `config.example.php` to `config.php` inside `stellora-private/`. Complete `origin`, SMTP hostname, port, encryption, mailbox username/password, and `from_email` using your email provider's settings.
5. Set `origin` to the exact HTTPS origin used by visitors, without a path. Redirect the other www/non-www variant to this canonical origin using Hostinger's domain configuration.
6. Use an authenticated mailbox on your domain as the sender. The recipient remains `stelloratravels@gmail.com`. Do not put the Gmail destination address in `from_email` unless it is also the authenticated SMTP mailbox you intentionally configured. Set the provider's SPF/DKIM records as supplied by that provider.
7. Generate a random `rate_limit_secret` of at least 32 characters. For example: `php -r 'echo bin2hex(random_bytes(32));'`.
8. Ensure the PHP process can create/write `stellora-private/rate-limits`. This contains only salted IP digests and request timestamps, not enquiry contents. Do not make directories world-writable. Configuration and dependencies should remain outside the public web root.
9. Enable HTTPS through Hostinger. Keep credentials out of the Angular code and all public files.
10. Open `/`, `/about-us`, `/services`, and `/contact-us` directly and refresh each route. Check menus at mobile widths, scroll effects, image loading, service filters and prefilled enquiry links.
11. Submit one clearly labelled test enquiry with consent from the mailbox owner. Verify receipt, reply-to behaviour, failure feedback and spam folder placement. A success response means SMTP accepted the message, not guaranteed inbox delivery.

If your hosting arrangement cannot place `stellora-private` beside `public_html`, change `$privateDir` in `api/enquiry.php` to an absolute server-side path outside the document root. Never expose the private directory in public hosting.

No database, dashboard, online payment, customer account or booking engine is included. Enquiries are emailed and are not confirmed bookings.

## Edit content

- `src/app/data.ts`: services and destinations (destinations are ordered south to north; the journey section and the route follow this order).
- `src/app/home.html`: homepage.
- `src/app/pages.ts`: About, Services, Contact and 404 pages.
- `src/app/enquiry.ts`: enquiry UI.
- `src/app/motion.ts`: animations and cleanup (hero entrance and scroll depth, reveals, pinned services, parallax).
- `src/app/smooth-scroll.ts`: Lenis setup and `scrollTo` helper.
- `src/styles.css`: branding, layout and responsive rules.
- `backend/enquiry.php`: PHP endpoint.
- `backend/config.example.php`: SMTP configuration template.

Rebuild with `npm run build` after changes and upload the new compiled files. Backend changes are copied to `release/` by the same build.

## Assets and references

Mango Cabs supplied the visual reference. Its pinned horizontal service carousel was observed live. The service spotlights adapt the supplied screenshots; the shared video was inaccessible, so animation timing is not claimed to be an exact match.

The supplied Stellora logo was cleaned to remove its baked-in checkerboard. `original-assets/stellora-logo-original.png` preserves the original upload.

Destination images are real Wikimedia Commons photographs. See `public/assets/image-credits.txt` for authors, source pages, licences and changes. Attribution is also available through the website footer. The resized/cropped destination derivatives retain their respective licences. Generated car/scooter images are illustrative and do not claim to show the actual fleet.

Replace generated vehicle imagery with real vehicle photos when available. No fabricated reviews, operating history, fleet sizes or credentials are published.
