import { ChatInputCommandInteraction } from 'discord.js'
import { ValuesType } from 'utility-types'

import {
  InputBooleanOption,
  InputChoiceOption,
  InputIntegerOption,
  InputNumberOption,
  InputOption,
  InputStringOption,
} from './options'

export const SlashCommandType = {
  BASIC: 'basic',
  SUBCOMMAND: 'subcommand',
  SUBCOMMAND_GROUP: 'subcommand_group',
} as const
export type SlashCommandType = ValuesType<typeof SlashCommandType>

export type ExecuteFnProps<TBody> = {
  interaction: ChatInputCommandInteraction
  body: TBody
}

export type InputExecuteFn<TOptions> = (context: ExecuteFnProps<TOptions>) => void | Promise<void>

export type OutputExecuteFn = (context: Omit<ExecuteFnProps<never>, 'body'>) => void | Promise<void>

export type CommandOptions = Record<string, InputOption>

type ToNativeType<TInputOption extends InputOption> = TInputOption extends InputBooleanOption
  ? boolean
  : TInputOption extends InputNumberOption | InputIntegerOption
    ? TInputOption['choices'] extends readonly (infer TChoice)[]
      ? TChoice extends InputChoiceOption<number>
        ? TChoice['value']
        : never
      : number
    : TInputOption extends InputStringOption
      ? TInputOption['choices'] extends readonly (infer TChoice)[]
        ? TChoice extends InputChoiceOption<string>
          ? TChoice['value']
          : never
        : string
      : string

export type CommandOptionsToNativeType<TOptions extends CommandOptions> = {
  [K in keyof TOptions]: TOptions[K]['required'] extends true
    ? ToNativeType<TOptions[K]>
    : ToNativeType<TOptions[K]> | undefined
}
