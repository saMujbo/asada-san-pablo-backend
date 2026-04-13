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
    Rolname: RoleEnum.GUEST,
    Description: 'Rol por defecto con acceso limitado.',
  },
  {
    Rolname: RoleEnum.BOD,
    Description: 'Acceso para miembros de la Junta Directiva.',
  },
  {
    Rolname: RoleEnum.SUB,
    Description: 'Acceso para abonados del sistema.',
  },
  {
    Rolname: RoleEnum.ASSOS,
    Description: 'Acceso para asociados del sistema.',
  },
  {
    Rolname: RoleEnum.PLMBR,
    Description: 'Acceso para fontaneros.',
  },
];

export async function seedRoles(dataSource: DataSource) {
  return syncSeedData(dataSource.getRepository(RoleEntity), 'Rolname', roles);
}
