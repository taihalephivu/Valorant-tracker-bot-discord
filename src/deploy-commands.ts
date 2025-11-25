import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

const commands: any[] = [];

// Load tất cả commands từ thư mục commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command) {
    commands.push(command.data.toJSON());
    console.log(`[INFO] Loaded command: ${command.data.name}`);
  } else {
    console.warn(`[WARNING] Command at ${filePath} is missing required "data" property.`);
  }
}

// Kiểm tra environment variables
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token) {
  console.error('❌ DISCORD_TOKEN không được tìm thấy trong file .env!');
  process.exit(1);
}

if (!clientId) {
  console.error('❌ DISCORD_CLIENT_ID không được tìm thấy trong file .env!');
  process.exit(1);
}

// Construct REST module
const rest = new REST({ version: '10' }).setToken(token);

// Deploy commands
(async () => {
  try {
    console.log(`🚀 Bắt đầu đăng ký ${commands.length} slash command(s)...`);

    if (guildId) {
      // Deploy commands cho một guild cụ thể (test server) - nhanh hơn
      console.log(`📍 Đăng ký commands cho guild: ${guildId}`);
      const data: any = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(`✅ Đã đăng ký ${data.length} slash command(s) cho guild ${guildId}!`);
    } else {
      // Deploy commands globally - mất 1 giờ để cập nhật
      console.log('🌍 Đăng ký commands globally (có thể mất đến 1 giờ để cập nhật)...');
      const data: any = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );
      console.log(`✅ Đã đăng ký ${data.length} slash command(s) globally!`);
    }

    console.log('\n💡 Commands đã được đăng ký thành công!');
    console.log('📝 Danh sách commands:');
    commands.forEach(cmd => {
      console.log(`   - /${cmd.name}: ${cmd.description}`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi đăng ký commands:', error);
    process.exit(1);
  }
})();
