const { expect } = require("chai")
const { deployContract, createAccount, hexToDecimal, getSnarkHash, sha256 } = require("../scripts/utils")
const path = require("path")
const fs = require("fs")
const { initialize } = require("zokrates-js/node")
const { MerkleTree } = require("merkletreejs")
const { config } = require(path.resolve("package.json"))

describe("Elekton", function () {
	let zokrates
	let elektonInstance

	before(async function () {
		zokrates = await initialize()
		elektonInstance = await deployContract("Elekton")
	})

	it("Snark program should work fine", async function () {
		const account1 = createAccount()
		const account2 = createAccount()
		const account3 = createAccount()
		const account4 = createAccount()
		const account5 = createAccount()
		const account6 = createAccount()
		const account7 = createAccount()
		const account8 = createAccount()
		const leaves = [
			account1.publicKey,
			account2.publicKey,
			account3.publicKey,
			account4.publicKey,
			account5.publicKey,
			account6.publicKey,
			account7.publicKey,
			account8.publicKey
		].map(sha256)
		const tree = new MerkleTree(leaves, sha256)
		const root = tree.getRoot().toString("hex")
		const proof = tree.getProof(sha256(account2.publicKey))
		const pathDigests = proof.map((digest) => digest.data.toString("hex"))
		const directions = proof.map((digest) => digest.position === "right")

		const artifacts = JSON.parse(fs.readFileSync(path.join(config.paths.build.zksnark, "artifacts.json"), "utf-8"))

		const { output } = zokrates.computeWitness(artifacts, [
			hexToDecimal(account2.privateKey),
			directions,
			pathDigests.map((pathDigest) => getSnarkHash(pathDigest)),
			getSnarkHash(root)
		])

		console.log(output)
		// expect(publicKey).to.deep.equal(JSON.parse(output)[0])
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
