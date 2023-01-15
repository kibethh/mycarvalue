const cookieSession = require('cookie-session');
import { ValidationPipe, INestApplication } from '@nestjs/common';

export const setupApp = (app: INestApplication) => {
  app.use(
    cookieSession({
      keys: ['dhsadhsaghda'],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
};
