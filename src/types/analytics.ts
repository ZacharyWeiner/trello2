// Business Intelligence & Analytics Types

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'percentage' | 'currency' | 'duration' | 'date';
  category: 'productivity' | 'performance' | 'quality' | 'velocity' | 'engagement';
  description?: string;
  target?: number;
  unit?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: Date;
  category?: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'heatmap' | 'funnel';
  title: string;
  description?: string;
  data: ChartDataPoint[];
  options: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    showLegend?: boolean;
    showTooltips?: boolean;
    colors?: string[];
    xAxisLabel?: string;
    yAxisLabel?: string;
    stacked?: boolean;
    smooth?: boolean;
  };
}

export interface ReportFilter {
  id: string;
  type: 'date_range' | 'user' | 'list' | 'label' | 'priority' | 'status';
  label: string;
  value: any;
  options?: Array<{ label: string; value: any }>;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  description: string;
  category: 'overview' | 'productivity' | 'performance' | 'team' | 'project' | 'custom';
  metrics: AnalyticsMetric[];
  charts: ChartConfig[];
  filters: ReportFilter[];
  dateRange: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  boardId: string;
  createdBy: string;
  isScheduled?: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  recipients?: string[];
}

export interface TeamProductivityMetrics {
  userId: string;
  userName: string;
  tasksCompleted: number;
  tasksInProgress: number;
  averageCompletionTime: number; // in hours
  velocityScore: number;
  qualityScore: number;
  collaborationScore: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  workloadBalance: number; // 0-100
  streakDays: number;
  lastActiveDate: Date;
}

export interface ProjectHealthMetrics {
  boardId: string;
  boardTitle: string;
  overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
  completionRate: number;
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
  blockerCount: number;
  overdueTasksCount: number;
  teamEngagement: number;
  riskFactors: string[];
  recommendations: string[];
  estimatedCompletionDate?: Date;
  budgetUtilization?: number;
}

export interface VelocityData {
  period: string;
  tasksCompleted: number;
  storyPoints?: number;
  plannedVsActual: {
    planned: number;
    actual: number;
  };
  teamCapacity: number;
  efficiency: number;
}

export interface BurndownData {
  date: Date;
  remainingTasks: number;
  idealRemaining: number;
  completedTasks: number;
  addedTasks: number;
  scope: number;
}

export interface CycleTimeAnalysis {
  listId: string;
  listName: string;
  averageTime: number; // in hours
  medianTime: number;
  minTime: number;
  maxTime: number;
  taskCount: number;
  bottleneck: boolean;
}

export interface QualityMetrics {
  defectRate: number;
  reworkRate: number;
  customerSatisfaction: number;
  codeReviewCoverage?: number;
  testCoverage?: number;
  bugEscapeRate: number;
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  sessionDuration: number;
  actionsPerSession: number;
  collaborationIndex: number;
  feedbackScore: number;
  retentionRate: number;
}

export interface PredictiveAnalytics {
  projectCompletionPrediction: {
    estimatedDate: Date;
    confidence: number;
    factors: string[];
  };
  resourceNeeds: {
    additionalTeamMembers?: number;
    skillGaps: string[];
    workloadDistribution: Record<string, number>;
  };
  riskAssessment: {
    delayRisk: number;
    qualityRisk: number;
    resourceRisk: number;
    overallRisk: 'low' | 'medium' | 'high';
  };
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'heatmap' | 'gauge' | 'progress';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number; w: number; h: number };
  config: any;
  refreshInterval?: number; // in seconds
  isVisible: boolean;
}

export interface AnalyticsDashboard {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'masonry' | 'tabs';
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: {
    viewers: string[];
    editors: string[];
  };
}

export interface AnalyticsExport {
  id: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  reportId: string;
  fileName: string;
  size: number;
  downloadUrl: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AnalyticsSettings {
  boardId: string;
  enabledMetrics: string[];
  dataRetentionDays: number;
  autoReportGeneration: boolean;
  reportSchedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  alertThresholds: {
    velocityDrop: number;
    overdueTasksLimit: number;
    burnoutRiskLevel: 'medium' | 'high';
  };
  customMetrics: Array<{
    id: string;
    name: string;
    formula: string;
    description: string;
  }>;
}

export interface AnalyticsQuery {
  boardId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: ReportFilter[];
  groupBy?: string[];
  metrics: string[];
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
  actionable: boolean;
  suggestedActions?: string[];
  relatedMetrics: string[];
  detectedAt: Date;
} 