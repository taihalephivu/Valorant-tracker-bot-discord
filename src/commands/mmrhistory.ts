import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { TrackerValorantService } from '../services/trackerValorant';
import { createMMRHistoryEmbed } from '../utils/mmrHelper';

export const data = new SlashCommandBuilder()
  .setName('valo-mmr-history')
  .setDescription('Xem lịch sử thay đổi rank/RR của người chơi')
  .addStringOption(option =>
    option
      .setName('game_name')
      .setDescription('Tên in-game của người chơi')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('tag')
      .setDescription('Tag của người chơi (ví dụ: 1234)')
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
  )
  .addIntegerOption(option =>
    option
      .setName('size')
      .setDescription('Số trận muốn xem (1-20, mặc định: 10)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(20)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const gameName = interaction.options.getString('game_name', true);
  let tag = interaction.options.getString('tag', true);
  const region = interaction.options.getString('region') || process.env.DEFAULT_REGION || 'ap';
  const size = interaction.options.getInteger('size') || 10;

  tag = tag.replace('#', '');
  await interaction.deferReply();

  try {
    const trackerService = new TrackerValorantService(process.env.TRACKER_API_KEY);
    const history = await trackerService.getMMRHistory(gameName, tag, region, size);

    // Tạo embed bằng helper function
    const embed = createMMRHistoryEmbed({ gameName, tag, history });

    if (!embed) {
      const noHistoryEmbed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('⚠️ Không có lịch sử rank')
        .setDescription(`Không tìm thấy lịch sử rank của **${gameName}#${tag}**\n\nCó thể do:\n• Chưa chơi ranked\n• Profile ở chế độ private`)
        .setFooter({ text: 'Dữ liệu từ Henrik API' })
        .setTimestamp();

      await interaction.editReply({ embeds: [noHistoryEmbed] });
      return;
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error: any) {
    await interaction.editReply({
      content: `❌ **Lỗi:** ${error.message}`
    });
  }
}
