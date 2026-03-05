<div align="center">

# 🚀 BRUTSTeamPad

### Real-Time Collaborative Document Editor

*For students, small teams, and developers*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://typescriptlang.org/)
[![TipTap](https://img.shields.io/badge/TipTap-2.6-purple)](https://tiptap.dev/)
[![Yjs](https://img.shields.io/badge/Yjs-CRDT-green)](https://yjs.dev/)

</div>

---

## ✨ Features

- 🔄 **Real-Time Collaboration** — CRDT-powered sync via Yjs. Zero conflicts, instant updates.
- 🖊️ **Rich Document Editor** — TipTap-based with bold, italic, headings, lists, code blocks, tables, and images.
- 👥 **Live Cursors** — See collaborators' cursors and names in real-time with color-coded identities.
- 🔑 **Team Key Auth** — No accounts needed. Enter a shared team key + your name to join.
- 💾 **Autosave** — Content persists every 10 seconds automatically. Never lose work.
- 📂 **Workspace System** — Organize documents within team workspaces.
- 📝 **Suggestions** — Propose edits with accept/reject workflow.
- 🕐 **Version History** — Automatic snapshots every 5 minutes.
- 🎨 **Glassmorphism UI** — Dark-mode futuristic design inspired by Notion, Linear, and Apple VisionOS.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Frontend                         │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ Next.js  │  │  TipTap   │  │ Framer Motion    │  │
│  │ App      │  │  Editor   │  │ Animations       │  │
│  │ Router   │  │           │  │                  │  │
│  └────┬─────┘  └─────┬─────┘  └──────────────────┘  │
│       │              │                               │
│  ┌────┴──────────────┴─────┐                         │
│  │     Yjs CRDT Engine     │                         │
│  │   (Conflict-Free Sync)  │                         │
│  └────────────┬────────────┘                         │
└───────────────┼──────────────────────────────────────┘
                │ WebSocket
┌───────────────┼──────────────────────────────────────┐
│               ▼                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │  WebSocket Server    │  │  Supabase            │  │
│  │  (y-websocket)       │  │  ├── PostgreSQL DB   │  │
│  │                      │  │  ├── Storage (imgs)  │  │
│  └──────────────────────┘  │  └── RLS Policies    │  │
│                            └──────────────────────┘  │
│                    Backend                           │
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | SSR, routing, API routes |
| **Editor** | TipTap 2.6 | Rich text editing |
| **Realtime** | Yjs + y-websocket | CRDT conflict-free collaboration |
| **Styling** | TailwindCSS 3.4 | Glassmorphism design system |
| **Animations** | Framer Motion 11 | Smooth UI transitions |
| **State** | Zustand 4 | Lightweight global state |
| **Database** | Supabase PostgreSQL | Documents, workspaces, versions |
| **Storage** | Supabase Storage | Image uploads |
| **Workflows** | Motia.dev | Backend workflow orchestration |
| **Deployment** | Vercel | Serverless hosting |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.0
- **npm** ≥ 9.0
- A **Supabase** project ([create one free](https://supabase.com))

### 1. Clone & Install

```bash
git clone https://github.com/your-org/brutsteampad.git
cd brutsteampad
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_WS_URL=ws://localhost:1234
```

### 3. Database Setup

Copy the SQL from `supabase/migrations/001_initial_schema.sql` and run it in your **Supabase Dashboard → SQL Editor**.

Or use the migration script:

```bash
npm run db:migrate
```

### 4. Create Storage Bucket

In Supabase Dashboard → Storage:

1. Create a bucket named `brutsteampad-images`
2. Set it to **Public**
3. Add policies for public read/write

### 5. Start Development

Start the WebSocket server and Next.js dev server:

```bash
# Terminal 1: WebSocket server
npm run ws:server

# Terminal 2: Next.js app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter a team key to start!

---

## 📁 Project Structure

```
brutsteampad/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API route handlers
│   │   │   ├── autosave/      
│   │   │   ├── documents/     
│   │   │   └── workspace/     
│   │   ├── globals.css         # Global styles & design system
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main entry point
│   ├── components/
│   │   ├── editor/             # TipTap editor components
│   │   │   ├── DocumentEditor.tsx
│   │   │   └── EditorToolbar.tsx
│   │   ├── workspace/          # Workspace layout components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── TopNavigation.tsx
│   │   │   ├── WorkspaceLayout.tsx
│   │   │   ├── WorkspaceSidebar.tsx
│   │   │   └── SuggestionPanel.tsx
│   │   ├── cursors/            # Collaboration cursor components
│   │   │   └── LiveUserBar.tsx
│   │   └── ui/                 # Reusable UI primitives
│   │       ├── Avatar.tsx
│   │       ├── Button.tsx
│   │       ├── GlassPanel.tsx
│   │       └── Logo.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAutosave.ts
│   │   ├── useDocuments.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useRealtime.ts
│   ├── lib/                    # Core libraries
│   │   ├── realtime.ts         # Yjs CRDT engine
│   │   ├── store.ts            # Zustand state stores
│   │   ├── supabase.ts         # Supabase client
│   │   ├── supabase-api.ts     # Database operations
│   │   └── types.ts            # TypeScript type definitions
│   └── server/
│       └── websocket.mjs       # Standalone WebSocket server
├── workflows/                  # Motia.dev workflow definitions
│   ├── team-key-validation.ts
│   ├── document-autosave.ts
│   ├── suggestion-processing.ts
│   ├── version-snapshot.ts
│   └── workspace-documents.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── scripts/
│   └── migrate.mjs
├── .env.example
├── vercel.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── package.json
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── README.md
```

---

## 🔐 Authentication

BRUTSTeamPad uses **Team Key Authentication** — no email accounts required.

```
User opens app → Enter Team Key → Enter Display Name → Join Workspace
```

**Example:**
- Team Key: `BRUTS-2026`
- Name: `Rubs`
- Result: Joins the workspace associated with `BRUTS-2026`

If the team key doesn't exist, a new workspace is created automatically.

---

## 📡 Real-Time Data Flow

```
User types
  → TipTap emits change
    → Yjs processes CRDT update
      → WebSocket broadcasts to all clients
        → All clients sync instantly (conflict-free)
```

**Autosave Pipeline:**
```
Editor update → Yjs sync (instant) → Periodic save (10s) → Supabase DB
```

---

## 🎨 Design System

The UI uses a **dark-mode glassmorphism** aesthetic:

```css
/* Glass Panel */
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.15);
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
```

**Design Inspiration:** Notion · Linear · Apple VisionOS

---

## ☁️ Deployment

### Deploy to Vercel

1. Push your repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel Dashboard
4. Deploy automatically on push

### Deploy WebSocket Server

The WebSocket server needs a persistent process. Options:
- **Railway** / **Render** / **Fly.io** — deploy `src/server/websocket.mjs`
- **Docker**: Create a container for the WS server
- **VPS**: Run with `pm2` or `systemd`

Update `NEXT_PUBLIC_WS_URL` to point to your deployed WS server.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ by the BRUTSTeamPad community**

</div>
