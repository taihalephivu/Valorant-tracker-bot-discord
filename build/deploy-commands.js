"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Load environment variables
dotenv.config();
const commands = [];
// Load tất cả commands từ thư mục commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command) {
        commands.push(command.data.toJSON());
        console.log(`[INFO] Loaded command: ${command.data.name}`);
    }
    else {
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
const rest = new discord_js_1.REST({ version: '10' }).setToken(token);
// Deploy commands
(async () => {
    try {
        console.log(`🚀 Bắt đầu đăng ký ${commands.length} slash command(s)...`);
        if (guildId) {
            // Deploy commands cho một guild cụ thể (test server) - nhanh hơn
            console.log(`📍 Đăng ký commands cho guild: ${guildId}`);
            const data = await rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, guildId), { body: commands });
            console.log(`✅ Đã đăng ký ${data.length} slash command(s) cho guild ${guildId}!`);
        }
        else {
            // Deploy commands globally - mất 1 giờ để cập nhật
            console.log('🌍 Đăng ký commands globally (có thể mất đến 1 giờ để cập nhật)...');
            const data = await rest.put(discord_js_1.Routes.applicationCommands(clientId), { body: commands });
            console.log(`✅ Đã đăng ký ${data.length} slash command(s) globally!`);
        }
        console.log('\n💡 Commands đã được đăng ký thành công!');
        console.log('📝 Danh sách commands:');
        commands.forEach(cmd => {
            console.log(`   - /${cmd.name}: ${cmd.description}`);
        });
    }
    catch (error) {
        console.error('❌ Lỗi khi đăng ký commands:', error);
        process.exit(1);
    }
})();
