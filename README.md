# BRUTSTeamPad

BRUTSTeamPad is an open-source collaborative real-time document editor built for small teams, students, and developers.

## Features

- Real-time collaborative editing
- Workspace-based document organization
- Team Key authentication system
- Live cursors with usernames
- Suggestion mode for edits
- Autosave every 10 seconds
- Markdown and rich text support
- Image uploads using Supabase Storage
- Dark mode glassmorphism UI

## Tech Stack

Frontend:
- Next.js
- TailwindCSS
- Framer Motion
- TipTap Editor

Realtime Collaboration:
- Yjs CRDT
- WebSocket provider

Backend:
- Supabase PostgreSQL
- Supabase Storage
- Motia.dev workflows

Deployment:
- Vercel

## Workspace System

Users can create workspaces using a unique Team Key.

Example Team Key:
BRUTS-1234

Team members join a workspace using this key to collaborate on documents.

## License

MIT License
