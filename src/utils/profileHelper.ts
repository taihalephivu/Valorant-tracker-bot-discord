import { EmbedBuilder } from 'discord.js';
import { TrackerValorantService } from '../services/trackerValorant';

interface ProfileDisplayOptions {
  gameName: string;
  tag: string;
  profile: any;
  trackerService: TrackerValorantService;
}

export function createProfileEmbed(options: ProfileDisplayOptions): EmbedBuilder | null {
  const { gameName, tag, profile, trackerService } = options;

  // Lấy segment overview (stats tổng thể)
  const overviewSegment = profile.segments.find((s: any) => s.type === 'overview');
  
  if (!overviewSegment) {
    return null;
  }

  const stats = overviewSegment.stats;
  
  // Lấy các thông tin quan trọng
  const rankInfo = stats.rank || stats.peakRank;
  const rankValue = rankInfo?.metadata?.tierName || 'Unranked';
  const rankRating = stats.rankRating?.displayValue || null;
  const rankIconUrl = rankInfo?.metadata?.iconUrl || trackerService.getRankIconUrl(0);
  
  // Hiển thị rank kèm RR nếu có
  const rankDisplay = rankRating ? `${rankValue} (${rankRating})` : rankValue;
  
  const kdRatio = stats.kDRatio?.displayValue || 'N/A';
  const headshots = stats.headshotsPercentage?.displayValue || 'N/A';
  const wins = stats.matchesWon?.displayValue || '0';
  const losses = stats.matchesLost?.displayValue || '0';
  const winRate = stats.matchesWinPct?.displayValue || 'N/A';
  const kills = stats.kills?.displayValue || '0';
  const deaths = stats.deaths?.displayValue || '0';
  const assists = stats.assists?.displayValue || '0';
  const timePlayed = stats.timePlayed?.displayValue || 'N/A';
  const score = stats.scorePerMatch?.displayValue || 'N/A';
  const damage = stats.damagePerRound?.displayValue || 'N/A';

  // Lấy top agents nếu có
  const agentSegments = profile.segments.filter((s: any) => s.type === 'agent');
  let topAgents = '';
  
  if (agentSegments.length > 0) {
    // Sắp xếp theo thời gian chơi
    const sortedAgents = agentSegments
      .sort((a: any, b: any) => {
        const aTime = a.stats.timePlayed?.value || 0;
        const bTime = b.stats.timePlayed?.value || 0;
        return Number(bTime) - Number(aTime);
      })
      .slice(0, 3);

    topAgents = sortedAgents
      .map((agent: any) => {
        const agentName = agent.metadata.name || 'Unknown';
        const agentKD = agent.stats.kDRatio?.displayValue || 'N/A';
        const agentMatches = agent.stats.matchesPlayed?.displayValue || '0';
        return `**${agentName}**: ${agentMatches} trận, K/D ${agentKD}`;
      })
      .join('\n');
  }

  // Tạo embed
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`📊 Profile Valorant: ${gameName}#${tag}`)
    .setThumbnail(rankIconUrl)
    .addFields(
      { name: '🏆 Rank', value: rankDisplay, inline: true },
      { name: '⚔️ K/D Ratio', value: kdRatio, inline: true },
      { name: '🎯 Headshot %', value: headshots, inline: true },
      { name: '✅ Wins', value: wins, inline: true },
      { name: '❌ Losses', value: losses, inline: true },
      { name: '📈 Win Rate', value: winRate, inline: true },
      { name: '💀 Kills', value: kills, inline: true },
      { name: '☠️ Deaths', value: deaths, inline: true },
      { name: '🤝 Assists', value: assists, inline: true },
      { name: '⏱️ Time Played', value: timePlayed, inline: true },
      { name: '💯 Score/Match', value: score, inline: true },
      { name: '💥 Damage/Round', value: damage, inline: true }
    )
    .setFooter({ text: 'Dữ liệu từ Tracker Network' })
    .setTimestamp();

  // Thêm top agents nếu có
  if (topAgents) {
    embed.addFields({ name: '🎭 Top Agents', value: topAgents, inline: false });
  }

  // Thêm avatar nếu có
  if (profile.platformInfo?.avatarUrl) {
    embed.setAuthor({
      name: profile.platformInfo.platformUserHandle,
      iconURL: profile.platformInfo.avatarUrl
    });
  }

  return embed;
}
