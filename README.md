# What Is Dis <!-- omit in toc -->

Typescript Discord bot framework aims to be a simple and easy to use framework for creating discord bots. It is built on top of [discord.js](https://discord.js.org/#/) and

# Table of Contents <!-- omit in toc -->

# Installation

```bash
npm install discord.js @softnetics/what-is-dis
# Or
yarn add discord.js @softnetics/what-is-dis
# Or
pnpm add discord.js @softnetics/what-is-dis
# Or
bun add discord.js @softnetics/what-is-dis
```

# Usage

```ts
import { GatewayIntentBits } from '@discordjs/core'
import { DiscordBot, defineSlashCommandBasic } from '@softnetics/what-is-dis'

const pingCommand = defineSlashCommandBasic({
  name: 'ping',
  description: 'Ping!',
  options: {
    message: {
      type: 'string',
      description: 'Message to echo back',
      choices: [
        { name: 'Hello', value: 'hello' },
        { name: 'World', value: 'world' },
      ],
    },
    to: {
      type: 'user',
      description: 'User to ping',
      required: true,
    },
  },
  execute: async ({ interaction, body, logger }) => {
    const message = body.message // Type: "hello" | "world" | undefined
    const user = body.to // Type: string (user id)
    logger.info(`Received /ping command with message: ${message} and user: ${user}`)
    await interaction.reply({
      content: `Pong! ${message} <@${user}>`,
    })
  },
})

// Create a discord bot instance
const bot = new DiscordBot({
  clientId: environment.DISCORD_CLIENT_ID,
  token: environment.DISCORD_TOKEN,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  // If this value is set, the bot will only register commands in this guild. It's useful for development.
  developmentGuildId: environment.DISCORD_DEVELOPMENT_GUILD_ID,
  // If this value is set to true, the bot will delete the commands before registering them for `developmentGuildId`.
  refreshCommands: true,
  // Add more slash commands here
  slashCommands: [pingCommand],
  // Customized logger
  loggerOptions: {
    level: 'debug',
  },
  // This function will be called when the bot is ready
  onReady: ({ logger }) => {
    logger.info('Try to excecute /ping command!')
  },
  // This function will be called before the bot shuts down
  onShutDown: async ({ logger }) => {
    logger.info('Bot is shutting down!')
  },
})

// Register the given slash commands and listen for the event
bot.listen()
```

# Examples

You can find examples in the [examples](./examples) folder.

- [Ping-pong discord bot](./examples/bun-simple-bot/)

# Features

- [x] Slash commands
  - Input types
    - [x] Subcommands
    - [ ] 🚧 Subcommand groups
    - [x] String
    - [x] Integer
    - [x] Boolean
    - [x] User
    - [x] Channel
    - [x] Role
    - [x] Mentionable
    - [x] Number
    - [x] Attachment
- [ ] 🚧 Message command with prefix
- [ ] 🚧 Message components
  - [ ] 🚧 [Action Rows](https://discordjs.guide/message-components/action-rows.html)
  - [ ] 🚧 [Buttons](https://discordjs.guide/message-components/buttons.html)
  - [ ] 🚧 [Select menus](https://discordjs.guide/message-components/select-menus.html)
- [ ] 🚧 Other components
  - [ ] 🚧 [Modal](https://discordjs.guide/interactions/modals.html#building-and-responding-with-modals)
  - [ ] 🚧 [Context Menu](https://discordjs.guide/interactions/context-menus.html)
- [ ] 🚧 Emoji reactions

# Contributing

WIP...

# License

[MIT](./LICENSE)
