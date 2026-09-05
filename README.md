# Airline Executive

Airline Executive is a web-based airline management simulation. This first playable foundation covers airline creation, strategy, fleet acquisition, route launch, weekly operations, finances, reputation, demand and aircraft condition.

## GitHub Codespaces

1. Select **Code → Codespaces → Create codespace on main**.
2. Codespaces installs the project automatically.
3. Run `npm run dev:codespaces` in the terminal.
4. Open the forwarded development URL when Codespaces offers it.

## Publish with GitHub Pages

The repository includes an automatic Pages deployment workflow.

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Push to the `main` branch or run the workflow manually from the **Actions** tab.

The live address will be `https://YOUR-USERNAME.github.io/airline-executive/` when the repository is named `airline-executive`.

To test the Pages build inside Codespaces, run `GITHUB_PAGES=true npm run build:pages`. The finished static site is created in `dist-pages/`.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Current game systems

- Three-step founder career setup
- Five international hub choices
- Regional, network and premium business models
- Three realistic first-aircraft lease options
- Initial route selection with market demand
- Weekly operating simulation and automatic local saves
- Command Centre, Network, Fleet and Finance workspaces
- Responsive desktop and mobile interface

The simulation data and formulas live in `lib/game-data.ts`. The main interface and game state are in `components/airline-game.tsx`.
