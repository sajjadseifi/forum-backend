import { Request } from 'express';
import { RoleSection } from '../entity/user-role.entity';

export const rolesFilterHandler = (req: Request) => {
  const strRoles = (req.query.roles as string) ?? '';
  if (!strRoles) {
    return { roles: [], all: false };
  }
  let roles: any[] = strRoles.split('|');
  roles = roles.map((d: string) => {
    const [section, permisstionStr] = d.split(':') as [RoleSection, string];

    const permision: any = {};
    const crud = permisstionStr?.split(',').map((c) => c != '' && +c);

    if (typeof crud[0] === 'number') permision.canCreate = !!crud[0];
    if (typeof crud[1] === 'number') permision.canRead = !!crud[1];
    if (typeof crud[2] === 'number') permision.canUpdate = !!crud[2];
    if (typeof crud[3] === 'number') permision.canDelete = !!crud[3];

    return { section, ...permision };
  });

  const allIndex = roles.findIndex((r) => r.section === 'ALL');
  if (allIndex > -1) {
    delete roles[allIndex].section;
  }
  return { roles };
};
