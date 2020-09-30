const { ethers, run } = require("@nomiclabs/buidler")
const { PublicKey, PrivateKey } = require("babyjubjub")
const circomlib = require("circomlib")
const jsSHA = require("jssha")

function sha256(value) {
	if (typeof value !== "string") {
		value = value.toString("hex")
	}

	const sha256 = new jsSHA("SHA-256", "HEX")

	sha256.update(value)

	return sha256.getHash("HEX")
}

function createAccount() {
	const sk = PrivateKey.getRandObj().field
	const privateKey = new PrivateKey(sk)
	const publicKey = PublicKey.fromPrivate(privateKey)

	return {
		privateKey: decimalToHex(privateKey.s.n.toFixed()),
		publicKey: getPublicKeyHex(publicKey.p.x.n.toFixed(), publicKey.p.y.n.toFixed())
	}
}

function getPublicKeyHex(x, y) {
	return circomlib.babyJub.packPoint([BigInt(x), BigInt(y)]).toString("hex")
}

function decimalToHex(decimal) {
	return ethers.BigNumber.from(decimal).toHexString()
}

function hexToDecimal(hex) {
	return ethers.BigNumber.from(hex).toString()
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

function getSnarkHash(hash) {
	const snarkHash = []

	for (let i = 0; i < 8; i++) {
		const j = i * 8
		snarkHash.push(`0x${hash.substring(j, j + 8)}`)
	}

	return snarkHash
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
	sha256,
	getAccounts,
	getAccountAddresses,
	deployContract,
	bytes32ToString,
	stringToBytes32,
	hexToDecimal,
	decimalToHex,
	createAccount,
	getSnarkHash
}
