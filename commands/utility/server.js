import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('server')
    .setDescription('Displays information about the current server');

export async function execute(interaction) {
    const guild = interaction.guild;

    // Get guild features as a formatted string
    const features = guild.features.length > 0
        ? guild.features.map(feature => `\`${feature}\``).join(', ')
        : 'None';

    // Create embed with server information
    const serverEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
            { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'Server ID', value: guild.id, inline: true },
            { name: 'Members', value: `${guild.memberCount}`, inline: true },
            { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
            { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
            { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
            { name: 'Boost Count', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
            { name: 'Verification Level', value: `${guild.verificationLevel}`, inline: true },
            { name: 'Features', value: features }
        )
        .setFooter({ text: 'Server Information' })
        .setTimestamp();

    await interaction.reply({ embeds: [serverEmbed] });
}
