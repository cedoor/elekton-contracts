const fs = require("fs")
const circom = require("circom")
const snarkjs = require("snarkjs")
const { buildBn128 } = require("ffjavascript")
const { getProjectConfig } = require("./utils.js")
const fastFile = require("fastfile")
const logger = require("js-logger")

logger.useDefaults()

async function main() {
	const { paths } = getProjectConfig()

	if (!fs.existsSync(paths.build.snark)) {
		fs.mkdirSync(paths.build.snark, { recursive: true })
	}

	if (!fs.existsSync(`${paths.build.snark}/pot12_beacon.ptau`)) {
		await snarkjs.powersOfTau.newAccumulator(await buildBn128(), 15, `${paths.build.snark}/pot12_0000.ptau`, logger)
		await snarkjs.powersOfTau.beacon(
			`${paths.build.snark}/pot12_0000.ptau`,
			`${paths.build.snark}/pot12_beacon.ptau`,
			"Final beacon",
			"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
			10,
			logger
		)
		await snarkjs.powersOfTau.preparePhase2(
			`${paths.build.snark}/pot12_beacon.ptau`,
			`${paths.build.snark}/pot12_final.ptau`,
			logger
		)
	}

	await circom.compiler(`${paths.circuit}/main.circom`, {
		r1csFileName: `${paths.build.snark}/main.r1cs`,
		wasmFile: await fastFile.createOverride(`${paths.build.snark}/main.wasm`),
		symWriteStream: fs.createWriteStream(`${paths.build.snark}/main.sym`)
	})

	await snarkjs.r1cs.info(`${paths.build.snark}/main.r1cs`, logger)

	await snarkjs.zKey.newZKey(
		`${paths.build.snark}/main.r1cs`,
		`${paths.build.snark}/pot12_final.ptau`,
		`${paths.build.snark}/circuit_0000.zkey`,
		logger
	)
	await snarkjs.zKey.beacon(
		`${paths.build.snark}/circuit_0000.zkey`,
		`${paths.build.snark}/circuit_final.zkey`,
		"Final beacon",
		"0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
		10,
		logger
	)

	const verificationKey = await snarkjs.zKey.exportVerificationKey(`${paths.build.snark}/circuit_final.zkey`, logger)
	const verifierCode = await snarkjs.zKey.exportSolidityVerifier(
		`${paths.build.snark}/circuit_final.zkey`,
		`./node_modules/snarkjs/templates/verifier_groth16.sol`,
		logger
	)

	fs.writeFileSync(`${paths.build.snark}/verification_key.json`, JSON.stringify(verificationKey), "utf-8")
	fs.writeFileSync(`${paths.contracts}/Verifier.sol`, verifierCode, "utf-8")
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
