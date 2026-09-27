# Quality

Maintained by [ever-better](https://github.com/isamu/ever-better). Numbers are rendered from
`.ever-better/state.json`; edits outside the notes block are overwritten on the next run.

- Phase: **freeze**
- Frozen: not yet — run `ever-better freeze`
- Open violations: **0**
- Rules improved since the ceiling: **0**
- Everything is at or below its ceiling.

## Worklist

Top to bottom. An unattended run works this list and nothing else.

- [x] **P0 diagnose** — taken 2026-09-27T01:28:33.769Z
- [x] **P1 bootstrap** — nothing missing
- [ ] **P2 freeze** — baseline not pinned yet
- [ ] **P3 drain** — backlog empty
- [ ] **P4 tighten** — add the next rule tier, then freeze and drain again
- [ ] **P5 duplication and dead code** — report-only scans; extraction is judgment, not a threshold

## Ratchet

Ceiling is the count at the last freeze. It may fall and must never rise.

No rule violations recorded yet. Run `ever-better freeze`.

## Outstanding

### drain

- [ ] **No CLAUDE.md / AGENTS.md** — Draining is done by agents. Rules that live only in your head produce a different fix every session.

### tighten

- [ ] **Only 71% of sources are TypeScript** — The type-aware rules cover the typed part only, so the remaining .js files are the blind spot the counts will not show.
- [ ] **9 high-value rules are not enforcing (9 off, 0 warn-only)** — Measured with `eslint --print-config`, not read from the config: @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-floating-promises, and 3 more. Each of these has cost somebody real bugs, and a rule that is off reports nothing to notice.
- [ ] **6 strictness flags `strict` does not include are off** — Measured with `tsc --showConfig`, after every extends: noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitReturns, noFallthroughCasesInSwitch, noImplicitOverride, noPropertyAccessFromIndexSignature. Type errors have no suppression mechanism, so enable them one at a time and measure the cost first.

## Notes

<!-- ever-better:notes:start -->
_Anything written between these markers survives a re-render._
<!-- ever-better:notes:end -->
