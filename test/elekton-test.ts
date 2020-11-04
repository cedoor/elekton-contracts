import { expect } from "chai"
import { Contract } from "ethers"
import { createElektonProof, delay, deployContract, getAccounts, getSmt } from "../scripts/utils"

describe("Elekton", function () {
	let elekton: Contract
	let accounts: any[]

	before(async function () {
		elekton = await deployContract("Elekton")
		accounts = await getAccounts()
	})

	it("Users should add themselves to elekton contract", async function () {
		for (let i = 1; i < 5; i++) {
			const address = await accounts[i].signer.getAddress()

			await expect(elekton.connect(accounts[i].signer).createUser(i))
				.to.emit(elekton, "UserCreated")
				.withArgs(address, i)
		}
	})

	it("An user should create a ballot", async function () {
		const id = 12n
		const smt = await getSmt(accounts.slice(1, 5).map((account) => account.voter.publicKey))
		const startDate = Math.floor(Date.now() / 1000) - 10
		const endDate = Math.floor(Date.now() / 1000) + 25

		await expect(elekton.connect(accounts[1].signer).createBallot(id, smt.root, startDate, endDate))
			.to.emit(elekton, "BallotCreated")
			.withArgs(id)
	})

	it("Authorized users should vote anonymously in a ballot", async function () {
		const id = 12n

		for (let i = 1; i < 5; i++) {
			const vote = BigInt(i % 2)
			const proof = await createElektonProof(
				accounts.slice(1, 5).map((account) => account.voter.publicKey),
				id,
				accounts[i].voter,
				vote
			)

			await expect(elekton.vote(...proof))
				.to.emit(elekton, "VoteAdded")
				.withArgs(id, vote)
		}
	})

	it("The ballot creator should set the poll key when the voting ends", async function () {
		const id = 12n
		const pollKey = 122n

		await delay(10000)

		await expect(elekton.connect(accounts[1].signer).publishPollKey(id, pollKey))
			.to.emit(elekton, "PollKeyPublished")
			.withArgs(id, pollKey)
	})
})
