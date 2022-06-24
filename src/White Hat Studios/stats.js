import fetch from 'node-fetch';
import { config } from '#lib';
import { TWITTER_BEARER } from '#auth';

export default async function main(client) {
  const guild = await client.guilds.fetch(config.guildId);
  await playerCount(guild).catch(() => { return null; });
  await guildMembers(guild).catch(() => { return null; });
  await fansCount(guild).catch(() => { return null; });
}

async function playerCount(guild) {
  const placeIDs = ['3452652137', '2756861770', '4751054607', '3069857462', '3298359873', '2482834103', '2956075197', '9666739740'];
  const channel = await guild.channels.fetch(config.statsChannels.players);
  const promises = placeIDs.map(id => fetch(`https://www.roblox.com/places/api-get-details?assetId=${id}`).then(async res => (await res.json()).OnlineCount));
  const results = await Promise.all(promises);

  await channel.setName(`Playing Now: ${results.reduce((curr, prev) => curr + prev, 0)}`);
}

async function guildMembers(guild) {
  const channel = await guild.channels.fetch(config.statsChannels.guildMembers);
  await channel.setName(`Members: ${guild.memberCount}`);
}

async function fansCount(guild) {
  // eslint-disable-next-line no-undef
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${TWITTER_BEARER}`);
  const discordMembers = guild.memberCount;

  const groupMembers = await (await fetch('https://groups.roblox.com/v1/groups/2851520')).json();
  const twitterFollowers = await (await fetch ('https://api.twitter.com/2/users/1057388018515038208?user.fields=public_metrics', { 
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  })).json();

  const channel = await guild.channels.fetch(config.statsChannels.groupMembers);
  await channel.setName(`Fans: ${groupMembers.memberCount + discordMembers + twitterFollowers.data.public_metrics.followers_count}`);
}