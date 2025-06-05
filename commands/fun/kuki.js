import { MessageFlags, SlashCommandBuilder} from 'discord.js';
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    entersState,
    VoiceConnectionStatus,
    StreamType
} from '@discordjs/voice';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const data = new SlashCommandBuilder()
    .setName('kuki')
    .setDescription('Cleans the air.');

export async function execute(interaction) {
        // Fetch the full member object to ensure voice state is available
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({
                content: 'You must be in a voice channel to use this command.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Check bot permissions in the channel
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions?.has('Connect')) {
            return interaction.reply({
                content: 'I need the **Connect** permission to join your voice channel.',
                flags: MessageFlags.Ephemeral
            });
        }
        if (!permissions?.has('Speak')) {
            return interaction.reply({
                content: 'I need the **Speak** permission to play audio in your voice channel.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply({
            content: 'Coming over to clean the air!',
            flags: MessageFlags.Ephemeral
        });

        // Join the user's voice channel
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
        } catch (error) {
            connection.destroy();
            return interaction.followUp({
                content: 'Failed to join the voice channel.',
                flags: MessageFlags.Ephemeral
            });
        }

    // Prepare and play the audio using FFmpeg for compatibility
    const audioPath = path.join(__dirname, '../../audio/kuki.mp3');
    const fs = await import('fs');
    if (!fs.existsSync(audioPath)) {
        connection.destroy();
        return interaction.followUp({
            content: 'Audio file not found.',
            flags: MessageFlags.Ephemeral
        });
    }

    const { spawn } = await import('child_process');
    const ffmpeg = spawn('ffmpeg', [
        '-i', audioPath,
        '-analyzeduration', '0',
        '-loglevel', '0',
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        'pipe:1',
    ]);

    const resource = createAudioResource(ffmpeg.stdout, {
        inputType: StreamType.Raw,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);
    player.play(resource);

    player.once(AudioPlayerStatus.Idle, () => {
        connection.destroy();
    });
    player.on('error', () => {
        connection.destroy();
    });
    ffmpeg.stderr?.on('data', (data) => {
        console.error('FFmpeg stderr:', data.toString());
    });
}
