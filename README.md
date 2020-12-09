<p align="center">
    <h1 align="center">
        <img width="40" src="https://github.com/elekton/elekton-dapp/raw/main/assets/images/icon.png">
        Elekton contracts
    </h1>
    <p align="center">Elekton Solidity smart contracts.</p>
</p>

<p align="center">
    <a href="https://github.com/elekton" target="_blank">
        <img src="https://img.shields.io/badge/project-Elekton-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/elekton/elekton-contracts/blob/main/LICENSE" target="_blank">
        <img src="https://img.shields.io/github/license/elekton/elekton-contracts.svg?style=flat-square">
    </a>
    <a href="https://eslint.org/" target="_blank">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-blueviolet?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/" target="_blank">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/elekton/elekton-contracts?style=flat-square">

</p>

---

## Table of Contents

-   🚀[Features](#features)
-   🛠 [Install](#install)
-   🕹 [Usage](#usage)
-   🔬 [Development](#development)
    -   [Rules](#scroll-rules)
        -   [Commits](https://github.com/cedoor/cedoor/tree/main/git#commits-rules)
        -   [Branches](https://github.com/cedoor/cedoor/tree/main/git#branch-rules)
-   🧾 [MIT License](https://github.com/elekton/elekton-contracts/blob/main/LICENSE)
-   ☎️ [Contacts](#contacts)
    -   [Developers](#developers)

## Features

| Feature           | Status | Description                                        |
| ----------------- | :----: | -------------------------------------------------- |
| User registration |   ✔️   | You can register on the system as an Elekton user. |
| Ballot creation   |   ✔️   | All users can create ballots.                      |
| Anonymous vote    |   ✔️   | Authorized users can cast their votes on ballots.  |

## Install

With the following installed packages:

-   git
-   node
-   yarn

Clone the repo and install the dependencies from npm.

```bash
git clone https://github.com/elekton/elekton-contracts.git
cd elekton-contracts
yarn
```

## Usage

Create the snark artifacts (takes a few minutes) and test with:

```
yarn snark
yarn test
```

If you want to interact with the contracts from the outside you can create a [hardhat node](https://hardhat.org/hardhat-network/)
on `http://localhost:8545`, compile and deploy contracts with:

```
yarn start
yarn compile
yarn deploy
```

## Contacts

### Developers

-   e-mail : me@cedoor.dev
-   github : [@cedoor](https://github.com/cedoor)
-   website : https://cedoor.dev
