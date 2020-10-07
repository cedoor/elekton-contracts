const { config } = require(`${__dirname}/../package.json`)
const { ethers, run } = require("@nomiclabs/buidler")
const { eddsa, smt, poseidon } = require("circomlib")
const snarkjs = require("snarkjs")
const { Scalar, utils } = require("ffjavascript")
const createBlakeHash = require("blake-hash")
const crypto = require("crypto")

function getProjectConfig() {
	return config
}

async function createAccounts(n) {
	let accounts = []

	for (let i = 0; i < n; i++) {
		accounts.push(await createAccount())
	}

	return accounts
}

function createAccount() {
	const privateKey = crypto.randomBytes(32)
	const publicKey = eddsa.prv2pub(privateKey)

	return { privateKey, publicKey }
}

async function createElektonProof(publicKeys, electionId, account, vote) {
	const ppk = processPrivateKey(account.privateKey)
	const signature = eddsa.signPoseidon(account.privateKey, vote)
	const nullifier = poseidon([electionId, ppk])
	const tree = await smt.newMemEmptyTrie()

	for (const publicKey of publicKeys) {
		await tree.insert(...publicKey)
	}

	const { siblings } = await tree.find(account.publicKey[0])

	while (siblings.length < 10) {
		siblings.push(0n)
	}

	return getProofParameters({
		privateKey: ppk,
		R8x: signature.R8[0],
		R8y: signature.R8[1],
		S: signature.S,
		smtSiblings: siblings,
		smtRoot: tree.root,
		encryptedVote: vote,
		electionId,
		nullifier
	})
}

async function getProofParameters(input) {
	const { proof, publicSignals } = await snarkjs.groth16.fullProve(
		input,
		`${config.paths.build.snark}/main.wasm`,
		`${config.paths.build.snark}/circuit_final.zkey`
	)

	return [
		[padNumberAs64Hex(proof.pi_a[0]), padNumberAs64Hex(proof.pi_a[1])],
		[
			[padNumberAs64Hex(proof.pi_b[0][1]), padNumberAs64Hex(proof.pi_b[0][0])],
			[padNumberAs64Hex(proof.pi_b[1][1]), padNumberAs64Hex(proof.pi_b[1][0])]
		],
		[padNumberAs64Hex(proof.pi_c[0]), padNumberAs64Hex(proof.pi_c[1])],
		publicSignals.map((n) => padNumberAs64Hex(n))
	]
}

function processPrivateKey(privateKey) {
	const blakeHash = createBlakeHash("blake512").update(privateKey).digest()
	const sBuff = eddsa.pruneBuffer(blakeHash.slice(0, 32))
	const s = utils.leBuff2int(sBuff)

	return Scalar.shr(s, 3)
}

function padNumberAs64Hex(n) {
	let hex = BigInt(n).toString("16")

	while (hex.length < 64) {
		hex = "0" + hex
	}

	return `0x${hex}`
}

function deployContract(contractName) {
	return run("deploy", { contract: contractName, quiet: true })
}

function stringToBytes32(s) {
	if (!Array.isArray(s) && typeof s !== "string") {
		throw TypeError("Parameter must be a string or an array of strings")
	}

	if (Array.isArray(s)) {
		return s.map(stringToBytes32)
	}

	return ethers.utils.formatBytes32String(s)
}

function bytes32ToString(s) {
	if (!Array.isArray(s) && typeof s !== "string") {
		throw TypeError("Parameter must be a string or an array of strings")
	}

	if (Array.isArray(s)) {
		return s.map(bytes32ToString)
	}

	return ethers.utils.parseBytes32String(s)
}

module.exports = {
	createElektonProof,
	getProjectConfig,
	deployContract,
	bytes32ToString,
	stringToBytes32,
	createAccount,
	createAccounts
}
