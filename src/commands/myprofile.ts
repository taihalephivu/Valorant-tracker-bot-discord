import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { TrackerValorantService } from '../services/trackerValorant';
import { getUserAccount } from './setaccount';
import { createProfileEmbed } from '../utils/profileHelper';

export const data = new SlashCommandBuilder()
  .setName('valo-myprofile')
  .setDescription('Xem profile Valorant của bạn (dùng tài khoản đã lưu)');

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    // Defer reply ngay lập tức để có thêm thời gian
    await interaction.deferReply();

    const userId = interaction.user.id;

    // Lấy account đã lưu
    const account = getUserAccount(userId);

    if (!account) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ Chưa Có Tài Khoản Mặc Định')
        .setDescription(
          `Bạn chưa lưu tài khoản Valorant.\n\n` +
          `Hãy dùng lệnh:\n` +
          `\`/valo-setaccount game_name:TênCủaBạn tag:1234\`\n\n` +
          `Hoặc dùng:\n` +
          `\`/valo-profile game_name:TênCủaBạn tag:1234\``
        )
        .setFooter({ text: 'Valorant Tracker Bot' });

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const trackerService = new TrackerValorantService(process.env.TRACKER_API_KEY);
    const profile = await trackerService.getPlayerProfile(account.gameName, account.tag, account.region);

    // Tạo embed bằng helper function
    const embed = createProfileEmbed({ gameName: account.gameName, tag: account.tag, profile, trackerService });

    if (!embed) {
      await interaction.editReply({
        content: '⚠️ Không thể lấy thông tin stats của người chơi này.'
      });
      return;
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error: any) {
    const errorContent = `❌ **Lỗi:** ${error.message}\n\n💡 Hãy kiểm tra lại tài khoản đã lưu bằng \`/valo-setaccount\``;
    
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: errorContent });
      } else {
        await interaction.reply({ content: errorContent, ephemeral: true });
      }
    } catch (replyError) {
      // Ignore reply errors
    }
  }
}
