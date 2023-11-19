import { SlashCommandBuilder } from 'discord.js'

import { CommandOptions, SlashCommandType } from '../common/types'
import {
  constructBodyFromInteractionData,
  handleDiscordInputError,
  setupBuilderOptions,
} from '../common/utils'
import {
  SlashCommandSubcommandsProps,
  SlashCommandSubcommandsReturn,
  SubcommandProps,
  SubcommandReturn,
} from './types'

export function defineSlashCommandSubcommands(
  props: SlashCommandSubcommandsProps
): SlashCommandSubcommandsReturn {
  const builder = new SlashCommandBuilder().setName(props.name)

  if (props.description) {
    builder.setDescription(props.description)
  }

  const executions: Record<string, SubcommandReturn['execute']> = {}

  for (const subcommand of props.subcommands) {
    builder.addSubcommand(subcommand.register)
    Object.assign(executions, { [subcommand.name]: subcommand.execute })
  }

  return {
    type: SlashCommandType.SUBCOMMAND,
    data: builder.toJSON(),
    execute: executions,
  }
}

export function defineSubcommand<TOptions extends CommandOptions>(
  props: SubcommandProps<TOptions>
): SubcommandReturn {
  const register: SubcommandReturn['register'] = (subcommand) => {
    subcommand.setName(props.name)
    subcommand.setDescription(props.description)
    setupBuilderOptions(subcommand, props.options)
    return subcommand
  }

  return {
    name: props.name,
    register,
    execute: (context) => {
      const interaction = context.interaction

      if (!interaction.isChatInputCommand()) return

      const { body, errors } = constructBodyFromInteractionData(
        props.options,
        interaction.options.data
      )

      if (errors.length > 0) {
        return void handleDiscordInputError(interaction, errors)
      }

      props.execute({ ...context, body })
    },
  }
}