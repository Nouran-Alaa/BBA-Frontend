// src/app/core/models/permission.model.ts

export enum PermissionType {
  CREATE_DASHBOARD = 'CREATE_DASHBOARD',
  EDIT_DASHBOARD = 'EDIT_DASHBOARD',
  DELETE_DASHBOARD = 'DELETE_DASHBOARD',

  EDIT_CHARTS = 'EDIT_CHARTS',
  EDIT_COUNT_BOXES = 'EDIT_COUNT_BOXES',

  UPLOAD_LOGO = 'UPLOAD_LOGO',
  MANAGE_USERS = 'MANAGE_USERS',
}

export interface Permission {
  id: string;
  name: PermissionType;
  description: string;
}

export interface UserPermissions {
  userId: string;
  permissions: PermissionType[];
}
