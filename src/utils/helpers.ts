import chalk from 'chalk'
import * as emojify from 'node-emoji'
import path from 'path'
import fs from 'fs'
import {execSync} from 'child_process'
export const showDocumentation = (CONFIG_FILE: string): void => {
	console.log(
		chalk.cyan(`${emojify.get('books')}  Documentation for config.json:`)
	)
	console.log(`
The config.json file allows you to customize the behavior of the Meritt CLI.

Here are the available options:

1. apiUrl: The base URL for the Meritt API.
   Example: "https://api-dev.meritt.dev"

2. verbose: Enable verbose logging for debugging.
   Example: true or false

To edit the config file, open it in your preferred text editor:
${chalk.bold(`vi ${CONFIG_FILE} or code ${CONFIG_FILE}`)}
`)
}
export const getProjectNameFromPackageJson = (): string | null => {
	try {
		const packageJsonPath = path.join(process.cwd(), 'package.json')
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
		return packageJson.name
	} catch (err) {
		const error = err as Error
		console.error(
			chalk.red(
				`${emojify.get('x')}  Error reading package.json: ${error.message}`
			)
		)
		return null
	}
}
export const hideFolderOnWindows = (folderPath: string): void => {
	try {
		// Use the `attrib` command to set the hidden attribute
		execSync(`attrib +h "${folderPath}"`)
		console.log(`Folder "${folderPath}" is now hidden.`)
	} catch (error) {
		console.error(`Failed to hide folder "${folderPath}":`, error)
	}
}
