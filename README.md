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

## Contact details

| | |
|---|---|
| Email | `Max.Nudelman@du.edu` |
| LinkedIn | `linkedin.com/in/max-nudelman` |
| GitHub | `github.com/Max-Nudelman` |

## The resume

The nav Resume button links to `resume/Max-Nudelman-Resume.pdf`, exported from
`~/Desktop/Resume/Resume - Nudelman 2026.docx`.

**When you update the resume, re-export it to that exact path and filename**, or the
button will 404. From Word: File, then Save As, choose PDF, and overwrite the file in
`resume/`.

To take the button out again, in the nav of `index.html` replace:

```html
<a href="#contact">Contact</a>
<a class="cta" href="resume/Max-Nudelman-Resume.pdf">Resume</a>
```

with `<a class="cta" href="#contact">Contact</a>`, and do the same in each file under
`projects/` with `../` in front of both paths.

Note that below 620px the nav hides everything except the green pill, so on a phone the
Resume button is the only nav item shown. That is deliberate.

## Editing it later

- **Add a project:** copy one of the `<a class="card">` blocks in `index.html`, and copy
  a file in `projects/` as the write-up template.
- **Change a status tag:** `tag-progress` (amber, "In progress") →
  `tag-live` (green, "Live demo").
- **Change colors:** every color is a variable at the top of `assets/css/style.css`.
  Change `--accent` and the whole site re-themes.

See `DEPLOY.md` for publishing.
