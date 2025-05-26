import { readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { ActivityType, Client, Collection, GatewayIntentBits } from "discord.js"

import { config } from "./config.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const client = new Client({
    intents: config.bot.intents.map((intent) => GatewayIntentBits[intent]),
    presence: {
        activities: [
            {
                name: config.bot.presence.name,
                type: config.bot.presence.type,
            },
        ],
    },
})

client.commands = new Collection()

// Function to load commands
async function loadCommands() {
    const foldersPath = join(__dirname, "commands")
    const commandFolders = readdirSync(foldersPath)

    for (const folder of commandFolders) {
        const commandsPath = join(foldersPath, folder)
        const commandFiles = readdirSync(commandsPath).filter((file) =>
            file.endsWith(".js"),
        )
        for (const file of commandFiles) {
            const filePath = pathToFileURL(join(commandsPath, file))
            const command = await import(filePath)
            if ("data" in command && "execute" in command) {
                client.commands.set(command.data.name, command)
                console.log(`Loaded command: ${command.data.name}`)
            } else {
				console.log(
                    'The command at ${filePath} is missing a required "data" or "execute" property.',
                )
            }
        }
    }
}

// Function to load events
async function loadEvents() {
    const eventsPath = join(__dirname, "events")
    const eventFiles = readdirSync(eventsPath).filter((file) =>
        file.endsWith(".js"),
    )

    for (const file of eventFiles) {
        const filePath = pathToFileURL(join(eventsPath, file))
        const event = await import(filePath)
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args))
        } else {
            client.on(event.name, (...args) => event.execute(...args))
        }
		console.log(`Ran event: ${event.name}`)
    }
}

// Login and initialization
async function init() {
	console.log("Loading commands...")
    await loadCommands()
     console.log("Loading events...")
    await loadEvents()
    await client.login(config.token)
}

init()