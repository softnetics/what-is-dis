import { parseEnv, z } from 'znv'

export const environment = parseEnv(process.env, {
  DISCORD_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_DEVELOPMENT_GUILD_ID: z.string(),
})
