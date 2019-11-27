const { generatePairs, format, formatWithPair } = require("..");
const { parseArgs } = require("../arg-parser");
const StatusCodes = require("http-status-codes");
const appName = require("../../package.json").name;

function parseMembers(members) {
  if (!members) {
    return [];
  } else if (typeof members === "string") {
    return members.split(",").map(member => member.trim());
  }
  return members;
}

const COMMON_ARGS = [
  "period",
  "offset",
  "epoch",
  "date",
  "prologue",
  "role1",
  "role2",
  "format-string"
];

function configureRestApiRouter(router) {
  router.get("/pairs", (request, response) => {
    try {
      const members = parseMembers(request.query.members);
      const argv = [];
      COMMON_ARGS.forEach(paramName => {
        if (request.query[paramName]) {
          argv.push(`--${paramName}`, request.query[paramName]);
        }
      });

      const args = parseArgs([...argv, "--", ...members]);

      if (request.query.title) {
        args.title = request.query.title;
      }
      if (
        request.query.verbose &&
        request.query.verbose.toLowerCase() == "true"
      ) {
        args.verbose = true;
      }

      const pairs = generatePairs(args.members, args);
      if (request.query.format === "html") {
        response
          .type("text/html; charset=utf-8")
          .send(generateHtml(pairs.pairs, args, request.query))
          .end();
      } else if (request.query.format === "text") {
        response
          .type("text/plain; charset=utf-8")
          .send(generatePlainText(pairs.pairs, args, request.query))
          .end();
      } else {
        response.json(pairs);
      }
    } catch (e) {
      console.error(e);
      response.status(StatusCodes.BAD_REQUEST).json({ error: e.message });
    }
  });
}

function generateHtml(pairs, args, query) {
  const title =
    args.title &&
    escapeHtml(format(args.title, args.date, args.period, args.members));
  const prologue =
    args.prologue &&
    escapeHtml(format(args.prologue, args.date, args.period, args.members));

  const localFormatWithPair = pair =>
    formatWithPair(
      args["format-string"],
      pair,
      [args.role1, args.role2],
      args.date,
      args.period,
      args.members
    );

  return `<!doctype html!>
  <html>
    <head>
      <title>${title || "Pairings"}</title>
    </head>
    <body>
      ${(title && `<h1>${title}</h1>`) || ""}
      ${(prologue && `<p>${prologue}</p>`) || ""}
      <ul>
        ${pairs
          .map(pair => `<li>${escapeHtml(localFormatWithPair(pair))}</li>`)
          .join("\n")}
      </ul>
      ${args.verbose ? `<pre>${escapeHtml(generateCommand(query))}</pre>` : ""}
    </body>
  </html>
`;
}

function generatePlainText(pairs, args, query) {
  const title =
    args.title && format(args.title, args.date, args.period, args.members);
  const prologue =
    args.prologue &&
    format(args.prologue, args.date, args.period, args.members);

  const localFormatWithPair = pair =>
    formatWithPair(
      args["format-string"],
      pair,
      [args.role1, args.role2],
      args.date,
      args.period,
      args.members
    );

  const lines = [];
  if (title) {
    lines.push(title);
  }
  if (prologue) {
    lines.push(prologue);
  }
  if (lines.length) {
    lines.push("");
  }
  lines.push(...pairs.map(pair => ` * ${localFormatWithPair(pair)}`));

  if (args.verbose) {
    lines.push("");
    lines.push("```");
    lines.push(generateCommand(query));
    lines.push("```");
    lines.push("");
  }
  return lines.join("\n");
}

function generateCommand(query) {
  const parts = [appName, "cli"];
  const prologue = [query.title, query.prologue].filter(Boolean).join(" ");
  COMMON_ARGS.filter(name => query[name] && name !== "prologue").forEach(
    name => {
      parts.push(`--${name}`);
      parts.push(escapeForShell(query[name]));
    }
  );
  if (prologue) {
    parts.push("--prologue", escapeForShell(prologue));
  }
  parts.push("--");
  parts.push(...parseMembers(query.members).map(escapeForShell));
  return parts.join(" ");
}

function escapeForShell(value) {
  if (/[\s'"`%$]/.test(String(value))) {
    return `'${String(value).replace(/'/g, `'"'"'`)}'`;
  }
  return String(value);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = { configureRestApiRouter };
