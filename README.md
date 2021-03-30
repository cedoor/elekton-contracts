<p align="center">
    <h1 align="center">
        Elekton contracts
    </h1>
    <p align="center">Elekton Solidity smart contracts.</p>
</p>

<p align="center">
    <a href="https://github.com/cedoor/elekton-contracts/blob/main/LICENSE" target="_blank">
        <img src="https://img.shields.io/github/license/cedoor/elekton-contracts.svg?style=flat-square">
    </a>
    <a href="https://eslint.org/" target="_blank">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/" target="_blank">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/cedoor/elekton-contracts?style=flat-square">
</p>

## Features

| Feature           | Status | Description                                                   |
| ----------------- | :----: | ------------------------------------------------------------- |
| User registration |   ✔️   | Users can register themselves in the contract.                |
| Ballot creation   |   ✔️   | All users can create ballots.                                 |
| Anonymous vote    |   ✔️   | Authorized users can cast their votes on ballots anonymously. |

---

## Table of Contents

-   🛠 [Install](#install)
-   🕹 [Usage](#usage)
-   🔬 Development
    -   Rules
        -   [Commits](https://github.com/cedoor/cedoor/tree/main/git#commits-rules)
        -   [Branches](https://github.com/cedoor/cedoor/tree/main/git#branch-rules)
-   🧾 [MIT License](https://github.com/cedoor/elekton-contracts/blob/main/LICENSE)
-   ☎️ [Contacts](#contacts)
    -   [Developers](#developers)

## Install

With the following installed packages:

-   git
-   node
-   yarn

Clone the repo and install the dependencies from npm.

```bash
git clone https://github.com/cedoor/elekton-contracts.git
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
