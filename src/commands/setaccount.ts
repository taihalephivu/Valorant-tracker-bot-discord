import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

// File để lưu user accounts
const ACCOUNTS_FILE = path.join(__dirname, '../../data/user_accounts.json');

// Cache in-memory để tránh đọc file liên tục
let accountsCache: Record<string, { gameName: string; tag: string; region?: string }> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // 60 seconds

// Đảm bảo thư mục data tồn tại
function ensureDataDirectory() {
  const dataDir = path.dirname(ACCOUNTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Đọc accounts từ file với cache
function loadAccounts(): Record<string, { gameName: string; tag: string; region?: string }> {
  const now = Date.now();
  
  // Sử dụng cache nếu còn hạn
  if (accountsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return accountsCache;
  }

  try {
    ensureDataDirectory();
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
      accountsCache = JSON.parse(data);
      cacheTimestamp = now;
      return accountsCache!;
    }
  } catch (error) {
    // Ignore load errors
  }
  
  accountsCache = {};
  cacheTimestamp = now;
  return {};
}

// Lưu accounts vào file và update cache
function saveAccounts(accounts: Record<string, { gameName: string; tag: string; region?: string }>) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
    accountsCache = accounts; // Update cache
    cacheTimestamp = Date.now();
  } catch (error) {
    throw error;
  }
}

export const data = new SlashCommandBuilder()
  .setName('valo-setaccount')
  .setDescription('Lưu tài khoản Valorant mặc định của bạn')
  .addStringOption(option =>
    option
      .setName('game_name')
      .setDescription('Tên in-game của bạn')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('tag')
      .setDescription('Tag của bạn (ví dụ: 1234)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('region')
      .setDescription('Khu vực server mặc định')
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
  const region = interaction.options.getString('region') || 'ap';

  // Xử lý tag: loại bỏ # nếu có
  tag = tag.replace('#', '');

  const userId = interaction.user.id;

  try {
    // Load current accounts
    const accounts = loadAccounts();

    // Save user's account
    accounts[userId] = {
      gameName,
      tag,
      region
    };

    saveAccounts(accounts);

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Đã Lưu Tài Khoản Mặc Định')
      .setDescription(
        `Tài khoản của bạn đã được lưu!\n\n` +
        `**In-game:** ${gameName}#${tag}\n` +
        `**Region:** ${region.toUpperCase()}\n\n` +
        `Giờ bạn có thể dùng:\n` +
        `• \`/valo-myprofile\` - Xem profile của bạn\n` +
        `• \`/valo-mymatch\` - Xem live match của bạn\n\n` +
        `💡 Hoặc vẫn có thể dùng \`/valo-profile\` với tên khác.`
      )
      .setFooter({ text: `User ID: ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

  } catch (error: any) {
    await interaction.reply({
      content: `❌ Lỗi khi lưu tài khoản: ${error.message}`,
      ephemeral: true
    });
  }
}

// Helper function để lấy account của user
export function getUserAccount(userId: string): { gameName: string; tag: string; region?: string } | null {
  const accounts = loadAccounts();
  return accounts[userId] || null;
}
