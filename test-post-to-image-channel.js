import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'IMAGE_CHANNEL_ID'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not defined in .env file`);
    process.exit(1);
  }
}

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Function to post test message to image channel
async function postTestMessage() {
  try {
    console.log(`Looking for image channel ID: ${process.env.IMAGE_CHANNEL_ID}`);
    
    const imageChannel = client.channels.cache.get(process.env.IMAGE_CHANNEL_ID);
    
    if (!imageChannel) {
      console.error('Error: Image channel not found');
      console.error('Available channels:', client.channels.cache.map(ch => `${ch.name} (${ch.id})`));
      return;
    }

    console.log(`Posting test message to channel: ${imageChannel.name}`);
    
    // Send a test message
    await imageChannel.send('テストメッセージ: 画像用チャンネルに投稿できています！');
    
    console.log('Test message sent successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error posting test message:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Bot ready event
client.once('ready', () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
  postTestMessage();
});

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
  console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error(reason.stack);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error(error.stack);
  process.exit(1);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
