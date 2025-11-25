### 1. Create a Discord Application & Bot
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** → give it a name.
3. Navigate to **Bot** → select **Add Bot**.
4. Copy the **Bot Token** for later use.

### 2. Invite the Bot to Your Server
1. In Developer Portal, go to **OAuth2 → URL Generator**.
2. Select scopes: `bot` and `applications.commands`.
3. Choose permissions such as:
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`
4. Copy the generated URL and open it in your browser to invite the bot.
## Getting a Valorant API Key
This bot uses the HenrikDev Systems API to fetch Valorant data.  
To get your API key:
1. Join the HenrikDev Systems Discord: [https://discord.com/invite/X3GaVkX2YN](https://discord.com/invite/X3GaVkX2YN)
2. Verify your account.
3. Go to the **#get-a-key** channel.
4. Select **VALORANT (Basic Key)** to instantly receive your API key.
5. (Optional) Request an **Advanced Key** if you need higher rate limits.

Add the key to your `.env` file:
```env
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
TRACKER_API_KEY=
```
### install dependencies
```
npm install
wait a minute
npm start (to run bot)
```
