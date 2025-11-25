import { EmbedBuilder } from 'discord.js';

interface MMRHistoryDisplayOptions {
  gameName: string;
  tag: string;
  history: any[];
}

export function createMMRHistoryEmbed(options: MMRHistoryDisplayOptions): EmbedBuilder | null {
  const { gameName, tag, history } = options;

  if (!history || history.length === 0) {
    return null;
  }

  // Lấy rank hiện tại từ trận gần nhất
  const currentMatch = history[0];
  const currentTier = currentMatch.currenttier || 0;
  const rankIconUrl = currentTier > 0 
    ? `https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/${currentTier}.png`
    : 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/0.png';

  // Tạo embed
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`📊 Lịch Sử Rank: ${gameName}#${tag}`)
    .setThumbnail(rankIconUrl)
    .setFooter({ text: 'Dữ liệu từ Henrik API' })
    .setTimestamp();

  // Format history
  let historyText = '';
  history.forEach((match: any, index: number) => {
    const change = match.mmr_change_to_last_game;
    const changeIcon = change > 0 ? '🟢' : change < 0 ? '🔴' : '⚪';
    const arrowIcon = change > 0 ? '⬆️' : change < 0 ? '⬇️' : '➖';
    const changeText = change > 0 ? `+${change}` : change.toString();
    const rrText = match.ranking_in_tier !== undefined ? `${match.ranking_in_tier} RR` : 'N/A';
    
    // Convert to Vietnam time (UTC+7)
    let vnTime = match.date;
    if (match.date_raw) {
      const date = new Date(match.date_raw * 1000);
      vnTime = date.toLocaleString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    historyText += `**${index + 1}.** ${match.currenttierpatched || 'Unranked'} (${rrText})\n`;
    historyText += `└ ${changeIcon}${arrowIcon} ${changeText} RR • ${match.map.name} • ${vnTime}\n\n`;
  });

  embed.setDescription(`**Lịch sử ${history.length} trận gần nhất:**\n\n${historyText}`);

  return embed;
}
