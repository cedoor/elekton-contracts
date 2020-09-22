const { expect } = require("chai")
const { bytes32ToString, stringToBytes32, deploy } = require("../scripts/utils")

describe("Elekton", function () {
	it("Should return the user data once an admin is created", async function () {
		const elekton = await deploy("Elekton")

		await elekton.createAdmin(...bytes32ToString(["Pinco", "Pallino", "pallino"]))

		const userData = await elekton.getUser()

		expect(stringToBytes32(userData.name)).to.equal("Pinco")
	})
})
