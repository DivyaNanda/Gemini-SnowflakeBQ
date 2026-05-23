export interface TranslationResult {
  complexityAssessment: string; // Step 1: High-level complexity assessment
  translatedSql: string;        // Step 2: Translated, production-ready BigQuery SQL
  structuralChanges: string[];  // Step 3: Bulleted list of structural and dialect changes
  explanation: string;
  partitioningRecommendation: string;
  clusteringRecommendation: string;
  complexityScore: 'Low' | 'Medium' | 'High';
  warnings: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface MigrationRule {
  id: string;
  category: 'Data Types' | 'Functions' | 'DDL/DML' | 'Advanced';
  snowflake: string;
  bigquery: string;
  description: string;
  exampleSnowflake: string;
  exampleBigQuery: string;
}

export interface BatchItem {
  id: string;
  name: string;
  snowflakeSql: string;
  translatedSql?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  complexity?: 'Low' | 'Medium' | 'High';
  error?: string;
}

export interface CostCalculatorInput {
  snowflakeWarehouseSize: string;
  snowflakeHoursPerDay: number;
  snowflakeDaysPerMonth: number;
  bigqueryStorageTb: number;
  bigqueryQueryVolumeTb: number;
}
