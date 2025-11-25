import { ChatInputCommandInteraction } from 'discord.js';

/**
 * Safely defer a reply with timeout handling
 * @param interaction Discord interaction
 * @param timeoutMs Maximum time to wait for defer (default 2000ms)
 * @returns Promise that resolves to true if deferred successfully
 */
export async function safeDeferReply(interaction: ChatInputCommandInteraction, timeoutMs: number = 2000): Promise<boolean> {
  try {
    // Race between defer and timeout
    await Promise.race([
      interaction.deferReply(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Defer timeout')), timeoutMs))
    ]);
    return true;
  } catch (error: any) {
    // If defer failed, interaction is probably already expired
    return false;
  }
}

/**
 * Safe reply to interaction with fallback handling
 */
export async function safeReply(interaction: ChatInputCommandInteraction, content: any): Promise<boolean> {
  try {
    if (interaction.deferred) {
      await interaction.editReply(content);
    } else if (!interaction.replied) {
      await interaction.reply(content);
    }
    return true;
  } catch (error: any) {
    return false;
  }
}
