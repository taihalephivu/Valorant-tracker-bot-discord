"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const trackerValorant_1 = require("../services/trackerValorant");
const profileHelper_1 = require("../utils/profileHelper");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('valo-profile')
    .setDescription('Tra cứu thông tin profile Valorant của người chơi')
    .addStringOption(option => option
    .setName('game_name')
    .setDescription('Tên in-game của người chơi (ví dụ: PlayerName)')
    .setRequired(true))
    .addStringOption(option => option
    .setName('tag')
    .setDescription('Tag của người chơi (ví dụ: 1234 hoặc #1234)')
    .setRequired(true))
    .addStringOption(option => option
    .setName('region')
    .setDescription('Khu vực server (mặc định: ap)')
    .setRequired(false)
    .addChoices({ name: 'Asia Pacific', value: 'ap' }, { name: 'Europe', value: 'eu' }, { name: 'North America', value: 'na' }, { name: 'Korea', value: 'kr' }, { name: 'Latin America', value: 'latam' }, { name: 'Brazil', value: 'br' }));
async function execute(interaction) {
    const gameName = interaction.options.getString('game_name', true);
    let tag = interaction.options.getString('tag', true);
    const region = interaction.options.getString('region') || process.env.DEFAULT_REGION || 'ap';
    // Xử lý tag: loại bỏ # nếu có
    tag = tag.replace('#', '');
    // Defer reply vì API call có thể mất thời gian
    await interaction.deferReply();
    try {
        const trackerService = new trackerValorant_1.TrackerValorantService(process.env.TRACKER_API_KEY);
        const profile = await trackerService.getPlayerProfile(gameName, tag, region);
        // Tạo embed bằng helper function
        const embed = (0, profileHelper_1.createProfileEmbed)({ gameName, tag, profile, trackerService });
        if (!embed) {
            await interaction.editReply({
                content: '⚠️ Không thể lấy thông tin stats của người chơi này.'
            });
            return;
        }
        await interaction.editReply({ embeds: [embed] });
    }
    catch (error) {
        await interaction.editReply({
            content: `❌ **Lỗi:** ${error.message}\n\n💡 **Gợi ý:**\n- Kiểm tra lại tên và tag\n- Tag không cần dấu # ở đầu\n- Ví dụ đúng: \`/valo-profile game_name:PlayerName tag:1234\``
        });
    }
}
