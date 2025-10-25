import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

console.log('Starting debug test...');

// Load environment variables
dotenv.config();

console.log('Environment variables loaded');
console.log('IMAGE_CHANNEL_ID:', process.env.IMAGE_CHANNEL_ID);

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

console.log('Discord client created');

// Bot ready event
client.once('ready', async () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
  
  try {
    console.log('Looking for image channel...');
    const imageChannel = client.channels.cache.get(process.env.IMAGE_CHANNEL_ID);
    
    if (!imageChannel) {
      console.error('Image channel not found');
      console.log('Available channels:');
      client.channels.cache.forEach(ch => {
        console.log(`- ${ch.name} (${ch.id})`);
      });
      process.exit(1);
    }
    
    console.log(`Found channel: ${imageChannel.name} (${imageChannel.id})`);
    console.log(`Posting to channel: ${imageChannel.name}`);
    
    await imageChannel.send('テスト');
    console.log('Message sent successfully!');
    
    // Wait a bit before exiting
    setTimeout(() => {
      console.log('Exiting...');
      process.exit(0);
    }, 2000);
    
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
