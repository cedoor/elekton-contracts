const { expect } = require("chai")
const { babyJub } = require("circomlib")
const {
	deployContract,
	attachContract,
	createVoterAccounts,
	createElektonProof,
	getSmt,
	getEthereumAccounts,
	stringToBytes32
} = require("../scripts/utils")

describe("Elekton", function () {
	let ethereumAccounts
	let elekton
	let admin
	let ballot
	let voterAccounts

	before(async function () {
		ethereumAccounts = await getEthereumAccounts()
		elekton = await deployContract("Elekton")
		admin = elekton.connect(ethereumAccounts[1])
		voterAccounts = createVoterAccounts(5)
	})

	it("An admin should add himself to elekton contract", async function () {
		await admin.createAdmin()

		const adminAddress = await admin.signer.getAddress()
		const isAdmin = await admin.isAdmin(adminAddress)

		expect(isAdmin).to.deep.equal(true)
	})

	it("A voter should add himself to elekton contract", async function () {
		const publicKey = `0x${babyJub.packPoint(voterAccounts[0].publicKey).toString("hex")}`
		const username = stringToBytes32("pincopallino")
		const name = stringToBytes32("Pinco")
		const surname = stringToBytes32("Pallino")

		await elekton.createVoter(publicKey, username, name, surname)

		const voter = await elekton.voters(0)

		expect(voter.username).to.deep.equal(username)
	})

	it("An admin should create a ballot", async function () {
		const name = stringToBytes32("Referendum")
		const question = stringToBytes32("What do you want to vote for?")
		const proposals = stringToBytes32(["Yes", "No"])
		const voters = [
			`0x${babyJub.packPoint(voterAccounts[0].publicKey).toString("hex")}`,
			`0x${babyJub.packPoint(voterAccounts[1].publicKey).toString("hex")}`
		]
		const smt = await getSmt([voterAccounts[0].publicKey, voterAccounts[1].publicKey])
		const smtRoot = `0x${smt.root.toString("16")}`
		const startDate = Math.floor(Date.now() / 1000) - 10
		const endDate = Math.floor(Date.now() / 1000) + 10
		const encryptionKey = stringToBytes32("key")

		await admin.createBallot(name, question, proposals, voters, smtRoot, startDate, endDate, encryptionKey)

		const ballotAddress = await admin.ballots(0)
		ballot = await attachContract("Ballot", ballotAddress)

		expect(await ballot.name()).to.deep.equal(name)
	})

	it("A voter of a ballot should vote anonymously in that ballot", async function () {
		const ballotAddress = BigInt(ballot.address)
		const vote = 2n
		const proof = await createElektonProof(
			[voterAccounts[0].publicKey, voterAccounts[1].publicKey],
			ballotAddress,
			voterAccounts[0],
			vote
		)

		await ballot.vote(...proof)

		expect(await ballot.votes(0)).to.deep.equal(vote)
	})

	it("An admin should set the poll key when the voting ends", async function () {
		function delay(duration = 10000) {
			return new Promise((resolve) => {
				setTimeout(resolve, duration)
			})
		}

		await delay()
		const b = ballot.connect(admin.signer)
		const pollKey = stringToBytes32("key")

		await b.setPollKey(pollKey)

		expect(await ballot.pollKey()).to.deep.equal(pollKey)
	})
})
