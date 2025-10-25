import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

console.log('Starting URL image fetch debug...');

// Load environment variables
dotenv.config();

console.log('Environment variables loaded');
console.log('IMAGE_CHANNEL_ID:', process.env.IMAGE_CHANNEL_ID);

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

console.log('Discord client created');

// Function to extract image URLs from text
function extractImageUrls(text) {
  const imageUrlPattern = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|tiff)(?:\?[^\s]*)?)/gi;
  const urls = text.match(imageUrlPattern) || [];
  return urls;
}

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

    console.log(`Found channel: ${imageChannel.name} (${imageChannel.id})`);
    console.log(`Channel type: ${imageChannel.type}`);
    
    // Fetch last 100 messages from the image channel
    console.log('Fetching messages...');
    const messages = await imageChannel.messages.fetch({ limit: 100 });
    console.log(`Total messages fetched: ${messages.size}`);
    
    // Log all messages for debugging
    console.log('\n=== MESSAGE DEBUG ===');
    const allImageUrls = [];
    
    messages.forEach((message, index) => {
      console.log(`Message ${index + 1}:`);
      console.log(`  - Author: ${message.author.tag}`);
      console.log(`  - Content: ${message.content}`);
      console.log(`  - Attachments: ${message.attachments.size}`);
      console.log(`  - Created: ${message.createdAt}`);
      
      // Check attachments
      if (message.attachments.size > 0) {
        message.attachments.forEach((attachment, attachIndex) => {
          console.log(`    Attachment ${attachIndex + 1}:`);
          console.log(`      - Name: ${attachment.name}`);
          console.log(`      - ContentType: ${attachment.contentType}`);
          console.log(`      - Size: ${attachment.size}`);
          console.log(`      - URL: ${attachment.url}`);
          
          if (attachment.contentType && attachment.contentType.startsWith('image/')) {
            allImageUrls.push({
              url: attachment.url,
              filename: attachment.name,
              size: attachment.size,
              contentType: attachment.contentType,
              source: 'attachment'
            });
            console.log(`      ✓ Added attachment to image list`);
          }
        });
      }
      
      // Check for image URLs in message content
      if (message.content) {
        const imageUrls = extractImageUrls(message.content);
        if (imageUrls.length > 0) {
          console.log(`    Image URLs found in content: ${imageUrls.length}`);
          imageUrls.forEach((url, urlIndex) => {
            console.log(`      URL ${urlIndex + 1}: ${url}`);
            allImageUrls.push({
              url: url,
              filename: `url-image-${urlIndex + 1}`,
              source: 'content'
            });
            console.log(`      ✓ Added URL to image list`);
          });
        }
      }
      
      console.log('---');
    });
    
    console.log(`\nFound ${allImageUrls.length} images total`);
    allImageUrls.forEach((img, index) => {
      console.log(`Image ${index + 1}: ${img.filename} (${img.source}) - ${img.url}`);
    });
    
    return allImageUrls;
  } catch (error) {
    console.error('Error fetching images from channel:', error);
    console.error(error.stack);
    return [];
  }
}

// Bot ready event
client.once('ready', async () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
  
  try {
    const images = await fetchImagesFromChannel();
    
    if (images.length === 0) {
      console.log('\n❌ No images found');
    } else {
      console.log(`\n✅ Found ${images.length} images`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
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
