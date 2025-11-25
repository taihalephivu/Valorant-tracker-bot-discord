"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const trackerValorant_1 = require("../services/trackerValorant");
const setaccount_1 = require("./setaccount");
const profileHelper_1 = require("../utils/profileHelper");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('valo-myprofile')
    .setDescription('Xem profile Valorant của bạn (dùng tài khoản đã lưu)');
async function execute(interaction) {
    try {
        // Defer reply ngay lập tức để có thêm thời gian
        await interaction.deferReply();
        const userId = interaction.user.id;
        // Lấy account đã lưu
        const account = (0, setaccount_1.getUserAccount)(userId);
        if (!account) {
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Chưa Có Tài Khoản Mặc Định')
                .setDescription(`Bạn chưa lưu tài khoản Valorant.\n\n` +
                `Hãy dùng lệnh:\n` +
                `\`/valo-setaccount game_name:TênCủaBạn tag:1234\`\n\n` +
                `Hoặc dùng:\n` +
                `\`/valo-profile game_name:TênCủaBạn tag:1234\``)
                .setFooter({ text: 'Valorant Tracker Bot' });
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        const trackerService = new trackerValorant_1.TrackerValorantService(process.env.TRACKER_API_KEY);
        const profile = await trackerService.getPlayerProfile(account.gameName, account.tag, account.region);
        // Tạo embed bằng helper function
        const embed = (0, profileHelper_1.createProfileEmbed)({ gameName: account.gameName, tag: account.tag, profile, trackerService });
        if (!embed) {
            await interaction.editReply({
                content: '⚠️ Không thể lấy thông tin stats của người chơi này.'
            });
            return;
        }
        await interaction.editReply({ embeds: [embed] });
    }
    catch (error) {
        const errorContent = `❌ **Lỗi:** ${error.message}\n\n💡 Hãy kiểm tra lại tài khoản đã lưu bằng \`/valo-setaccount\``;
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: errorContent });
            }
            else {
                await interaction.reply({ content: errorContent, ephemeral: true });
            }
        }
        catch (replyError) {
            // Ignore reply errors
        }
    }
}
