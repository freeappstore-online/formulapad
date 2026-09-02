# FreeAppStore (FAS) Development Guidelines & SDK Specification

These guidelines and specifications govern the architecture, SDK usage, UI components, CLI workflows, and platform constraints for applications built for **FreeAppStore (freeappstore.online)**.

---

## 1. Core Architecture & Prerequisites

- **Runtime & Tooling:** Node.js 22+, `pnpm` (or `npm`), Git, GitHub account.
- **Templates:**
  - `standalone`: LocalStorage-only applications with no backend dependency.
  - `connected`: Apps utilizing the FAS platform backend (`fas.auth`, `fas.kv`, `fas.rooms`, `fas.counters`, `fas.db`, `fas.roles`, `fas.friends`, etc.).
  - `game-canvas`: HTML5 Canvas 2D games.
  - `game-grid`: Grid/tile-based board & puzzle games.
  - `game-3d`: Three.js / WebGL 3D games.
- **Compliance Rules (`fas check`):**
  - No leftover app name placeholders.
  - No tracking SDKs (all known third-party trackers are blocked).
  - Brand fonts must be referenced: `Manrope` + `Fraunces`.
  - No redefined platform CSS tokens.
  - Valid PWA `manifest.json` (`name`, `display`, `start_url`).
  - Total bundle size under **300KB gzipped**.

---

## 2. SDK Reference (`@freeappstore/sdk`)

### Initialization
```typescript
import { initApp } from '@freeappstore/sdk';

export const fas = initApp({ appId: 'my-app' });
await fas.auth.init(); // Capture OAuth callback (call once at app start)
```

### Authentication (`fas.auth`)
- **Providers:** `'github' | 'google' | 'apple' | 'email'` (magic link).
- **Session:** Persists in `localStorage` (30-day HMAC token).
- **Methods:**
  - `fas.auth.user` -> `User | null`
  - `fas.auth.token` -> `string | null`
  - `fas.auth.signIn('github' | 'google' | 'apple' | 'email')`
  - `fas.auth.signInWithEmail('user@x.com')`
  - `fas.auth.signOut()`
  - `fas.auth.onChange((user) => { ... })` -> returns `Unsubscribe`
  - `fas.auth.setDateOfBirth('2000-01-15')`

### Per-User Key-Value (`fas.kv`)
- Scoped to `(appId, userId)` server-side.
- **Limits:** 1MB per user, max 100 keys, max 64KB per value.
- **Methods:**
  - `await fas.kv.set(key, value)`
  - `await fas.kv.get<T>(key)`
  - `await fas.kv.delete(key)`
  - `await fas.kv.list({ prefix?: string })`
  - `await fas.kv.getMany<T>(keys)`

### Shared Atomic Counters (`fas.counters`)
- App-wide atomic counters (public read, auth-required write).
- **Limits:** 1,000 counters per app, increment range `-1000` to `+1000`.
- **Methods:**
  - `await fas.counters.list()` -> `{ [counterName: string]: number }`
  - `await fas.counters.get('name')`
  - `await fas.counters.increment('likes', 1)`

### Collections / Document Store (`fas.db`)
- Public read, owner-only write document store.
- **Limits:** 10,000 documents per collection, 64KB per document.
- **Methods:**
  - `const posts = fas.db.collection('posts')`
  - `await posts.create(data)`
  - `await posts.query({ limit: 20, orderBy: 'created_at', order: 'desc', owner: userId })`
  - `await posts.get(id)`
  - `await posts.update(id, data)`
  - `await posts.delete(id)`

### Realtime Rooms (`fas.rooms`)
- Ephemeral WebSocket rooms backed by Durable Objects (messages not persisted).
- **Limits:** 32 peers/room, 100 msgs/sec/peer, 4KB/message, 64 active rooms/app, 24h idle eviction.
- **Methods:**
  - `const room = fas.rooms.join('roomName')`
  - `room.onPeers((peers) => ...)`
  - `room.onMessage<T>((msg) => ...)`
  - `room.onConnectionState((state) => ...)`
  - `room.send(data)`
  - `room.close()`

### Secret-Injecting Proxy (`fas.proxy`)
- Call third-party APIs with developer-stored keys injected server-side.
- **Limits:** 5 secrets, 5 allowlist rules, 10,000 requests/day, 100KB body limit.
- AI provider hosts (`openai.com`, `anthropic.com`, etc.) are blocked from proxy — use `fas.keys` instead.
- **Usage:**
  - `const res = await fas.proxy.fetch('api.openweathermap.org/data/2.5/weather?q=London')`

### User API Key Vault (`fas.keys`)
- End-user brings their own keys (OpenAI, Anthropic, Google AI, OpenRouter, Replicate, Stability AI, ElevenLabs, Stripe).
- **Usage:**
  - `await fas.keys.has('openai')`
  - `fas.keys.manage('openai')`
  - `await fas.keys.status()`

### Role-Based Access Control (`fas.roles`)
- Roles: `owner`, `member`, `moderator`, `editor`, `viewer`, plus custom roles.
- `await fas.roles.myRoles()`, `await fas.roles.check('moderator')`, `await fas.roles.assign(userId, role)`, `await fas.roles.revoke(userId, role)`

### Friends (`fas.friends`)
- Platform-wide cross-app friendship system.
- `await fas.friends.list()`, `await fas.friends.request(userId)`, `await fas.friends.respond(userId, 'accept' | 'decline' | 'block')`

### Email (`fas.email`) & Webhooks (`fas.webhooks`) & Logging (`fas.log`)
- Transactional email via Resend (100/day limit).
- 5 outbound HMAC-SHA256 signed webhooks per app.
- 3-tier logging: `fas.log.debug()`, `fas.log.info()`, `fas.log.warn()`, `fas.log.error()`, `fas.log.flush()`.

---

## 3. UI Components & Theming (`@freeappstore/sdk/ui`)

### Components
- **Shell & Navigation:** `FasShell`, `ProfileMenu`, `ProfilePage`, `Tabs`, `Footer`
- **Auth & Identity:** `Avatar`, `SignInButton`
- **Controls:** `ThemeToggle`, `TextSizeToggle`
- **Social & Friends:** `AddFriendButton`, `FriendRequestBadge`, `FriendsList`
- **Voice Input:** `VoiceButton`, `VoiceTextArea`
- **Feedback & States:** `Spinner`, `Badge`, `ProgressBar`, `EmptyState`, `ErrorBoundary`
- **Data Display:** `Card`, `ListRow`
- **Overlays:** `Modal`, `ConfirmDialog`
- **Input:** `SearchInput`, `KeyPrompt`

### Design System & Fonts
- **Fonts:** `Manrope` (body/sans) and `Fraunces` (display/serif).
- **CSS Custom Properties:** Respect `--ink`, `--accent`, `--surface`, etc.
- Accent customization:
  ```css
  :root {
    --accent: #10b981;
  }
  ```

### React Hooks (`@freeappstore/sdk/hooks` and `@freeappstore/sdk/ui`)
- `useAuth(fas)` -> `{ user, loading, signIn, signOut, deleteAccount, hasRole }`
- `useTheme()` -> `{ theme, preference, setPreference }`
- `useFriends(fas)` -> `{ friends, requests, loading, requestCount, refresh }`
- `useVoiceInput(onResult)` -> `{ isListening, start, stop, transcript }`
- `useTextSize()` -> `{ size, setSize }`
- `useStandalone()` -> `boolean`

---

## 4. Preferred Free / Keyless Integrations
When an API key is not strictly needed, prefer free public APIs & libraries:
- **Maps:** Leaflet, OpenStreetMap
- **Charts:** Recharts
- **Weather:** Open-Meteo
- **Geocoding:** Nominatim
- **Routing:** OSRM
- **Countries:** REST Countries
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)
- **Drag & Drop:** `@dnd-kit`
- **Markdown:** `react-markdown`
- **State:** Zustand / React Context
