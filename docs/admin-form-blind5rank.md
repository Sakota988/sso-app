# Prompt: Admin form for creating `BLIND_5_RANK` cards

Build an **admin create/edit form** that writes a **Blind 5 Rank** (“Na slepo”) card into the database in the exact JSON shape the mobile app already consumes. Do not invent extra payload fields the client does not read.

## What this card is

This is a **preference ranking game**, not a quiz. There is **no correct answer**.

The player is shown **5 items one at a time, in shuffled order**. For each item they assign a rank **1 through 5**. Each rank can be used **only once**. When all 5 items are ranked, the game is done.

Ranks **1–5 are hardcoded on the client**. The admin form does **not** let editors change the number of ranks or items.

The meaning of 1 vs 5 is content, not code. Editors set two short labels:
- **rank1** — what “1” means (shown under the left / 1 button)
- **rank5** — what “5” means (shown under the right / 5 button)

Examples from existing cards: `Najbolja` / `Najmanje dobra`, `Najgori` / `Najmanje loš`. Gender in Serbian should match the theme (najbolji / najbolja / najbolje).

On the deck grid, the card back is fixed by type (`slepo_back.png`). Editors do not upload a card-back image.

## Stored payload (must match this TypeScript type)

Cards are stored as full JSON on the deck. The app uses the object as-is (`GET /v1/decks/:deckId` → `cards[]`).

```ts
type Blind5RankCard = {
  cardId: string;
  type: 'BLIND_5_RANK';
  title: string;
  shortTitle: string;
  description: string;
  items: string[];
  labels: { rank1: string; rank5: string };
};
```

| Field | Required | Used in the app as |
| --- | --- | --- |
| `cardId` | yes | Unique id. Progress is keyed by this. Stable after publish. |
| `type` | yes | Must be the literal `'BLIND_5_RANK'`. Not user-editable. |
| `title` | yes | Large title on the play screen. |
| `shortTitle` | yes | One-line label on the deck grid (truncated). Keep short. |
| `description` | yes | One-line hint under the “Na slepo” header. Truncated to 1 line. |
| `items` | yes | Exactly 5 strings. Shuffled at play time. Player assigns ranks 1–5. |
| `labels.rank1` | yes | Caption for rank 1 (left). e.g. `Najbolja`. |
| `labels.rank5` | yes | Caption for rank 5 (right). e.g. `Najgora`. |

**Do not store:** rank count, a correct ranking, images, colors, or result copy. Rank buttons are always `[1, 2, 3, 4, 5]` on the client.

Also persist whatever the rest of the card model already has (deck association, sort order, publish status). This form only owns the type-specific payload above.

## Example of a valid card (from existing content)

```json
{
  "cardId": "starter-b5-04",
  "type": "BLIND_5_RANK",
  "title": "Najbolje kuhinje",
  "shortTitle": "Kuhinje",
  "description": "Rangiraj od 1 do 5.",
  "items": [
    "Italijanska",
    "Meksička",
    "Japanska",
    "Mamina kuhinja",
    "Tajlandska"
  ],
  "labels": {
    "rank1": "Najbolja",
    "rank5": "Najmanje dobra"
  }
}
```

Another pattern (worst → least bad):

```json
{
  "cardId": "starter-b5-13",
  "type": "BLIND_5_RANK",
  "title": "Najgora saobraćajna sredstva za putovanje u 10 ujutru",
  "shortTitle": "Prevoz",
  "description": "Rangiraj od najgoreg.",
  "items": ["Skuter", "Gradski autobus", "Fiat Punto bez klime", "Voz", "Avion"],
  "labels": { "rank1": "Najgore", "rank5": "Najmanje loše" }
}
```

## Admin form UX

**Fixed / hidden**
- `type` = `BLIND_5_RANK` (set automatically when this card type is chosen).

**Text fields**
- **Title** — required. e.g. `Najbolje kuhinje`. Shown large on the play screen.
- **Short title** — required. e.g. `Kuhinje`. Shown on the deck grid; keep it short (aim ≤ ~20 chars). Default it from title if the editor leaves it blank, but still save the field.
- **Description** — required. Short instruction, Serbian, one line. Typical: `Rangiraj od 1 do 5.` or `Rangiraj od najgoreg.` Must stay short; the app clips it with `numberOfLines={1}`.

**Scale labels**
- Two required inputs, side by side:
  - **Rank 1 label** (`labels.rank1`) — left pole. Placeholder: `Najbolji`
  - **Rank 5 label** (`labels.rank5`) — right pole. Placeholder: `Najgori`
- Helper text: “Shown under the 1 and 5 buttons. Match Serbian gender to the theme.”
- Do not let editors add labels for 2, 3, or 4. The client only displays rank1 and rank5.

**Items list (the important part)**
- Exactly **5** string fields, labeled Item 1 … Item 5 (or “Stavka”).
- Each item is a short label shown one at a time on a card. Examples: `Italijanska`, `The Godfather`, `Burger iz Lidla`.
- Support add/remove/reorder **only if** you still enforce exactly 5 on save. Simplest UX: always show 5 inputs.
- Item **order in the form does not matter**. The app shuffles `items` at play time. Do not store a “correct order.”
- Allow Serbian Latin, spaces, punctuation, apostrophes.
- Do **not** use a rich-text editor. Plain strings only.

**cardId**
- Follow the same id/slug rules as other card types.
- Must be unique across cards.
- Immutable after the card is published (changing it orphans local progress).

## Validation (reject save if any fail)

1. `type` is exactly `BLIND_5_RANK`.
2. `title`, `shortTitle`, `description` are non-empty after trim.
3. `labels.rank1` and `labels.rank5` are non-empty after trim.
4. `labels.rank1` !== `labels.rank5` (case-insensitive after trim) — the two poles must differ.
5. `items` is an array of **exactly 5** strings.
6. Each item is non-empty after trim.
7. Items are **unique** (case-insensitive after trim). The app uses the item string as a React `key` and as the key in `ranks: Record<string, number>`; duplicates break ranking and the UI.
8. Reasonable length caps (suggested, not currently enforced by the client):
   - `title` ≤ 80
   - `shortTitle` ≤ 40
   - `description` ≤ 80 (one-line header)
   - `labels.rank1` / `labels.rank5` ≤ 30 (small caption under the rank buttons)
   - each `item` ≤ 60 (shown large on the card face; some existing items are longer phrases)

Trim whitespace before save. Do not persist empty strings.

**Why 5:** the client always shows five rank buttons `[1, 2, 3, 4, 5]` and each rank can be used once. With fewer than 5 items some ranks are unused. With more than 5 the player runs out of ranks and cannot finish. **Lock the form to 5.**

## What the API must return to the app

Unchanged public shape. This card must appear inside `GET /v1/decks/:deckId` → `cards` as the JSON object above. The mobile client does **not** transform `items` or `labels`. If `items` is missing/empty or `labels.rank1` / `labels.rank5` are missing, the play screen breaks.

Progress is **not** written to this form. The app stores locally:

```ts
{
  type: 'BLIND_5_RANK',
  cardId, deckId, cardTitle,
  ranks: Record<string, number>,  // item → rank (1–5), each rank used once
  labels: { rank1: string; rank5: string },
  playedAt: number
}
```

Do not build a results/progress form for this type.

## Out of scope

- Player ranking UI, shuffle, “rank already used” logic
- Card-back image, colors, share-card layout
- Changing the rank scale away from 1–5
- Storing a correct or suggested ranking

## Done when

- An editor can create and edit a Blind 5 Rank card with title, short title, description, rank1/rank5 labels, and 5 unique items.
- Saving stores JSON matching the type above.
- `GET /v1/decks/:deckId` returns that object in `cards`.
- Invalid data (wrong item count, blanks, duplicate items, missing labels) is rejected with a clear error.
