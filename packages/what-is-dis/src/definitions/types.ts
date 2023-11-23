import { SlashCommandBasicReturn } from './basic/types'
import { SlashCommandSubcommandsReturn } from './subcommand/types'

export type SlashCommand = SlashCommandBasicReturn | SlashCommandSubcommandsReturn
