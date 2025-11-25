import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { TrackerValorantService } from '../services/trackerValorant';
import { getUserAccount } from './setaccount';
import { createMMRHistoryEmbed } from '../utils/mmrHelper';

export const data = new SlashCommandBuilder()
  .setName('valo-my-mmr-history')
  .setDescription('Xem lịch sử thay đổi rank/RR của bạn (dùng tài khoản đã lưu)')
  .addIntegerOption(option =>
    option
      .setName('size')
      .setDescription('Số trận muốn xem (1-20, mặc định: 10)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(20)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    // Defer reply NGAY LẬP TỨC để tránh timeout
    await interaction.deferReply();

    const userId = interaction.user.id;
    const size = interaction.options.getInteger('size') || 10;

    const account = getUserAccount(userId);

    if (!account) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ Chưa Có Tài Khoản Mặc Định')
        .setDescription(
          `Bạn chưa lưu tài khoản Valorant.\n\n` +
          `Hãy dùng lệnh:\n` +
          `\`/valo-setaccount game_name:TênCủaBạn tag:1234\``
        )
        .setFooter({ text: 'Valorant Tracker Bot' });

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const trackerService = new TrackerValorantService(process.env.TRACKER_API_KEY);
    const history = await trackerService.getMMRHistory(account.gameName, account.tag, account.region, size);

    // Tạo embed bằng helper function
    const embed = createMMRHistoryEmbed({ gameName: account.gameName, tag: account.tag, history });

    if (!embed) {
      const noHistoryEmbed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('⚠️ Không có lịch sử rank')
        .setDescription(`Không tìm thấy lịch sử rank của **${account.gameName}#${account.tag}**\n\nCó thể do:\n• Chưa chơi ranked\n• Profile ở chế độ private`)
        .setFooter({ text: 'Dữ liệu từ Henrik API' })
        .setTimestamp();

      await interaction.editReply({ embeds: [noHistoryEmbed] });
      return;
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error: any) {
    // Kiểm tra xem interaction còn valid không
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: `❌ **Lỗi:** ${error.message}`,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        content: `❌ **Lỗi:** ${error.message}`
      }).catch(() => {});
    }
  }
}
