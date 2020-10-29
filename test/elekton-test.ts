import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"
import { expect } from "chai"
import { Contract } from "ethers"
import { createElektonProof, createVoterAccounts, deployContract, getEthereumAccounts, getSmt } from "../scripts/utils"

describe("Elekton", function () {
	let elekton: Contract
	let ethereumAccounts: SignerWithAddress[]
	let voterAccounts: any

	before(async function () {
		ethereumAccounts = await getEthereumAccounts()
		elekton = await deployContract("Elekton")
		voterAccounts = createVoterAccounts(5)
	})

	it("An user should add himself to elekton contract", async function () {
		const address = await ethereumAccounts[1].getAddress()
		const id = 121n

		await expect(elekton.connect(ethereumAccounts[1]).createUser(id))
			.to.emit(elekton, "UserCreated")
			.withArgs(address, id)
	})

	it("An user should create a ballot", async function () {
		const id = 12n
		const smt = await getSmt([voterAccounts[0].publicKey, voterAccounts[1].publicKey])
		const startDate = Math.floor(Date.now() / 1000) - 10
		const endDate = Math.floor(Date.now() / 1000) + 10

		await expect(elekton.connect(ethereumAccounts[1]).createBallot(id, smt.root, startDate, endDate))
			.to.emit(elekton, "BallotCreated")
			.withArgs(id)
	})

	it("A voter of a ballot should vote anonymously in that ballot", async function () {
		const id = 12n
		const vote = 2n
		const proof = await createElektonProof(
			[voterAccounts[0].publicKey, voterAccounts[1].publicKey],
			id,
			voterAccounts[0],
			vote
		)

		await expect(elekton.vote(...proof))
			.to.emit(elekton, "VoteAdded")
			.withArgs(id, vote)
	})

	it("A ballot admin should set the poll key when the voting ends", async function () {
		function delay(duration = 5000) {
			return new Promise((resolve) => {
				setTimeout(resolve, duration)
			})
		}

		await delay()

		const id = 12n
		const pollKey = 122n

		await expect(elekton.connect(ethereumAccounts[1]).publishPollKey(id, pollKey))
			.to.emit(elekton, "PollKeyPublished")
			.withArgs(id, pollKey)
	})
})
