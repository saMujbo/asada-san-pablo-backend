// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { MailServiceModule } from './mail-service/mail-service.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { CacheModule } from '@nestjs/cache-manager';
import { CategoriesModule } from './categories/categories.module';
import { UnitMeasureModule } from './unit_measure/unit_measure.module';
import { MaterialModule } from './material/material.module';
import { ProductModule } from './product/product.module';
import { SupplierModule } from './supplier/supplier.module';
import { ProjectModule } from './project/project.module';
import { TraceProjectModule } from './trace-project/trace-project.module';
import { TraceProjectProductModule } from './trace-project/trace-project_product/trace-project_product.module';
import { ProjectStateModule } from './project/project-state/project-state.module';
import { ProjectProjectionModule } from './project-projection/project-projection.module';
import { ProductDetailModule } from './product/product-detail/product-detail.module';
import { ActualExpenseModule } from './actual-expense/actual-expense.module';
import { AgentSupplierModule } from './agent_supplier/agent_supplier.module';
import { LegalSupplierModule } from './legal-supplier/legal-supplier.module';
import { PhysicalSupplierModule } from './physical-supplier/physical-supplier.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,                  // disponible en toda la app
      load: [configuration],           // mapea tus vars a un objeto
      envFilePath: ['.env'],           // ruta(s) del .env
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<'mysql'>('DB_TYPE'),
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    CacheModule.register({ isGlobal: true }),
    UsersModule,
    RolesModule,
    AuthModule,
    MailServiceModule,
    MaterialModule,
    CategoriesModule,
    UnitMeasureModule,
    ProductModule,
    SupplierModule,
    ProjectModule,
    TraceProjectModule,
    TraceProjectProductModule,
    ProjectStateModule,
    ProductDetailModule,
    ProjectProjectionModule,
    ActualExpenseModule,
    AgentSupplierModule,
    LegalSupplierModule,
    PhysicalSupplierModule,
  ],
})
export class AppModule {}
