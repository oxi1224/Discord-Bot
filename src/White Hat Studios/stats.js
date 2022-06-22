import fetch from 'node-fetch';
import { guildId, statsChannels } from '#lib';

export default async function main(client) {
  const guild = await client.guilds.fetch(guildId);
  playerCount(guild);
  guildMembers(guild);
  groupMembers(guild);
}

async function playerCount(guild) {
  const placeIDs = ['3452652137', '2756861770', '4751054607', '3069857462', '3298359873', '2482834103', '2956075197', '9666739740'];
  const channel = await guild.channels.fetch(statsChannels.players);
  const promises = placeIDs.map(id => fetch(`https://www.roblox.com/places/api-get-details?assetId=${id}`).then(async res => (await res.json()).OnlineCount));
  const results = await Promise.all(promises);

  await channel.setName(`Playing Now: ${results.reduce((curr, prev) => curr + prev, 0)}`);
}

async function guildMembers(guild) {
  const channel = await guild.channels.fetch(statsChannels.guildMembers);
  await channel.setName(`Members: ${guild.memberCount}`);
}

async function groupMembers(guild) {
  const data = await (await fetch('https://groups.roblox.com/v1/groups/2851520')).json();
  const channel = await guild.channels.fetch(statsChannels.groupMembers);
  await channel.setName(`Fans: ${data.memberCount}`);
}