const { config } = require(`${__dirname}/../package.json`)
const { ethers, run } = require("@nomiclabs/buidler")
const { eddsa } = require("circomlib")
const snarkjs = require("snarkjs")
const { Scalar, utils } = require("ffjavascript")
const createBlakeHash = require("blake-hash")
const crypto = require("crypto")

function getProjectConfig() {
	return config
}

function createAccount() {
	const rawpvk = crypto.randomBytes(32).toString("hex")
	const pvk = eddsa.pruneBuffer(createBlakeHash("blake512").update(rawpvk).digest().slice(0, 32))
	const privateKey = Scalar.shr(utils.leBuff2int(pvk), 3)
	const publicKey = eddsa.prv2pub(rawpvk)

	return { privateKey, publicKey }
}

async function createProof(input) {
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

function padNumberAs64Hex(n) {
	let hex = decimalToHex(n)

	while (hex.length < 64) {
		hex = "0" + hex
	}

	return `0x${hex}`
}

function decimalToHex(decimal) {
	return ethers.BigNumber.from(decimal).toHexString().substring(2)
}

function hexToDecimal(hex) {
	return ethers.BigNumber.from(`0x${hex}`).toString()
}

async function getAccountAddresses() {
	return Promise.all((await ethers.getSigners()).map((account) => account.getAddress()))
}

function getAccounts() {
	return ethers.getSigners()
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
	createProof,
	getProjectConfig,
	getAccounts,
	getAccountAddresses,
	deployContract,
	bytes32ToString,
	stringToBytes32,
	hexToDecimal,
	decimalToHex,
	createAccount
}
