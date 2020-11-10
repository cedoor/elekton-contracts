import solc from "solc"
import fs from "fs"
import { getProjectConfig } from "./utils"

async function main() {
	const config = getProjectConfig()

	const input = {
		language: "Solidity",
		sources: {
			"Elekton.sol": {
				content: fs.readFileSync("./contracts/Elekton.sol", "utf8")
			}
		},
		settings: {
			outputSelection: {
				"*": {
					"*": ["*"]
				}
			}
		}
	}

	function findImports(path: string) {
		return {
			contents: fs.readFileSync(path.startsWith("@") ? `./node_modules/${path}` : `./contracts/${path}`, "utf8")
		}
	}

	const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }))
	const devdoc = output.contracts["Elekton.sol"]["Elekton"].devdoc

	let markdown = `# Elekton - ${devdoc.title}\n\nAuthor: ${devdoc.author}\nDescription: ${devdoc.details}\n\n`
	markdown += `## API\n\n${Object.keys(devdoc.methods)
		.map((name) => `* ${name}`)
		.join("\n")}`

	console.log(Object.keys(devdoc.methods))

	fs.writeFileSync(`${config.paths.docs}/Elekton.md`, markdown)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
