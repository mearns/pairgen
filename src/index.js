function getRotation (memberCount, options) {
  const modulus = memberCount - 1
  const elapsedTime = options.date - options.epoch
  const intervalNum = parseInt(options.offset + (elapsedTime / options.period))
  const rotation = ((intervalNum % modulus) + modulus) % modulus // handle negative offsets.
  return 1 + rotation
}

function generatePairs (members, options) {
  const rotation = getRotation(members.length, options)
  return members.map((member, idx) => {
    return [member, members[(rotation + idx) % members.length]]
  })
}

module.exports = {
  generatePairs
}
