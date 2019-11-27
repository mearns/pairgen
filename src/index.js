const humanizeDuration = require("humanize-duration");

function getHumanDurationDescriptions(timeMs, ...languages) {
  return languages.reduce((acc, lang) => {
    acc[lang] = {
      exact: humanizeDuration(timeMs, { language: lang }),
      approximate: humanizeDuration(timeMs, {
        language: lang,
        largest: 2,
        round: true
      })
    };
    return acc;
  }, {});
}

function describeDuration(timeMs) {
  return {
    ms: timeMs,
    text: getHumanDurationDescriptions(timeMs, "en")
  };
}

function generatePairs(members, options) {
  if (members.length < 2) {
    throw new Error("Cannot generate pairs for fewer than two members");
  }
  const modulus = members.length - 1;
  const elapsedTime = options.date - options.epoch;
  const intervalNum = parseInt(options.offset + elapsedTime / options.period);
  const baseRotation = ((intervalNum % modulus) + modulus) % modulus; // handle negative offsets.
  const rotation = 1 + baseRotation;
  const pairs = members.map((member, idx) => {
    return [member, members[(rotation + idx) % members.length]];
  });
  if (options.verbose) {
    return {
      pairs,
      rotation,
      elapsedTime: describeDuration(elapsedTime),
      period: describeDuration(options.period),
      interval: intervalNum,
      date: options.date,
      epoch: options.epoch,
      offset: options.offset
    };
  } else {
    return { pairs };
  }
}

function formatWithPair(formatString, pair, roles, date, period, members) {
  return formatString
    .replace("%1", pair[0])
    .replace("%2", pair[1])
    .replace("%r1", roles[0])
    .replace("%r2", roles[1])
    .replace("%d{x}", date.toLocaleDateString())
    .replace("%d{X}", date.toLocaleTimeString())
    .replace("%d{c}", date.toLocaleString())
    .replace("%p", humanizeDuration(period))
    .replace("%m", members.join(", "));
}

function format(prologue, date, period, members) {
  return prologue
    .replace("%d{x}", date.toLocaleDateString())
    .replace("%d{X}", date.toLocaleTimeString())
    .replace("%d{c}", date.toLocaleString())
    .replace("%p", humanizeDuration(period))
    .replace("%m", members.join(", "));
}

module.exports = {
  generatePairs,
  format,
  formatWithPair
};
