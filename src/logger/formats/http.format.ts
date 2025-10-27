interface HttpLogData {
  method: string;
  originalUrl: string;
  statusCode: number;
  duration: number;
  contentLength: string;
  userAgent: string;
}

export const formatHttpLog = (data: HttpLogData): string => {
  const {
    method,
    originalUrl,
    statusCode,
    duration,
    contentLength,
    userAgent,
  } = data;

  // ANSI-коды для цветов
  const grey = '\u001b[90m';
  const green = '\u001b[32m';
  const yellow = '\u001b[33m';
  const red = '\u001b[31m';
  const cyan = '\u001b[36m';
  const reset = '\u001b[0m';

  let statusColor: string;

  if (statusCode >= 500) {
    statusColor = red;
  } else if (statusCode >= 400) {
    statusColor = yellow;
  } else {
    statusColor = green;
  }

  const methodMessage = `${cyan}${method.padEnd(7)}${reset}`;
  const statusMessage = `${statusColor}${statusCode}${reset}`;
  const durationMessage = `${grey}${String(duration).padStart(5)}ms${reset}`;
  const contentLengthMessage = `${grey}${contentLength}b${reset}`;

  return `${methodMessage} ${originalUrl} ${statusMessage} ${durationMessage} ${contentLengthMessage} - ${userAgent}`;
};
