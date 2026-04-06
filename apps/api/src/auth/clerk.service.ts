import { Injectable } from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkService {
  private clerk;

  constructor(private configService: ConfigService) {
    this.clerk = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
    });
  }

  async createUser(params: {
    emailAddress: string;
    password: string;
    firstName: string;
    lastName: string;
    publicMetadata?: Record<string, unknown>;
  }) {
    return this.clerk.users.createUser({
      emailAddress: [params.emailAddress],
      password: params.password,
      firstName: params.firstName,
      lastName: params.lastName,
      publicMetadata: params.publicMetadata || {},
    });
  }

  async getUser(userId: string) {
    return this.clerk.users.getUser(userId);
  }

  async updateUser(
    userId: string,
    params: {
      firstName?: string;
      lastName?: string;
      publicMetadata?: Record<string, unknown>;
    },
  ) {
    return this.clerk.users.updateUser(userId, {
      firstName: params.firstName,
      lastName: params.lastName,
      publicMetadata: params.publicMetadata,
    });
  }

  async deleteUser(userId: string) {
    return this.clerk.users.deleteUser(userId);
  }
}
