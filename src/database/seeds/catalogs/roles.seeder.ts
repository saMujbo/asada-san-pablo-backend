import { DataSource } from 'typeorm';
import { Role as RoleEntity } from 'src/roles/entities/role.entity';
import { Role as RoleEnum } from 'src/auth/auth-roles/roles.enum';
import { syncSeedData } from '../seeder.utils';

const roles = [
  {
    Rolname: RoleEnum.ADMIN,
    Description: 'Acceso administrativo completo al sistema.',
  },
  {
    Rolname: RoleEnum.USER,
    Description: 'Usuario autenticado con permisos operativos generales.',
  },
  {
    Rolname: RoleEnum.GUEST,
    Description: 'Rol por defecto con acceso limitado.',
  },
];

export async function seedRoles(dataSource: DataSource) {
  return syncSeedData(dataSource.getRepository(RoleEntity), 'Rolname', roles);
}
