import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Interaction,
  InteractionType,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js'

import { SlashCommandType } from '../definitions/common/types'
import { SlashCommand } from '../definitions/types'

interface DiscordBotOptions {
  /**
   * The token of the bot.
   */
  token: string
  /**
   * The client ID of the bot.
   */
  clientId: string
  /**
   * The intents to use for the bot.
   */
  intents: GatewayIntentBits[]
  /**
   * List of slash commands to register.
   */
  slashCommands: SlashCommand[]
  /**
   * The ID of the guild to use as the development guild. If this value is set, the bot will only register commands in this guild.
   */
  developmentGuildId?: string
  /**
   * The callback to run when the bot is ready.
   */
  onReady?: (args: Client) => void
  /**
   * The callback before the bot shut down.
   */
  onShutDown?: (args: { rest: REST }) => void
}

export class DiscordBot {
  // REST manager instance requires a token to make requests
  private readonly rest: REST
  // Discord client to handle all requests
  private readonly client: Client
  // SlashCommand collections
  private readonly slashCommandCollection = new Collection<string, SlashCommand>()

  constructor(private readonly options: DiscordBotOptions) {
    this.rest = new REST({ version: '10', timeout: 2000 }).setToken(options.token)
    const intents = options.intents.reduce((acc, cur) => acc | cur, 0)
    this.client = new Client({ intents })
    options.slashCommands.forEach((command) => {
      this.slashCommandCollection.set(command.data.name, command)
    })
  }

  private subscribeGatewayDispatchEvents() {
    this.options.onReady && this.client.once(Events.ClientReady, this.options.onReady.bind(this))
    this.client.on(Events.InteractionCreate, this.handleInteractionCreate.bind(this))

    // TODO: handle message create
    // this.client.on(GatewayDispatchEvents.MessageCreate, handleMessageCreate)
  }

  private async handleInteractionCreate(interaction: Interaction) {
    switch (interaction.type) {
      case InteractionType.ApplicationCommand:
        await this.handleApplicationCommand(interaction)
        break
      default:
        break
    }
  }

  private async handleApplicationCommand(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return

    const commandName = interaction.commandName
    const command = this.slashCommandCollection.find((command) => command.data.name === commandName)

    if (!command) return

    switch (command.type) {
      case SlashCommandType.BASIC: {
        await command.execute({ interaction })
        break
      }
      case SlashCommandType.SUBCOMMAND: {
        const subcommandName = interaction.options.getSubcommand()
        if (!subcommandName) return
        const subcommandExecute = command.execute[subcommandName]
        subcommandExecute({ interaction })
        break
      }
      default:
        break
    }
  }

  private async registerSlashCommands() {
    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
      this.slashCommandCollection.map((command) => command.data)

    // If the development guild ID is not set, register commands globally
    if (!this.options.developmentGuildId) {
      const route = Routes.applicationCommands(this.options.clientId)
      await this.rest.put(route, { body: commands })
    }

    // Otherwise, register commands in the development guild only
    else {
      const route = Routes.applicationGuildCommands(
        this.options.clientId,
        this.options.developmentGuildId
      )
      await this.rest.put(route, { body: commands })
    }
  }

  private setupGracefulShutdown() {
    if (this.options.onShutDown) {
      const onShutDown = this.options.onShutDown.bind(this)
      const options: Parameters<typeof onShutDown>[0] = { rest: this.rest }
      process.on('SIGINT', () => {
        onShutDown(options)
        process.exit(0)
      })
      process.on('SIGTERM', () => {
        onShutDown(options)
        process.exit(0)
      })
      process.on('SIGKILL', () => {
        onShutDown(options)
        process.exit(0)
      })
    }
  }

  async listen() {
    this.setupGracefulShutdown()
    this.subscribeGatewayDispatchEvents()
    await this.registerSlashCommands()
    await this.client.login(this.options.token)
  }
}
