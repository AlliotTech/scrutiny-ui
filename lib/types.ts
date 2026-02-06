export interface DeviceModel {
  archived?: boolean;
  wwn: string;
  device_name?: string;
  device_uuid?: string;
  device_serial_id?: string;
  device_label?: string;
  manufacturer: string;
  model_name: string;
  interface_type: string;
  interface_speed: string;
  serial_number: string;
  firmware: string;
  rotational_speed: number;
  capacity: number;
  form_factor: string;
  smart_support: boolean;
  device_protocol: string;
  device_type: string;
  label: string;
  host_id: string;
  device_status: number;
}

export interface SmartSummary {
  collector_date?: string;
  temp?: number;
  power_on_hours?: number;
}

export interface SmartTemperatureModel {
  date: string;
  temp: number;
}

export interface DeviceSummaryModel {
  device: DeviceModel;
  smart?: SmartSummary;
  temp_history?: SmartTemperatureModel[];
}

export interface DeviceSummaryResponseWrapper {
  success: boolean;
  errors?: unknown[];
  data: {
    summary: Record<string, DeviceSummaryModel>;
  };
}

export interface DeviceSummaryTempResponseWrapper {
  success: boolean;
  errors?: unknown[];
  data: {
    temp_history: Record<string, SmartTemperatureModel[]>;
  };
}

export interface SmartAttributeModel {
  attribute_id: number | string;
  value: number;
  thresh: number;
  worst?: number;
  raw_value?: number;
  raw_string?: string;
  when_failed?: string;
  transformed_value: number;
  status: number;
  status_reason?: string;
  failure_rate?: number;
  chartData?: Array<{ date: string; value: number }>;
}

export interface SmartModel {
  date: string;
  device_wwn: string;
  device_protocol: string;
  temp: number;
  power_on_hours: number;
  power_cycle_count: number;
  attrs: Record<string, SmartAttributeModel>;
}

export interface AttributeMetadataModel {
  display_name: string;
  ideal: string;
  critical: boolean;
  description: string;
  transform_value_unit?: string;
  observed_thresholds?: unknown[];
  display_type: string;
}

export interface DeviceDetailsResponseWrapper {
  success: boolean;
  errors?: unknown[];
  data: {
    device: DeviceModel;
    smart_results: SmartModel[];
  };
  metadata: Record<string, AttributeMetadataModel>;
}

export type Theme = "light" | "dark" | "system";
export type DashboardDisplay = "name" | "serial_id" | "uuid" | "label";
export type DashboardSort = "status" | "title" | "age";
export type TemperatureUnit = "celsius" | "fahrenheit";
export type LineStroke = "smooth" | "straight" | "stepline";
export type DevicePoweredOnUnit = "humanize" | "device_hours";

export enum MetricsNotifyLevel {
  Warn = 1,
  Fail = 2,
}

export enum MetricsStatusFilterAttributes {
  All = 0,
  Critical = 1,
}

export enum MetricsStatusThreshold {
  Smart = 1,
  Scrutiny = 2,
  Both = 3,
}

export interface AppConfig {
  theme?: Theme;
  layout?: string;
  dashboard_display?: DashboardDisplay;
  dashboard_sort?: DashboardSort;
  temperature_unit?: TemperatureUnit;
  file_size_si_units?: boolean;
  powered_on_hours_unit?: DevicePoweredOnUnit;
  line_stroke?: LineStroke;
  collector?: {
    discard_sct_temp_history?: boolean;
  };
  metrics?: {
    notify_level?: MetricsNotifyLevel;
    status_filter_attributes?: MetricsStatusFilterAttributes;
    status_threshold?: MetricsStatusThreshold;
    repeat_notifications?: boolean;
  };
}

export interface SettingsResponseWrapper {
  success: boolean;
  settings: AppConfig;
}

export interface HealthResponse {
  success: boolean;
  error?: string;
  errors?: string[];
}
