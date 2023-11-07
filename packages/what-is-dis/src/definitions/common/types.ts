import { SlashCommandBuilder } from '@discordjs/builders'
import { API, APIApplicationCommandInteraction } from '@discordjs/core'
import { ValuesType } from 'utility-types'

import {
  InputNumberOption,
  InputOption,
  InputStringChoiceOption,
  InputStringOption,
} from './options'

export const SlashCommandType = {
  BASIC: 'basic',
  SUBCOMMAND: 'subcommand',
  SUBCOMMAND_GROUP: 'subcommand_group',
} as const
export type SlashCommandType = ValuesType<typeof SlashCommandType>

export type ExecuteFnProps<TBody> = {
  interaction: APIApplicationCommandInteraction
  api: API
  body: TBody
}

export type InputExecuteFn<TOptions> = (context: ExecuteFnProps<TOptions>) => void | Promise<void>

export type OutputExecuteFn = (context: Omit<ExecuteFnProps<never>, 'body'>) => void | Promise<void>

export type CommandOptions = Record<string, InputOption>

type ToNativeType<TInputOption extends InputOption> = TInputOption extends InputNumberOption
  ? number
  : TInputOption extends InputStringOption
  ? TInputOption['choices'] extends readonly (infer TChoice)[]
    ? TChoice extends InputStringChoiceOption
      ? TChoice['value']
      : never
    : string
  : string

export type CommandOptionsToNativeType<TOptions extends CommandOptions> = {
  [K in keyof TOptions]: TOptions[K]['required'] extends true
    ? ToNativeType<TOptions[K]>
    : ToNativeType<TOptions[K]> | undefined
}

export type DefineGeneric<TType extends SlashCommandType, TExecute> = {
  type: TType
  data: ReturnType<SlashCommandBuilder['toJSON']>
  execute: TExecute
}
