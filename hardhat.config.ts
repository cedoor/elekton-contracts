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

		await instance.deployed()

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
	networks: {
		besu: {
			url: "http://151.56.86.147:18545",
			accounts: [
				"e227d26044b03bdb29ef637638a4a153cd6afb6572753d3ba4dbb3367bb6ebba",
				"1a0bb26879365926c14777a58dcc259e241a71c2546f7eb86f723e1cdf683d73",
				"2a8664ee7022cf75e2cfa04636fe77fc45b735d9ff9d7c514f8ae75114fe0ee6",
				"f6eb9c7034b57fb692e2c1f4177fc01b28eea9e6e5e32ae64d0f62f3937623ad",
				"ec5a056be5c22f3ef4d1bfa02371dcc0cf1394f9ea4b5ce8e9c4f5bc1f0d7704"
			]
		}
	}
}

export default hardhatConfig
