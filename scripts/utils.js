const { ethers, run } = require("@nomiclabs/buidler")
const { PublicKey, PrivateKey, Jub } = require("babyjubjub")
const circomlib = require("circomlib")

function createAccount() {
	const sk = PrivateKey.getRandObj().field
	const privateKey = new PrivateKey(sk)
	const publicKey = PublicKey.fromPrivate(privateKey)

	return {
		privateKey: privateKey.s.n.toFixed(),
		publicKey: [publicKey.p.x.n.toFixed(), publicKey.p.y.n.toFixed()]
	}
}

function getPublicKeyHex(x, y) {
	return circomlib.babyJub.packPoint([BigInt(x), BigInt(y)]).toString("hex")
}

function decimalToHex(decimal) {
	return ethers.BigNumber.from(decimal).toHexString()
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
	getAccounts,
	getAccountAddresses,
	deployContract,
	bytes32ToString,
	stringToBytes32,
	hexToDecimal,
	decimalToHex,
	getPublicKeyHex,
	createAccount
}
