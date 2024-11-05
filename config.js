const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

module.exports = {
  // Bot settings
  PREFIX: ".", // Set the prefix for bot commands
  OWNER: "+263774638594", // Enter the owner's WhatsApp number (in international format)
  USER_NAME: "Goose", // Enter your bot's username
  PASSWORD: "goose##", // Enter your bot's password

  // Group and Channel JIDs (will be set programmatically in the bot's index.js)
  GOOSE_TECH_NEWS_GROUP_JID: [],  // Placeholder for Goose Tech News group JID, set programmatically
  GOOSE_UPDATES_GROUP_JID: [],  // Placeholder for Goose Updates group JID, set programmatically
  GOOSE_CHANNEL_JID: [],  // Placeholder for Goose channel JID, set programmatically

  // News API configuration
  API_KEY: process.env.NEWS_API_KEY || "a85a8299c40148a79850dd8e71121cee",  // NewsAPI key from environment variable or default value
  SOURCES: 'the-verge,techcrunch,techradar,wired,ars-technica,cnet,engadget,bbc-news,polygon,forbes,business-insider,recode,mashable,gizmodo,fast-company,venturebeat,siliconbeat,zdnet,digital-trends,tomshardware,android-police,macworld,computerworld,network-world,how-to-geek,lifehacker,slashdot,techmeme', // Tech news sources
};