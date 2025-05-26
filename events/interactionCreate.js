import { Events, MessageFlags } from "discord.js"

export const name = Events.InteractionCreate

export async function execute(interaction) {
    try {
        if (!interaction.isChatInputCommand()) return

        const command = interaction.client.commands.get(interaction.commandName)

        if (!command) {
            console.log(
                `Command not found: ${interaction.commandName} | User: ${interaction.user.tag} | Channel: ${interaction.channel?.id || "N/A"} | Guild: ${interaction.guild?.id || "N/A"}`,
            )
            return
        }

        await command.execute(interaction)
    } catch (error) {
        const errorDetails = [
            `Command: ${interaction.commandName || "N/A"}`,
            `User: ${interaction.user?.tag || "N/A"}`,
            `Channel: ${interaction.channel?.id || "N/A"}`,
            `Guild: ${interaction.guild?.id || "N/A"}`,
            `Error: ${error.message}`,
            `Code: ${error.code || "N/A"}`,
            `Stack: ${error.stack || "No stack trace"}`,
        ].join(" | ")

        console.log(`Interaction Error: ${errorDetails}`)

        try {
            if (
                interaction.isCommand() &&
                !interaction.replied &&
                !interaction.deferred
            ) {
                await interaction.reply({
                    content: "An error occurred while executing this command!",
                    flags: MessageFlags.Ephemeral,
                })
            } else if (interaction.isRepliable()) {
                await interaction.followUp({
                    content: "An error occurred after initial response!",
                    flags: MessageFlags.Ephemeral,
                })
            }
        } catch (replyError) {
            console.log(
                `Reply Failed: ${replyError.message} | Command: ${interaction.commandName} | Interaction ID: ${interaction.id}`,
            )
        }
    }
}