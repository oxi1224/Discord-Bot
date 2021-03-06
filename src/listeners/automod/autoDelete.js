import { config } from '#lib';


export default async function autoDelete(message) {
  const autoDeleteConfig = config.automod.autoDelete;
  const matchingFilters = autoDeleteConfig.filter(obj => obj.channelId === message.channelId);
  if (matchingFilters.length === 0) return;
  matchingFilters.forEach(filter => {
    switch (filter.position) {
    case 'start':
      if (filter.invert && !message.content.startsWith(filter.content)) return message.delete();
      if (!filter.invert && message.content.startsWith(filter.content)) return message.delete();
      return;
    case 'end':
      if (filter.invert && !message.content.endsWith(filter.content)) return message.delete();
      if (!filter.invert && message.content.endsWith(filter.content)) return message.delete();
      return;
    case 'any':
      if (filter.invert && !message.content.includes(filter.content)) return message.delete();
      if (!filter.invert && message.content.includes(filter.content)) return message.delete();
      return;
    }
  });
}

