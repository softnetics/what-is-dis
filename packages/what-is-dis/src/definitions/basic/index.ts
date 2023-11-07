import { SlashCommandBuilder } from '@discordjs/builders'

import { isAPIChatInputApplicationCommandInteractionData } from '../../utils/type-guard'
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
      if (!isAPIChatInputApplicationCommandInteractionData(context.interaction.data)) return

      const { body, errors } = constructBodyFromInteractionData(
        props.options,
        context.interaction.data.options
      )

      if (errors.length > 0) {
        return void handleDiscordInputError(
          context.interaction.id,
          context.interaction.token,
          context.api.interactions,
          errors
        )
      }

      props.execute({ ...context, body })
    },
  }
}
