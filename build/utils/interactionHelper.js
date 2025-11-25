"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeDeferReply = safeDeferReply;
exports.safeReply = safeReply;
/**
 * Safely defer a reply with timeout handling
 * @param interaction Discord interaction
 * @param timeoutMs Maximum time to wait for defer (default 2000ms)
 * @returns Promise that resolves to true if deferred successfully
 */
async function safeDeferReply(interaction, timeoutMs = 2000) {
    try {
        // Race between defer and timeout
        await Promise.race([
            interaction.deferReply(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Defer timeout')), timeoutMs))
        ]);
        return true;
    }
    catch (error) {
        // If defer failed, interaction is probably already expired
        return false;
    }
}
/**
 * Safe reply to interaction with fallback handling
 */
async function safeReply(interaction, content) {
    try {
        if (interaction.deferred) {
            await interaction.editReply(content);
        }
        else if (!interaction.replied) {
            await interaction.reply(content);
        }
        return true;
    }
    catch (error) {
        return false;
    }
}
