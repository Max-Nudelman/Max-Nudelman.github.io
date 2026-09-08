# Publishing to GitHub Pages

End state: your site lives at **https://max-nudelman.github.io**, which is free and
permanent, and the public repo is itself a signal to recruiters that you write code.

This is the browser route, since you do not have the `gh` command line tool installed.
It takes about five minutes.

---

## 1. Your account

Already done: **github.com/Max-Nudelman**. Your site will land at
**https://max-nudelman.github.io** (GitHub lowercases it).

While you are in there, the profile itself is worth five minutes, because recruiters
who click through from the site land on it:

- **Photo:** the same headshot the site uses, at `assets/img/headshot.jpg`.
- **Name:** Max Nudelman
- **Bio:** Business Information and Analytics @ University of Denver. Sports betting
  analytics, previously risk trading at Fanatics.
- **Location:** Denver, CO
- **Website:** https://max-nudelman.github.io once step 3 is done.

## 2. Create the repository

1. Click **+** at the top right, then **New repository**.
2. **Repository name:** `Max-Nudelman.github.io`, which is your username followed by
   `.github.io`. That exact name is what makes GitHub serve it as your main site rather
   than as a subfolder.
3. Set it to **Public**. It has to be public for Pages to work on a free account.
4. Do **not** check "Add a README", because this folder already has one.
5. Click **Create repository**.

## 3. Upload the site

On the new empty repo page, click **uploading an existing file**.

Open `~/Desktop/max-portfolio` in Finder, select **everything inside it** (Cmd+A), and
drag it onto the browser window. Folders are preserved, so `assets`, `projects` and
`demos` will come across intact.

Two notes so you don't get stuck:

- `.nojekyll` and `.gitignore` are hidden files and Cmd+A will not select them. That is
  fine. Neither is required for this site to work, because none of the folders start with
  an underscore. If you want them anyway, press **Cmd+Shift+.** in Finder to reveal
  hidden files first.
- You can skip `README.md` and `DEPLOY.md` if you would rather not have them public.
  Uploading them is harmless and a README on a repo generally looks better than nothing.

Scroll down, type `Initial site` in the commit box, and click **Commit changes**.

## 4. Turn Pages on

For a repo named `USERNAME.github.io` this is usually automatic. To confirm, go to
**Settings**, then **Pages** in the left sidebar. Under *Build and deployment*, Source
should be **Deploy from a branch**, branch **main**, folder **/ (root)**.

Wait a minute or two, then visit `https://max-nudelman.github.io`. First deploys sometimes
take up to ten minutes, so if you get a 404 give it a bit before assuming something
broke.

## 5. Updating it later

For a one line change, open the repo, click the file, click the pencil icon, edit, and
commit. For anything bigger, use **Add file**, then **Upload files** and drop the replacements in.

If you end up updating the site often, install **GitHub Desktop**. It handles the login
for you, so you never have to deal with access tokens, and pushing a change becomes one
button instead of a browser upload.

---

## Making the GitHub profile itself work for you

The site is one half; the profile is the other. Two things worth doing:

**Publish your project repos.** `bettor-segmentation` and `tableau-betting` should
each be their own public repo, with the README leading on the *finding*, not the file
layout. A recruiter who clicks through from the site should land on something readable.

**Add a profile README.** Create a repo named exactly `Max-Nudelman`, just the username on its own.
Add a `README.md` to it, which GitHub displays at the top of your profile page. Three short
paragraphs: who you are, what you're building, how to reach you.

## Optional: a custom domain

If you later buy `maxnudelman.com` (~$12/year at Namecheap or Cloudflare):

1. Add a file named `CNAME` to the repo containing one line: `maxnudelman.com`
2. At your registrar, add four `A` records for `@` pointing to
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`,
   and a `CNAME` record for `www` pointing to `Max-Nudelman.github.io`.
3. In **Settings then Pages**, enter the domain and tick **Enforce HTTPS**.
