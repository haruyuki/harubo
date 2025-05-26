import { readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { REST, Routes } from "discord.js"
import dotenv from "dotenv"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .option("global", {
        alias: "g",
        description: "Deploy commands globally",
        type: "boolean",
        default: false,
    })
    .option("guild", {
        alias: "s",
        description: "Deploy commands to a specific guild",
        type: "string",
    })
    .option("delete", {
        alias: "d",
        description: "Delete a command by ID",
        type: "string",
    })
    .option("env", {
        alias: "e",
        description: "Environment to deploy to (dev or prod)",
        type: "string",
        choices: ["dev", "prod"],
        default: "prod",
    })
    .option("token", {
        alias: "t",
        description: "Token environment variable to use (overrides env option)",
        type: "string",
    })
    .option("clientId", {
        alias: "c",
        description:
            "Client ID environment variable to use (overrides env option)",
        type: "string",
    })
    .help()
    .alias("help", "h")
    .parse()

const commands = []
const foldersPath = join(__dirname, "commands")
const commandFolders = readdirSync(foldersPath)

async function loadCommands() {
    for (const folder of commandFolders) {
        const commandsPath = join(foldersPath, folder)
        const commandFiles = readdirSync(commandsPath).filter((file) =>
            file.endsWith(".js"),
        )
        for (const file of commandFiles) {
            const filePath = pathToFileURL(join(commandsPath, file))
            const command = await import(filePath)
            if ("data" in command && "execute" in command) {
                commands.push(command.data.toJSON())
            } else {
                console.log(
                    `The command at ${filePath} is missing a required "data" or "execute" property.`,
                )
            }
        }
    }

    // Determine token and client ID variables
    const isDevEnv = argv.env === "dev";
    let tokenVar = argv.token || (isDevEnv ? "DISCORD_TOKEN_DEV" : "DISCORD_TOKEN");
    let clientIdVar = argv.clientId || (isDevEnv ? "CLIENT_ID_DEV" : "CLIENT_ID");

    console.log(`Using environment: ${argv.env}`);
    console.log(`Using token variable: ${tokenVar}`);
    console.log(`Using client ID variable: ${clientIdVar}`);

    const rest = new REST().setToken(process.env[tokenVar])

    try {
        console.log(`Started refreshing ${commands.length} slash commands.`)

        // Handle command deletion if specified
        if (argv.delete) {
            const commandID = argv.delete
            if (argv.global) {
                await rest.delete(
                    Routes.applicationCommand(
                        process.env[clientIdVar],
                        commandID,
                    ),
                )
                console.log("Successfully deleted global command")
            } else {
                const guildId = argv.guild || process.env.GUILD_ID;
                if (!guildId) {
                    console.error("Error: Guild ID is required for deleting guild-specific commands and was not provided via --guild option or GUILD_ID environment variable.");
                    process.exit(1);
                }
                await rest.delete(
                    Routes.applicationGuildCommand(
                        process.env[clientIdVar],
                        guildId,
                        commandID,
                    ),
                );
                console.log(
                    `Successfully deleted guild command from guild ${guildId}`,
                );
            }
            return
        }

        // Handle command deployment
        let data;
        if (argv.global) {
            // Global commands
            data = await rest.put(
                Routes.applicationCommands(process.env[clientIdVar]),
                { body: commands },
            );
            console.log(
                `Successfully reloaded ${data.length} global slash commands.`,
            );
        } else {
            // Guild commands
            const guildId = argv.guild || process.env.GUILD_ID;
            if (!guildId) {
                console.error("Error: Guild ID is required for deploying guild-specific commands and was not provided via --guild option or GUILD_ID environment variable.");
                process.exit(1);
            }
            data = await rest.put(
                Routes.applicationGuildCommands(
                    process.env[clientIdVar],
                    guildId,
                ),
                { body: commands },
            );
            console.log(
                `Successfully reloaded ${data.length} slash commands to guild ${guildId}.`,
            );
        }
    } catch (error) {
        console.error("An error occurred:", error);
        process.exit(1);
    }
    // Script will exit naturally on success
}

loadCommands()