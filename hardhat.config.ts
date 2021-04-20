import { config } from "./package.json"
import { task, types, HardhatUserConfig } from "hardhat/config"

import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"

// https://hardhat.org/guides/create-task.html

task("deploy", "Deploy a contract instance")
    .addOptionalParam("contract", "The name of the contract", "Elekton", types.string)
    .addOptionalParam("quiet", "To quiet output messages", false, types.boolean)
    .setAction(async (args, hre) => {
        const { contract, quiet } = args
        const ContractFactory = await hre.ethers.getContractFactory(contract)
        const instance = await ContractFactory.deploy()

        if (!quiet) {
            console.log(`Contract ${contract} deployed to: ${instance.address}`)
        }

        return instance
    })

// https://hardhat.org/config/
const hardhatConfig: HardhatUserConfig = {
    solidity: config.solidity,
    paths: {
        sources: config.paths.contracts,
        tests: config.paths.tests,
        cache: config.paths.cache,
        artifacts: config.paths.build.contracts
    },
    defaultNetwork: "besu",
    networks: {
        besu: {
            url: "http://127.0.0.1:8545",
            gasPrice: 0,
            gas: 112450000,
            accounts: {
                mnemonic: "test test test test test test test test test test test junk"
            }
        }
    }
}

export default hardhatConfig
