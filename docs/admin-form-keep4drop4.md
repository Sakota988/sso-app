# Prompt: Admin form for creating `KEEP_4_DROP_4` cards

Build an **admin create/edit form** that writes a **Keep 4 Drop 4** card into the database in the exact JSON shape the mobile app already consumes. Do not invent extra payload fields the client does not read.

## What this card is

This is a **preference game**, not a quiz. There is **no correct answer**.

The player is shown a shuffled stack of short items (traits). For each one they tap **Keep** or **Drop**. They must end with **exactly 4 kept**. The rest are dropped. Keep/drop counts are **hardcoded on the client** (`MAX_KEEP = 4`). The admin form does **not** let editors change how many to keep.

Typical content: a theme (e.g. “Balkanska jela”) plus **exactly 8 unique items**. Keep 4, drop 4.

On the deck grid, the card back is fixed by type (`zadrzi_back.png`). Editors do not upload a card-back image.

## Stored payload (must match this TypeScript type)

Cards are stored as full JSON on the deck. The app uses the object as-is (`GET /v1/decks/:deckId` → `cards[]`).

```ts
type Keep4Drop4Card = {
  cardId: string;
  type: 'KEEP_4_DROP_4';
  title: string;
  shortTitle: string;
  description: string;
  traits: string[];
};
```

| Field | Required | Used in the app as |
| --- | --- | --- |
| `cardId` | yes | Unique id. Progress is keyed by this. Stable after publish. |
| `type` | yes | Must be the literal `'KEEP_4_DROP_4'`. Not user-editable. |
| `title` | yes | Large title on the play screen. |
| `shortTitle` | yes | One-line label on the deck grid (truncated). Keep short. |
| `description` | yes | One-line hint under the “Zadrži 4 Izbaci 4” header. Truncated to 1 line. |
| `traits` | yes | The items. Shuffled at play time. Player keeps 4, drops the rest. |

**Do not store:** keep-count, drop-count, correct answers, images, colors, copy for Keep/Drop buttons, or result text. All of that is client-side.

Also persist whatever the rest of the card model already has (deck association, sort order, publish status). This form only owns the type-specific payload above.

## Example of a valid card (from existing content)

```json
{
  "cardId": "starter-k4-05",
  "type": "KEEP_4_DROP_4",
  "title": "Balkanska jela",
  "shortTitle": "Balkanska jela",
  "description": "Zadrži 4 koja voliš.",
  "traits": [
    "Ćevapi",
    "Pljeskavica",
    "Sarma",
    "Burek",
    "Ajvar",
    "Kajmak",
    "Gibanica",
    "Proja"
  ]
}
```

## Admin form UX

**Fixed / hidden**
- `type` = `KEEP_4_DROP_4` (set automatically when this card type is chosen).

**Text fields**
- **Title** — required. e.g. `Balkanska jela`. Shown large on the play screen.
- **Short title** — required. e.g. `Balkanska jela`. Shown on the deck grid; keep it short (aim ≤ ~20 chars). Default it from title if the editor leaves it blank, but still save the field.
- **Description** — required. Short instruction, Serbian, one line. e.g. `Zadrži 4 koja voliš.` or `Zadrži 4.` Must stay short; the app clips it with `numberOfLines={1}`.

**Traits list (the important part)**
- Repeatable list of **exactly 8** string fields, labeled Trait 1 … Trait 8 (or “Stavka”).
- Each trait is a short label the player sees on a card (one item at a time). Examples: `Ćevapi`, `Pas`, `Nike`, `Gitara`.
- Support add/remove/reorder **only if** you still enforce exactly 8 on save. Simplest UX: always show 8 inputs.
- Allow Serbian Latin, spaces, punctuation, apostrophes (`Shaquille O'Neal`).
- Do **not** use a rich-text editor. Plain strings only.

**cardId**
- Follow the same id/slug rules as other card types.
- Must be unique across cards.
- Immutable after the card is published (changing it orphans local progress).

## Validation (reject save if any fail)

1. `type` is exactly `KEEP_4_DROP_4`.
2. `title`, `shortTitle`, `description` are non-empty after trim.
3. `traits` is an array of **exactly 8** strings.
4. Each trait is non-empty after trim.
5. Traits are **unique** (case-insensitive after trim). The app uses the trait string as a React `key` and as the saved result value; duplicates break the UI and progress.
6. Reasonable length caps (suggested, not currently enforced by the client):
   - `title` ≤ 80
   - `shortTitle` ≤ 40
   - `description` ≤ 80 (one-line header)
   - each `trait` ≤ 40 (shown large on the card face)

Trim whitespace before save. Do not persist empty strings.

**Why 8:** the client always keeps 4. With 8 items the player drops 4, which matches the product name. With fewer than 4 the client auto-keeps everything. With more than 8 it still works (keep 4, drop the rest) but existing content and the product copy assume 8 — **lock the form to 8**.

## What the API must return to the app

Unchanged public shape. This card must appear inside `GET /v1/decks/:deckId` → `cards` as the JSON object above. The mobile client does **not** transform `traits`. If the field is missing, empty, or not an array of strings, the play screen breaks.

Progress is **not** written to this form. The app stores locally:

```ts
{
  type: 'KEEP_4_DROP_4',
  cardId, deckId, cardTitle,
  kept: string[],    // exactly 4 trait strings
  dropped: string[], // the rest
  playedAt: number
}
```

Do not build a results/progress form for this type.

## Out of scope

- Player Keep/Drop UI, shuffle, auto-keep/auto-drop rules
- Card-back image, colors, share-card layout
- Changing `MAX_KEEP` from 4

## Done when

- An editor can create and edit a Keep 4 Drop 4 card with title, short title, description, and 8 unique traits.
- Saving stores JSON matching the type above.
- `GET /v1/decks/:deckId` returns that object in `cards`.
- Invalid data (wrong count, blanks, duplicate traits) is rejected with a clear error.
