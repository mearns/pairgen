const humanizeDuration = require('humanize-duration')

function getHumanDurationDescriptions (timeMs, ...languages) {
  return languages.reduce((acc, lang) => {
    acc[lang] = {
      exact: humanizeDuration(timeMs, {language: lang}),
      approximate: humanizeDuration(timeMs, {language: lang, largest: 2, round: true})
    }
    return acc
  }, {})
}

function describeDuration (timeMs) {
  return {
    ms: timeMs,
    text: getHumanDurationDescriptions(timeMs, 'en')
  }
}

function generatePairs (members, options) {
  if (members.length < 2) {
    throw new Error('Cannot generate pairs for fewer than two members')
  }
  const modulus = members.length - 1
  const elapsedTime = options.date - options.epoch
  const intervalNum = parseInt(options.offset + (elapsedTime / options.period))
  const baseRotation = ((intervalNum % modulus) + modulus) % modulus // handle negative offsets.
  const rotation = 1 + baseRotation
  const pairs = members.map((member, idx) => {
    return [member, members[(rotation + idx) % members.length]]
  })
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
    }
  } else {
    return pairs
  }
}

module.exports = {
  generatePairs
}
