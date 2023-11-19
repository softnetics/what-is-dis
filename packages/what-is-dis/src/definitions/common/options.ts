import { ValuesType } from 'utility-types'
import { z } from 'zod'

export const InputType = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  CHANNEL: 'channel',
  USER: 'user',
  ROLE: 'role',
  BOOLEAN: 'boolean',
  MENTIONABLE: 'mentionable',
  ATTACHMENT: 'attachment',
} as const
type InputType = ValuesType<typeof InputType>

export type InputBaseOption = {
  description: string
  required?: boolean
  validate?: z.ZodType
}

export type InputChoiceOption<T> = {
  name: string
  value: T
}

// String input
export type InputStringOption = InputBaseOption & {
  type: typeof InputType.STRING
  choices?: InputChoiceOption<string>[]
}

// Number input
export type InputNumberOption = InputBaseOption & {
  type: typeof InputType.NUMBER
  choices?: InputChoiceOption<number>[]
}

// Integer input
export type InputIntegerOption = InputBaseOption & {
  type: typeof InputType.INTEGER
  choices?: InputChoiceOption<number>[]
}

// Channel input
export type InputChannelOption = InputBaseOption & {
  type: typeof InputType.CHANNEL
}

// User input
export type InputUserOption = InputBaseOption & {
  type: typeof InputType.USER
}

// Role input
export type InputRoleOption = InputBaseOption & {
  type: typeof InputType.ROLE
}

// Boolean input
export type InputBooleanOption = InputBaseOption & {
  type: typeof InputType.BOOLEAN
}

// Mentionable input
export type InputMentionableOption = InputBaseOption & {
  type: typeof InputType.MENTIONABLE
}

// Attachment input
export type InputAttachmentOption = InputBaseOption & {
  type: typeof InputType.ATTACHMENT
}

// Input option
export type InputOption =
  | InputStringOption
  | InputNumberOption
  | InputIntegerOption
  | InputChannelOption
  | InputUserOption
  | InputRoleOption
  | InputBooleanOption
  | InputMentionableOption
  | InputAttachmentOption
