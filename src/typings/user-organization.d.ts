import { SessionUser } from './user'

export type SessionOrganizationUser = Pick<UserOrganization, 'organization_id' | 'role' | 'user_id'> & { user: SessionUser }
