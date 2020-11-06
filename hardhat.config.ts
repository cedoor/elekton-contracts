import { config } from "./package.json"
import { task, types, HardhatUserConfig } from "hardhat/config"

import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"

// https://hardhat.org/guides/create-task.html

task("deploy", "Deploy a contract instance")
	.addParam("contract", "The name of the contract", undefined, types.string)
	.addOptionalParam("quiet", "To quiet output messages", false, types.boolean)
	.setAction(async (args, hre) => {
		const { contract, quiet } = args
		const ContractFactory = await hre.ethers.getContractFactory(contract)
		const instance = await ContractFactory.deploy()

		await instance.deployed()

		if (!quiet) {
			console.log(`Contract ${contract} deployed to: ${instance.address}`)
		}

		return instance
	})

// https://hardhat.org/config/
const hardhatConfig: HardhatUserConfig = {
	solidity: {
		version: config.solidity.version
	},
	paths: {
		sources: config.paths.contracts,
		tests: config.paths.tests,
		cache: config.paths.cache,
		artifacts: config.paths.build.contracts
	},
	networks: {
		hardhat: {
			accounts: {
				count: 100
			}
		}
	}
}

export default hardhatConfig
