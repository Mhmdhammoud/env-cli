import * as emoji from 'node-emoji'

const commands = [
	{
		name: `${emoji.get('key')} meritt login`,
		description: 'Log in to your Meritt account',
	},
	{
		name: `${emoji.get('globe_with_meridians')} meritt env <environment>`,
		description: 'Fetch the env file for the project and specified environment',
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
		name: `${emoji.get('globe_with_meridians')} meritt help`,
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
		name: `${emoji.get('warning')} meritt update`,
		description: 'Checks and updates the Meritt CLI',
	},
]
export default commands
