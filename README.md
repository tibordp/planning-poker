This is a a Planning Poker app, useful for Scrum grooming sessions to avoid anchoring in point estimates.

## [See it live](https://poker.ojdip.net)

## Screenshots

Scores hidden                |  Scores visible              |  Session settings
:---------------------------:|:----------------------------:|:-----------------:
![](./docs/hidden_scores.png)|![](./docs/visible_scores.png)| ![](./docs/settings.png)

## Features

- A self contained stateful Node app, no database required
- Ephemeral sessions that are created and cleaned up on demand
- Easily customizable score sets and other session parameters
- Median scores are automatically highlighted
- Easy integration with e.g. Jira userscripts via the API

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production build

```bash
yarn build
yarn start
```

See [the example manifest](./kubernetes/manifest.yaml) for deploying Planning Poker to the Kubernetes cluster of your choice.