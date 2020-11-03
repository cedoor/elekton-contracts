<p align="center">
    <h1 align="center">
        <img width="40" src="https://github.com/elekton/dapp/raw/master/assets/images/icon.png">
        Elekton contracts
    </h1>
    <p align="center">Elekton Solidity smart contracts.</p>
</p>
    
<p align="center">
    <a href="https://github.com/elekton" target="_blank">
        <img src="https://img.shields.io/badge/project-Elekton-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/elekton/contracts/blob/master/LICENSE" target="_blank">
        <img src="https://img.shields.io/github/license/elekton/contracts.svg?style=flat-square">
    </a>
    <a href="https://david-dm.org/elekton/contracts" target="_blank">
        <img src="https://img.shields.io/david/elekton/contracts.svg?style=flat-square">
    </a>
    <a href="https://david-dm.org/elekton/contracts?type=dev" target="_blank">
        <img src="https://img.shields.io/david/dev/elekton/contracts.svg?style=flat-square">
    </a>
</p>

___

## :paperclip: Table of Contents
- :rocket: [Features](#rocket-features)
- :hammer: [Install](#hammer-install)
- :video_game: [Usage](#video_game-usage)
- :chart_with_upwards_trend: [Development](#chart_with_upwards_trend-development)
  - :scroll: [Rules](#scroll-rules)
    - [Commits](https://github.com/cedoor/cedoor/tree/main/git#commits-rules)
    - [Branches](https://github.com/cedoor/cedoor/tree/main/git#branch-rules)
- :page_facing_up: [MIT License](https://github.com/elekton/contracts/blob/master/LICENSE)
- :telephone_receiver: [Contacts](#telephone_receiver-contacts)
  - :boy: [Developers](#boy-developers)

## :rocket: Features

| Feature | Status | Description |
|---------|:------:|-------------|
| User registration | :heavy_check_mark: | You can register on the system as an Elektron user. |
| Ballot creation | :heavy_check_mark: | All users can create ballots. |
| Anonymous vote | :heavy_check_mark: | Authorized users can cast their votes on ballots. |

## :hammer: Install

With the following installed packages:
- git
- node >= 12
- npm >= 6

Clone the repo and install the dependencies from npm.

```bash
git clone https://github.com/elekton/contracts.git
cd contracts
npm i
```

## :video_game: Usage

Create the snark artifacts (takes a few minutes) and test with:

```
npm run snark 
npm run test
```

If you want to interact with the contracts from the outside you can create a [hardhat node](https://hardhat.org/hardhat-network/)
on `http://localhost:8545`, compile and deploy contracts with:

```
npm start
npm compile
npm deploy
```

## :telephone_receiver: Contacts
### :boy: Developers
* e-mail : me@cedoor.dev
* github : [@cedoor](https://github.com/cedoor)
* website : https://cedoor.dev
