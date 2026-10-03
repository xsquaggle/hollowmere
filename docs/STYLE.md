# Hollowmere: style

Everything is drawn in code, on canvas or in SVG. The look is a painted field journal: flat gouache-style shapes
with soft grain, bold ink outlines on characters, fish and props, and atmospheric light on the water.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#2B2A33` | Outlines, text, primary buttons |
| `--paper` | `#F3EAD7` | Cards, sheets, light text on dark |
| `--paper-2` | `#E6D9BE` | Secondary paper |
| `--brass` | `#C9A15A` | Fittings, coins, focus rings, highlights |
| `--night` | `#1B2232` | Page background, HUD chips |
| `--danger` | `#D9614C` | Warnings, badges, line tension |
| `--good` | `#7FB069` | Gains |

Rarity colors (`--c-common` to `--c-godly` in `src/styles/base.css`) are used for rarity and nothing else.

The tackle bag adds its own materials: waxed canvas `#857E4E`, with `#6A643C` for shade and `#9C9563` for light; leather `#6B4630`; and a cloth lining `#F1E6CC`.

## Type

- **Titles and names:** Young Serif.
- **Numbers, buttons and body text:** Nunito.
- **Handwriting** (notes, letters): Caveat, used for flavor only.
- **Size:** body text is at least 15 px on phones. Small caps labels are 10–11 px, with letter-spacing.

## Material language

- **World:** flat painted shapes in 3–4 values each, a grain overlay, no gradients on objects, and light from additive glows only.
- **Characters and fish:** bold, slightly wobbly ink outlines. A silhouette must be readable at 48 px, and recognizable as a pure black shape.
- **Water** is the hero material: mirrored reflections, gentle wave distortion, drifting light, foam at the shores, and ripples from every interaction.
- **UI:** cream paper cards, ink-stamp icons and small brass fittings.

## The art bar (from step 15 on)

Every new or redrawn asset meets these, checked in a phone-sized screenshot before it ships:

- **Values:** 3–4 per shape (base, shadow, light), with ink outlines on characters and props.
- **Material:** surface detail that says what it's made of: wood grain and nails, rope twist, metal sheen, stone strata and barnacles, canvas weave.
- **Silhouette:** readable at phone size.
- **Life:** an idle motion wherever the real thing would move, and at least 5 idle animations per scene.
- **Speed:** static detail is drawn once and cached; only the moving parts redraw each frame.

Assets from before step 15 that fall short are being redone in step 16, the scene art pass.

## Rarity kit

There are eight tiers, from Common to Godly. Each tier keeps everything the tier below has and adds one layer:

| Tier | What it adds |
| --- | --- |
| Uncommon | A soft edge glow |
| Rare | A slow foil shimmer |
| Epic | Sparks |
| Legendary | Drifting motes and a dimmed sky |
| Exotic | A prism sheen |
| Mythic | Ink that bleeds and recedes |
| Godly | Light rays |

Pips count the tier from 1 to 8.

## Motion

- **Anticipation:** short (squash before stretch), and nothing moves linearly.
- **Taps:** answer within a frame, with a press of 100–150 ms.
- **Panels:** take 200–300 ms. The tackle bag opens in 0.7 s and closes in 0.35 s.
- **Celebrations:** take 0.6–2 s, depending on how much the moment matters.
- **Reduced motion:** every overlay falls back to a short fade, and big movement stops.

## Sound

Soft, wooden and watery, all procedural (Web Audio): plucks and bells for music, and clicks, splashes and canvas or
leather for interactions. Each sound is short and slightly varied, so repeats don't grate.
