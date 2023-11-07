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
    },
  },
  execute: async ({ interaction, api, body }) => {
    const message = body.message
    await api.interactions.reply(interaction.id, interaction.token, {
      content: !message ? 'Pong!' : `Pong! ${message}`,
    })
  },
})

const bot = new DiscordBot({
  clientId: environment.DISCORD_CLIENT_ID,
  token: environment.DISCORD_TOKEN,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  slashCommands: [pingCommand],
})

bot.listen()
