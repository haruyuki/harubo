import dotenv from "dotenv"
import { ActivityType } from "discord.js";

dotenv.config()

export const config = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  bot: {
    intents: ["Guilds"],
    presence: {
      name: "you babo",
      type: ActivityType.Playing,
    },
    version: "1.0.0"
  }
}