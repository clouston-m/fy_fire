End the current working session:

## 1. Update context files

Read both files in full, then propose and apply updates to capture what changed this session.

**`CLAUDE.md`** (project root) — stable facts only. Update if:
- New routes, key files, or shadcn/ui components added
- Build state changed (e.g. a phase moved from "not built" to "complete")
- New architecture rules or conventions established

**`~/.claude/projects/-Users-clouston-mahon-Documents-fy-fire/memory/MEMORY.md`** — evolving state. Always update:
- "Current Development State" section to reflect what was built this session
- Add key decisions made and why (remove stale ones)
- Add any new workflow quirks or user preferences observed

Show proposed changes as diffs and ask for approval before writing. Keep additions to one line per concept.

## 2. Update README.md

Reflect any structural or feature changes — keep it accurate and concise, remove anything outdated.

## 3. Commit uncommitted changes

Check `git status`. If changes exist (excluding `.claude/`):
- Stage relevant files
- Write a concise conventional commit message summarising the session's work
- Commit with the standard Co-Authored-By trailer

## 4. Push

If local branch is ahead of origin: run `gh auth setup-git` then `git push origin main`.

## 5. Confirm

Report what was updated, committed, and pushed (or note if nothing was new).
