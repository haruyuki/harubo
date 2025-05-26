import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with the bot\'s latency');

export async function execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', withResponse: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply({
        content: `🏓 Pong!\n📊 Roundtrip latency: ${latency}ms\n📡 API Latency: ${apiLatency}ms`
    });
}
