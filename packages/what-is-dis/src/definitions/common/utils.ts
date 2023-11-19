import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  CommandInteractionOption,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js'
import { ZodError, ZodType } from 'zod'

import { toCamelCase } from '../../utils/to-camel-case'
import { toKebabCase } from '../../utils/to-kebab-case'
import { InputType } from './options'
import { CommandOptions, CommandOptionsToNativeType } from './types'

export function keys<T extends Record<string | number | symbol, unknown>>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

export function validateWithZodIfExists(value: unknown, zodSchema?: ZodType) {
  if (!zodSchema) return true
  const result = zodSchema.safeParse(value)
  if (result.success) return true
  return result.error
}

export function setupBuilderOptions<T extends SlashCommandBuilder | SlashCommandSubcommandBuilder>(
  builder: T,
  _options: CommandOptions
): T {
  // Swap required options to the front
  let options: CommandOptions = {}
  for (const key of keys(_options)) {
    const input = _options[key]
    if (input.required) {
      options = { [key]: input, ...options }
    } else {
      options = { ...options, [key]: input }
    }
  }

  for (const key of keys(options)) {
    const input = options[key]
    const name = toKebabCase(`${key as string}`)
    switch (input.type) {
      case InputType.STRING:
        builder.addStringOption((option) => {
          option.setName(name)
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          if (input.choices && input.choices.length > 0) option.setChoices(...input.choices)
          return option
        })
        break
      case InputType.NUMBER:
        builder.addNumberOption((option) => {
          option.setName(name)
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          if (input.choices && input.choices.length > 0) option.setChoices(...input.choices)
          return option
        })
        break
      case InputType.INTEGER:
        builder.addIntegerOption((option) => {
          option.setName(name)
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          if (input.choices && input.choices.length > 0) option.setChoices(...input.choices)
          return option
        })
        break
      case InputType.CHANNEL:
        builder.addChannelOption((option) => {
          option.setName(name)
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          return option
        })
        break
      case InputType.USER:
        builder.addUserOption((option) => {
          option.setName(name)
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          return option
        })
        break
      case InputType.ROLE:
        builder.addRoleOption((option) => {
          option.setName(name)
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          return option
        })
        break
      case InputType.BOOLEAN:
        builder.addBooleanOption((option) => {
          option.setName(name)
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          return option
        })
        break
      case InputType.MENTIONABLE:
        builder.addMentionableOption((option) => {
          option.setName(name)
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          return option
        })
        break
      case InputType.ATTACHMENT:
        builder.addAttachmentOption((option) => {
          option.setName(name)
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          return option
        })
        break
    }
  }

  return builder
}

export function constructBodyFromInteractionData<TOptions extends CommandOptions>(
  inputOptions: TOptions,
  commandOptions?: readonly CommandInteractionOption[]
): { body: CommandOptionsToNativeType<TOptions>; errors: ZodError[] } {
  const body = {} as CommandOptionsToNativeType<TOptions>
  const errors: ZodError[] = []

  commandOptions?.forEach((commandOption) => {
    const key = toCamelCase(commandOption.name) as keyof typeof inputOptions

    switch (commandOption.type) {
      case ApplicationCommandOptionType.Subcommand: {
        const subcommandOptions = commandOption.options
        return constructBodyFromInteractionData(inputOptions, subcommandOptions)
      }
      case ApplicationCommandOptionType.String:
      case ApplicationCommandOptionType.Boolean:
      case ApplicationCommandOptionType.Number:
      case ApplicationCommandOptionType.Integer:
      case ApplicationCommandOptionType.Channel:
      case ApplicationCommandOptionType.User:
      case ApplicationCommandOptionType.Mentionable:
      case ApplicationCommandOptionType.Role: {
        const validate = inputOptions[key].validate
        const result = validateWithZodIfExists(commandOption.value, validate)
        if (result !== true) {
          errors.push(result)
          break
        }
        Object.assign(body, { [key]: commandOption.value })
        break
      }
      default:
        throw new Error(`Unknown option type: ${commandOption.type}`)
    }
  })

  return { body, errors }
}

export function handleDiscordInputError(
  interaction: ChatInputCommandInteraction,
  errors: ZodError[]
) {
  if (errors.length > 0) {
    interaction.reply({
      content: `There was an error with your input: ${errors
        .map((error) => error.message)
        .join(', ')}`,
      flags: MessageFlags.Ephemeral,
    })
  }
}
