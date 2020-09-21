usePlugin("@nomiclabs/buidler-waffle")
usePlugin("@nomiclabs/buidler-ethers")
usePlugin("@openzeppelin/buidler-upgrades")

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
	.setAction(async ({ contract }) => {
		const ContractFactory = await ethers.getContractFactory(contract)
		const instance = await upgrades.deployProxy(ContractFactory)

		await instance.deployed()

		console.log(`Contract ${contract} deployed!`)
	})

// https://buidler.dev/config/
module.exports = {
	solc: {
		version: "0.6.8",
	},
	paths: {
		artifacts: "./build/contracts",
	},
}
