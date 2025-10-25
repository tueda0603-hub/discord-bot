import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Bot ready event
client.once('ready', async () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
  
  try {
    const imageChannel = client.channels.cache.get(process.env.IMAGE_CHANNEL_ID);
    
    if (!imageChannel) {
      console.error('Image channel not found');
      console.log('Available channels:');
      client.channels.cache.forEach(ch => {
        console.log(`- ${ch.name} (${ch.id})`);
      });
      process.exit(1);
    }
    
    console.log(`Posting to channel: ${imageChannel.name}`);
    await imageChannel.send('テスト');
    console.log('Message sent successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
