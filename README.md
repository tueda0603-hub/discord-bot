# Discord Bot

Discord bot that sends scheduled messages with random images.

## Features
- Fetches images from a designated channel
- Sends scheduled messages on weekdays at 8:45 AM JST
- Updates image list daily at 8:00 AM JST

## Environment Variables
- `DISCORD_TOKEN`: Discord bot token
- `CHANNEL_ID`: Main channel ID for sending messages
- `IMAGE_CHANNEL_ID`: Channel ID for fetching images

## Usage
```bash
npm install
node index.js
```