#!/usr/bin/env node
import {Command} from 'commander'
import inquirer from 'inquirer'
import keytar from 'keytar'
import axios, {AxiosError} from 'axios'
import fs from 'fs'
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import Table from 'cli-table3'
import * as emoji from 'node-emoji'
import open from 'open'
import {
	getProjectNameFromPackageJson,
	hideFolderOnWindows,
	showDocumentation,
} from './utils/helpers.js'
import {execSync} from 'child_process'

const program = new Command()
const SERVICE_NAME = 'meritt-cli'
const ACCOUNT_NAME = 'auth-token'

const CONFIG_DIR = path.join(os.homedir(), '.meritt')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')
const validEnvironments = ['development', 'staging', 'production']

interface Config {
	apiUrl: string
	verbose: boolean
}

const createConfigFile = async (): Promise<void> => {
	const {apiUrl, verbose} = await inquirer.prompt([
		{
			type: 'input',
			name: 'apiUrl',
			message: 'Enter the API URL:',
		},
		{
			type: 'confirm',
			name: 'verbose',
			message: 'Enable verbose logging?',
			default: false,
		},
	])

	const config: Config = {apiUrl, verbose}

	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR, {recursive: true})
	}
	// Hide the folder on Windows
	if (process.platform === 'win32') {
		hideFolderOnWindows(CONFIG_DIR)
	}

	fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
	console.log(
		chalk.green(
			`${emoji.get('white_check_mark')}  Config file created at ${CONFIG_FILE}`
		)
	)
}

program
	.command('install')
	.description('Set up the Meritt CLI configuration file')
	.action(async () => {
		try {
			await createConfigFile()
			showDocumentation(CONFIG_FILE)
		} catch (err) {
			const error = err as Error
			console.error(
				chalk.red(
					`${emoji.get('x')}  Error creating config file: ${error.message}`
				)
			)
		}
	})

const getConfig = (): Config => {
	if (!fs.existsSync(CONFIG_FILE)) {
		throw new Error(
			chalk.red(
				`${emoji.get('x')}  Config file not found. Run \`meritt install\`.`
			)
		)
	}
	return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) as Config
}

const backupEnvFile = (envFilePath: string): void => {
	const backupPath = `${envFilePath}.backup`
	fs.copyFileSync(envFilePath, backupPath)
	console.log(
		chalk.yellow(`${emoji.get('floppy_disk')}  Backup created: ${backupPath}`)
	)
}

const commands = [
	{
		name: `${emoji.get('key')} meritt login`,
		description: 'Log in to your Meritt account',
	},
	{
		name: `${emoji.get('globe_with_meridians')} meritt fetch-env [environment]`,
		description:
			'Fetch and create a .env file for the current project and specified environment',
	},
	{
		name: `${emoji.get('outbox_tray')} meritt logout`,
		description: 'Log out of your Meritt account',
	},
	{
		name: `${emoji.get('books')} meritt docs`,
		description: 'Open the Meritt CLI documentation in your browser',
	},
	{
		name: `${emoji.get('gear')} meritt install`,
		description: 'Set up the Meritt CLI configuration file',
	},
	{
		name: `${emoji.get('information')} meritt help`,
		description: 'Display help information',
	},
	{
		name: `${emoji.get('floppy_disk')} meritt recover`,
		description: 'Restore the .env file from backup',
	},
	{
		name: `${emoji.get('speech_balloon')} meritt interactive`,
		description: 'Start the CLI in interactive mode',
	},
	{
		name: `${emoji.get('warning')} meritt check-updates`,
		description: 'Check for updates to the Meritt CLI',
	},
]

const table = new Table({
	head: [
		chalk.bold(`${emoji.get('gear')} Command`),
		chalk.bold(`${emoji.get('information')} Description`),
	],
	colWidths: [40, 60],
	style: {
		head: ['cyan'],
		border: ['green'],
	},
})

commands.forEach((cmd) => {
	table.push([cmd.name, cmd.description])
})

program.version(`${emoji.get('rocket')}  ${chalk.blue('Meritt CLI v1.0.0')}`)

// Login command
program
	.command('login')
	.description('Log in to your Meritt account')
	.action(async () => {
		try {
			const config = getConfig()
			const apiUrl = config.apiUrl
			console.log(chalk.blue(`${emoji.get('key')}  Logging in to Meritt...`))

			const {email, password} = await inquirer.prompt([
				{
					type: 'input',
					name: 'email',
					message: 'Enter your email:',
				},
				{
					type: 'password',
					name: 'password',
					message: 'Enter your password:',
				},
			])

			const response = await axios.post(`${apiUrl}/cli/auth/login`, {
				email,
				password,
			})

			const {token, refresh_token} = response.data
			await keytar.setPassword(
				SERVICE_NAME,
				ACCOUNT_NAME,
				JSON.stringify({token, refresh_token})
			)
			console.log(
				chalk.green(`${emoji.get('white_check_mark')}  Login successful!`)
			)
		} catch (err) {
			const error = err as AxiosError
			if (error.response?.status === 403) {
				console.error(
					chalk.red(`${emoji.get('x')}  Invalid credentials. Please try again.`)
				)
			} else {
				console.error(
					chalk.red(`${emoji.get('x')}  Login failed: ${error.message}`)
				)
			}
		}
	})

// Fetch-env command
program
	.command('fetch-env [environment]')
	.description(
		'Fetch and create a .env file for the current project and specified environment'
	)
	.option('-v, --verbose', 'Enable verbose logging')
	.option('-o, --output <path>', 'Custom path to save the .env file')
	.action(
		async (
			environment: string,
			options: {verbose: boolean; output: string}
		) => {
			try {
				const config = getConfig()
				const apiUrl = config.apiUrl
				const project = getProjectNameFromPackageJson()
				if (!project) {
					console.error(
						chalk.red(
							`${emoji.get('x')}  Project name not found in package.json.`
						)
					)
					return
				}

				// If environment is not provided, prompt the user to select one
				if (!environment) {
					const {selectedEnvironment} = await inquirer.prompt([
						{
							type: 'list',
							name: 'selectedEnvironment',
							message: 'Select the environment:',
							choices: validEnvironments,
						},
					])
					environment = selectedEnvironment
				}

				if (!validEnvironments.includes(environment)) {
					console.error(
						chalk.red(
							`${emoji.get(
								'x'
							)}  Invalid environment. Allowed values: ${validEnvironments.join(
								', '
							)}`
						)
					)
					return
				}

				if (options.verbose || config.verbose) {
					console.log(chalk.gray(`Fetching .env file for project: ${project}`))
					console.log(chalk.gray(`Environment: ${environment}`))
				}

				const payload = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
				if (!payload) {
					console.error(
						chalk.red(
							`${emoji.get(
								'x'
							)}  You are not logged in. Run \`meritt login\` first.`
						)
					)
					return
				}

				const {token, refresh_token} = JSON.parse(payload)
				const response = await axios.get(`${apiUrl}/cli/env`, {
					params: {project, environment},
					headers: {
						Authorization: `Bearer ${token}`,
						refresh: `Bearer ${refresh_token}`,
					},
				})
				const responseData = await axios.get(response.data)
				const envFilePath = options.output
					? path.resolve(options.output)
					: path.join(process.cwd(), `.env.${environment}`)
				if (fs.existsSync(envFilePath)) {
					backupEnvFile(envFilePath)
				}
				fs.writeFileSync(envFilePath, responseData.data, {mode: 0o600})
				console.log(
					chalk.green(
						`${emoji.get(
							'white_check_mark'
						)}  .env.${environment} file created successfully!`
					)
				)
			} catch (err) {
				const error = err as AxiosError
				if (error.response?.status === 404) {
					console.error(
						chalk.red(
							`${emoji.get(
								'x'
							)}  Project not found, make sure project name is correct: ${
								error.message
							}`
						)
					)
				} else {
					console.error(
						chalk.red(
							`${emoji.get('x')}  Error fetching or creating .env file: ${
								error.message
							}`
						)
					)
				}
			}
		}
	)

// Logout command
program
	.command('logout')
	.description('Log out of your Meritt account')
	.action(async () => {
		try {
			await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME)
			console.log(
				chalk.green(`${emoji.get('outbox_tray')}  Logged out successfully!`)
			)
		} catch (err) {
			const error = err as Error
			console.error(
				chalk.red(`${emoji.get('x')}  Error logging out: ${error.message}`)
			)
		}
	})

// Help command
program
	.command('help')
	.description('Display help information')
	.action(() => {
		console.log(chalk.cyan(`${emoji.get('books')}  Meritt CLI Help\n`))
		console.log(table.toString())
	})

// Docs command
program
	.command('docs')
	.description('Open the Meritt CLI documentation in your browser')
	.action(() => {
		open('https://docs.meritt.dev/cli')
	})

// Recover command
program
	.command('recover')
	.description('Restore the .env file from backup')
	.action(() => {
		const envFilePath = path.join(process.cwd(), '.env')
		const backupPath = `${envFilePath}.backup`
		if (fs.existsSync(backupPath)) {
			fs.copyFileSync(backupPath, envFilePath)
			console.log(
				chalk.green(
					`${emoji.get('white_check_mark')}  .env file restored from backup.`
				)
			)
		} else {
			console.error(chalk.red(`${emoji.get('x')}  No backup found.`))
		}
	})
program
	.command('interactive')
	.description('Start the CLI in interactive mode')
	.action(async () => {
		const {command} = await inquirer.prompt([
			{
				type: 'list',
				name: 'command',
				message: 'What would you like to do?',
				choices: ['login', 'fetch-env', 'logout', 'help'],
			},
		])
		program.parse([process.argv[0], process.argv[1], command])
	})
program
	.command('check-updates')
	.description('Check for updates to the Meritt CLI')
	.action(() => {
		const latestVersion = execSync('npm show @mhmdhammoud/cli version')
			.toString()
			.trim()
		const currentVersion = require('./package.json').version
		if (latestVersion === currentVersion) {
			console.log(
				chalk.green(
					`${emoji.get(
						'white_check_mark'
					)}  You are using the latest version (${currentVersion}).`
				)
			)
		} else {
			console.log(
				chalk.yellow(
					`${emoji.get(
						'warning'
					)}  A new version (${latestVersion}) is available. Run \`npm install -g meritt-cli\` to update.`
				)
			)
		}
	})

program.parse(process.argv)
