# Commit Message Guidelines

This repo uses the **Conventional Commits** specification so tools like
[release-please](https://github.com/googleapis/release-please) can automatically
generate changelogs and version releases.

👉 Full spec: <https://www.conventionalcommits.org/>

---

## Format

```

<type>[optional scope][!]: <short description>

[optional body]

[optional footer(s)]

```

### Example

```

feat(api): add user authentication endpoint

```

---

## Types (What to Use)

These are the most important commit types for automation:

| Type             | Purpose         | Version Impact |
| ---------------- | --------------- | -------------- |
| `feat`           | New feature     | MINOR          |
| `fix`            | Bug fix         | PATCH          |
| `feat!` / `fix!` | Breaking change | MAJOR          |

---

## Common Additional Types

These don’t affect versioning (unless marked as breaking):

| Type       | Description                          |
| ---------- | ------------------------------------ |
| `docs`     | Documentation only changes           |
| `chore`    | Maintenance (deps, configs, etc.)    |
| `ci`       | CI/CD changes                        |
| `build`    | Build system or dependencies         |
| `refactor` | Code change without feature or fix   |
| `perf`     | Performance improvements             |
| `test`     | Adding or updating tests             |
| `style`    | Formatting, linting, no logic change |
| `revert`   | Reverts a previous commit            |

---

## Breaking Changes

You can mark breaking changes in **two ways**:

### 1. Using `!` (recommended for release-please)

```

feat!: drop support for Node 16

```

### 2. Using a footer

```

feat: update config system

BREAKING CHANGE: config format has changed

```

---

## Scope (Optional but Recommended)

Use scopes to describe _where_ the change happened:

```

feat(auth): add login endpoint
fix(ui): button alignment issue

```

---

## Writing Good Descriptions

- Use **imperative mood**
    - ✅ `add login validation`
    - ❌ `added login validation`
- Keep it short (~50 chars ideal)
- Be clear and specific

---

## Multi-line Example

```

fix(api): prevent duplicate user creation

Adds a unique constraint check before insert.
Improves error handling for race conditions.

Refs: #123

```

---

## Reverting Commits

```

revert: remove experimental caching

Refs: abc1234

```

---

## Why This Matters

Using this format allows us to:

- Automatically generate changelogs
- Automatically bump versions (SemVer)
- Trigger releases via release-please
- Keep history clean and searchable

---

## Quick Reference

```

feat: new feature
fix: bug fix
feat!: breaking change
docs: documentation
chore: maintenance

```

---

## 📌 Notes

- The tool release-please highly recommend that you use squash-merges when merging pull requests.

---
