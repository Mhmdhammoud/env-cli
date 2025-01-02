# Meritt CLI

## Description

Meritt CLI is a command-line tool designed to manage environment variables efficiently. It allows you to easily set, get, and delete environment variables for your projects, as well as manage your Meritt account. This tool is specifically made for Meritt.dev projects.

## Features

- Set up configuration files
- Log in and log out of your Meritt account
- Fetch and create .env files for different environments
- Restore .env files from backup
- Interactive mode for ease of use
- Check for updates

## Installation

To install Meritt CLI, you can use npm:

```sh
npm install -g @merittdev/cli
```

## Usage

Here are some basic commands you can use with Meritt CLI:

### Set up the configuration file

```sh
meritt install
```

### Log in to your Meritt account

```sh
meritt login
```

### Fetch and create a .env file for the current project and specified environment

```sh
meritt env <environment> # e.g. meritt env development
```

### Log out of your Meritt account

```sh
meritt logout
```

### Display help information

```sh
meritt help
```

### Open the Meritt CLI documentation in your browser

```sh
meritt docs
```

### Restore the .env file from backup

```sh
meritt recover
```

### Start the CLI in interactive mode

```sh
meritt interactive
```

### Check for updates to the Meritt CLI

```sh
meritt update
```

## Commands

| Command                    | Description                                                                    |
| -------------------------- | ------------------------------------------------------------------------------ |
| `meritt install`           | Set up the Meritt CLI configuration file                                       |
| `meritt login`             | Log in to your Meritt account                                                  |
| `meritt env [environment]` | Fetch and create a .env file for the current project and specified environment |
| `meritt logout`            | Log out of your Meritt account                                                 |
| `meritt help`              | Display help information                                                       |
| `meritt docs`              | Open the Meritt CLI documentation in your browser                              |
| `meritt recover`           | Restore the .env file from backup                                              |
| `meritt interactive`       | Start the CLI in interactive mode                                              |
| `meritt update`            | Check for updates to the Meritt CLI                                            |

## License

This project is licensed under the MIT License.
