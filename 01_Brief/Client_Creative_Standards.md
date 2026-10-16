# Sequifi: Client Creative Standards

Derived from the 36 client-shared creatives in `Sequifi_Meta_Ads_4x5_36_creatives/` (3 sets × 3 layouts × 4 industries). Colors and positions were measured from the full-size PNGs. Fonts, logo and color codes were then checked against the live site's CSS and assets (sequifi.com, fetched 2026-10-16); see section 8. Official files are in `brand_assets/`.

## 1. Canvas
- **1080 × 1350 px (4:5)** for every creative.
- **Safe margins:** about 65 px left, right and bottom. Text and CTA align to x = 65.

## 2. Fixed shell (on every creative)
| Element | Spec |
|---|---|
| Top accent bar | Full width, 6 px tall, `#6078EC` |
| Logo | Sequifi "S" mark + wordmark, top-left at x ≈ 70, vertically centered around y ≈ 80. White on photo backgrounds, ink `#1C1C2C` on light backgrounds |
| Industry pill | Top-right, right edge at x ≈ 1015, about 175 × 45 px, fully rounded. Uppercase, bold, wide letter-spacing (~0.2em), ~19 px. **Light bg:** solid ink `#1C1C2C` with white text. **Photo bg:** translucent white fill with a thin white border and white text |
| Pill labels | `MORTGAGE`, `ROOFING`, `FIBER`, `SOLAR` (the client uses "FIBER", not "Fiber / Telecom") |
| CTA button | Bottom-left at x = 65, y ≈ 1197–1284 (about 88 px tall), fully rounded, width hugs the text. Label is semibold, ~28 px, followed by "→" |

## 3. Color tokens
| Token | Hex | Used for |
|---|---|---|
| Periwinkle (primary) | `#6078EC` / `#647CEC` | Top bar, italic accent word, check circles, step-1 icon |
| CTA gradient | `#788EF4` → `#5D75E9` (top → bottom) | Filled CTA pill, with a soft periwinkle drop shadow |
| Ink | `#1C1C2C` | Headlines, navy pill, step-3 icon, dark text |
| Body gray | `#4C4C64` | Sub-headlines on light backgrounds |
| Label gray | `#8C8CA4` | Mono labels ("STEP 01") |
| Success green | `#2CB494` | Check marks in badges, step-2 icon |
| Annotation red | `#D4243C` | Handwritten problem notes on spreadsheets |
| Light bg | `#FFFFFF` → `#DCE1FA` (top → bottom) | Light layouts: white fading to lavender, with a faint dot grid (`#E4E4EC`) |
| Dark overlay | transparent → `#19192D` (bottom) | Full-bleed photo layouts |
| Flow line gradient | `#6E87EB` → `#40BC9E` → `#313445` | Divider above the 3-step cards |

## 4. Typography (as used in the creatives)
| Role | Typeface | How confirmed | Notes |
|---|---|---|---|
| Headline | **DM Sans Bold** | Pixel-overlap test vs. headlines: DM Sans 94% / 88%; Schibsted Grotesk (site font) 66–72% | About 80–88 px, leading ~1.0, tracking **−0.03em**. Ink on light, white on dark |
| Accent word | **Instrument Serif Italic** | Visual match; the site's CSS also carries a Figma-exported `Instrument Serif:Italic` class | One word or phrase per headline, usually the last ("paid.", "Made simple."). Periwinkle on light, pale lavender on dark. **Not used on problem/question headlines** |
| Sub-headline | DM Sans Regular | Visual match | ~28 px, body gray on light, light lavender on dark. 1–2 lines |
| Checklist | DM Sans Semibold | Visual match | ~26 px, periwinkle check circles |
| Handwritten notes | **Caveat** (~600 weight) | Visual match (closer than Kalam) | Ink on light, white on photos with green check boxes, red with curved arrows for problems ("Overrides?") |
| Mono labels | **Space Mono** | The site's CSS carries a Figma-exported `Space Mono:Regular` class | "STEP 01", "TOTAL ANTICIPATED PAY", "COMMISSIONS" |

## 5. Layout library (9 layouts)
| Layout | Sets | Structure | CTA used |
|---|---|---|---|
| **Photo + payroll UI** | A1 | Photo on the top ~45%, fading into a white dot-grid area. Headline + subhead. Real Sequifi payroll table bleeds off the right and bottom. 3 floating white badges with green checks | See Sequifi in Action (filled) |
| **Checklist + phone** | A2, B1, C2 | Light gradient. Headline at top, 5-item checklist on the left. Tilted phone (Sequifi "Earnings" app) bleeds off the right. Small tilted inset photo, handwritten line bottom-left | Book a Demo (filled) |
| **Hero photo** | A3, B2, C3 | Full-bleed photo with a dark gradient from the bottom. White headline (italic accent in Set A and C), subhead. 2–3 handwritten white check items mid-right | See How It Works (ghost/glass) |
| **Spreadsheet (problem)** | B3 | Photo on top fading to white. **Question** headline with no accent. Tilted spreadsheet ("Industry commissions · Q3.xlsx") with red handwritten "Overrides?", "Accurate?" notes and arrows | See Sequifi in Action (filled) |
| **3-step flow** | C1 | Photo on top fading to white. Headline + subhead. Gradient line, then 3 cards: Hire / Track / Pay with icon, "STEP 0X", and 2 lines each | See the Full Platform (filled) |

**Set A vs. Set B:** same layouts, copy reworded. Set B (original) frames problems ("without the back-office chaos"). Set A (affirmative) frames outcomes ("with a back office that keeps up") and swaps the spreadsheet layout for the solved payroll UI.

## 6. Photography
Realistic, warm golden-hour light, smiling people, industry setting clearly visible.
| Industry | Scenes used |
|---|---|
| Mortgage | Professional woman in navy blazer, city skyline at sunset. Desk flat-lay (laptop, glasses, coffee, navy folder). Two professionals talking, city backdrop |
| Roofing | Roofer with hard hat and nail gun on a roof. Rep smiling by a house at dusk. Crew working on a roof |
| Fiber | Tech in hi-vis with a blue fiber spool and tablet. Two field reps in a suburb. Van with a cable spool. Tech at a home utility box |
| Solar | Installer standing on a panel roof with mountains at sunset. Desert neighborhood with solar rooftops. Rep with tablet by a solar home |

## 7. Industry vocabulary and mock data (for UI visuals)
| Industry | Terms | Spreadsheet columns | Phone app (total / commissions / overrides) | Floating badges |
|---|---|---|---|---|
| Mortgage | LOs, loan officers, brokerage, branch & manager overrides, tiers, clawbacks | Loan Officer · Branch · Volume · Split · Commission · Adjustments | $12,650 / $8,750 / $2,100 | Overrides applied · Adjustments approved · Payroll ready |
| Roofing | Reps, crew, jobs, setter/closer splits, bonuses & SPIFFs | Rep · Role · Jobs · Rev · Split · Commission | $9,500 / $7,200 / $1,400 | Overrides applied · Bonuses added · Ready to pay |
| Fiber | Installs, milestones, MRC, multi-level comp | Rep · Installs · MRC · Milestone · Override · Total | $4,270 / $3,200 / $320 | Milestones hit · Overrides applied · Accurate to the cent |
| Solar | Adders, kW, clawbacks, SPIFFs | Rep · KW · Base · Adder · Override · Total | $11,960 / $10,400 / $520 | Adders applied · Clawbacks reconciled · Correct every time |

## 8. Website brand source (sequifi.com)
Taken from the live site's stylesheet (`/assets/index-DKT8wTEt.css`), header HTML and logo files.

### Fonts loaded by the site
| Font | Where used | Weights loaded |
|---|---|---|
| **Schibsted Grotesk** | `body`, all headings (h1 at weight 500, line-height 1.04), and highlighted words | 400–900 |
| Inter | Secondary UI text | 400–700 |

Highlighted words on the site (`.font-script`) use Schibsted Grotesk, upright and lowercase, with a gradient text fill: `#2A2F45 → #6078EC` on light backgrounds and `#FFFFFF → #8FA0F5` on dark. The creatives use Instrument Serif Italic for this instead.

### Logo
| File (in `brand_assets/logo/`) | Source URL | Colors |
|---|---|---|
| `sequifi-logo-dark-text.svg` | https://sequifi.com/sequifi-logo.svg | Mark: periwinkle `#6078EC` outline · Wordmark: `#060606` |
| `sequifi-logo-white-text.svg` | https://sequifi.com/assets/sequifi-logo-white-axsu7kQr.svg (site header) | Mark: periwinkle `#6078EC` outline · Wordmark: `#FFFFFF` |
| `sequifi-app-icon.svg` | https://sequifi.com/favicon.svg | White "S" on a `#6078EC` rounded square |

The site's logo is **two-color**: a periwinkle mark plus a black or white wordmark. The creatives use a **one-color** version, where the mark matches the wordmark. The shapes are identical.

### Color tokens (site variables) vs. creatives
| Site token | Hex | Creatives (measured) | Match |
|---|---|---|---|
| `--hv-accent` (primary; 140 uses) | `#6078EC` | Top bar `#6078EC`, accent `#647CEC` | ✅ Exact |
| `--hv-accent-soft` | `#8FA0F5` | Accent text on dark, CTA highlight | ✅ |
| `--hv-accent-deep` | `#4A5BD0` | (darker CTA edge ≈ `#5D75E9`) | ≈ |
| `--hv-accent-tint` | `#EEF1FE` | Light background tint (`#DCE1FA` at the bottom) | ≈ |
| Button gradient | `#5673FF → #6078EC` | CTA gradient `#788EF4 → #5D75E9` | ≈ |
| `--hv-ink` | `#0D1020` | Headline ink `#1C1C2C` | ≈ (creatives slightly lighter) |
| `--hv-night-900` / `-950` | `#050817` / `#03050F` | Dark overlay `#19192D` | ≈ |
| Green | `#2BB594` | `#2CB494` | ✅ Exact |
| `--destructive` | `#D4183D` | Red notes `#D4243C` | ✅ Near-exact |
| `--muted-foreground` | `#717182` | Label gray `#8C8CA4` | ≈ |
| `--primary` (generic UI token, 1 use) | `#3758F9` | Not used | n/a |
