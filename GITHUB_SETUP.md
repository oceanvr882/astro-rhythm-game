# 🚀 Setting Up ASTRO for Online Play

To make ASTRO available online and share your leaderboard with others, follow these steps to host it on **GitHub Pages**.

## 1. Create a GitHub Repository
1. Go to [github.com](https://github.com) and create a new repository named `astro-rhythm-game`.
2. Keep it **Public**.

## 2. Upload Your Code
Open your terminal in the `fnf_clone` folder and run:
```bash
git init
git add .
git commit -m "Initial release of ASTRO"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/astro-rhythm-game.git
git push -u origin main
```

## 3. Enable GitHub Pages
1. In your GitHub Repo, go to **Settings > Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**.
3. Select **main** and `/ (root)` and click **Save**.
4. Your game will be live at `https://YOUR_USERNAME.github.io/astro-rhythm-game/`!

## 🌐 Making the Leaderboard "Online"
Currently, the leaderboard uses local storage (only you see your scores). To make it truly global, you need a database.

### Recommendation: Supabase (Easiest)
1. Create a free account at [supabase.com](https://supabase.com).
2. Create a table named `leaderboard` with columns: `username`, `score`, `accuracy`.
3. Use the Supabase JS Library in `js/settings.js` to `INSERT` scores after a song and `SELECT` them for the Profile screen.

### Current "Online" Features in ASTRO:
- **Simulated Pro Pilots**: I've added a "World Rankings" tab in the Profile so people can see the standard of top-tier play.
- **Beatmap Sharing**: You can now use the **EDITOR** to create maps. To share them, you can copy the JSON output from the console and give it to a friend!

## 👑 ASTRO Pass Features
The **ASTRO Pass** (Unlockable for 5000 Coins) grants access to:
- **The Editor**: Create custom maps for any MP3 on the web.
- **Premium Effects**: Vortex and Glitch hit animations.
- **Arrow Skins**: Neon, Pixel, and Ghost variants.
```
