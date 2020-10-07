const { expect } = require("chai")
const { babyJub } = require("circomlib")
const { deployContract, createAccounts, createElektonProof } = require("../scripts/utils")

describe("Elekton", function () {
	let elektonInstance
	let accounts

	before(async function () {
		elektonInstance = await deployContract("Elekton")
		accounts = await createAccounts(4)
	})

	it("An admin should create an election with a list of enabled electors", async function () {
		const electors = accounts.map((account) => `0x${babyJub.packPoint(account.publicKey).toString("hex")}`)

		await elektonInstance.createElection(2, electors)

		const election = await elektonInstance.getElection(2)

		expect(election.electors).to.deep.equal(electors)
	})

	it("An elector should vote anonymously", async function () {
		const electionId = 2
		const vote = 4n
		const proof = await createElektonProof(
			accounts.map((account) => account.publicKey),
			electionId,
			accounts[2],
			vote
		)

		await elektonInstance.vote(...proof)

		const election = await elektonInstance.getElection(2)

		console.log(election)

		expect(election.votes[0]).to.equal(vote)
	})
})
