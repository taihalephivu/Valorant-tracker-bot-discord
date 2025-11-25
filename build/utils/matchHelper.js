"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatchEmbed = createMatchEmbed;
const discord_js_1 = require("discord.js");
function createMatchEmbed(options) {
    const { gameName, tag, matchData } = options;
    // Kiểm tra xem có match data không
    if (!matchData || !matchData.matches || matchData.matches.length === 0) {
        return null;
    }
    // Lấy match gần nhất
    const match = matchData.matches[0];
    const metadata = match.metadata;
    // Match info
    const mapName = metadata.map || 'Unknown';
    const mode = metadata.mode || 'Unknown';
    // Convert to Vietnam time (UTC+7)
    let startTime = 'Unknown';
    if (metadata.game_start) {
        // game_start might be Unix timestamp in seconds, convert to milliseconds
        const timestamp = metadata.game_start < 10000000000 ? metadata.game_start * 1000 : metadata.game_start;
        const date = new Date(timestamp);
        startTime = date.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    else if (metadata.game_start_patched) {
        startTime = metadata.game_start_patched;
    }
    const rounds = metadata.rounds_played || 0;
    // Teams
    const redTeam = match.teams.red;
    const blueTeam = match.teams.blue;
    const redWon = redTeam.has_won;
    const blueWon = blueTeam.has_won;
    const redScore = redTeam.rounds_won || 0;
    const blueScore = blueTeam.rounds_won || 0;
    // Tạo embed
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`🎮 Trận Đấu Gần Nhất: ${gameName}#${tag}`)
        .setDescription(`**Map:** ${mapName}\n` +
        `**Mode:** ${mode}\n` +
        `**Thời gian:** ${startTime}\n` +
        `**Số round:** ${rounds}\n` +
        `**Kết quả:** ${redWon ? `🔴 Red Team thắng ${redScore} - ${blueScore}` : blueWon ? `🔵 Blue Team thắng ${blueScore} - ${redScore}` : `Hòa ${redScore} - ${blueScore}`}`)
        .setFooter({ text: 'Dữ liệu từ Henrik API' })
        .setTimestamp();
    // Red Team
    let redPlayers = '';
    // Sắp xếp theo score từ cao xuống thấp
    const sortedRedPlayers = match.players.red?.sort((a, b) => (b.stats.score || 0) - (a.stats.score || 0));
    sortedRedPlayers?.forEach((p) => {
        const kda = `${p.stats.kills}/${p.stats.deaths}/${p.stats.assists}`;
        const rank = p.currenttier_patched || 'Unranked';
        redPlayers += `**${p.name}#${p.tag}** - ${p.character}\n`;
        redPlayers += `└ \`${rank}\` | KDA: ${kda} | Score: ${p.stats.score}\n`;
    });
    if (redPlayers) {
        embed.addFields({ name: '🔴 Red Team', value: redPlayers, inline: false });
    }
    // Blue Team
    let bluePlayers = '';
    // Sắp xếp theo score từ cao xuống thấp
    const sortedBluePlayers = match.players.blue?.sort((a, b) => (b.stats.score || 0) - (a.stats.score || 0));
    sortedBluePlayers?.forEach((p) => {
        const kda = `${p.stats.kills}/${p.stats.deaths}/${p.stats.assists}`;
        const rank = p.currenttier_patched || 'Unranked';
        bluePlayers += `**${p.name}#${p.tag}** - ${p.character}\n`;
        bluePlayers += `└ \`${rank}\` | KDA: ${kda} | Score: ${p.stats.score}\n`;
    });
    if (bluePlayers) {
        embed.addFields({ name: '🔵 Blue Team', value: bluePlayers, inline: false });
    }
    // Set thumbnail là rank icon của người được tra cứu
    const targetPlayer = match.players.all_players?.find((p) => p.name.toLowerCase() === gameName.toLowerCase() && p.tag.toLowerCase() === tag.toLowerCase());
    if (targetPlayer?.currenttier) {
        embed.setThumbnail(`https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/${targetPlayer.currenttier}.png`);
    }
    return embed;
}
