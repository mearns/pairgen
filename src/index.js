function getRotation (memberCount, options) {

}

function generatePairs (members, options) {
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
      elapsedTime: {
        ms: elapsedTime
      },
      period: {
        ms: options.period
      },
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
