import { expect } from "chai"
import { Contract } from "ethers"
import { createElektonProof, delay, deployContract, getAccounts, getSmt } from "../scripts/utils"

describe("Core tests", function () {
	let elekton: Contract
	let accounts: any[]

	before(async function () {
		elekton = await deployContract("Elekton")
		accounts = await getAccounts()
	})

	describe("#createUser()", function () {
		it(`An user with id = 0 should not add himself`, async function () {
			const elektonUser = elekton.connect(accounts[1].signer)

			await expect(elektonUser.createUser(0)).to.be.revertedWith("E000")
		})

		for (let userId = 1; userId < 5; userId++) {
			it(`User with id = ${userId} should add himself`, async function () {
				const elektonUser = elekton.connect(accounts[userId].signer)
				const address = await accounts[userId].signer.getAddress()

				await expect(elektonUser.createUser(userId)).to.emit(elekton, "UserCreated").withArgs(address, userId)
			})
		}

		it(`User with id = 1 should not update his id to 1`, async function () {
			const elektonUser = elekton.connect(accounts[1].signer)

			await expect(elektonUser.createUser(1)).to.be.revertedWith("E001")
		})

		it(`User with id = 1 should update his id to 5`, async function () {
			const elektonUser = elekton.connect(accounts[1].signer)
			const address = await accounts[1].signer.getAddress()
			const userId = 5

			await expect(elektonUser.createUser(userId)).to.emit(elekton, "UserUpdated").withArgs(address, userId)
		})

		it(`User with id = 5 should update again his id to 1`, async function () {
			const elektonUser = elekton.connect(accounts[1].signer)
			const address = await accounts[1].signer.getAddress()
			const userId = 1

			await expect(elektonUser.createUser(userId)).to.emit(elekton, "UserUpdated").withArgs(address, userId)
		})
	})

	describe("#createBallot()", function () {
		it("User with id = 1 should create a ballot of 30s with 4 voters", async function () {
			const elektonUser = elekton.connect(accounts[1].signer)
			const ballotId = 12n
			const smt = await getSmt(accounts.slice(1, 5).map((account) => account.voter.publicKey))
			const startDate = Math.floor(Date.now() / 1000) + 10
			const endDate = Math.floor(Date.now() / 1000) + 30

			await expect(elektonUser.createBallot(ballotId, smt.root, startDate, endDate))
				.to.emit(elekton, "BallotCreated")
				.withArgs(ballotId)
		})
	})

	describe("#vote()", function () {
		const ballotId = 12n

		for (let userId = 1; userId < 5; userId++) {
			it(`Voter with id = ${userId} should vote anonymously in a ballot`, async function () {
				const vote = BigInt(userId % 2)
				const proof = await createElektonProof(
					accounts.slice(1, 5).map((account) => account.voter.publicKey),
					ballotId,
					accounts[userId].voter,
					vote
				)

				await expect(elekton.vote(...proof))
					.to.emit(elekton, "VoteAdded")
					.withArgs(ballotId, vote)
			})
		}
	})

	describe("#publishPollKey()", function () {
		it("User 0 should set the poll key when his ballot ends", async function () {
			const id = 12n
			const pollKey = 122n

			await delay(10000)

			await expect(elekton.connect(accounts[1].signer).publishPollKey(id, pollKey))
				.to.emit(elekton, "PollKeyPublished")
				.withArgs(id, pollKey)
		})
	})
})
