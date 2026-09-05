# GitHub Readme Attack Pulse

An embeddable soccer activity graph for GitHub profile READMEs. It turns the public events behind a profile into a 15-day attack pulse, then marks the day where that profile played its most active stretch.

## The useful part is the habit read

This is not another contribution-calendar clone. The Worker reads the last 15 days of public events and computes the same compact scouting report for every render:

| Signal               | What it tells you                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Weighted actions     | How intense the recent activity was, with pushes, reviews, issues, releases, and other events weighted by action value. |
| Active days          | Whether the work happened consistently or in short bursts.                                                              |
| Repositories         | How many distinct codebases appeared in the recent run.                                                                 |
| Play style           | The dominant event type, such as code pushes or pull requests.                                                          |
| Daily pulse and peak | The rhythm of the last 15 days, with the highest-activity day marked by a football.                                     |

The result is a static SVG, so the analysis remains readable when GitHub or a README viewer does not run JavaScript.

## Embed

```html
<a href="https://github.com/AlexBybye/soccer-activity-display" target="_blank">
  <img src="https://github-readme-attack-pulse.github-readme-attack-pulse.workers.dev/graph?username=AlexBybye&club=bayern" alt="AlexBybye GitHub attack pulse">
</a>
```

[![AlexBybye GitHub attack pulse](https://github-readme-attack-pulse.github-readme-attack-pulse.workers.dev/graph?username=AlexBybye&club=bayern)](https://github.com/AlexBybye/soccer-activity-display)

`username` is required. `club` is optional and accepts `bayern`, `realmadrid`, `intermilan`, `barcelona`, `dortmund`, or `mancity`; unknown values fall back to `bayern`. `manchestercity` is also accepted as an alias for `mancity`. These are club-inspired palette names only and do not include official club logos or assets.

## Palette previews

Every preset uses the same chart layout, spacing, typography, and peak marker. A shared soft-gray background keeps the card integrated with GitHub, while the pitch grid and pulse use each club's accent colors.

<table>
  <tr>
    <td><strong>Bayern</strong><br><img src="examples/bayern.svg" alt="Bayern red and white palette preview" width="480"></td>
    <td><strong>Real Madrid</strong><br><img src="examples/realmadrid.svg" alt="Real Madrid blue and yellow palette preview" width="480"></td>
  </tr>
  <tr>
    <td><strong>Inter Milan</strong><br><img src="examples/intermilan.svg" alt="Inter Milan blue and black palette preview" width="480"></td>
    <td><strong>Barcelona</strong><br><img src="examples/barcelona.svg" alt="Barcelona red and yellow palette preview" width="480"></td>
  </tr>
  <tr>
    <td><strong>Dortmund</strong><br><img src="examples/dortmund.svg" alt="Dortmund yellow and black palette preview" width="480"></td>
    <td><strong>Manchester City</strong><br><img src="examples/mancity.svg" alt="Manchester City sky blue and white palette preview" width="480"></td>
  </tr>
</table>

The preview files use a fixed sample event shape so the five palettes can be compared side by side. The hosted endpoint always computes the chart from the requested user's current public events.
### For example, here are some of my classmates public events:
<img width="1206" height="411" alt="533b969106f40963a6d0c48c6375f3d3" src="https://github.com/user-attachments/assets/5e246f5e-3330-49e5-9f1b-990fcdc076da" />
<img width="1206" height="409" alt="a1dc430a81581eb4381857262be28d17" src="https://github.com/user-attachments/assets/21418e61-5fed-4021-ad77-9602341915c4" />
<img width="1206" height="415" alt="885ae243b260bb4547c6f36c869e7b77" src="https://github.com/user-attachments/assets/1dde1bca-67a4-42a0-b4da-8230e73f91b6" />
You can also use it to find more public events designed by me!
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
