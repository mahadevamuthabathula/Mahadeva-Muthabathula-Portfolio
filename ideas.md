# Mahadeva Portfolio — Design Direction

## Reference ground truth
The supplied `MahadevaPortfolioPresentation.pdf` is the visual source of truth: a 10-page black-and-white editorial portfolio with a thin top navigation, large serif headlines, compact sans-serif body copy, generous white space, chapter-like page rhythm, and content covering introduction, about, vision, mission, portfolio, team, contact, and thank you.

## Initial directions considered

### Quiet Gallery
An art-book portfolio with near-white paper, dark ink, fine rules, and restrained image crops. Probability: 0.07.

### Signal / Studio
A monochrome creative studio interface with oversized numerals, modular grids, and high-contrast editorial pacing. Probability: 0.06.

### Film Strip Journal
A cinematic contact-sheet layout with frame counters, crop marks, and darker tonal sections. Probability: 0.05.

## Committed direction: Quiet Gallery

- **Design movement:** Swiss editorial minimalism softened by a printed portfolio / gallery-book feel.
- **Core principles:** reduce, frame, sequence, reveal; typography and spacing do most of the branding work.
- **Color philosophy:** warm paper `#f4f1eb`, ink `#171717`, muted gray `#77736d`, and a single clay accent `#b87355` for active states and tiny visual cues.
- **Layout paradigm:** a centered max-width reading column with full-bleed chapters, asymmetric two-column intros, ruled portfolio cards, and large page numbers echoing the reference slides.
- **Signature elements:** monogram mark made from an open `M`, small vertical page labels, thin rules, oversized serif display type, and abstract framed stills that suggest a director's contact sheet.
- **Interaction philosophy:** calm and discoverable; smooth anchor navigation, mobile menu, scroll reveal, portfolio filters, and a gentle image lightbox feel without hijacking the reading flow.
- **Animation:** short opacity / translate reveals, hover crop motion, active nav underline, and no looping decorative motion that competes with the work.
- **Typography system:** `Cormorant Garamond` for display and pull quotes; `DM Sans` for labels, body, controls, and metadata. Use fluid `clamp()` sizes and comfortable line-height.
- **Brand essence:** a visual storyteller who moves between worlds — 3D, texture, edit, and grade — with patience and precision.
- **Brand voice:** quiet confidence, specific craft language, collaborative, observant, and warm.
- **Wordmark / logo:** `M.` monogram in a square, paired with `Muthabathula Mahadeva` in uppercase tracking.
- **Signature brand color:** clay `#b87355`, used sparingly as a film-burn accent and for focus states.

## Asset plan

- Create one custom hero / contact-sheet artwork for the opening visual frame, with safe negative space for overlaid HTML text. The art should feel like a still from a tactile 3D / film workflow: sculptural forms, paper texture, monochrome with clay-brown light.
- Create a project icon / favicon as a flat full-bleed square mark using the open `M` monogram, no baked-in rounded corners, no text, no gradient.
- Use CSS-built frame compositions for portfolio cards so the site stays lightweight and all labels remain accessible HTML.

## Content structure

1. Home / hero
2. Introduction and About Me
3. Vision / Mission
4. Selected work with filterable portfolio cards
5. Team / collaboration statement
6. Contact form and contact details
7. Thank-you close

## Serving decision
Static HTML, CSS, and vanilla JavaScript served from a minimal Node HTTP server on port 3000. No database or server capability is needed for this content-first portfolio. The published build will copy the project root to a static `dist` directory; assets use root-relative paths and the only declared page route is `/`.
