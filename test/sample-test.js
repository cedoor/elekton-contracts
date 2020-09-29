const { expect } = require("chai")
const {
	bytes32ToString,
	stringToBytes32,
	deployContract,
	getAccountAddresses,
	getAccounts,
	getPublicKeyHex,
	createAccount,
	mod
} = require("../scripts/utils")
const { MerkleTree } = require("merkletreejs")
const SHA256 = require("crypto-js/sha256")
const path = require("path")
const fs = require("fs")
const { initialize } = require("zokrates-js/node")
const { config } = require(path.resolve("package.json"))

describe("Elekton", function () {
	let zokrates
	let elektonInstance

	before(async function () {
		zokrates = await initialize()
		elektonInstance = await deployContract("Elekton")
	})

	it("Snark program should work fine", async function () {
		const { privateKey, publicKey } = createAccount()

		const artifacts = JSON.parse(fs.readFileSync(path.join(config.paths.build.zksnark, "artifacts.json"), "utf-8"))

		const { output } = zokrates.computeWitness(artifacts, [privateKey])

		expect(publicKey).to.deep.equal(JSON.parse(output)[0])
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
