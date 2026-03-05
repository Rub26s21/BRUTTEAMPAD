# Contributing to BRUTSTeamPad

Thank you for your interest in contributing! BRUTSTeamPad is an open-source project and we welcome contributions from everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold this code. Report unacceptable behavior to the maintainers.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18.0
- npm ≥ 9.0
- A Supabase project (free tier works)

### Setup

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/brutsteampad.git
   cd brutsteampad
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```
5. **Run database migrations** (see README for details)
6. **Start development:**
   ```bash
   npm run ws:server  # Terminal 1
   npm run dev        # Terminal 2
   ```

---

## Development Workflow

### Branch Naming

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation updates
- `refactor/description` — Code refactoring

### Workflow

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Make your changes
3. Test thoroughly
4. Commit with clear messages:
   ```bash
   git commit -m "feat: add document search functionality"
   ```
5. Push and create a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Formatting (no code change)
- `refactor:` — Code restructuring
- `test:` — Tests
- `chore:` — Maintenance

---

## Pull Request Process

1. **Update documentation** if your change affects the public API or usage
2. **Add/update tests** for new functionality
3. **Ensure the build passes:**
   ```bash
   npm run build
   npm run lint
   ```
4. **Fill out the PR template** completely
5. **Request review** from at least one maintainer
6. **Address review feedback** promptly

### PR Requirements

- [ ] Code follows project coding standards
- [ ] Self-review completed
- [ ] Documentation updated (if applicable)
- [ ] No console errors or warnings
- [ ] Responsive design maintained
- [ ] Accessibility considered

---

## Coding Standards

### TypeScript

- Use strict TypeScript — no `any` types unless absolutely necessary
- Define interfaces for all data structures
- Use meaningful variable and function names

### React

- Use functional components with hooks
- Memoize expensive computations with `useMemo` / `useCallback`
- Keep components focused and under 200 lines when possible
- Co-locate hooks, types, and utilities with components

### Styling

- Use TailwindCSS utility classes
- Follow the glassmorphism design system defined in `globals.css`
- Use design tokens from `tailwind.config.js` (no arbitrary colors)
- Ensure dark-mode compatibility (it's the only mode)

### File Organization

- Components → `src/components/{domain}/`
- Hooks → `src/hooks/`
- Libraries → `src/lib/`
- API routes → `src/app/api/`
- Workflows → `workflows/`

---

## Reporting Bugs

Use the [Bug Report template](./.github/ISSUE_TEMPLATE/bug_report.md) and include:

1. **Description** — What happened?
2. **Steps to reproduce** — How can we see the bug?
3. **Expected behavior** — What should happen?
4. **Screenshots** — If applicable
5. **Environment** — Browser, OS, Node version

---

## Suggesting Features

Use the [Feature Request template](./.github/ISSUE_TEMPLATE/feature_request.md) and include:

1. **Problem statement** — What problem does this solve?
2. **Proposed solution** — How would it work?
3. **Alternatives** — Other approaches considered
4. **Additional context** — Mockups, examples, etc.

---

## 🎉 Thank You!

Every contribution makes BRUTSTeamPad better. Whether it's fixing a typo, reporting a bug, or adding a major feature — we appreciate it!
