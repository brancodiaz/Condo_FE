export interface MaintenanceFee {
  id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  blockId?: string;
  blockName?: string;
  createdAt: string;
}

export interface CreateMaintenanceFeeRequest {
  name: string;
  description?: string | null;
  amount: number;
  frequency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  blockId?: string | null;
}

export interface UpdateMaintenanceFeeRequest extends CreateMaintenanceFeeRequest {}

export const FREQUENCY_OPTIONS = [
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'SEMIANNUAL', label: 'Semestral' },
  { value: 'ANNUAL', label: 'Anual' },
];

export const FREQUENCY_LABELS: Record<string, string> = {
  MONTHLY: 'Mensual',
  QUARTERLY: 'Trimestral',
  SEMIANNUAL: 'Semestral',
  ANNUAL: 'Anual',
};
