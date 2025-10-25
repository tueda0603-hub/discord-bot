import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

console.log('Starting daily task (image update + message send)...');

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
    GatewayIntentBits.GuildMessages
  ],
});

// Function to fetch images from the image channel
async function fetchImagesFromChannel() {
  try {
    console.log(`Fetching images from channel ID: ${process.env.IMAGE_CHANNEL_ID}`);
    
    const imageChannel = client.channels.cache.get(process.env.IMAGE_CHANNEL_ID);
    
    if (!imageChannel) {
      console.error('Error: Image channel not found');
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
            imageUrls.push(attachment.url);
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

// Function to get random image URL
function getRandomImageUrl(imageUrls) {
  if (imageUrls.length === 0) {
    console.warn('No images available');
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  return imageUrls[randomIndex];
}

// Function to send daily message
async function sendDailyMessage(imageUrls) {
  try {
    console.log(`Looking for channel ID: ${process.env.CHANNEL_ID}`);
    
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);
    
    if (!channel) {
      console.error('Error: Channel not found');
      return;
    }

    const message = 'kidsly出した？';
    const randomImageUrl = getRandomImageUrl(imageUrls);

    if (randomImageUrl) {
      await channel.send({
        content: message,
        files: [randomImageUrl]
      });
      console.log(`Daily message sent successfully with image at ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
    } else {
      await channel.send({
        content: `${message} (画像が見つかりませんでした)`
      });
      console.log(`Daily message sent without image at ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
    }
  } catch (error) {
    console.error('Error sending daily message:', error);
    console.error(error.stack);
  }
}

// Main function
async function runDailyTask() {
  try {
    console.log('Step 1: Updating image list...');
    const imageUrls = await fetchImagesFromChannel();
    console.log(`Image list updated. Total images: ${imageUrls.length}`);
    
    console.log('Step 2: Sending daily message...');
    await sendDailyMessage(imageUrls);
    
    console.log('Daily task completed successfully!');
  } catch (error) {
    console.error('Error in daily task:', error);
    console.error(error.stack);
  }
}

// Bot ready event
client.once('ready', async () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
  
  try {
    await runDailyTask();
    console.log('Daily task finished!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
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
