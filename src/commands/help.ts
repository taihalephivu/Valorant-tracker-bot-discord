import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('valo-help')
  .setDescription('Hiển thị hướng dẫn sử dụng bot');

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0xFF4655)
    .setTitle('📚 Hướng Dẫn Sử Dụng Bot Valorant Tracker')
    .setDescription('Bot này giúp bạn tra cứu thông tin Valorant từ Tracker Network.')
    .addFields(
      {
        name: '💾 /valo-setaccount',
        value: '**Mô tả:** Lưu tài khoản Valorant mặc định của bạn\n' +
               '**Cách dùng:** `/valo-setaccount game_name:TênCủaBạn tag:1234 region:ap`\n' +
               '**Lợi ích:** Sau khi lưu, bạn có thể dùng `/valo-myprofile` và `/valo-mymatch` mà không cần nhập lại tên!\n\n' +
               '**Ví dụ:** `/valo-setaccount game_name:PlayerName tag:1234 region:ap`',
        inline: false
      },
      {
        name: '👤 /valo-myprofile',
        value: '**Mô tả:** Xem profile của BẠN (dùng tài khoản đã lưu)\n' +
               '**Cách dùng:** `/valo-myprofile`\n' +
               '**Yêu cầu:** Phải lưu tài khoản trước bằng `/valo-setaccount`',
        inline: false
      },
      {
        name: '🎮 /valo-mymatch',
        value: '**Mô tả:** Xem trận đấu gần nhất của BẠN (dùng tài khoản đã lưu)\n' +
               '**Cách dùng:** `/valo-mymatch`\n' +
               '**Yêu cầu:** Phải lưu tài khoản trước bằng `/valo-setaccount`',
        inline: false
      },
      {
        name: '📊 /valo-profile',
        value: '**Mô tả:** Tra cứu thông tin profile của NGƯỜI KHÁC\n' +
               '**Cách dùng:** `/valo-profile game_name:TenNguoiChoi tag:1234`\n' +
               '**Tham số:**\n' +
               '• `game_name` (bắt buộc): Tên in-game\n' +
               '• `tag` (bắt buộc): Tag (không cần #)\n' +
               '• `region` (tùy chọn): Khu vực server\n\n' +
               '**Ví dụ:** `/valo-profile game_name:TenZ tag:SEN region:na`',
        inline: false
      },
      {
        name: '🔍 /valo-match',
        value: '**Mô tả:** Xem trận đấu gần nhất của NGƯỜI KHÁC\n' +
               '**Cách dùng:** `/valo-match game_name:TenNguoiChoi tag:1234`\n' +
               '**Lưu ý:** Hiển thị trận đấu gần nhất đã hoàn thành.',
        inline: false
      },
      {
        name: '📊 /valo-mmr-history',
        value: '**Mô tả:** Xem lịch sử thay đổi rank/RR của NGƯỜI KHÁC\n' +
               '**Cách dùng:** `/valo-mmr-history game_name:TenNguoiChoi tag:1234 size:10`\n' +
               '**Tham số:** `size` - số trận muốn xem (1-20, mặc định: 10)',
        inline: false
      },
      {
        name: '📈 /valo-my-mmr-history',
        value: '**Mô tả:** Xem lịch sử rank/RR của BẠN (dùng tài khoản đã lưu)\n' +
               '**Cách dùng:** `/valo-my-mmr-history size:10`\n' +
               '**Yêu cầu:** Phải lưu tài khoản trước bằng `/valo-setaccount`',
        inline: false
      },
      {
        name: '❓ /valo-help',
        value: '**Mô tả:** Hiển thị hướng dẫn này\n' +
               '**Cách dùng:** `/valo-help`',
        inline: false
      },
      {
        name: '💡 Mẹo Sử Dụng',
        value: '• Tag không cần dấu # ở đầu (ví dụ: dùng `1234` thay vì `#1234`)\n' +
               '• Nếu không chỉ định region, bot sẽ dùng region mặc định (AP)\n' +
               '• Dữ liệu được lấy từ Tracker Network API\n' +
               '• Bot có thể mất vài giây để lấy dữ liệu',
        inline: false
      },
      {
        name: '🔗 Liên Kết',
        value: '[Tracker.gg Valorant](https://tracker.gg/valorant)',
        inline: false
      }
    )
    .setThumbnail('https://trackercdn.com/cdn/tracker.gg/valorant/db/images/valorant-logo.png')
    .setFooter({ text: 'Valorant Tracker Bot' })
    .setTimestamp();

  await interaction.reply({ 
    embeds: [embed], 
    flags: MessageFlags.Ephemeral 
  });
}
