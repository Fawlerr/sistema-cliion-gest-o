function stringifyMeta(meta) {
  if (!meta || typeof meta !== "object" || !Object.keys(meta).length) {
    return "";
  }

  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return " [unserializable-meta]";
  }
}

function log(level, message, meta) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${stringifyMeta(meta)}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info(message, meta) {
    log("info", message, meta);
  },
  warn(message, meta) {
    log("warn", message, meta);
  },
  error(message, meta) {
    log("error", message, meta);
  }
};
