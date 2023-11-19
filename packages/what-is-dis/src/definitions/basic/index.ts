import { SlashCommandBuilder } from 'discord.js'

import { CommandOptions, SlashCommandType } from '../common/types'
import {
  constructBodyFromInteractionData,
  handleDiscordInputError,
  setupBuilderOptions,
} from '../common/utils'
import { SlashCommandBasicProps, SlashCommandBasicReturn } from './types'

export function defineSlashCommandBasic<TOptions extends CommandOptions>(
  props: SlashCommandBasicProps<TOptions>
): SlashCommandBasicReturn {
  const builder = new SlashCommandBuilder()
  builder.setName(props.name)
  builder.setDescription(props.description)
  setupBuilderOptions(builder, props.options)

  return {
    type: SlashCommandType.BASIC,
    data: builder.toJSON(),
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
