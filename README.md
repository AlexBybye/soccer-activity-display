# GitHub Readme Attack Pulse

An embeddable, soccer-themed SVG activity graph for GitHub profile READMEs.

It reads up to 200 recent public GitHub events, groups them into a 30-day pulse, and highlights the peak-activity moment on a football pitch. The action count is intentionally weighted by event type; it is not the same metric as GitHub's contribution calendar.

## Embed

```html
<img src="https://YOUR-WORKER-DOMAIN/graph?username=AlexBybye&club=red" alt="AlexBybye GitHub attack pulse">
```

`username` is required. `club` is optional and accepts `red`, `sky`, `royal`, `green`, `black`, or `violet`; unknown values fall back to `red`. These are palette names only and do not include official club logos or assets.

The response is a self-contained `image/svg+xml` document. The line and peak marker remain readable if SVG animation is unavailable or reduced motion is enabled.

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
