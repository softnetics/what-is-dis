import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders'
import {
  APIApplicationCommandInteractionDataOption,
  ApplicationCommandOptionType,
  InteractionsAPI,
  MessageFlags,
} from '@discordjs/core'
import { ZodError, ZodType } from 'zod'

import { toCamelCase } from '../../utils/to-camel-case'
import { toKebabCase } from '../../utils/to-kebab-case'
import { InputType } from './options'
import { CommandOptions, CommandOptionsToNativeType } from './types'

export function validateWithZodIfExists(value: unknown, zodSchema?: ZodType) {
  if (!zodSchema) return true
  const result = zodSchema.safeParse(value)
  if (result.success) return true
  return result.error
}

export function setupBuilderOptions<T extends SlashCommandBuilder | SlashCommandSubcommandBuilder>(
  builder: T,
  options: CommandOptions
): T {
  const keys = Object.keys(options) as (keyof typeof options)[]

  for (const key of keys) {
    const input = options[key]
    switch (input.type) {
      case InputType.STRING:
        builder.addStringOption((option) => {
          option.setName(toKebabCase(`${key as string}`))
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          if (input.choices && input.choices.length > 0) option.setChoices(...input.choices)
          return option
        })
        break
      case InputType.NUMBER:
        builder.addNumberOption((option) => {
          option.setName(toKebabCase(`${key as string}`))
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          return option
        })
        break
      case InputType.CHANNEL:
        builder.addChannelOption((option) => {
          option.setName(toKebabCase(`${key as string}`))
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          return option
        })
        break
      case InputType.USER:
        builder.addUserOption((option) => {
          option.setName(toKebabCase(`${key as string}`))
          if (input.description) option.setDescription(input.description)
          if (input.required) option.setRequired(input.required)
          return option
        })
        break
      case InputType.ROLE:
        builder.addRoleOption((option) => {
          option.setName(toKebabCase(`${key as string}`))
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
  commandOptions?: APIApplicationCommandInteractionDataOption[]
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
      case ApplicationCommandOptionType.Number:
      case ApplicationCommandOptionType.Channel:
      case ApplicationCommandOptionType.User:
      case ApplicationCommandOptionType.Role: {
        const validate = inputOptions[key].validate
        const result = validateWithZodIfExists(commandOption.value, validate)
        if (result !== true) {
          errors.push(result)
          break
        }
        Object.assign(body, { [key]: commandOption.value })
      }
    }
  })

  return { body, errors }
}

export function handleDiscordInputError(
  interactionId: string,
  interactionToken: string,
  interaction: InteractionsAPI,
  errors: ZodError[]
) {
  if (errors.length > 0) {
    interaction.reply(interactionId, interactionToken, {
      content: `There was an error with your input: ${errors
        .map((error) => error.message)
        .join(', ')}`,
      flags: MessageFlags.Ephemeral,
    })
  }
}
