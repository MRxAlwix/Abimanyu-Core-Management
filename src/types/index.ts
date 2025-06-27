export interface Worker {
  id: string;
  name: string;
  dailyRate: number;
  position: string;
  joinDate: string;
  isActive: boolean;
  phone?: string;
  address?: string;
  skills: string[];
  profileImage?: string;
}

export interface PayrollRecord {
  id: string;
  workerId: string;
  workerName: string;
  period: string;
  daysWorked: number;
  dailyRate: number;
  regularPay: number;
  overtime: number;
  totalPay: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  projectId?: string;
  receipt?: string;
  createdBy: string;
}

export interface OvertimeRecord {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  hours: number;
  rate: number;
  total: number;
  description: string;
  projectId?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
  status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled';
  budget: number;
  spent: number;
  workers: string[];
  manager: string;
  progress: number;
  images: string[];
  qrCode?: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  projectId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'overtime';
  location: string;
  notes?: string;
  qrScanned: boolean;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  supplier: string;
  category: string;
  stock: number;
  minStock: number;
  lastUpdated: string;
}

export interface MaterialCalculation {
  id: string;
  projectId: string;
  materials: {
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    total: number;
  }[];
  totalCost: number;
  createdAt: string;
  notes?: string;
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalPayroll: number;
  totalOvertime: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  activeWorkers: number;
  completedProjects: number;
  productivity: {
    workerId: string;
    workerName: string;
    hoursWorked: number;
    overtimeHours: number;
    productivity: number;
  }[];
  generatedAt: string;
}

export interface DashboardStats {
  totalWorkers: number;
  activeWorkers: number;
  monthlyPayroll: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  pendingOvertimes: number;
  activeProjects: number;
  completedProjects: number;
  totalMaterials: number;
  lowStockMaterials: number;
}