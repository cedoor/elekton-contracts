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

Elekton is an e-voting system that uses non-interactive zero-knowledge proofs and blockchain technologies to allow users to vote anonymously in a verifiable and transparent manner. The goal of zero-knowledge proofs is for a *verifier* to be able to convince herself that a *prover* possesses knowledge of a secret parameter. In the Elekton system the verifier is a Solidity smart contract, whereas the prover is the voter, who must create a valid off-chain proof in order to send a transaction and to cast a new vote on an on-chain ballot anonymously. 

In recent years [zk-SNARK](https://doi.org/10.1145/2090236.2090263) has aroused a lot of interest. ZCash uses it to provide a privacy-focused cryptocurrency with a strong mechanism for creating anonymous transactions and many development tools make it easy to use for the integration with other types of blockchains as well. [Iden3](https://www.iden3.io/) provides for example several tools, which are just used in the Elekton system.

[Circom](https://github.com/iden3/circom) is used to create the voting circuit, whereas [SnarkJS](https://github.com/iden3/snarkjs) is used to generate the proofs and export the verifier as a Solidity smart contract. The circuit requires the use of some ZK-friendly algorithms: [Merkle trees](https://doi.org/10.1007/3-540-48184-2_32), [EdDSA](https://doi.org/10.17487/RFC8032) and [Poseidon](https://www.poseidon-hash.info/). Circom actually requires a special kind of Merkle tree, the sparse Merkle tree (SMT), which can be used to create not only membership proofs, but also non-membership proofs. Elekton uses the [SMT](https://github.com/cedoor/sparse-merkle-tree) TypeScript implementation and the [Circomlib](https://github.com/iden3/circomlib) JavaScript library, which provides several zk-friendly algorithm implementations.

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
