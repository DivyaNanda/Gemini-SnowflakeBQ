import { MigrationRule } from './types';

export const SQL_TEMPLATES = [
  {
    id: 'flatten-variant',
    name: 'Flatten Variant Array',
    description: 'Translates Snowflake LATERAL FLATTEN on a VARIANT column to BigQuery UNNEST.',
    snowflake: `-- Snowflake FLATTEN on Variant Array
SELECT
  order_id,
  customer_details:name::STRING as customer_name,
  f.value:item_id::STRING as item_id,
  f.value:price::NUMBER(10,2) as item_price
FROM raw_orders,
LATERAL FLATTEN(input => order_items) f;`
  },
  {
    id: 'complex-windowing',
    name: 'Complex Windowing & Qualify',
    description: 'Translates Snowflake QUALIFY clause and window functions to BigQuery standard SQL.',
    snowflake: `-- Snowflake QUALIFY & Windowing
SELECT
  employee_id,
  department_id,
  salary,
  hire_date,
  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC, hire_date ASC) as rank
FROM enterprise_hr.employees
WHERE status = 'ACTIVE'
QUALIFY rank <= 3;`
  },
  {
    id: 'cluster-by-ddl',
    name: 'Table with CLUSTER BY',
    description: 'Translates Snowflake CLUSTER BY clause to BigQuery PARTITION BY and CLUSTER BY DDL.',
    snowflake: `-- Snowflake Table with CLUSTER BY
CREATE OR REPLACE TABLE analytics.web_clicks (
  click_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64),
  click_timestamp TIMESTAMP_LTZ,
  ip_address VARCHAR(45),
  device_type VARCHAR(20),
  revenue NUMBER(15,4)
)
CLUSTER BY (device_type, DATE(click_timestamp));`
  },
  {
    id: 'task-stream-orchestration',
    name: 'Task & Stream Orchestration',
    description: 'Demonstrates how Snowflake Tasks, Streams, and Storage Integrations trigger GCP Architectural Notes.',
    snowflake: `-- Snowflake Task, Stream & Storage Integration
CREATE OR REPLACE STORAGE INTEGRATION gcs_sales_int
  TYPE = EXTERNAL_STAGE
  STORAGE_PROVIDER = 'GCS'
  ENABLED = TRUE
  STORAGE_ALLOWED_LOCATIONS = ('gcs://my-bucket/sales/');

CREATE OR REPLACE STREAM sales_stream ON TABLE raw_sales;

CREATE OR REPLACE TASK process_sales_task
  WAREHOUSE = 'COMPUTE_WH'
  SCHEDULE = 'USING CRON 0 2 * * * UTC'
AS
  INSERT INTO sales_fact
  SELECT * FROM sales_stream WHERE METADATA$ACTION = 'INSERT';`
  },
  {
    id: 'ddl-types',
    name: 'DDL with Snowflake Types',
    description: 'Translates Snowflake table creation with VARCHAR, NUMBER, and VARIANT to BigQuery DDL.',
    snowflake: `-- Snowflake Table DDL
CREATE OR REPLACE TABLE analytics.customer_profiles (
  profile_id VARCHAR(64) NOT NULL,
  account_balance NUMBER(18,4) DEFAULT 0.00,
  metadata VARIANT,
  tags ARRAY,
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);`
  },
  {
    id: 'merge-date-funcs',
    name: 'Merge with Date Functions',
    description: 'Translates Snowflake MERGE statement and specific date/string formatting functions.',
    snowflake: `-- Snowflake MERGE & Date Formatting
MERGE INTO target_sales t
USING source_sales s
ON t.sale_id = s.sale_id
WHEN MATCHED AND s.last_modified > t.last_modified THEN
  UPDATE SET
    t.amount = s.amount,
    t.updated_at = TO_VARCHAR(CURRENT_TIMESTAMP(), 'YYYY-MM-DD HH24:MI:SS')
WHEN NOT MATCHED THEN
  INSERT (sale_id, amount, updated_at)
  VALUES (s.sale_id, s.amount, TO_VARCHAR(CURRENT_TIMESTAMP(), 'YYYY-MM-DD HH24:MI:SS'));`
  }
];

export const MIGRATION_RULES: MigrationRule[] = [
  {
    id: 'rule-1',
    category: 'Data Types',
    snowflake: 'VARIANT / OBJECT / ARRAY',
    bigquery: 'JSON / STRUCT / ARRAY',
    description: 'Snowflake semi-structured types map directly to BigQuery native JSON or strongly-typed STRUCTs and ARRAYs.',
    exampleSnowflake: 'metadata VARIANT',
    exampleBigQuery: 'metadata JSON'
  },
  {
    id: 'rule-2',
    category: 'Data Types',
    snowflake: 'VARCHAR(N) / STRING',
    bigquery: 'STRING',
    description: 'BigQuery does not enforce length constraints on STRING types. All VARCHARs map to STRING.',
    exampleSnowflake: 'customer_name VARCHAR(100)',
    exampleBigQuery: 'customer_name STRING'
  },
  {
    id: 'rule-3',
    category: 'Data Types',
    snowflake: 'NUMBER(p, s)',
    bigquery: 'NUMERIC / BIGNUMERIC',
    description: 'Snowflake fixed-point numbers map to BigQuery NUMERIC (38 digits) or BIGNUMERIC (76+ digits).',
    exampleSnowflake: 'price NUMBER(18, 4)',
    exampleBigQuery: 'price NUMERIC'
  },
  {
    id: 'rule-4',
    category: 'Functions',
    snowflake: 'LATERAL FLATTEN(input => col)',
    bigquery: 'CROSS JOIN UNNEST(col)',
    description: 'Snowflake uses FLATTEN to explode arrays. BigQuery uses the standard UNNEST operator with a CROSS JOIN.',
    exampleSnowflake: 'FROM table, LATERAL FLATTEN(input => tags) t',
    exampleBigQuery: 'FROM table CROSS JOIN UNNEST(tags) as t'
  },
  {
    id: 'rule-5',
    category: 'Functions',
    snowflake: 'TO_VARCHAR(val, format)',
    bigquery: 'CAST(val AS STRING) / FORMAT_TIMESTAMP()',
    description: 'Snowflake TO_VARCHAR maps to CAST for simple types, or FORMAT_TIMESTAMP / FORMAT_DATE for temporal types.',
    exampleSnowflake: "TO_VARCHAR(created_at, 'YYYY-MM-DD')",
    exampleBigQuery: "FORMAT_TIMESTAMP('%Y-%m-%d', created_at)"
  },
  {
    id: 'rule-6',
    category: 'DDL/DML',
    snowflake: 'QUALIFY <window_condition>',
    bigquery: 'QUALIFY <window_condition>',
    description: 'Both Snowflake and BigQuery support the QUALIFY clause natively, making window filtering highly compatible.',
    exampleSnowflake: 'SELECT * FROM t QUALIFY ROW_NUMBER() OVER (...) = 1',
    exampleBigQuery: 'SELECT * FROM t QUALIFY ROW_NUMBER() OVER (...) = 1'
  },
  {
    id: 'rule-7',
    category: 'DDL/DML',
    snowflake: 'CLUSTER BY (col1, col2)',
    bigquery: 'PARTITION BY ... CLUSTER BY col1, col2',
    description: 'Snowflake CLUSTER BY is mapped to BigQuery PARTITION BY (for date/timestamp/integer ranges) and CLUSTER BY (up to 4 columns) to optimize query costs and slot utilization.',
    exampleSnowflake: 'CREATE TABLE t (...) CLUSTER BY (category, DATE(created_at))',
    exampleBigQuery: 'CREATE TABLE t (...) PARTITION BY DATE(created_at) CLUSTER BY category'
  },
  {
    id: 'rule-8',
    category: 'Advanced',
    snowflake: 'TASKS / STREAMS / STORAGE INTEGRATIONS',
    bigquery: 'Cloud Composer / Pub/Sub / BigQuery DTS',
    description: 'Snowflake-specific orchestration and ingestion objects cannot be directly translated to SQL. They require GCP native services like Cloud Composer (Managed Airflow), Pub/Sub, or BigQuery Data Transfer Service.',
    exampleSnowflake: 'CREATE TASK my_task SCHEDULE = \'5 MINUTE\' AS ...',
    exampleBigQuery: '[GCP ARCHITECTURAL NOTE] Use Cloud Composer (Airflow DAG) or Cloud Scheduler + Cloud Run.'
  }
];

export const WAREHOUSE_SIZES = [
  { size: 'X-Small', creditsPerHour: 1 },
  { size: 'Small', creditsPerHour: 2 },
  { size: 'Medium', creditsPerHour: 4 },
  { size: 'Large', creditsPerHour: 8 },
  { size: 'X-Large', creditsPerHour: 16 },
  { size: '2X-Large', creditsPerHour: 32 },
  { size: '3X-Large', creditsPerHour: 64 },
  { size: '4X-Large', creditsPerHour: 128 }
];
