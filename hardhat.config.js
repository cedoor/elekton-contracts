const { config } = require("./package.json")
const { task, types } = require("hardhat/config")

require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-solhint")

// https://hardhat.org/guides/create-task.html

task("deploy", "Deploy a contract instance")
	.addParam("contract", "The name of the contract", undefined, types.string)
	.addOptionalParam("quiet", "To quiet output messages", false, types.boolean)
	.setAction(async ({ contract, quiet }) => {
		const ContractFactory = await ethers.getContractFactory(contract)
		const instance = await ContractFactory.deploy()

		await instance.deployed()

		if (!quiet) {
			console.log(`Contract ${contract} deployed to: ${instance.address}`)
		}

		return instance
	})

// https://hardhat.org/config/
module.exports = {
	solidity: {
		version: config.solidity.version
	},
	paths: {
		sources: config.paths.contracts,
		tests: config.paths.tests,
		cache: config.paths.cache,
		artifacts: config.paths.build.contracts
	}
}
