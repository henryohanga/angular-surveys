import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('check', () => {
    it('should return health status', () => {
      const result = controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });

    it('should return increasing uptime', async () => {
      const result1 = controller.check();

      // Wait a tiny bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result2 = controller.check();

      expect(result2.uptime).toBeGreaterThanOrEqual(result1.uptime);
    });
  });
});
