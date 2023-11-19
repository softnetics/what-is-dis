import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js'

import {
  CommandOptions,
  CommandOptionsToNativeType,
  InputExecuteFn,
  OutputExecuteFn,
  SlashCommandType,
} from '../common/types'

export type SubcommandProps<TOptions extends CommandOptions> = Readonly<{
  name: string
  description: string
  options: TOptions
  execute: InputExecuteFn<CommandOptionsToNativeType<TOptions>>
}>

export type SubcommandReturn = {
  name: string
  register: (subcommand: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder
  execute: OutputExecuteFn
}

export type SlashCommandSubcommandsProps = Readonly<{
  name: string
  description: string
  subcommands: readonly SubcommandReturn[]
}>

export type SlashCommandSubcommandsReturn = {
  type: typeof SlashCommandType.SUBCOMMAND
  data: ReturnType<SlashCommandBuilder['toJSON']>
  execute: Record<string, OutputExecuteFn>
}
