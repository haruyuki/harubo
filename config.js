import dotenv from "dotenv"

dotenv.config()

export const config = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  bot: {
    intents: ["Guilds"],
    presence: {
      name: "you babo",
      type: "Playing",
    },
    version: "1.0.0"
  }
}