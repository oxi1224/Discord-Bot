export const dev = {
  guild: '613024666079985702',
  loggingChannel: '977566053062303764',
  errorsChannel: '980478015412772884',
  mutedRole: '980484262652416080',
  prefix: '!',
  owners: ['344452070360875008'],
  emotes: {
    error: '<:error:980866363461599292>',
    success: '<:success:980866382323396723>',
    info:  '<:info:980866381283201025>'
  },
  colors: {
    base: '#0099ff',
    error: '#ef4047',
    success: '#3fa45d',
    info: '#cb8715'
  },
  blacklistedRoles: {
    names: [],
    ids: []
  },
  automodConfig: {
    messageLimit: 7,
    timeDifference: 5000,
    expiryTime: 5000,
    muteDuration: '15min'
  }
};

export const whs = {
  guild: '508779434929815554',
  loggingChannel: '510442164400947218',
  errorsChannel: '981918816739131443',
  mutedRole: '510866226130714624',
  prefix: '*',
  owners: ['162210610287869952', '364285073492803585', '344452070360875008'],
  emotes: {
    error: '<:error:988494191946522696>',
    success: '<:success:988494169108529262>',
    info:  '<:info:988494211009618021>'
  },
  colors: {
    base: '#0099ff',
    error: '#ef4047',
    success: '#3fa45d',
    info: '#cb8715'
  },
  blacklistedRoles: {
    names: [
      'suggestions bot', 'bloxlink', 
      'senior administrator', 'administrators', 
      'support', 'moderators',
      'trial moderators', 'affiliate',
      'youtuber', 'bot technician',
      'bots', 'server manager',
      'founder & lead dev'
    ],
    ids: [
      '785373603248078851', '700359746850521119',
      '707343386666991677', '510298000724328451',
      '938965551311634522', '510811561733128192',
      '510812696921505812', '594578103268016148',
      '511615644785967105', '981940437747118200',
      '669264819899072532', '508780559292563457',
      '510463283258458115'
    ]
  },
  automodConfig: {
    'messageLimit': 7,
    'timeDifference': 5000,
    'expiryTime': 5000,
    'muteDuration': '15min'
  },
  statsChannels: {
    'players': '989158296185368626',
    'guildMembers': '989158452800655410',
    'groupMembers': '989158585529401354'
  }
};