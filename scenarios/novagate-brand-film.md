# NovaGate Brand Film — "BULK"-style teaser

Reference: ~10s looping brand film. Fast-cut montage of cinematic/archival-texture
shots with accelerating tempo → calm wide logo end card. Serif kinetic copy over
select shots. Film grain + light leaks throughout, 16:9.

Reference cut structure (from screen recording):
1. 0:00–0:01 — film-grain color wash / light leak (warm → magenta)
2. 0:01–0:02 — B&W waves crashing on rocks
3. 0:02–0:04 — archival trading floor, open-outcry chaos, teal/orange
4. 0:04–0:05 — B&W macro: hand circling a number on paper ("61.8% abv" circled)
5. 0:05–0:06 — stock ticker board, red/green %, kinetic text "Every…" over it
6. 0:06–0:07 — night sky / milky way timelapse over lake
7. 0:07–0:08 — macro human eye (amber; then cool-blue close-up with ticker reflection)
8. 0:08–0:09 — lightning storm
9. 0:09–0:10 — aerial ocean foam (bleached film look)
10. end card — calm dark ocean + aurora, serif logo "✳ BULK" centered

## NovaGate version — shot list + Seedance prompts

Brand: NovaGate — token/stock basket trading app. Dark UI, purple (#A855F7-ish)
accent. Tone: cosmic, gate/portal, "the market as a force of nature."
All clips: 16:9, 4–5s each (we cut to ~1s each in the edit), heavy 16mm film
grain, no on-screen text baked in (text added in post).

S1 — light leak: "Abstract analog 16mm film light leak, warm amber bleeding into
deep violet and magenta, heavy film grain, no subjects, dreamy overexposed wash"

S2 — history of finance (v2): "Sepia-toned archival footage from the early
1900s, close-up of weathered hands counting gold coins onto an old wooden
banker's desk beside a handwritten ledger and a brass scale, dust motes in warm
light, heavy film grain and scratches, vintage 16mm"
(v1 was B&W crashing waves)

S3 — trading floor: "1980s archival footage of a chaotic stock exchange trading
floor, open outcry traders shouting and waving paper, green CRT price boards,
teal and orange color grade, 16mm film grain"

S4 — hand circling number: "Black and white macro close-up, a hand with a marker
pen circling a handwritten number on paper covered in scribbled calculations,
shallow depth of field, film grain"

S5 — crypto ticker (v2): "Cinematic close-up of a dark digital ticker board
showing cryptocurrency symbols BTC, ETH and SOL with green and red percentage
changes scrolling, shallow depth of field, blue-black palette with subtle
purple glow, anamorphic lens"

S6 — human life timelapse (v2): "Cinematic timelapse of a human life: portrait
of a face seamlessly aging from young child to adult to elderly person, gentle
morph, soft window light, neutral background, warm tones, subtle film grain"
(v1 was milky-way timelapse)

S7 — macro eye: "Extreme macro of a human eye, iris with violet and amber
detail, stock ticker numbers faintly reflected on the cornea, cinematic
lighting, shallow focus"

S8 — clouds gate (v2): "Aerial flight through towering cumulus clouds at dusk,
a radiant gap in the clouds opening like a gate with god rays streaming through
it, violet and deep blue palette, cinematic, film grain"
(v1 was lightning storm)

S9 — end card plate: "Calm dark ocean at night under a glowing purple and
green aurora borealis, stars, wide static shot, cinematic, serene, space for
centered logo" (5s, this one runs long under the logo)

## Post / assembly
- Cut: S1 1.0s → S2 1.0s → S3 1.5s → S4 1.0s → S5 1.0s → S6 1.0s → S7 1.0s →
  S8 0.8s → S9 hold ~3.5s with logo fade-in. Total ≈ 11–12s, loopable.
- Kinetic serif copy (added in Remotion, editorial serif, white):
  "Every market." (over S3) / "Every signal." (over S5) / "One gate." (over S8)
- End card: "◗ novagate" wordmark centered over S9 (white serif or brand mark
  from ~/Desktop/novagate assets), slow fade.
- Grade: unify with slight grain + vignette; audio: low ambient drone + riser
  into a soft hit on the logo (Seedance native audio off; add music in post).

## Generation routes
- Higgsfield MCP (preferred, user request): mcp.higgsfield.ai/mcp — Seedance 2.0,
  needs OAuth via /mcp in Claude Code.
- Fallback: tools/seedance.mjs via fal.ai (FAL_KEY in ~/.claude/settings.json):
  node tools/seedance.mjs "<prompt>" --aspect 16:9 --duration 5 --no-audio --out out/novagate/s1.mp4

---

# NarrativesFilm — "Trade the narrative" teaser (v1, Jul 2026)

Story: narratives crafted through history → tradable on NovaGate baskets.
Reuses s1 (light leak), s9 (aurora plate). 15.6s, 1920x1080.

Cut: s1 light leak 1.0s → n1 cave 1.6s ("Narratives built tribes.") → n2 Rome
1.6s ("Narratives built empires.") → n3 printing press 1.6s ("Narratives built
nations.") → n4 phone glow 1.6s ("Narratives went viral.") → n5 chart pump 1.8s
("Now they move markets.") → baskets UI panel beat 2.4s ("Trade them. In one
tap.") → s9 aurora end card 4.0s (logo + ✦ novagate + italic "Trade the
narrative.").

N1 — cave: "Prehistoric cave interior lit by flickering torchlight, ancient
ochre cave paintings of hunters and bison on the rock wall, shadows of gathered
people dancing across the paintings, drifting embers, warm firelight,
cinematic, heavy film grain"

N2 — Rome: "Ancient Rome, a toga-clad orator addressing a large crowd from the
marble steps of the forum, arms raised mid-speech, dramatic golden sunlight,
dust in the air, epic painterly cinematography, film grain"

N3 — America: "1950s black and white archival footage, massive newspaper
printing presses running at high speed, front pages streaming through the
machines, pressmen watching, dramatic industrial lighting, 16mm film grain and
scratches"

N4 — online: "Cinematic close-up in a dark room, a young person's face lit only
by the cold blue glow of a smartphone, light flickering as they scroll rapidly,
feed reflections in their glasses, shallow depth of field, film grain"

N5 — trading: "Cinematic shot of a huge dark trading screen, a green
candlestick chart suddenly pumping vertically upward, streaming numbers and
percentages, subtle purple glow, dramatic anamorphic lens, film grain"

Product beat: CSS-built "baskets" panel mockup (no real product screenshot —
the original render used a real app screenshot, replaced here with a
generic mock for public release) over dark violet radial bg, slow 1.07x
push-in.
Render: npx remotion render src/index.ts NarrativesFilm out/novagate-narratives.mp4
