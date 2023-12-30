# Ghost-Unlock Integration 

## Overview

⚠️ This project is currently under active development. Things might break. Feel free to check the open issues & create new ones.

The Ghost Unlock Integration is an open-source project that aims to introduce token-gated memberships to Ghost CMS publications using the Unlock Protocol. The project is built using Scaffold-Eth 2, an open-source toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.
It's a new version of scaffold-eth with its core functionality. Built using NextJS, RainbowKit, Hardhat, Wagmi and Typescript.

Features
- MongoDB
- NextAuth
- Siwe
- Nextjs-cors

## Contents

- [Requirements](#requirements)
- [Quickstart](#Quickstart)
- [Deploying your NextJS App](#Deploying-your-NextJS-App)
- [Disabling Type & Linting Error Checks](#Disabling-type-and-linting-error-checks)
  * [Disabling commit checks](#Disabling-commit-checks)
  * [Deploying to Vercel without any checks](#Deploying-to-Vercel-without-any-checks)
  * [Disabling Github Workflow](#Disabling-Github-Workflow)
- [Contributing to Scaffold-Eth 2](#Contributing-to-Scaffold-Eth-2)

## Requirements

Before you begin, you need to install the following tools:
- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-Eth 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/blahkheart/se-2.git 
cd se-2
git checkout ghost-unlock-api
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

3. On a second terminal, start your NextJS app:

```
yarn start
```
Visit your app on: `http://localhost:3000`. You can tweak the frontend components in `packages/nextjs/components/ghost-unlock`.

- Edit your database models in `packages/nextjs/lib/models`
- Edit your frontend in `packages/nextjs/pages/user`
- Edit your api endpoints in `packages/nextjs/pages/api`

### How it works

As the name implies, the Ghost Unlock integration works with a ghost publication. For convenience we are developing a Ghost theme to facilitate usage of the integration [coming soon]. However, you can deploy your own ghost publication easily using the [ghost documentation](https://ghost.org/docs/). 
Once you have your ghost publication setup: 
- Get your admin api key and head over to the Ghost Unlock integration. 
- Create a new integration for your publication using the admin api key, and enter the url for your publication or `http://localhost:2368` if it is hosted locally.
- Create a new tier for the integration you just created to begin token gating posts 
  * Deploy two lock smart contracts using [Unlock Protocol](https://app.unlock-protocol.com/locks) (one for your monthly plan and another your yearly plan)
  * Fill the `Create a tier` form and submit. If successful, you will have the tier created on your ghost publication.

**Hint**: We recommend using a 3-letter ISO currency code when creating a tier for compatibiliy with the ghost api i.e `USD, EUR, BTC, ETH` etc. 

**Hint**: Locks used for tier monthly and yearly plans must have integer prices for compatibiliy with the ghost api i.e `keyPrice > 0`.

## Deploying your NextJS App

Run `yarn vercel` and follow the steps to deploy to Vercel. Once you log in (email, github, etc), the default options should work. It'll give you a public URL.

If you want to redeploy to the same production URL you can run `yarn vercel --prod`. If you omit the `--prod` flag it will deploy it to a preview/test URL.

**Make sure your `packages/nextjs/scaffold.config.ts` file has the values you need.**

**Hint**: We recommend connecting the project GitHub repo to Vercel so you the gets automatically deployed when pushing to `main`

## Disabling type and linting error checks
> **Hint**
> Typescript helps you catch errors at compile time, which can save time and improve code quality, but can be challenging for those who are new to the language or who are used to the more dynamic nature of JavaScript. Below are the steps to disable type & lint check at different levels

### Disabling commit checks
We run `pre-commit` [git hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) which lints the staged files and don't let you commit if there is an linting error.

To disable this, go to `.husky/pre-commit` file and comment out `yarn lint-staged --verbose`

```diff
- yarn lint-staged --verbose
+ # yarn lint-staged --verbose
```

### Deploying to Vercel without any checks
Vercel by default runs types and lint checks while developing `build` and deployment fails if there is a types or lint error.

To ignore types and lint error checks while deploying, use :
```shell
yarn vercel:yolo
```

### Disabling Github Workflow
We have github workflow setup checkout `.github/workflows/lint.yaml` which runs types and lint error checks every time code is __pushed__ to `main` branch or __pull request__ is made to `main` branch

To disable it, **delete `.github` directory**

## Contributing to Scaffold-Eth 2

We welcome contributions to Scaffold-Eth 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/se-2/blob/master/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-Eth 2.

