usePlugin("@nomiclabs/buidler-waffle")
usePlugin("@nomiclabs/buidler-ethers")
usePlugin("@nomiclabs/buidler-solhint")

const { task, types } = require("@nomiclabs/buidler/config")

// https://buidler.dev/guides/create-task.html

task("accounts", "Prints the list of accounts", async () => {
	const accounts = await ethers.getSigners()

	for (const account of accounts) {
		console.log(await account.getAddress())
	}
})

task("deploy", "Deploy a contract instance with Open Zeppelin")
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

// https://buidler.dev/config/
module.exports = {
	solc: {
		version: "0.6.8",
	},
}
