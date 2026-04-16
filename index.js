const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const db = require('./database');
const cron = require('./utils/cron');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

client.once('ready', () => {
  console.log(`✅ Bot ${client.user.tag} đã online!`);
  require('./events/ready')(client);
  cron.startPetNotifications(client);
});

client.on('messageCreate', (message) => require('./events/messageCreate')(message, client));
client.on('voiceStateUpdate', (oldState, newState) => require('./events/voiceStateUpdate')(oldState, newState, client));
client.on('interactionCreate', (interaction) => require('./events/interactionCreate')(interaction, client));

client.login(config.TOKEN);