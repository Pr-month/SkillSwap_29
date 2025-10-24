import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import { tskvFormat } from '../formats/tskv.format';

describe('fileTskvTransport', () => {
  const logsDir = path.join(__dirname, '../../../../test-logs');
  const logFilePath = path.join(logsDir, 'test-tskv.log');

  beforeAll(() => {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    fs.writeFileSync(logFilePath, '');
  });

  afterAll((done) => {
    fs.rm(logsDir, { recursive: true, force: true }, done);
  });

  beforeEach((done) => {
    fs.writeFile(logFilePath, '', done);
  });

  it('должен записывать лог-сообщение в формате TSKV в файл', (done) => {
    const testMessage = 'Это тестовое сообщение';
    const meta = { userId: 123, requestId: 'abc-xyz' };

    const testTransport = new winston.transports.File({
      filename: logFilePath,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.splat(),
        tskvFormat,
      ),
    });

    const logger = winston.createLogger({
      transports: [testTransport],
    });

    testTransport.on('finish', () => {
      setTimeout(() => {
        try {
          const data = fs.readFileSync(logFilePath, 'utf8');

          expect(data).not.toBe('');
          expect(data).toContain(`message=${testMessage}`);
          expect(data).toContain(`level=info`);
          expect(data).toContain(`userId=${meta.userId}`);
          expect(data).toContain(`requestId=${meta.requestId}`);
          expect(data).toMatch(
            /timestamp=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/,
          );

          done();
        } catch (error) {
          done(error);
        }
      }, 100); // 100ms задержка
    });

    testTransport.on('error', (err) => {
      done(err);
    });

    logger.info(testMessage, meta);
    logger.end();
  });
});
