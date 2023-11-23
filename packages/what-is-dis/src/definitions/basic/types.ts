import { SlashCommandBuilder } from 'discord.js'

import {
  CommandOptions,
  CommandOptionsToNativeType,
  InputExecuteFn,
  OutputExecuteFn,
  SlashCommandType,
} from '../common/types'

export type SlashCommandBasicProps<TOptions extends CommandOptions> = Readonly<{
  name: string
  description: string
  options: TOptions
  execute: InputExecuteFn<CommandOptionsToNativeType<TOptions>>
}>

export type SlashCommandBasicReturn = {
  type: typeof SlashCommandType.BASIC
  data: ReturnType<SlashCommandBuilder['toJSON']>
  execute: OutputExecuteFn
}
