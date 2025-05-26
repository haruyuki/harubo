import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('user')
    .setDescription('Displays information about yourself');

export async function execute(interaction) {
    const user = interaction.user;
    const member = interaction.member;

    const userCreatedAt = Math.floor(user.createdTimestamp / 1000);
    const memberJoinedAt = Math.floor(member.joinedTimestamp / 1000);

    const embed = {
        color: 0x0099ff,
        title: `User Information - ${user.username}`,
        thumbnail: {
            url: user.displayAvatarURL({ dynamic: true }),
        },
        fields: [
            {
                name: 'Username',
                value: user.username,
                inline: true,
            },
            {
                name: 'User ID',
                value: user.id,
                inline: true,
            },
            {
                name: 'Account Created',
                value: `<t:${userCreatedAt}:R>`,
                inline: true,
            },
            {
                name: 'Server Join Date',
                value: `<t:${memberJoinedAt}:R>`,
                inline: true,
            },
            {
                name: 'Roles',
                value: member.roles.cache.map(role => role.toString()).join(', '),
                inline: false,
            },
        ],
        timestamp: new Date(),
        footer: {
            text: `Requested by ${user.username}`,
            icon_url: user.displayAvatarURL({ dynamic: true }),
        },
    };

    await interaction.reply({ embeds: [embed] });
}
