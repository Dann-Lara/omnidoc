import { Module } from '@nestjs/common'
import { ProductLibraryModule } from './product-library/product-library.module'
import { InventoryModule } from './inventory/inventory.module'
import { BatchesModule } from './batches/batches.module'
import { DispensingModule } from './dispensing/dispensing.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { PharmacyPermissionsGuard } from './guards/pharmacy-permissions.guard'

@Module({
  imports: [
    ProductLibraryModule,
    InventoryModule,
    BatchesModule,
    DispensingModule,
    DashboardModule,
  ],
  providers: [PharmacyPermissionsGuard],
  exports: [],
})
export class PharmacyModule {}
