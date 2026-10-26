---
name: Brand Story, Portfolio Cut
description: A 45 s brand film and its promo stills, drawn entirely in code; a navy night of periwinkle light, DM Sans kinetic type and a glossy 3D toy cast.
colors:
  night: "#050817"
  night-blue: "#070B22"
  navy-lift: "#0B1130"
  stage-glow: "#3445A8"
  ink: "#0D1020"
  periwinkle: "#6078EC"
  periwinkle-soft: "#8FA0F5"
  periwinkle-deep: "#4A5BD0"
  periwinkle-light: "#B9C4FF"
  periwinkle-pale: "#DDE3FF"
  mint: "#2BB594"
  mint-light: "#8FE8C8"
  cream: "#EEF1FF"
  ice: "#F5F7FF"
  toy-hero: "#7B8BFF"
  toy-mint: "#3FD6A2"
  toy-coral: "#FF7C66"
  toy-yellow: "#FFC83D"
  toy-hat-orange: "#FF9A3D"
  toy-bead: "#FFD34D"
  toy-cheek: "#FF9EC4"
  toy-ink: "#14162A"
  toy-headset: "#2B2F52"
typography:
  display:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "172px"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  display-strong:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "172px"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "104px"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline-strong:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "104px"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "48px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.015em"
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "44px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  measure:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    letterSpacing: "0.01em"
    fontFeature: "tnum"
  outline:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "172px"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.035em"
  ui-body:
    fontFamily: "Inter, sans-serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1
rounded:
  handle: "2px"
  ftile: "26px"
  card: "28px"
  tag: "36px"
  device: "40px"
  pill: "46px"
  tile: "60px"
spacing:
  card-inset: "28px"
  pill-gap: "14px"
  frame-margin: "104px"
components:
  pill-on:
    textColor: "#FFFFFF"
    typography: "{typography.title}"
    rounded: "{rounded.pill}"
    padding: "0 38px 0 28px"
    height: "92px"
  pill-ghost:
    backgroundColor: "rgba(143,160,245,.08)"
    textColor: "rgba(185,196,255,.42)"
    typography: "{typography.title}"
    rounded: "{rounded.pill}"
    padding: "0 38px 0 28px"
    height: "92px"
  cta:
    textColor: "#FFFFFF"
    rounded: "50px"
    padding: "0 52px"
    height: "100px"
  card:
    textColor: "#E9ECFF"
    typography: "{typography.ui-body}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-inset}"
  chip:
    backgroundColor: "rgba(143,160,245,.14)"
    textColor: "{colors.periwinkle-pale}"
    rounded: "19px"
    padding: "0 16px"
    height: "38px"
  toggle-on:
    backgroundColor: "{colors.mint}"
    rounded: "15px"
    width: "52px"
    height: "30px"
  oss-tag:
    backgroundColor: "{colors.navy-lift}"
    textColor: "{colors.cream}"
    rounded: "{rounded.tag}"
    padding: "20px 44px 22px 26px"
---

# Design System: Brand Story, Portfolio Cut

## Overview

**Creative North Star: "The Night Studio Toy Box"**

A navy night lit by periwinkle stage light, where a cast of glossy 3D toys and big, quiet DM Sans type act out an idea. The system is made for the 1920 × 1080 frame, not a scrolling page: one statement at a time, set large on an open field, with a character doing something next to it. Every visual is a pure function of time. Stills such as the thumbnail are frames of the same world, so they borrow its motion language (arcs, squash, onion skins, time stamps) instead of freezing a title over a paused frame.

The world has two palettes: the dark navy night, and a light ice day. It switches between them only through a circular wipe that opens from a point, usually where the hero lands. Depth comes from light, not from boxes: drifting blurred glows, glows that bleed off periwinkle elements, and the gloss on the toys. The editor's tools carry the craft story: a thin selection box with square handles and a pointer cursor turn a word into something that has just been made.

The cut is unbranded by design. Nothing in the visual system identifies a client: no logo, wordmark, URL or trust badge. The cast is the face of the work.

**Key Characteristics:**
- Navy night (#050817 to #070B22) with periwinkle glows; light ice (#F5F7FF) as the second palette, reached only by a circular wipe.
- DM Sans throughout, carried by weight contrast: Regular 400 for the line, Bold 700 for the one word that matters.
- The selection box with square handles and the pointer cursor as the signature devices.
- A cast of four glossy toy blobs (periwinkle hero with antenna, mint in a hard hat, coral in glasses, yellow in a headset).
- Motion by springs, parabolic hops and damped landing squash; never linear.

## Colors

One cool family (periwinkle on navy) with a single green accent; all warm colour lives in the toys.

### Primary
- **Stage Periwinkle** (periwinkle): the voice of the world. Highlight bars, active pills and the CTA (as the #8597F6 to #5A70E6 vertical gradient), chart fills, the base ring in the device. The coloured glows that give the night its depth are this hue.
- **Selection Lavender** (periwinkle-light): every hairline that means "made in an editor": selection-box edges and handle borders, time stamps, icon strokes on tiles and cards, secondary type on dark (the thumbnail's "45s brand film").
- **Soft Periwinkle** (periwinkle-soft): the comet trail, translucent fills for ghost pills and card hairlines (at 8 to 25% alpha), the handle line in the tag.
- **Deep Periwinkle** (periwinkle-deep): the accent on the light palette, where periwinkle-light would vanish: bold words on ice, the cursor ripple, outline-stack strokes.
- **Pale Periwinkle** (periwinkle-pale): chip text on dark cards.

### Secondary
- **Paid Mint** (mint): the one non-blue accent. On toggles, the "done" state, the bonus arc, the mint highlight variant (#22A585 to #4FD3AE) and the second background glow. **Mint Light** (mint-light) is its text form on dark (positive values, check marks).

### Tertiary: the toy cast
The toys are physical material, not UI colour. They render through Three.js as MeshPhysicalMaterial (roughness 0.42, clearcoat 0.6, sheen 0.8 tinted 55% towards white) under a key, a cool periwinkle rim (#C8D0FF) and a pink fill (#FFE6F0).
- **Hero Periwinkle** (toy-hero): the hero; antenna one step deeper (#6577F0), ending in **Glow Bead** (toy-bead, emissive #FFB21A).
- **Field Mint** (toy-mint): the wide blob, in a **Hard-Hat Orange** (toy-hat-orange) hat.
- **Manager Coral** (toy-coral): the tall pill in round **Toy Ink** (toy-ink) glasses.
- **Operator Yellow** (toy-yellow): the rounded square in a **Headset Navy** (toy-headset) headset.
- **Blush** (toy-cheek): cheeks on every character (matte: roughness 0.75, no clearcoat).
- Faces are Toy Ink with two white catchlights per eye.

### Neutral
- **Night** (night): the film's stage base, and the fill inside selection handles on dark.
- **Night Blue** (night-blue) and **Navy Lift** (navy-lift): the still frame's base gradient (162deg, navy-lift at top-left to night-blue at 48% to #04061A); **Stage Glow** (stage-glow) is its upper-right radial bloom.
- **Cream** (cream): primary text on dark. Bold words stay cream; the weight step carries the emphasis.
- **Ice** (ice): the light palette's base (shader: #ECEFFD at the bottom to ice at the top), tinted by pale periwinkle, mint and lilac glows.
- **Ink** (ink): text on ice, and the cursor's outline on dark.

### Named Rules
**The Two Nights Rule.** The world has exactly two grounds, the navy night and the ice day. A scene changes ground only through a circular wipe that grows from a point (soft edge 30 px, inOutCubic, to 2300 px radius); never a cut or a crossfade between palettes.

**The Warmth Lives in the Toys Rule.** Coral, yellow, orange and blush belong to the cast's materials. Type, UI and background stay in the periwinkle and mint family.

## Typography

**Display Font:** DM Sans (with sans-serif), weights 400, 500, 600 and 700
**Outline Font:** Schibsted Grotesk 800 (outline word stacks only)
**Product-UI Font:** Inter 400 to 700 (inside the in-film dashboard cards and device only)

**Character:** A friendly geometric sans set large and tight, where meaning is carried by weight, not by size or colour changes. The Regular line reads as the speaking voice; the Bold word is the one that lands.

### Hierarchy
- **Display** (400, 172px, line-height 0.98, -0.035em): still-frame headlines, two or three lines, top left. The strong word steps to 700, still in cream.
- **Headline** (400, 56 to 188px, most often 104px, line-height 1.12, -0.025em): the film's kinetic lines; the strong word at 700 and -0.03em.
- **Title** (600, 48px, -0.015em): pills; end-card CTA at 700 40px; floating tiles at 700 46px and 600 30px.
- **Label** (500, 44px, -0.01em, periwinkle-light): a supporting line under a display headline. The OSS tag sets 46px with a 700 name and a 40px 500 handle in periwinkle-soft.
- **Measure** (500, 24px, +0.01em, tabular figures, periwinkle-light): time stamps set as measurement ("t 0.00s"), placed beside the thing they measure.
- **Outline** (Schibsted Grotesk 800, 172 to 188px, line-height 0.9, -0.035em, uppercase): stacked words with a 2px stroke and transparent fill; one copy in the stack is solid periwinkle.
- **UI Body** (Inter 500, 19px; titles 600 21px; figures 700 44px, -0.03em): product UI inside cards and the device, never for the film's own voice.

### Named Rules
**The Weight Contrast Rule.** A line is Regular 400; one word, at most two, is Bold 700. Never a full line in Bold, never a size jump inside a line.

**The Measurement Rule.** Small type in the frame is a measurement (time stamps) or a credit, set in tabular figures beside what it measures. It never sits above a headline as a category label.

## Layout

A fixed 1920 × 1080 stage, composed per frame, not on a grid. Type anchors the left at 104 to 150px from the edge (film kinetic lines at x 130 to 150; the still's headline at 104px, the label and tag at 112 to 118px). Characters and their action take the right half and the light. The centre of a still stays open (LinkedIn draws its play button there). Footers sit 92px from the bottom. Stills must still read at about 390px wide, which is why still-frame headlines run at 172px.

Cards keep a 28px inset on every side, with rows stepped at 60 to 80px. Pills, tags and tiles space their icon from the label by 14 to 24px.

## Elevation & Depth

Depth is light, not layers. The grounds carry four drifting gaussian glows with domain-warped edges, and a vignette; elements then glow into that light. Shadows are soft, large and pulled in with a negative spread so they read as contact under a floating object, never as an offset slab. Toys get a drop-shadow glow on dark, a soft navy drop-shadow on light, and an elliptical contact shadow on the floor.

### Shadow Vocabulary
- **Periwinkle lift** (`box-shadow: 0 16px 40px -12px rgba(96,120,236,.85), inset 0 1.5px 0 rgba(255,255,255,.45)`): active pills, buttons and the CTA; the inset top light is part of it.
- **Highlight glow** (`box-shadow: 0 10px 30px -10px rgba(96,120,236,.8)`): under the highlight bar behind a word (mint version: rgba(43,181,148,.8)).
- **Card float** (`box-shadow: inset 0 0 0 1px rgba(143,160,245,.18), 0 40px 70px -34px rgba(0,0,0,.85)`): dark UI cards.
- **Device halo** (`box-shadow: inset 0 0 0 2px rgba(185,196,255,.75), 0 0 40px rgba(96,120,236,.55), 0 0 120px rgba(96,120,236,.25)`): the device that fills with the app.
- **Toy glow** (`filter: drop-shadow(0 0 26px rgba(143,160,245,.55)) drop-shadow(0 28px 34px rgba(2,3,14,.55))`): the solid hero on dark.
- **Cursor lift** (`filter: drop-shadow(0 6px 10px rgba(0,0,0,.35))`).

### Named Rules
**The Glow Not Slab Rule.** Every shadow is blurred and pulled in with negative spread, or is a coloured glow; edges are drawn with inset hairlines (1 to 2px), not outer borders.

## Shapes

Soft, squircle-cornered surfaces against hard, thin editor geometry. Cards (28px), feature tiles (26px), the device (40px) and big tiles (60px) use `corner-shape: squircle`; pills, the CTA and chips are fully round ends. The toys are superellipse blobs (sphere pushed towards a rounded box, widened at the bottom, flattened underneath), so nothing in the cast has a hard corner. Against all that softness the editor devices are deliberately sharp: selection-box edges are straight hairlines, handles are squares with at most a 2px corner. Circles recur only as UI: progress arcs, the donut and doodle avatars.

## Components

### Buttons and Pills
- **Shape:** fully round ends (46px on a 92px pill, 50px on the 100px CTA, 28px on a 56px card button).
- **Active / On:** vertical gradient #8597F6 to #5A70E6, white text, periwinkle lift shadow with the inset top light.
- **Ghost / Off:** periwinkle-soft at 8% fill, lavender text at 42%, a 1.5px inset hairline at 24%.
- **Motion:** pressed by the cursor (cursor scales to 0.84 on press, a ripple ring expands for 0.6 s), then pops on with a spring.

### Chips
- **Style:** periwinkle-soft at 14% fill, periwinkle-pale text, Inter 600 17px, 38px tall, check icon first. The positive variant uses mint at 22% with mint-light text.

### Cards / Containers
- **Corner Style:** squircle, 28px.
- **Background:** vertical gradient rgba(30,39,88,.96) to rgba(15,20,50,.96).
- **Shadow Strategy:** Card float (see Elevation).
- **Border:** 1px inset hairline in periwinkle-soft at 18%.
- **Internal Padding:** 28px; title in Inter 600 21px at 66% cream with a lavender stroke icon.

### Toggles
- 52 × 30px track, 24px white knob; off is periwinkle-soft at 25%, on is mint.

### Selection Box (signature)
The editor's selection drawn round the one bold word. Four straight hairline edges in periwinkle-light (2px in the film, 3px at 172px display size) and four square handles at the corners, filled with the ground colour (night on dark) and bordered in the same lavender. In motion, the edges draw on in turn (each 0.09 s, staggered 0.07 s, inOutCubic), then the four handles pop on a spring (response 0.3, damping 0.5, staggered 0.03 s). The word inside is Bold, in the line's own colour (cream on night).

### Cursor (signature)
A classic pointer arrow (24-unit path) at 46px in the film and 64px in stills: cream fill with an ink outline (1.3 stroke, round joins) on dark, inverted to ink with a white outline on ice. It lives at the selection box's bottom-right handle in stills. Clicks expand a 120px lavender ring (3px stroke) that fades over 0.6 s.

### Toy Cast (signature)
Four glossy blob characters with simple faces: tall ellipsoid ink eyes with two white catchlights, a half-torus smile, blush cheeks. Each is a pure function of its pose (yaw, pitch, roll, look, blink, happy, antenna wobble). The hero travels; the antenna lags behind its motion and the eyes lead. They blink about every 3 s, never in unison. Teammates look towards the hero (pitch up, pupils following).

### Highlight Bar
A rounded bar (0.14em corners) behind a word, the periwinkle gradient #5B71E6 to #8597F4 (or the mint variant), growing left to right over 0.26 s while the word's ink shifts to white.

### Open-Source Tag
The GitHub mark (76px, cream) beside two lines: "Open source" in 500 lavender, a 8px periwinkle-soft dot, the project name in 700 cream; the handle below in 500 periwinkle-soft. Solid navy-lift fill (#0B1130), 36px corners, 2px inset hairline at 28%.

### Motion Grammar
- **Springs:** iOS-style spring (response = period in s, damping fraction), overshooting; pops use response 0.42, damping 0.55.
- **Hops:** parabolic arcs, x and y eased inOutSine with a height term h·4u(1−u).
- **Squash:** a damped landing squash, k·e^(−8t)·cos(26t), k about 0.3; stretch along velocity up to 20%.
- **Type entrances:** pop, type (0.032 s per character), rise, drop and scramble; exits fall per character or lift and blur.
- **Wipes:** circular, from the hero's position, inOutCubic.
- **Stills:** show the motion as onion skins: translucent hero ghosts tinted #9AA9FA (opacity 0.22 to 0.5) at equal time steps along a parabola, growing towards camera, the first squashed on its launch point, the solid hero last; time stamps on the first and last frame only. The path itself is implied by the ghosts, never drawn.

## Do's and Don'ts

### Do:
- **Do** keep every headline line in DM Sans 400 and set the one word that matters in 700 cream (#EEF1FF), inside the selection box when it is the hero word.
- **Do** change ground only by a circular wipe between the navy night and the ice day.
- **Do** flip editor devices for the light palette: cursor ink with a white outline, accents in periwinkle-deep (#4A5BD0), text in ink (#0D1020).
- **Do** build depth from glows and the toys' gloss; draw edges as 1 to 2px inset hairlines.
- **Do** move everything on springs, hops and damped squash, with toys looking where they are going.
- **Do** set time stamps in 500 tabular figures in periwinkle-light, next to what they measure.

### Don't:
- **Don't** put any client name, logo, wordmark, URL, trust badge or client figure on the portfolio cut or its promo surfaces.
- **Don't** use hard, offset, unblurred shadows; every shadow is a soft lift or a coloured glow.
- **Don't** set a small label or kicker above a headline; supporting lines go below it.
- **Don't** give type, UI or backgrounds the toys' warm colours (coral, yellow, orange).
- **Don't** use Inter or Schibsted Grotesk for the film's voice; they are scoped to in-film product UI and outline stacks.
- **Don't** round the selection box's corners or handles beyond 2px.
- **Don't** draw motion paths, tick marks, dotted trails, stage-light rings or scattered dust dots on stills; the ghosts carry the motion.
