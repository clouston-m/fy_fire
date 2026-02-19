End the current working session:

1. Update README.md to reflect any structural or feature changes made this session — keep it accurate and concise, remove anything outdated.

2. Check for uncommitted changes with `git status`. If any exist (excluding `.claude/`):
   - Stage the relevant files
   - Write a concise conventional commit message summarising the session's work
   - Commit with the standard Co-Authored-By trailer

3. Check if the local branch is ahead of origin. If so, run `gh auth setup-git` then `git push origin main`.

4. Confirm what was committed and pushed (or note if there was nothing new to deploy).
