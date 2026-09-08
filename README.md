# maxnudelman.github.io

Personal portfolio site. Plain HTML and CSS — no build step, no dependencies.
Open `index.html` in a browser and it works.

```
index.html                  Home: hero, project cards, experience, toolkit, contact
projects/                   One case-study page per project
  market-movement.html
  stake-factor.html
  world-cup-2026.html
demos/
  world-cup-2026.html       The interactive dashboard (self-contained)
assets/css/style.css        All styling. Colors and sizes live in the :root block at the top.
assets/img/headshot.jpg
resume/                     Put Max-Nudelman-Resume.pdf here
.nojekyll                   Tells GitHub Pages to serve files as-is
```

## Before you publish

No `TODO`s left in the HTML. Contact details are all set:

| | |
|---|---|
| Email | `Max.Nudelman@du.edu` |
| LinkedIn | `linkedin.com/in/max-nudelman` |
| GitHub | `github.com/Max-Nudelman` |
| Tableau Public | `public.tableau.com/app/profile/max.nudelman` |

The only thing still missing is the resume PDF — see below.

### Adding the resume back later

The Resume button was removed on purpose until the PDF is finalized — a 404 on that
button is worse than not having one. To put it back, drop the file at
`resume/Max-Nudelman-Resume.pdf`, then in the nav of `index.html` change:

```html
<a class="cta" href="#contact">Contact</a>
```

to:

```html
<a href="#contact">Contact</a>
<a class="cta" href="resume/Max-Nudelman-Resume.pdf">Resume</a>
```

and do the same in each file in `projects/`, with `../` in front of both paths.

## Editing it later

- **Add a project:** copy one of the `<a class="card">` blocks in `index.html`, and copy
  a file in `projects/` as the write-up template.
- **Change a status tag:** `tag-progress` (amber, "In progress") →
  `tag-live` (green, "Live demo").
- **Change colors:** every color is a variable at the top of `assets/css/style.css`.
  Change `--accent` and the whole site re-themes.

See `DEPLOY.md` for publishing.
