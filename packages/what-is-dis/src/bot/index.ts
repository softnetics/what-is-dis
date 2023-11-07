import { Collection } from '@discordjs/collection'
import {
  API,
  APIApplicationCommandInteraction,
  APIInteraction,
  Client,
  GatewayDispatchEvents,
  GatewayIntentBits,
  GatewayReadyDispatchData,
  InteractionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  WithIntrinsicProps,
} from '@discordjs/core'
import { REST } from '@discordjs/rest'
import { WebSocketManager } from '@discordjs/ws'

import { SlashCommandType } from '../definitions/common/types'
import { SlashCommand } from '../definitions/types'
import { isAPIChatInputApplicationCommandInteractionData } from '../utils/type-guard'

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
  onReady?: (args: WithIntrinsicProps<GatewayReadyDispatchData>) => void
  /**
   * The callback before the bot shut down.
   */
  onShutDown?: () => void
}

export class DiscordBot {
  // REST manager instance requires a token to make requests
  private readonly rest: REST
  // API instance requires a REST manager to make requests
  private readonly api: API
  // Websocket manager requires a REST manager to make requests
  private readonly gateway: WebSocketManager
  // Discord client to handle all requests
  private readonly client: Client
  // SlashCommand collections
  private readonly slashCommandCollection = new Collection<string, SlashCommand>()

  constructor(private readonly options: DiscordBotOptions) {
    this.rest = new REST({ version: '10', timeout: 2000 }).setToken(options.token)
    this.api = new API(this.rest)
    const intents = options.intents.reduce((acc, cur) => acc | cur, 0)
    this.gateway = new WebSocketManager({
      token: options.token,
      intents: intents,
      rest: this.rest,
    })
    this.client = new Client({ rest: this.rest, gateway: this.gateway })
  }

  private subscribeGatewayDispatchEvents() {
    this.options.onReady && this.client.once(GatewayDispatchEvents.Ready, this.options.onReady)
    this.client.on(GatewayDispatchEvents.InteractionCreate, this.handleInteractionCreate)

    // TODO: handle message create
    // this.client.on(GatewayDispatchEvents.MessageCreate, handleMessageCreate)
  }

  private async handleInteractionCreate({
    data: interaction,
    api,
  }: WithIntrinsicProps<APIInteraction>) {
    switch (interaction.type) {
      case InteractionType.ApplicationCommand:
        await this.handleApplicationCommand(interaction, api)
        break
      default:
        break
    }
  }

  private async handleApplicationCommand(interaction: APIApplicationCommandInteraction, api: API) {
    const commandName = interaction.data.name
    const command = this.slashCommandCollection.find((command) => command.data.name === commandName)

    if (!command) return

    switch (command.type) {
      case SlashCommandType.BASIC: {
        await command.execute({ interaction, api })
        break
      }
      case SlashCommandType.SUBCOMMAND: {
        if (!isAPIChatInputApplicationCommandInteractionData(interaction.data)) return
        const subcommandName = interaction.data.options?.[0].name
        if (!subcommandName) return
        const subcommandExecute = command.execute[subcommandName]
        subcommandExecute({ interaction, api })
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

  private gracefulShutdown() {
    if (this.options.onShutDown) {
      const onShutDown = this.options.onShutDown.bind(this)
      process.on('SIGINT', () => {
        onShutDown()
        process.exit(0)
      })
      process.on('SIGTERM', () => {
        onShutDown()
        process.exit(0)
      })
      process.on('SIGKILL', () => {
        onShutDown()
        process.exit(0)
      })
    }
  }

  async listen() {
    this.gracefulShutdown()
    this.subscribeGatewayDispatchEvents()
    await this.registerSlashCommands()
    await this.gateway.connect()
  }
}
