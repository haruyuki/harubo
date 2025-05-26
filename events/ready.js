import { Events } from "discord.js"
import { config } from "../config.js"

export const name = Events.ClientReady
export const once = true

export async function execute(client) {
    console.log(
        `Ready! Logged in as ${client.user.tag} running version ${config.bot.version}`,
    )
}