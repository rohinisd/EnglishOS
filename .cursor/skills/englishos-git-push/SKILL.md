---
name: englishos-git-push
description: Commit and push EnglishOS changes to GitHub. Use when the user asks to push, deploy, save to git, update GitHub, make Vercel deploy changes, or after completing EnglishOS implementation work to proactively offer the git push workflow.
---

# EnglishOS Git Push

## Workflow

Use this skill only inside the `EnglishOS` repository.

## Proactive end-of-work behavior

After completing code changes in `EnglishOS`, proactively check whether there are uncommitted relevant changes and offer to commit and push them using this skill.

Do not silently commit or push without explicit user approval in the current conversation. If the user has clearly asked to commit/push/deploy/save to git, proceed with the workflow below. Otherwise, say that the changes are ready and ask whether to commit and push them.

1. Check the repository state:
   - `git status --short --branch`
   - `git diff`
   - `git log --oneline -5`

2. Review the changes and confirm they are relevant to the user's current request.
   - Do not revert unrelated user changes.
   - Do not commit secrets, `.env` files, credentials, or private keys.
   - If secrets appear in tracked changes, stop and warn the user.

3. Commit using the `rohinisd` GitHub identity for this command only:
   - `GIT_AUTHOR_NAME=rohinisd`
   - `GIT_AUTHOR_EMAIL=rohinisd@users.noreply.github.com`
   - `GIT_COMMITTER_NAME=rohinisd`
   - `GIT_COMMITTER_EMAIL=rohinisd@users.noreply.github.com`

4. Use a concise commit message that explains the outcome.

5. Push to the linked repository:
   - `git push origin main`

6. Verify the result:
   - `git status --short --branch`
   - Confirm local `main` matches `origin/main`.

## PowerShell Commit Template

```powershell
$env:GIT_AUTHOR_NAME='rohinisd'
$env:GIT_AUTHOR_EMAIL='rohinisd@users.noreply.github.com'
$env:GIT_COMMITTER_NAME='rohinisd'
$env:GIT_COMMITTER_EMAIL='rohinisd@users.noreply.github.com'
$commitMessage = @'
Commit message here
'@
git add <relevant-files>
git commit -m $commitMessage
git push origin main
git status --short --branch
```

## Notes

- The remote must remain `https://github.com/rohinisd/EnglishOS`.
- Vercel deploys from `main`, so pushing to `origin/main` is enough to trigger deployment.
- Never update global Git config.
