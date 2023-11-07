import {
  APIApplicationCommandInteraction,
  APIApplicationCommandInteractionDataOption,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIChatInputApplicationCommandInteractionData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from '@discordjs/core'

export function isAPIChatInputApplicationCommandInteractionData(
  data: APIApplicationCommandInteraction['data']
): data is APIChatInputApplicationCommandInteractionData {
  return data.type === ApplicationCommandType.ChatInput
}

export function isAPIApplicationCommandInteractionDataSubcommandOption(
  data: APIApplicationCommandInteractionDataOption
): data is APIApplicationCommandInteractionDataSubcommandOption {
  return data.type === ApplicationCommandOptionType.Subcommand
}
