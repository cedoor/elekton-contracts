const { ethers, run } = require("@nomiclabs/buidler")

async function main() {
	const Elekton = await ethers.getContractFactory("Elekton")
	const elekton = await Elekton.deploy()

	await elekton.deployed()

	console.log("Elekton deployed to:", elekton.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
