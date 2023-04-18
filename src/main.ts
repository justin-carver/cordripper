import {
  Client,
  TextChannel,
  ChannelType,
  GatewayIntentBits,
} from 'discord.js';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const fetchAllMessagesByUser = async (
  client: Client,
  guildId: string,
  userId: string,
): Promise<unknown[]> => {
  const userMessages = [];
  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    throw new Error('Guild not found');
  }

  const channels = Array.from(
    guild.channels.cache
      .filter((channel: TextChannel) => channel.type === ChannelType.GuildText)
      .values(),
  ) as TextChannel[];

  for (const channel of channels) {
    console.log(`Currently in #${channel.name}...`);
    try {
      let fetchedMessages = await channel.messages.fetch({ limit: 100 });
      console.log(fetchedMessages[0]);
      let userChannelMessages = fetchedMessages.filter(
        (message) => message.author.id === userId,
      );

      while (fetchedMessages.size > 0) {
        userMessages.push(...userChannelMessages);
        const lastMessageId = fetchedMessages.last()?.id;
        fetchedMessages = await channel.messages.fetch({
          limit: 100,
          before: lastMessageId,
        });

        userChannelMessages = fetchedMessages.filter(
          (message) => message.author.id === userId,
        );
      }
    } catch (error) {
      console.error(
        `Error fetching messages from channel: ${channel.id}`,
        error,
      );
    }
  }

  return userMessages;
};

const saveMessagesToFile = (messages: unknown): void => {
  const data = JSON.stringify(messages);
  fs.writeFileSync('user_messages.json', data);
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildIntegrations,
  ],
});

client.once('ready', async () => {
  console.log('Bot is ready!');
  try {
    console.log('Beginning to fetch messages...');
    const userMessages = await fetchAllMessagesByUser(
      client,
      process.env.GUILDID,
      process.env.TARGET_USER,
    );
    saveMessagesToFile(userMessages);
    console.log(
      `A total of ${userMessages.length} messages from ${process.env.TARGET_USER} have been saved to a file.`,
    );
  } catch (error) {
    console.error('Error fetching all messages by user:', error);
    console.log('Error fetching messages. Please try again later.');
  }
});

client.login(process.env.TOKEN);
