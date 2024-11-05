const {
  default: makeWASocket,
  useSessionAuthState,
  DisconnectReason,
  getContentType,
  jidNormalizedUser,
  Browsers,
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const pino = require('pino');
const fetch = require('node-fetch'); // For fetching tech news from NewsAPI
const express = require("express");
const { News_Connect, News_Msg, Tech_newsModule, En_Tech_newsModule } = require('queen-news');
const { OWNER, PREFIX, USER_NAME, PASSWORD, TECH_GROUP_JID } = require("./config");

// NewsAPI Key (provided by the user)
const apiKey = 'a85a8299c40148a79850dd8e71121cee'; // Use your actual API key here

// Array to store dynamic JIDs
let techGroupJIDs = [];

// Fetch tech news from NewsAPI
const fetchTechNews = async (conn) => {
  try {
    const sources = 'the-verge,techcrunch,techradar,wired,ars-technica,cnet,engadget,bbc-news,polygon,forbes,business-insider,recode,mashable,gizmodo,fast-company,venturebeat,siliconbeat,zdnet,digital-trends,tomshardware,android-police,macworld,computerworld,network-world,how-to-geek,lifehacker,slashdot,techmeme';
    const url = `https://newsapi.org/v2/top-headlines?sources=${sources}&category=technology&apiKey=${apiKey}`;
    const response = await fetch(url);
    const newsData = await response.json();

    if (newsData && newsData.articles) {
      newsData.articles.forEach(article => {
        const newsMessage = `📰 ${article.title}\n\n${article.description}\nRead more: ${article.url}`;
        const imageUrl = article.urlToImage;

        techGroupJIDs.forEach(jid => {
          // Send news message along with image if available
          conn.sendMessage(jid, { text: newsMessage, image: imageUrl ? { url: imageUrl } : undefined });
        });
      });
    }
  } catch (error) {
    console.error('Error fetching tech news:', error);
  }
}

// Periodically fetch tech news every 15 minutes
const startTechNewsFetching = (conn) => {
  setInterval(() => fetchTechNews(conn), 900000);  // 15 minutes interval for news fetching
}

// Express setup to create API endpoint
const app = express();
const port = process.env.PORT || 8000;

// API endpoint to fetch latest tech news
app.get("/tech-news", async (req, res) => {
  try {
    const sources = 'the-verge,techcrunch,techradar,wired,ars-technica,cnet,engadget,bbc-news,polygon,forbes,business-insider,recode,mashable,gizmodo,fast-company,venturebeat,siliconbeat,zdnet,digital-trends,tomshardware,android-police,macworld,computerworld,network-world,how-to-geek,lifehacker,slashdot,techmeme';
    const url = `https://newsapi.org/v2/top-headlines?sources=${sources}&category=technology&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    const newsData = await response.json();

    if (newsData && newsData.articles) {
      res.json(newsData.articles);
    } else {
      res.status(404).json({ message: 'No tech news found.' });
    }
  } catch (error) {
    console.error('Error fetching tech news:', error);
    res.status(500).json({ message: 'Error fetching tech news' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Goose Tech News API running on http://localhost:${port}`);
});

// WhatsApp connection and bot setup
async function Goose() {
  // Use session-based authentication
  const { state, saveCreds } = await useSessionAuthState('./session.data.json');
  const conn = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
    browser: Browsers.macOS("Desktop"),
    downloadHistory: false,
    syncFullHistory: false,
  });

  conn.ev.on('creds.update', saveCreds);

  conn.ev.on("connection.update", async (update) => { 
    News_Connect(conn, Goose, update, jidNormalizedUser, Boom, DisconnectReason, USER_NAME, PASSWORD); 
  });

  // Add event listener to store group JIDs
  conn.ev.on("messages.upsert", async (mek) => {
    if (mek.messages[0].key.remoteJid.endsWith('@g.us') && !techGroupJIDs.includes(mek.messages[0].key.remoteJid)) {
      techGroupJIDs.push(mek.messages[0].key.remoteJid);
      console.log(`Added new group JID: ${mek.messages[0].key.remoteJid}`);
    }
    News_Msg(conn, mek, PREFIX, OWNER, getContentType); 
  });

  // Only include tech news modules
  Tech_newsModule(conn, post_TechPosted, get_TechPosted, TECH_GROUP_JID);
  En_Tech_newsModule(conn, post_EnTechPosted, get_EnTechPosted, TECH_GROUP_JID);

  // Start fetching tech news periodically
  startTechNewsFetching(conn);
}

// Start the bot
Goose();
