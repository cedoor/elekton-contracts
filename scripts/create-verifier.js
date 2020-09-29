const fs = require("fs")
const path = require("path")
const { initialize } = require("zokrates-js/node")
const { config } = require(path.resolve("package.json"))

async function main() {
	const zokrates = await initialize()

	const source = fs.readFileSync(path.join(__dirname, "snark-program.zok"), "utf-8")

	const artifacts = zokrates.compile(source)
	const keypair = zokrates.setup(artifacts.program)
	// TODO: set abi to v2 when zokrates will release a new version
	const verifier = zokrates.exportSolidityVerifier(keypair.vk, "v1")

	if (!fs.existsSync(config.paths.build.zksnark)) {
		fs.mkdirSync(config.paths.build.zksnark, {
			recursive: true
		})
	}

	fs.writeFileSync(path.join(config.paths.build.zksnark, "artifacts.json"), JSON.stringify(artifacts, null, 4))
	fs.writeFileSync(path.join(config.paths.build.zksnark, "keypair.json"), JSON.stringify(keypair, null, 4))
	fs.writeFileSync(path.join(config.paths.contracts, "Verifier.sol"), verifier)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
