import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint to check the health status of the application.
   * @returns An object containing the status of the application.
   */
  @Get('health')
  checkHealth() {
    return { status: 'UP' };
  }
}
