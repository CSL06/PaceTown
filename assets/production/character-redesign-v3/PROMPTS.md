# Character redesign v3 prompt record

Mode: built-in image generation with each original portrait as the authoritative identity reference. Sky also used the user-supplied face reference. After Sky established the shared visual language, his approved style master was supplied as a style-only reference for the remaining cast.

## Shared prompt

Create a polished hand-pixel-art full-body sprite style master for a cozy university stress-recovery game. Show exactly four standing views in one horizontal row: front/down, left, right, back/up. Preserve the supplied portrait identity and outfit closely. Match the cast's shared natural adult proportions, dark-navy pixel outline, warm two-to-three-tone cluster shading, consistent scale and baseline. Use a genuinely transparent background. No text, UI, scenery, watermark, extra poses, cropped bodies, duplicate limbs, photorealism, 3D rendering, smooth vector edges, oversized square heads, children, or generic chibi mascots.

## Character locks

- Player: warm medium-brown skin, short tousled burgundy hair, sage overshirt, cream T-shirt, plum backpack, gold pins.
- Mira: adult woman, long wavy dark-brown hair, round gold glasses, cat ears and tail, navy/cream neko-maid librarian uniform, teal bow and bell, book satchel.
- Kai: side-swept chestnut hair, cream rolled-sleeve shirt, amber waistcoat, dark tie, brass pocket chain.
- Sol: warm deep-brown skin, short natural curls, cream shirt, olive gardening overalls, amber neckerchief, leaf pin.
- Sky: authoritative supplied face; black centre-parted hair, round glasses, dusty-rose cardigan, cream collared shirt, sky-blue café apron, brown trousers.
- Goh: warm medium skin, tidy black hair, rust-red campus jacket, cream shirt, dark trousers, olive messenger strap and clipboard satchel.

## Player animation pose master v4

Mode: built-in image generation using `player-sprite-style-master-v3.png` as the authoritative identity and clothing reference.

Create exactly twelve complete front/down-facing key poses in a clean four-column by three-row layout: relaxed idle, gentle inhale, left-foot walk contact, right-foot walk contact; talking closed, talking open, friendly reach, seated upright; checking a phone, calming breath with hands near chest, concerned, and warmly happy. Preserve the same warm medium-brown skin, burgundy side-parted hair, sage overshirt, cream T-shirt, plum backpack, dark trousers, cream-accent shoes and gold pins in every pose. Use crisp dark-navy pixel outlines, clustered shading and genuine transparency. No labels, UI, furniture, branding, scenery, extra characters, cropped limbs, duplicated limbs, outfit changes, childlike proportions, photorealism or 3D rendering.

## Guardian animation pose masters v4

Mode: built-in image generation, one call per guardian, using that guardian's approved `*-sprite-style-master-v3.png` as the identity and outfit reference.

Shared request: create a clean four-column by three-row pose master containing exactly twelve full-body poses of the same character: neutral idle, slow inhale, left-foot walk contact, right-foot walk contact, talking closed, talking open, reaching/interacting, seated calmly, checking a phone, guided breathing, concerned but safe, and happy/relieved. Use crisp hand-authored pixel art, the canonical PaceTown palette, a one-native-pixel dark-navy outline, restrained cluster shading, an even baseline, genuine transparency, and no text, labels, watermark, extra characters, cropping, costume drift, gradients, 3D rendering or childlike proportions.

Identity additions:

- Mira: adult neko maid librarian; long wavy dark-brown hair, round gold glasses, natural cat ears and tail, navy-and-cream modest outfit, teal bow and bell, book satchel; warm and intelligent, never sexualized.
- Kai: neat dark hair, calm face, cream shirt, waistcoat, muted-teal tie and pocket-watch chain; composed musical-clock keeper.
- Sol: warm medium-brown skin, soft dark curls, sage work overalls, cream shirt and amber neckerchief; grounded garden caretaker.
- Sky: preserve the supplied face, black centre-parted hair, round glasses, dusty-rose cardigan, cream shirt and sky-blue apron exactly; reassuring tea-counter host.
- Goh: short dark hair, rust jacket, cream shirt, muted-teal messenger bag and clipboard; practical lantern-stall keeper.

## Sky clean animation pose master

Mode: built-in image generation using the user-supplied Sky face, the approved v3 four-view master, and the v4 pose sheet. The edit preserved identity and pose order while replacing fine shading with large pixel clusters, a maximum of two shading tones per material, consistent head/body scale and a stable baseline. The production pass then applied a fixed 24-colour palette, BOX reduction, binary alpha and exact `64x96` cells. Output: `generated/characters/sky/sky-animation-pose-master-clean.png` and `production/character-redesign-v3/sky-variant/sky/`.
