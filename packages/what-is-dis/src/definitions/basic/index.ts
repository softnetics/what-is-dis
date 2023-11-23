import { SlashCommandBuilder } from 'discord.js'

import { CommandOptions, SlashCommandType } from '../common/types'
import {
  constructBodyFromInteractionData,
  handleDiscordInputError,
  setupBuilderOptions,
} from '../common/utils'
import { SlashCommandBasicProps, SlashCommandBasicReturn } from './types'

export function defineSlashCommandBasic<const TOptions extends CommandOptions>(
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

      context.logger.debug(
        `Executing slash command ${props.name} with body: ${JSON.stringify(body)}`
      )

      if (errors.length > 0) {
        context.logger.debug(`Slash command ${props.name} has errors: ${JSON.stringify(errors)}`)
        return void handleDiscordInputError(interaction, errors)
      }

      props.execute({ ...context, body })
    },
  }
}
