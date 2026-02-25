export interface Unit {
  id: number;
  name: string;
  createdAt: string;
  unitTypeId: number;
  floor: number;
  rooms: number;
  squareMeters: number;
}

export interface UnitSummary {
  unitId: number;
  unit: string;
  blockId: string;
  block: string;
  unitTypeId: number;
  unitType: string;
  mainOwner: string;
}

export interface CreateUnitRequest {
  name: string;
  unitTypeId: number;
  floor: number;
  rooms: number;
  squareMeters: number;
}

export interface UpdateUnitRequest {
  id: number;
  name: string;
  unitTypeId: number;
  floor: number;
  rooms: number;
  squareMeters: number;
}

export interface UnitType {
  id: number;
  name: string;
  createdAt: string;
}

export interface CreateUnitTypeRequest {
  name: string;
}

export interface UpdateUnitTypeRequest {
  id: number;
  name: string;
}

export interface ComboItem<T = number> {
  id: T;
  value: string;
}
