import { SetMetadata } from '@nestjs/common';

export const RequirePharmacyPermission = (permission: string) =>
  SetMetadata('pharmacy:permission', permission);
