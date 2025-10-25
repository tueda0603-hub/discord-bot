import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'CHANNEL_ID', 'IMAGE_URL'];
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

// Parse image URLs from environment variable
const imageUrls = process.env.IMAGE_URL.split(',').map(url => url.trim());

console.log(`Found ${imageUrls.length} images to test:`);
imageUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

// Function to send all test images
async function sendAllTestImages() {
  try {
    console.log(`Looking for channel ID: ${process.env.CHANNEL_ID}`);
    
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);
    
    if (!channel) {
      console.error('Error: Channel not found');
      console.error('Available channels:', client.channels.cache.map(ch => `${ch.name} (${ch.id})`));
      return;
    }

    console.log(`Sending ${imageUrls.length} test images to channel: ${channel.name}`);

    // Send each image with a test message
    for (let i = 0; i < imageUrls.length; i++) {
      const message = `テスト画像 ${i + 1}/${imageUrls.length}`;
      
      await channel.send({
        content: message,
        files: [imageUrls[i]]
      });
      
      console.log(`Sent test image ${i + 1}/${imageUrls.length}`);
      
      // Wait 1 second between images to avoid rate limiting
      if (i < imageUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('All test images sent successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error sending test images:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Bot ready event
client.once('ready', () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
  sendAllTestImages();
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

