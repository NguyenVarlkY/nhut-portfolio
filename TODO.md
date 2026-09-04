# Portfolio Fixes — Task Tracking

## Completed
- [x] 1. Fix Todo dashboard i18n — add missing `tools.todo.*` keys to all 7 locale files
- [x] 2. Convert YCPU tool into a "System Info Viewer" (computer specs) + update `ycpu.*` i18n keys
- [x] 3. Write detailed project descriptions (business core, flow, problem, solution) in `lib/data.ts` + `Projects.tsx`
- [x] 4. Fix i18n key paths in YCPU / Yspeech / tools page (`t('ycpu.')` → `t('tools.ycpu.')`)
- [x] 5. Compact currency converter + transparent select styling
- [x] 6. Transparent tool select in tools page navigation
- [x] 7. Split blogs into separate posts (Vietnamese)
- [x] 8. Verify with `npx tsc --noEmit` (passes, no errors)
- [x] 9. Confirm todo dashboard has Goals/Plans/Schedule/Analytics tabs (verified in TestTodo.tsx)
- [x] 10. Verify YCPU + Yspeech components use correct `tools.*` i18n keys (verified)
- [x] 11. `npx next build` — **Compiled successfully** + type-check passed. Only `/api/chat` fails at page-data collection because `OPENAI_API_KEY` is not set in the environment (pre-existing, unrelated to these changes).

## Notes
- To run a full production build, set `OPENAI_API_KEY` in the environment (used by the ChatBot).
- `npm run dev` works normally without it for local development of the tools.
