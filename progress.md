Original prompt: Build this using HTML, CSS and vanilla js. Here is the concept: ICT Adventure Island. Create a touch-based classroom web app with a colorful island map and four mini-games: Build a Computer, Input vs Output sorting, What Does It Do?, and Teacher Says. Keep it bright, simple, kid-friendly, and easy to tap.

- 2026-03-30: Scaffolded `index.html`, `style.css`, and `app.js` from scratch in an empty workspace.
- 2026-03-30: Added island map, scoreboard, feedback banner, touch/mouse drag system, and four mini-games.
- 2026-03-30: Added `window.render_game_to_text` and `window.advanceTime` hooks for automated verification.
- 2026-03-30: Removed external font loading so the app works offline and fixed failed-drag shake cleanup in the build/sort games.
- 2026-03-30: Verified the app with Playwright across the map, build, sort, quiz, and Teacher Says flows. The automated run completed all four islands and ended at 25 stars / 4 of 4 completed.
- 2026-03-30: Expanded the lesson into a longer format. Computer Island now has 3 missions, Input Island has 3 missions, Output Island has 2 larger rounds, and Challenge Island has 10 Teacher Says rounds with streaks and lives.
- 2026-03-30: Switched the page to `app-extended.js` and verified the longer flow with Playwright. The automated run completed all islands at 96 stars with all missions cleared.
- TODO: Optional cleanup if desired: remove `node_modules` and the Playwright screenshot artifacts now that verification is finished.
