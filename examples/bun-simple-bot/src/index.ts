import { GatewayIntentBits } from '@discordjs/core'
import { DiscordBot, defineSlashCommandBasic } from '@softnetics/what-is-dis'

import { environment } from './env'

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
    line: {
      type: 'number',
      description: 'Number of times to echo back',
      required: true,
      choices: [
        { name: '1 time', value: 1 },
        { name: '2 times', value: 2 },
      ],
    },
  },
  execute: async ({ interaction, body, logger }) => {
    const line = body.line
    const message = body.message
    const singleLine = !message ? `Pong!` : `Pong! ${message}`

    logger.info(`Try to reply with ${line} lines of message!`)

    await interaction.reply({
      content: Array.from({ length: line }, () => singleLine).join('\n'),
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
  }, // This function will be called when the bot is ready
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
