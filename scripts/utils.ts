import createBlakeHash from "blake-hash"
import { eddsa, poseidon, smt } from "circomlib"
import crypto from "crypto"
import { Contract } from "ethers"
import { Scalar, utils } from "ffjavascript"
import { ethers } from "hardhat"
import { groth16 } from "snarkjs"
import { config } from "../package.json"

export function getProjectConfig() {
	return config
}

export async function getAccounts() {
	const signers = await ethers.getSigners()
	const voters = createVoterAccounts(signers.length)

	return signers.map((signer, i) => ({
		signer,
		voter: voters[i]
	}))
}

function createVoterAccounts(n: number) {
	let accounts = []

	for (let i = 0; i < n; i++) {
		accounts.push(createVoterAccount())
	}

	return accounts
}

function createVoterAccount() {
	const privateKey = crypto.randomBytes(32)
	const publicKey = eddsa.prv2pub(privateKey)

	return { privateKey, publicKey }
}

export async function getSmt(publicKeys: any[]) {
	const tree = await smt.newMemEmptyTrie()

	for (const publicKey of publicKeys) {
		await tree.insert(...publicKey)
	}

	return tree
}

export async function createElektonProof(publicKeys: any[], ballotId: BigInt, account: any, vote: BigInt) {
	const ppk = processPrivateKey(account.privateKey)
	const signature = eddsa.signPoseidon(account.privateKey, vote)
	const voteNullifier = poseidon([ballotId, ppk])
	const tree = await getSmt(publicKeys)

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
		vote,
		ballotId,
		voteNullifier
	})
}

async function getProofParameters(input: any) {
	const { proof, publicSignals } = await groth16.fullProve(
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
		publicSignals.map((n: any) => padNumberAs64Hex(n))
	]
}

function processPrivateKey(privateKey: BigInt) {
	const blakeHash = createBlakeHash("blake512").update(privateKey).digest()
	const sBuff = eddsa.pruneBuffer(blakeHash.slice(0, 32))
	const s = utils.leBuff2int(sBuff)

	return Scalar.shr(s, 3)
}

function padNumberAs64Hex(n: any) {
	let hex = BigInt(n).toString(16)

	while (hex.length < 64) {
		hex = "0" + hex
	}

	return `0x${hex}`
}

export async function deployContract(contractName: string): Promise<Contract> {
	const ContractFactory = await ethers.getContractFactory(contractName)
	const instance = await ContractFactory.deploy()

	await instance.deployed()

	return instance
}

export async function attachContract(contractName: string, address: string) {
	const ContractFactory = await ethers.getContractFactory(contractName)

	return ContractFactory.attach(address)
}

export function delay(duration = 5000) {
	return new Promise((resolve) => {
		setTimeout(resolve, duration)
	})
}

export function stringToBytes32(s: string | string[]): string | string[] {
	if (!Array.isArray(s) && typeof s !== "string") {
		throw TypeError("Parameter must be a string or an array of strings")
	}

	if (Array.isArray(s)) {
		return s.map((s) => stringToBytes32(s) as string)
	}

	return ethers.utils.formatBytes32String(s)
}

export function bytes32ToString(s: string | string[]): string | string[] {
	if (!Array.isArray(s) && typeof s !== "string") {
		throw TypeError("Parameter must be a string or an array of strings")
	}

	if (Array.isArray(s)) {
		return s.map((s) => bytes32ToString(s) as string)
	}

	return ethers.utils.parseBytes32String(s)
}
