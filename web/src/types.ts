import type React from 'react';

export type SubjectType = 'physics' | 'math' | 'chemistry';

export interface ParamDef {
  key: string;
  label: string;
  symbol: string;
  unit: string;
  defaultVal: number;
  min: number;
  max: number;
  step: number;
  decimals?: number;
  presets?: Array<{ label: string; value: number }>;
}

export interface MetricOutput {
  label: string;
  symbol: string;
  value: string;
  unit: string;
  color?: string;
  badge?: string;
}

export interface CalculationResult {
  primaryValue: string;
  primaryUnit: string;
  primarySymbol: string;
  substitutionSteps: string[];
  metrics: MetricOutput[];
  visualData?: Record<string, any>;
}

export interface FormulaItem {
  id: string;
  title: string;
  subject: SubjectType;
  category: string;
  equation: string;
  description: string;
  params: ParamDef[];
  calculate: (values: Record<string, number>) => CalculationResult;
  renderVisual?: (values: Record<string, number>, result: CalculationResult) => React.ReactNode;
}
