# Phase 1: Load decks from Nest API (sso-app)

Replace bundled JSON with **`sso-backend`** public deck routes. No auth, no progress sync, no admin API.

Backend reference: `sso-backend/src/decks/decks.controller.ts`, `decks.service.ts`.

---

## Goal

| Before | After |
| --- | --- |
| `require('../data/decks.json')` | `GET /v1/decks` |
| `getCardFile(deck.contentFile)` | `GET /v1/decks/:deckId` |
| Local `DECK_IMAGES` require | `{ uri: coverImageUrl }` + local fallback if null |
| Static module-level `DECKS` | Fetched state + AsyncStorage cache |

**Keep unchanged:** `CardItem` / `CardResult` types, all card screens, Zustand progress (local only).

---

## API contract (Phase 1 only)

**Base URL** — `EXPO_PUBLIC_API_URL` (no trailing slash)

| Platform | Default |
| --- | --- |
| iOS Simulator | `http://localhost:3001` |
| Android Emulator | `http://10.0.2.2:3001` |
| Physical device | `http://<your-LAN-IP>:3001` |

**No** `Authorization` header in Phase 1.

### `GET /health`

```json
{ "status": "ok" }
```

No `/v1` prefix. Optional startup connectivity check.

### `GET /v1/decks`

Published catalog. Array of:

```json
{
  "deckId": "deck-1",
  "title": "Starter 1",
  "description": "Za početak — malo svega.",
  "isFree": true,
  "productId": null,
  "cardCount": 20,
  "coverImageUrl": null,
  "updatedAt": "2026-08-22T12:35:51.047Z"
}
```

- `deckId` = backend deck `slug` (same as old JSON).
- **No `contentFile`** — do not add it back on the client.

### `GET /v1/decks/:deckId`

Single deck + cards. Shape:

```json
{
  "deckId": "deck-1",
  "title": "...",
  "description": "...",
  "isFree": true,
  "productId": null,
  "cardCount": 20,
  "coverImageUrl": null,
  "updatedAt": "...",
  "cards": [ /* CardItem[] — each includes cardId in payload */ ]
}
```

Cards are stored in DB as full JSON (`cardId`, `type`, `title`, …). App can use `cards` directly as `CardItem[]`.

---

## Type changes — [`types/deck.ts`](../types/deck.ts)

```typescript
export type DeckMeta = {
  deckId: string;
  title: string;
  description: string;
  isFree: boolean;
  productId: string | null;
  cardCount: number;
  coverImageUrl: string | null;
  updatedAt: string;
};

// For React Native Image: remote URI or local require fallback
export type DeckDisplay = DeckMeta & {
  coverSource: { uri: string } | number;
};

export type DeckWithCards = DeckMeta & {
  cards: CardItem[];
};
```

Remove `contentFile` from `DeckMeta`. Update any references.

---

## New files

### `lib/api/config.ts`

- Read `process.env.EXPO_PUBLIC_API_URL`
- Platform default if unset (`Platform.OS === 'android'` → `10.0.2.2`)
- Export `getApiBaseUrl(): string`

### `lib/api/client.ts`

- Thin `fetch` wrapper: `get<T>(path)`, handles JSON parse + throws on non-2xx with message
- Paths include `/v1/...` except health uses `/health`

### `lib/api/decks.ts`

```typescript
fetchDecks(): Promise<DeckMeta[]>
fetchDeck(deckId: string): Promise<DeckWithCards>
checkHealth(): Promise<boolean>
```

### `lib/cache/deckCache.ts`

AsyncStorage keys:

| Key | Value |
| --- | --- |
| `@sso/decks/catalog` | `{ fetchedAt, decks: DeckMeta[] }` |
| `@sso/decks/{deckId}` | `{ fetchedAt, updatedAt, deck: DeckWithCards }` |

**Read path:** try network → on success write cache → on failure read cache → if empty show error UI.

**Invalidation (simple v1):** if catalog fetch succeeds, replace catalog cache. Per-deck cache replaced on each successful `fetchDeck`. Optional: skip refetch if `deck.updatedAt` matches cache (later).

---

## Screen changes

### [`screens/DecksScreen.tsx`](../screens/DecksScreen.tsx)

1. Remove `require('../data/decks.json')`, `getCardFile`, module-level `DECKS`.
2. `useEffect` on mount: `fetchDecks()` → set state → keep existing skeleton until resolved (replace fake 500ms-only timer).
3. **Deck cover:** `coverImageUrl` → `{ uri }`; if null use existing `DECK_IMAGES[deckId]` require map as fallback (keep map temporarily).
4. **Completion badge:** stop using `getCardFile` for card IDs. Use Zustand:

```typescript
const playedInDeck = Object.values(results).filter((r) => r.deckId === deck.deckId).length;
const isCompleted = deck.cardCount > 0 && playedInDeck >= deck.cardCount;
```

5. **Error state:** banner + retry button if fetch fails and no cache.
6. **Pull-to-refresh** (optional, nice to have).

Pass `DeckDisplay` to `openDeck()` unchanged (context type updated).

### [`screens/DeckDetailsScreen.tsx`](../screens/DeckDetailsScreen.tsx)

1. Remove `getCardFile(deck.contentFile)`.
2. On mount (and when `deck.deckId` changes): `fetchDeck(deck.deckId)` → set `cards` state.
3. Skeleton until cards loaded (reuse existing skeleton; base count on `deck.cardCount` not `cards.length` while loading).
4. Header cover: use `deck.coverSource` instead of `deck.image`.
5. On fetch error: show message + retry; try cache.

### [`App.tsx`](../App.tsx)

No change required (still passes `DeckDisplay`).

---

## Files to stop using (after Phase 1 verified)

| File | Action |
| --- | --- |
| [`data/cardFileRegistry.ts`](../data/cardFileRegistry.ts) | Delete |
| [`data/decks.json`](../data/decks.json) | Delete (keep in git history) |
| [`data/sva-pitanja-*.json`](../data/) | Delete from app bundle |

Do **not** delete until API load works on device/simulator.

---

## Environment

**`.env`** (gitignored):

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

**`.env.example`:**

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
# Android emulator: http://10.0.2.2:3001
# Physical device: http://192.168.x.x:3001
```

Expo reads `EXPO_PUBLIC_*` at build time — restart dev server after change.

For physical iPhone: Mac firewall must allow port 3001; phone and Mac on same Wi‑Fi.

---

## Local backend checklist (before testing app)

```bash
cd sso-backend
docker compose up -d   # or local Postgres
npm run migration:run
npm run seed
npm run start:dev      # listens on :3001
curl http://localhost:3001/health
curl http://localhost:3001/v1/decks
curl http://localhost:3001/v1/decks/deck-1
```

---

## Out of scope (Phase 1)

- Cognito / `Authorization`
- `GET/PUT /v1/me/progress` (progress stays AsyncStorage)
- Entitlements API (gate PRO only via `isFree` from catalog)
- Push tokens, leaderboard, scheduled broadcasts
- Admin routes

Phase 2+ will add `userId` header or JWT when Cognito lands.

---

## Implementation order

1. Types + `lib/api/*` + `lib/cache/deckCache.ts`
2. `DecksScreen` fetch + cache + completion fix
3. `DeckDetailsScreen` fetch + cache
4. `.env.example` + manual test on simulator
5. Test physical device with LAN IP
6. Remove JSON + registry
7. Smoke test: browse decks, open deck, play card, completion badges update

---

## Testing checklist

- [ ] Catalog loads with backend running
- [ ] Catalog loads from cache with backend stopped (after one successful fetch)
- [ ] Deck detail loads cards; play flow unchanged
- [ ] FREE deck opens; PRO deck still locked (`isFree: false`)
- [ ] Cover shows when `coverImageUrl` set; fallback when null
- [ ] Completion % and per-deck checkmark match local progress
- [ ] Android emulator reaches API via `10.0.2.2`

---

## Risks / notes

- **CORS:** backend allows `http://localhost:5173` by default — mobile native fetch is not CORS-blocked; only relevant for web.
- **cardId:** API returns `cards` as stored payload; seed includes `cardId`. If any card missing `cardId`, normalize in client: `cardId: c.cardId ?? c.slug`.
- **HTTP on iOS:** App Transport Security may block cleartext `http://` on device; for dev add ATS exception in `app.json` `ios.infoPlist.NSAppTransportSecurity` or use LAN with local network permission. Simulator usually allows localhost.

---

## Estimated effort (with Cursor)

~4–8 focused hours for Phase 1 client work.
