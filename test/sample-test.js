const { expect } = require("chai")
const { ethers, upgrades } = require("@nomiclabs/buidler")

describe("Greeter", function () {
	it("Should return the new greeting once it's changed", async function () {
		const Greeter = await ethers.getContractFactory("Greeter")
		const greeter = await upgrades.deployProxy(Greeter)

		await greeter.setGreeting("Hola, mundo!")
		expect(await greeter.greet()).to.equal("Hola, mundo!")
	})
})
