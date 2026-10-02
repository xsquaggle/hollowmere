HOLLOWMERE: INSTALLABLE WEB APP (build 9e9506b30c)

What's in here
  index.html             the whole game (fonts built in)
  manifest.webmanifest   name, icons and full-screen settings for installing
  sw.js                  offline worker: the game opens with no signal
  icons/, splash/        home-screen icons and iPhone launch screens

Putting it online (pick one, all free)
  GitHub Pages: make a repository, upload everything in this folder, then
    Settings > Pages > Deploy from branch > main / root. Your address is
    https://YOUR-NAME.github.io/REPOSITORY/
  Netlify: go to app.netlify.com/drop and drag this folder onto the page.
  Cloudflare Pages: Workers & Pages > Create > Pages > Upload assets.
  It must be served over https (all three do this), from the folder root.

Installing
  iPhone: open the address in Safari > Share > Add to Home Screen.
    The home-screen app keeps its own save. To bring progress from Safari,
    open Settings (gear) > Save > Make a backup code in Safari first, then in
    the app tap "Have a backup code?" on the first screen and paste it.
  Pixel: open the address in Chrome > menu > Install app. The save carries over.

Updating
  Upload the new files over the old ones. Players get the new version the next
  time they open the game online; offline they keep playing the last version.

Fonts: Nunito, Young Serif and Caveat, SIL Open Font License 1.1 (see fonts/).
