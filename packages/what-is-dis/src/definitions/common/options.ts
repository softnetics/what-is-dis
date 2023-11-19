import { ValuesType } from 'utility-types'
import { z } from 'zod'

export const InputType = {
  STRING: 'string',
  NUMBER: 'number',
  CHANNEL: 'channel',
  USER: 'user',
  ROLE: 'role',
} as const
type InputType = ValuesType<typeof InputType>

export type InputBaseOption = {
  description: string
  required?: boolean
  validate?: z.ZodType
}

// String input
export type InputStringChoiceOption = {
  name: string
  value: string
}
export type InputStringOption = InputBaseOption & {
  type: typeof InputType.STRING
  choices?: InputStringChoiceOption[]
}

// Number input
export type InputNumberOption = InputBaseOption & {
  type: typeof InputType.NUMBER
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

// Input option
export type InputOption =
  | InputStringOption
  | InputNumberOption
  | InputChannelOption
  | InputUserOption
  | InputRoleOption
