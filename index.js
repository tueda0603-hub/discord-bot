import { Client, GatewayIntentBits } from 'discord.js';
import cron from 'node-cron';
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
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

// Global variable to store image URLs
let imageUrls = [];

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
    const newImageUrls = [];
    messages.forEach(message => {
      if (message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
          // Check if attachment is an image
          if (attachment.contentType && attachment.contentType.startsWith('image/')) {
            newImageUrls.push(attachment.url);
          }
        });
      }
    });

    console.log(`Found ${newImageUrls.length} images in the channel`);
    return newImageUrls;
  } catch (error) {
    console.error('Error fetching images from channel:', error);
    return [];
  }
}

// Function to get random image URL
function getRandomImageUrl() {
  if (imageUrls.length === 0) {
    console.warn('No images available, using fallback');
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  return imageUrls[randomIndex];
}

// Function to update image list
async function updateImageList() {
  console.log('Updating image list...');
  const newImages = await fetchImagesFromChannel();
  imageUrls = newImages;
  console.log(`Image list updated. Total images: ${imageUrls.length}`);
}

// Function to send scheduled message
async function sendScheduledMessage() {
  try {
    console.log(`Looking for channel ID: ${process.env.CHANNEL_ID}`);
    
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);
    
    if (!channel) {
      console.error('Error: Channel not found');
      console.error('Available channels:', client.channels.cache.map(ch => `${ch.name} (${ch.id})`));
      return;
    }

    const message = 'kidsly出した？';
    const randomImageUrl = getRandomImageUrl();

    if (randomImageUrl) {
      await channel.send({
        content: message,
        files: [randomImageUrl]
      });
      console.log(`Message sent successfully with image at ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
    } else {
      await channel.send({
        content: `${message} (画像が見つかりませんでした)`
      });
      console.log(`Message sent without image at ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    console.error(error.stack);
  }
}

// Bot ready event
client.once('ready', async () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
  
  // Initial image list update
  await updateImageList();
  
  // Schedule daily image list update at 8:00 AM JST
  cron.schedule('0 8 * * *', updateImageList, {
    scheduled: true,
    timezone: 'Asia/Tokyo'
  });
  
  // Schedule the message for weekdays at 8:45 AM JST
  cron.schedule('45 8 * * 1-5', sendScheduledMessage, {
    scheduled: true,
    timezone: 'Asia/Tokyo'
  });

  console.log('Scheduled tasks set:');
  console.log('- Daily image list update at 8:00 AM JST');
  console.log('- Message sending at 8:45 AM JST on weekdays');
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