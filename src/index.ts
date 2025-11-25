import { Client, GatewayIntentBits, Collection, Events, ChatInputCommandInteraction } from 'discord.js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

// Extend Client type để thêm commands collection
declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, any>;
  }
}

// Tạo Discord client với minimal intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
  // Tối ưu cache để giảm RAM
  sweepers: {
    messages: {
      interval: 300, // 5 phút
      lifetime: 180, // Giữ message 3 phút
    },
  },
});

// Khởi tạo commands collection
client.commands = new Collection();

// Load commands từ thư mục commands
const commandsPath = path.join(__dirname, 'commands');

// Kiểm tra thư mục commands có tồn tại không
if (!fs.existsSync(commandsPath)) {
  console.error(`❌ Thư mục commands không tồn tại: ${commandsPath}`);
  console.error('💡 Đảm bảo bạn đã build project: npm run build');
  process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

if (commandFiles.length === 0) {
  console.error('❌ Không tìm thấy file commands nào!');
  console.error('💡 Đảm bảo bạn đã build project: npm run build');
  process.exit(1);
}

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] Command at ${filePath} is missing required "data" or "execute" property.`);
  }
}

// Event: Bot ready
client.once(Events.ClientReady, (c) => {
  console.log(` Bot đã online! Đăng nhập với tên: ${c.user.tag}`);
  console.log(` Đang phục vụ ${c.guilds.cache.size} server(s)`);
  
  // Set bot activity/status
  c.user.setActivity('Valorant Stats | /valo-help', { type: 3 }); // Type 3 = Watching
  
  // Force garbage collection sau khi load xong
  if (global.gc) {
    global.gc();
  }
});

// Event: Interaction Create (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    
    try {
      const errorMessage = {
        content: '❌ Đã xảy ra lỗi khi thực thi lệnh này!',
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage).catch(() => {});
      } else {
        await interaction.reply(errorMessage).catch(() => {});
      }
    } catch (replyError) {
      // Ignore reply errors to prevent double error
    }
  }
});

// Error handling
client.on(Events.Error, (error) => {
  console.error('[ERROR] Discord client error:', error);
});

process.on('unhandledRejection', (error: Error) => {
  console.error('[ERROR] Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error: Error) => {
  console.error('[ERROR] Uncaught exception:', error);
  process.exit(1);
});

// Đăng nhập bot
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ DISCORD_TOKEN không được tìm thấy trong file .env!');
  console.error('💡 Vui lòng tạo file .env và thêm DISCORD_TOKEN=your_token_here');
  process.exit(1);
}

client.login(token).catch((error) => {
  console.error('❌ Không thể đăng nhập bot:', error);
  console.error('💡 Kiểm tra lại DISCORD_TOKEN trong file .env');
  process.exit(1);
});
