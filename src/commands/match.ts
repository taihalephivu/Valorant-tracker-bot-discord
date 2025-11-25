import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { TrackerValorantService } from '../services/trackerValorant';
import { createMatchEmbed } from '../utils/matchHelper';

export const data = new SlashCommandBuilder()
  .setName('valo-match')
  .setDescription('Xem trận đấu gần nhất của người chơi')
  .addStringOption(option =>
    option
      .setName('game_name')
      .setDescription('Tên in-game của người chơi')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('tag')
      .setDescription('Tag của người chơi (ví dụ: 1234 hoặc #1234)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('region')
      .setDescription('Khu vực server (mặc định: ap)')
      .setRequired(false)
      .addChoices(
        { name: 'Asia Pacific', value: 'ap' },
        { name: 'Europe', value: 'eu' },
        { name: 'North America', value: 'na' },
        { name: 'Korea', value: 'kr' },
        { name: 'Latin America', value: 'latam' },
        { name: 'Brazil', value: 'br' }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const gameName = interaction.options.getString('game_name', true);
  let tag = interaction.options.getString('tag', true);
  const region = interaction.options.getString('region') || process.env.DEFAULT_REGION || 'ap';

  // Xử lý tag: loại bỏ # nếu có
  tag = tag.replace('#', '');

  // Defer reply vì API call có thể mất thời gian
  await interaction.deferReply();

  try {
    const trackerService = new TrackerValorantService(process.env.TRACKER_API_KEY);
    const matchData = await trackerService.getLiveMatch(gameName, tag, region);

    // Tạo embed bằng helper function
    const embed = createMatchEmbed({ gameName, tag, matchData });

    // Kiểm tra xem có match data không
    if (!embed) {
      const noMatchEmbed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('⚠️ Không tìm thấy trận đấu')
        .setDescription(`Không tìm thấy trận đấu gần nhất của **${gameName}#${tag}**`)
        .setFooter({ text: 'Dữ liệu từ Henrik API' })
        .setTimestamp();

      await interaction.editReply({ embeds: [noMatchEmbed] });
      return;
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error: any) {
    await interaction.editReply({
      content: `❌ **Lỗi:** ${error.message}\n\n💡 **Gợi ý:**\n- Kiểm tra lại tên và tag\n- Tag không cần dấu # ở đầu\n- Tracker Network có thể không hỗ trợ live match data cho tất cả khu vực\n- Ví dụ đúng: \`/valo-match game_name:PlayerName tag:1234\``
    });
  }
}
