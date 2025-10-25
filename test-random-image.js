import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

console.log('Starting random image selection test...');

// Load environment variables
dotenv.config();

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

    console.log(`Found channel: ${imageChannel.name}`);
    
    // Fetch last 100 messages from the image channel
    const messages = await imageChannel.messages.fetch({ limit: 100 });
    console.log(`Total messages fetched: ${messages.size}`);
    
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
  const selectedUrl = imageUrls[randomIndex];
  console.log(`Selected random image ${randomIndex + 1}/${imageUrls.length}`);
  console.log(`Selected URL: ${selectedUrl}`);
  
  return selectedUrl;
}

// Function to send test message with random image
async function sendRandomImageTest() {
  try {
    console.log(`Looking for channel ID: ${process.env.CHANNEL_ID}`);
    
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);
    
    if (!channel) {
      console.error('Error: Channel not found');
      return;
    }

    console.log(`Found channel: ${channel.name}`);
    
    // Fetch images from the image channel
    const imageUrls = await fetchImagesFromChannel();
    
    if (imageUrls.length === 0) {
      console.log('No images found in the image channel');
      return;
    }

    // Get random image
    const randomImageUrl = getRandomImageUrl(imageUrls);
    
    if (randomImageUrl) {
      const message = '🎲 ランダム画像テスト - kidsly出した？';
      
      await channel.send({
        content: message,
        files: [randomImageUrl]
      });
      
      console.log(`✅ Random image test sent successfully!`);
      console.log(`📸 Image URL: ${randomImageUrl}`);
    } else {
      await channel.send({
        content: '🎲 ランダム画像テスト - 画像が見つかりませんでした'
      });
      console.log('❌ No random image available');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error sending random image test:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Bot ready event
client.once('ready', () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
  sendRandomImageTest();
});

// Add error handlers
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Attempting to login...');

// Login to Discord
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('Login failed:', error);
  process.exit(1);
});
