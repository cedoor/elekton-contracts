const { ethers, run } = require("@nomiclabs/buidler")

function deploy(contract) {
	return run("deploy", { contract, quiet: true })
}

function bytes32ToString(s) {
	if (!Array.isArray(s) && typeof s !== "string") {
		throw TypeError("Parameter must be a string or an array of strings")
	}

	if (Array.isArray(s)) {
		return s.map(bytes32ToString)
	}

	return ethers.utils.formatBytes32String(s)
}

function stringToBytes32(s) {
	if (!Array.isArray(s) && typeof s !== "string") {
		throw TypeError("Parameter must be a string or an array of strings")
	}

	if (Array.isArray(s)) {
		return s.map(bytes32ToString)
	}

	return ethers.utils.parseBytes32String(s)
}

module.exports = {
	deploy,
	bytes32ToString,
	stringToBytes32,
}
