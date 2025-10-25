import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Function to debug channel content
async function debugChannel() {
  try {
    console.log(`Debugging channel ID: ${process.env.IMAGE_CHANNEL_ID}`);
    
    const imageChannel = client.channels.cache.get(process.env.IMAGE_CHANNEL_ID);
    
    if (!imageChannel) {
      console.error('Error: Image channel not found');
      console.error('Available channels:', client.channels.cache.map(ch => `${ch.name} (${ch.id})`));
      return;
    }

    console.log(`Channel found: ${imageChannel.name} (${imageChannel.id})`);
    console.log(`Channel type: ${imageChannel.type}`);
    
    // Fetch last 10 messages to see what's in the channel
    const messages = await imageChannel.messages.fetch({ limit: 10 });
    
    console.log(`\nFound ${messages.size} messages in the channel:`);
    
    messages.forEach((message, index) => {
      console.log(`\n--- Message ${index + 1} ---`);
      console.log(`Author: ${message.author.tag}`);
      console.log(`Content: ${message.content || '(no text content)'}`);
      console.log(`Attachments: ${message.attachments.size}`);
      
      if (message.attachments.size > 0) {
        message.attachments.forEach((attachment, attIndex) => {
          console.log(`  Attachment ${attIndex + 1}:`);
          console.log(`    Name: ${attachment.name}`);
          console.log(`    URL: ${attachment.url}`);
          console.log(`    Content Type: ${attachment.contentType}`);
          console.log(`    Size: ${attachment.size} bytes`);
          console.log(`    Is Image: ${attachment.contentType && attachment.contentType.startsWith('image/')}`);
        });
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error debugging channel:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Bot ready event
client.once('ready', () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
  debugChannel();
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

