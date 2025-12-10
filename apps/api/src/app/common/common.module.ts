import { Module, Global } from '@nestjs/common';
import { SentryService } from './services/sentry.service';

@Global()
@Module({
  providers: [SentryService],
  exports: [SentryService],
})
export class CommonModule {}
