# $>SolarCoders<$ 🛰️

The website for **$>SolarCoders<$** — a student-founded nonprofit teaching elementary and
middle schoolers **Python** and **Python with AI**, built around a theme of orbits and
celestial bodies.

## What's inside

The site is **multi-page** (not one long scroll): Home, Programs, About, Stories, Contact,
and Enroll, linked through a shared top nav.

| File            | Purpose                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------- |
| `index.html`    | Home — hero with the 3D solar system, trust strip, explore hub, CTA                               |
| `programs.html` | Programs — the three orbits + the toolkit taught in order                                         |
| `about.html`    | About — mission and why-families-choose-us                                                        |
| `stories.html`  | Stories — testimonials from kids, parents, and teachers                                           |
| `enroll.html`   | Enrollment — validated application form + "what happens next" sidebar                             |
| `contact.html`  | Contact — contact-method cards, message form, FAQ accordion                                       |
| `styles.css`    | Hand-authored design system — tokens, type scale, buttons, cards, forms, the 3D solar system      |
| `main.js`       | Interactivity — the 3D solar engine, starfield, nav/menu, scroll reveals, magnetic buttons, forms |

Styling is **hand-authored CSS** (no framework, no build step). Typography pairs
**Fraunces** (editorial serif headlines) with **IBM Plex Sans** (body) and
**IBM Plex Mono** (labels & data readouts), loaded from Google Fonts.

### Design notes

- **Single, committed dark theme** — an "ephemeris / instrument" aesthetic: near-black
  blue-biased ground, hairline rules, one warm "star" gold accent used sparingly.
- **The 3D solar system (home hero).** A pseudo-3D orbital system built in `main.js`:
  $>SolarCoders<$ is the central star, and six library "planets" orbit a **tilted plane** — Python
  innermost, then scikit-learn, TensorFlow, NumPy, pandas, and Django outward. Depth drives
  each planet's scale, brightness, stacking order (they pass in front of and behind the star),
  and a subtle cursor parallax. It animates gently on its own and **freezes to a static frame**
  under `prefers-reduced-motion`.
  - Tune a planet by editing its `data-speed` / `data-phase` / `data-dir` attributes in
    `index.html`; orbit radii and the plane tilt (`PHI`) live at the top of the solar block in
    `main.js`.
  - **Logos:** the planet logos are **simplified SVG recreations** in each project's brand
    colors — not copies of official asset files — which suits a nonprofit that teaches these
    tools. For production, replace them with each project's **official logo** per its brand /
    trademark guidelines (Python, scikit-learn, TensorFlow, NumPy, pandas, Django).
- **Other motion is interaction-driven.** Sections do a **swift one-shot reveal** as they enter
  view, and the important CTAs are **magnetic** — they drift toward the cursor and spring back.
  Both respect `prefers-reduced-motion`.
  - Magnetic buttons are opt-in via the `data-magnetic` attribute — added only to the primary
    "Enroll" CTAs. Add it to any button to make it magnetic.

### How the forms work

The Enroll and Contact forms validate on the client, then open the visitor's own email app
with a **pre-filled message** to `hello@$>SolarCoders<$.org` (via a `mailto:` link) and show a
confirmation. **No data is sent to any server by the site itself** — nothing is collected
automatically.

To receive submissions directly in an inbox or spreadsheet instead, connect a no-backend form
service:

- **Formspree** — set `<form action="https://formspree.io/f/XXXX" method="POST">` and remove the
  `e.preventDefault()` path in `main.js`, **or**
- **Netlify Forms** — add `netlify` to the `<form>` tag when hosting on Netlify.

Both take a few minutes and need no server code.

## How to view it

Just **double-click `index.html`** — it opens in any browser, no build step needed.

To view it the way it will be served on the web (recommended), run a tiny local server
from this folder in PowerShell and open http://localhost:8777:

```powershell
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8777/")
$listener.Start()
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = $ctx.Request.Url.LocalPath.TrimStart('/'); if (!$rel) { $rel = "index.html" }
  $path = Join-Path (Get-Location) $rel
  if (Test-Path $path -PathType Leaf) {
    $b = [IO.File]::ReadAllBytes($path)
    if ($path -match '\.css$') { $ctx.Response.ContentType = 'text/css' }
    elseif ($path -match '\.js$') { $ctx.Response.ContentType = 'application/javascript' }
    elseif ($path -match '\.html$') { $ctx.Response.ContentType = 'text/html' }
    $ctx.Response.OutputStream.Write($b,0,$b.Length)
  } else { $ctx.Response.StatusCode = 404 }
  $ctx.Response.Close()
}
```

## Customizing

- **Text / content:** edit `index.html`. Sections are clearly commented (`<!-- ==== HERO ==== -->`).
- **Colors:** every color is a CSS custom property in the `:root` block at the top of `styles.css` (e.g. `--star`, `--cool`, `--bg`). Change them in one place.
- **Stats numbers:** edit the `.readout` block in the hero (`index.html`) — plain text, no scripting.
- **Voices:** each is a `<figure class="voice">` — swap the quote, name, and role. These are placeholder quotes; replace with real ones as you collect them.
- **Contact emails:** search for `$>SolarCoders<$.org` across `index.html`, `enroll.html`, and
  `contact.html` and update the `mailto:` links / the `to` address in `main.js`.
- **FAQ:** edit the `<details>` items in `contact.html` — question in `<summary>`, answer in the
  `.faq-body` paragraph.

## Accessibility & performance notes

- Fully responsive (mobile, tablet, desktop) with a working mobile menu.
- Respects `prefers-reduced-motion` — animations disable for users who ask for less motion.
- Keyboard focus states, semantic landmarks, and `aria` labels included.

## Deploying (when ready)

This is a static site, so it can be hosted for free on **Netlify**, **Vercel**, **GitHub
Pages**, or **Cloudflare Pages** — just drag the folder in or connect the repo.

# solarcoders

# solarcoders
