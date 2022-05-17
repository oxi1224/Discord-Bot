// get punishment expiration date
export function getExpirationDate(duration, startTime) {
  if (duration == null) return null;
  const numberInDuration = duration.match(/\d+/);

  console.log(duration.split('').slice(numberInDuration.length, duration.length).join(''));
  if (numberInDuration[0].length < 1) {
    if (duration.split('').slice(numberInDuration[0].length, duration.length).join('') === 'min') return (parseInt(numberInDuration[0]) * 60000) + startTime;
  } else if (duration.split('').slice(numberInDuration[0].length - 1, duration.length).join('') === 'min') {
    return (parseInt(numberInDuration[0]) * 60000) + startTime;
  }

  switch (duration.split('')[-1]) {
  case 'h':
    return (parseInt(numberInDuration[0]) * 3600000) + startTime;
  case 'd':
    return (parseInt(numberInDuration[0]) * 86400000) + startTime;
  case 'w':
    return (parseInt(numberInDuration[0]) * 604800000) + startTime;
  case 'm':
    return (parseInt(numberInDuration[0]) * 2678400000) + startTime;
  }
}