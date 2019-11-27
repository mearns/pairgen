const moment = require("moment");
const timestring = require("timestring");
const yargs = require("yargs");

function configureArgParser(cmdYargs) {
  return cmdYargs
    .positional("member", {
      alias: "members",
      array: true
    })
    .option("epoch", {
      alias: "e",
      coerce: getDateCoercer("epoch"),
      default: "1970-01-01",
      describe: "Specify the date from which rotations are calculated.",
      require: false
    })
    .option("date", {
      alias: "d",
      coerce: getDateCoercer("date"),
      default: new Date().toISOString(),
      describe:
        "The date for which you want to know the pair assignments. Defaults to right now.",
      require: false
    })
    .option("period", {
      alias: "p",
      coerce: arg => timestring(arg, "ms"),
      default: "1w",
      describe: "Specify how long a rotation lasts.",
      require: false
    })
    .option("offset", {
      alias: "o",
      number: true,
      default: 0,
      description:
        "Specify an arbitary offset for the rotation. This is useful if you have skipped some intervals."
    })
    .option("format-string", {
      alias: "f",
      string: true,
      default: "%1 -- %2",
      description:
        'The format string to use for each pair. Use "%1" and "%2" to represent the first and second item in each pair, respecitively. Use %r1 and %r2 for the specified roles.'
    })
    .option("role1", {
      alias: "r1",
      string: true,
      description: "The name of the role of the first item in each pair"
    })
    .option("role2", {
      alias: "r2",
      string: true,
      description: "The name of the role of the second item in each pair"
    })
    .option("prologue", {
      alias: ["P", "header"],
      string: true,
      description:
        "Specify a string to be printed before the listing of pairs. " +
        'Use "%p" for the period in humanized form, "%m" for the members in a comma-separated list, ' +
        "and various forms of %d for the date: %d{x} for the locale date string, %d{X} for the locale " +
        "time string, and %d{c} for the locale datetime string"
    });
}

const getDateCoercer = argName => arg => {
  const m = moment(arg);
  if (!m.isValid()) {
    throw new Error(`The provided ${argName} is not parseable as a date`);
  }
  return m.toDate();
};

const PARSER = yargs().command("* member [members...]", "", configureArgParser);

function parseArgs(argv) {
  return PARSER.parse(argv);
}

module.exports = { configureArgParser, parseArgs };
