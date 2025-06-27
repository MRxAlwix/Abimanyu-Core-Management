export const APP_CONFIG = {
  name: 'Abimanyu Core Management',
  version: '1.0.0',
  author: 'Abimanyu Core',
  description: 'Sistem Manajemen Tukang dan Keuangan',
};

export const STORAGE_KEYS = {
  WORKERS: 'abimanyu_workers',
  TRANSACTIONS: 'abimanyu_transactions',
  OVERTIME: 'abimanyu_overtime',
  PAYROLL: 'abimanyu_payroll',
  PROJECTS: 'abimanyu_projects',
  ATTENDANCE: 'abimanyu_attendance',
  MATERIALS: 'abimanyu_materials',
  SETTINGS: 'abimanyu_settings',
  AUTH: 'abimanyu_auth',
  THEME: 'abimanyu_theme',
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  VIEWER: 'viewer',
} as const;

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  OVERTIME: 'overtime',
} as const;