const { expect } = require("chai")
const { deployContract, createProof, createAccount } = require("../scripts/utils")

describe("Elekton", function () {
	let elektonInstance

	before(async function () {
		elektonInstance = await deployContract("Elekton")
	})

	it("Snark program should work fine", async function () {
		const { privateKey, publicKey } = await createAccount()
		const proof = await createProof({ in: privateKey, Ax: publicKey[0], Ay: publicKey[1] })
		const proofValidity = await elektonInstance.verifyProof(...proof)

		expect(proofValidity).to.equal(true)
	})

	// it("An admin should create an election with a list of user public keys (elector addresses)", async function () {
	// 	const elekton = await deployContract("Elekton")
	//
	// 	const electors = (await getAccountAddresses()).slice(0, 8)
	//
	// 	elekton.createElection("test", stringToBytes32(electors))
	//
	// 	const election = await elekton.getElection("test")
	//
	// 	expect(bytes32ToString(election.electors)).to.deep.equal(electors)
	// })
})
