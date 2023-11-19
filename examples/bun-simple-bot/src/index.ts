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
  },
  execute: async ({ interaction, body }) => {
    const message = body.message
    //      ^?
    await interaction.reply({
      content: !message ? 'Pong!' : `Pong! ${message}`,
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
  // Add more slash commands here
  slashCommands: [pingCommand],
  // This function will be called when the bot is ready
  onReady: () => {
    console.log('Bot is ready!')
  },
  // This function will be called before the bot shuts down
  onShutDown: () => {
    console.log('Bot is shutting down!')
  },
})

// Register the given slash commands and listen for the event
bot.listen()
