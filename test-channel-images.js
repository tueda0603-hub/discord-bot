import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'CHANNEL_ID', 'IMAGE_CHANNEL_ID'];
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

// Function to fetch images from the image channel
async function fetchImagesFromChannel() {
  try {
    console.log(`Fetching images from channel ID: ${process.env.IMAGE_CHANNEL_ID}`);
    
    const imageChannel = client.channels.cache.get(process.env.IMAGE_CHANNEL_ID);
    
    if (!imageChannel) {
      console.error('Error: Image channel not found');
      console.error('Available channels:', client.channels.cache.map(ch => `${ch.name} (${ch.id})`));
      return [];
    }

    console.log(`Fetching messages from channel: ${imageChannel.name}`);
    
    // Fetch last 100 messages from the image channel
    const messages = await imageChannel.messages.fetch({ limit: 100 });
    
    // Extract image URLs from messages with attachments
    const imageUrls = [];
    messages.forEach(message => {
      if (message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
          // Check if attachment is an image
          if (attachment.contentType && attachment.contentType.startsWith('image/')) {
            imageUrls.push({
              url: attachment.url,
              filename: attachment.name,
              size: attachment.size
            });
          }
        });
      }
    });

    console.log(`Found ${imageUrls.length} images in the channel`);
    return imageUrls;
  } catch (error) {
    console.error('Error fetching images from channel:', error);
    return [];
  }
}

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

    // Fetch images from the image channel
    const images = await fetchImagesFromChannel();
    
    if (images.length === 0) {
      console.log('No images found in the image channel');
      return;
    }

    console.log(`Sending ${images.length} test images to channel: ${channel.name}`);

    // Send each image with a test message
    for (let i = 0; i < images.length; i++) {
      const message = `テスト画像 ${i + 1}/${images.length} - ${images[i].filename}`;
      
      await channel.send({
        content: message,
        files: [images[i].url]
      });
      
      console.log(`Sent test image ${i + 1}/${images.length}: ${images[i].filename}`);
      
      // Wait 1 second between images to avoid rate limiting
      if (i < images.length - 1) {
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

