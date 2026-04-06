import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingSchema } from './onboarding.dto';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create onboarding (signup with org creation)' })
  @ApiResponse({ status: 201, description: 'Onboarding created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Organization or user already exists' })
  async createOnboarding(@Body() body: unknown): Promise<{ userId: string; organizationId: string; slug: string }> {
    const result = CreateOnboardingSchema.safeParse(body);
    
    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }

    return this.onboardingService.createOnboarding(result.data);
  }
}
