import { LoggerOptions, createLogger } from '@/logger'
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
import { Logger } from 'winston'

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
   * If this value is set to true, the bot will delete the commands before registering them.
   * It'll onlt refresh if `developmentGuildId` is set.
   * Which means, it'll not refresh the global commands.
   */
  refreshCommands?: boolean
  /**
   * The logger options based on `winston`.
   */
  loggerOptions?: LoggerOptions
  /**
   * The callback to run when the bot is ready.
   */
  onReady?: (args: { logger: Logger; client: Client }) => void
  /**
   * The callback before the bot shut down.
   */
  onShutDown?: (args: { logger: Logger; client: Client }) => void
}

export class DiscordBot {
  private readonly logger: Logger
  // REST manager instance requires a token to make requests
  private readonly rest: REST
  // Discord client to handle all requests
  private readonly client: Client
  // SlashCommand collections
  private readonly slashCommandCollection = new Collection<string, SlashCommand>()

  constructor(private readonly options: DiscordBotOptions) {
    this.logger = createLogger('bot', this.options.loggerOptions)
    this.rest = new REST({ version: '10', timeout: 2000 }).setToken(options.token)
    const intents = options.intents.reduce((acc, cur) => acc | cur, 0)
    this.client = new Client({ intents })
    options.slashCommands.forEach((command) => {
      this.slashCommandCollection.set(command.data.name, command)
    })
  }

  private subscribeGatewayDispatchEvents() {
    this.client.once(Events.ClientReady, (client) => {
      this.options.onReady?.({ logger: this.logger, client })
    })
    this.client.on(Events.InteractionCreate, (interaction) => {
      this.handleInteractionCreate(interaction)
    })

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
        await command.execute({ interaction, logger: this.logger })
        break
      }
      case SlashCommandType.SUBCOMMAND: {
        const subcommandName = interaction.options.getSubcommand()
        if (!subcommandName) return
        const subcommandExecute = command.execute[subcommandName]
        subcommandExecute({ interaction, logger: this.logger })
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
      this.logger.info('Globally Registering commands...')
      await this.rest.put(route, { body: commands })
      this.logger.info('Commands are globally registered!')
    }

    // Otherwise, register commands in the development guild only
    else {
      const route = Routes.applicationGuildCommands(
        this.options.clientId,
        this.options.developmentGuildId
      )
      if (this.options.refreshCommands) {
        this.logger.info(`Deleting commands for guild ${this.options.developmentGuildId}...`)
        await this.rest.put(route, { body: [] })
        this.logger.info(`Commands are deleted! for guild ${this.options.developmentGuildId}`)
      }

      this.logger.info(`Registering commands for guild ${this.options.developmentGuildId}...`)
      await this.rest.put(route, { body: commands })
      this.logger.info(`Commands are registered! for guild ${this.options.developmentGuildId}`)
    }
  }

  private setupGracefulShutdown() {
    if (this.options.onShutDown) {
      const onShutDown = this.options.onShutDown.bind(this)
      const options: Parameters<typeof onShutDown>[0] = {
        logger: this.logger,
        client: this.client,
      }
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

  getClient() {
    return this.client
  }

  reregisterSlashCommands() {
    return this.registerSlashCommands()
  }

  async listen() {
    this.setupGracefulShutdown()
    this.subscribeGatewayDispatchEvents()
    await this.registerSlashCommands()
    this.logger.info("Bot's logging in...")
    await this.client.login(this.options.token)
    this.logger.info("Bot's ready!")
  }
}
