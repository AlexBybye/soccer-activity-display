# GitHub Readme Attack Pulse

An embeddable, soccer-themed SVG activity graph for GitHub profile READMEs.

It reads up to 200 recent public GitHub events, groups them into a 30-day pulse, and highlights the peak-activity moment on a football pitch. The action count is intentionally weighted by event type; it is not the same metric as GitHub's contribution calendar.

## Embed

```html
<img src="https://github-readme-attack-pulse.github-readme-attack-pulse.workers.dev/graph?username=AlexBybye&club=bayern" alt="AlexBybye GitHub attack pulse">
```

Live endpoint: <https://github-readme-attack-pulse.github-readme-attack-pulse.workers.dev/graph?username=AlexBybye&club=bayern>

`username` is required. `club` is optional and accepts `bayern`, `realmadrid`, `intermilan`, `barcelona`, or `dortmund`; unknown values fall back to `bayern`. These are club-inspired palette names only and do not include official club logos or assets. The presets are based on Bayern (red/white), Real Madrid (white/blue), Inter Milan (blue/black), Barcelona (red/yellow), and Dortmund (yellow/black).

The response is a self-contained `image/svg+xml` document. The line and peak marker are rendered statically for consistent display in README images.

## Local development

```bash
npm install
npm test
npm run typecheck
npm run dev
```

For production, create a Cloudflare KV namespace, bind it as `ATTACK_PULSE_CACHE` in `wrangler.toml`, and set `GITHUB_PUBLIC_TOKEN` with `wrangler secret put GITHUB_PUBLIC_TOKEN`. A token increases GitHub API headroom; it is never returned to clients.

## License

MIT
