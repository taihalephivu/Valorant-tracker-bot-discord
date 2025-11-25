"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const trackerValorant_1 = require("../services/trackerValorant");
const setaccount_1 = require("./setaccount");
const mmrHelper_1 = require("../utils/mmrHelper");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('valo-my-mmr-history')
    .setDescription('Xem lịch sử thay đổi rank/RR của bạn (dùng tài khoản đã lưu)')
    .addIntegerOption(option => option
    .setName('size')
    .setDescription('Số trận muốn xem (1-20, mặc định: 10)')
    .setRequired(false)
    .setMinValue(1)
    .setMaxValue(20));
async function execute(interaction) {
    try {
        // Defer reply NGAY LẬP TỨC để tránh timeout
        await interaction.deferReply();
        const userId = interaction.user.id;
        const size = interaction.options.getInteger('size') || 10;
        const account = (0, setaccount_1.getUserAccount)(userId);
        if (!account) {
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Chưa Có Tài Khoản Mặc Định')
                .setDescription(`Bạn chưa lưu tài khoản Valorant.\n\n` +
                `Hãy dùng lệnh:\n` +
                `\`/valo-setaccount game_name:TênCủaBạn tag:1234\``)
                .setFooter({ text: 'Valorant Tracker Bot' });
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        const trackerService = new trackerValorant_1.TrackerValorantService(process.env.TRACKER_API_KEY);
        const history = await trackerService.getMMRHistory(account.gameName, account.tag, account.region, size);
        // Tạo embed bằng helper function
        const embed = (0, mmrHelper_1.createMMRHistoryEmbed)({ gameName: account.gameName, tag: account.tag, history });
        if (!embed) {
            const noHistoryEmbed = new discord_js_1.EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⚠️ Không có lịch sử rank')
                .setDescription(`Không tìm thấy lịch sử rank của **${account.gameName}#${account.tag}**\n\nCó thể do:\n• Chưa chơi ranked\n• Profile ở chế độ private`)
                .setFooter({ text: 'Dữ liệu từ Henrik API' })
                .setTimestamp();
            await interaction.editReply({ embeds: [noHistoryEmbed] });
            return;
        }
        await interaction.editReply({ embeds: [embed] });
    }
    catch (error) {
        // Kiểm tra xem interaction còn valid không
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: `❌ **Lỗi:** ${error.message}`,
                ephemeral: true
            });
        }
        else {
            await interaction.editReply({
                content: `❌ **Lỗi:** ${error.message}`
            }).catch(() => { });
        }
    }
}
