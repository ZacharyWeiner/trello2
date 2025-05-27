'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Eye,
  Brain,
  Zap,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  X,
  ChevronDown,
  ChevronRight,
  Star,
  Lightbulb,
  Shield,
  Gauge
} from 'lucide-react';
import { AnalyticsService } from '@/services/analyticsService';
import {
  AnalyticsMetric,
  AnalyticsReport,
  TeamProductivityMetrics,
  ProjectHealthMetrics,
  PredictiveAnalytics,
  ChartConfig,
  AnalyticsInsight
} from '@/types/analytics';
import { Board, List, Card } from '@/types';

interface BusinessIntelligenceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  lists: List[];
  cards: Card[];
}

export const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = ({
  isOpen,
  onClose,
  board,
  lists,
  cards
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'predictive' | 'insights'>('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [teamMetrics, setTeamMetrics] = useState<TeamProductivityMetrics[]>([]);
  const [projectHealth, setProjectHealth] = useState<ProjectHealthMetrics | null>(null);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [expandedCharts, setExpandedCharts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      generateAnalytics();
    }
  }, [isOpen, dateRange]);

  const generateAnalytics = async () => {
    setIsLoading(true);
    try {
      // Generate comprehensive analytics
      const analyticsReport = await AnalyticsService.generateBoardReport(board, lists, cards, dateRange);
      const teamProductivity = AnalyticsService.calculateTeamProductivityMetrics(board.members, cards, dateRange);
      const healthMetrics = AnalyticsService.calculateProjectHealthMetrics(board, lists, cards);
      const predictions = AnalyticsService.generatePredictiveAnalytics(board, lists, cards);
      const analyticsInsights = AnalyticsService.generateInsights(board, lists, cards);

      setReport(analyticsReport);
      setTeamMetrics(teamProductivity);
      setProjectHealth(healthMetrics);
      setPredictiveAnalytics(predictions);
      setInsights(analyticsInsights);
    } catch (error) {
      console.error('Error generating analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChartExpansion = (chartId: string) => {
    const newExpanded = new Set(expandedCharts);
    if (newExpanded.has(chartId)) {
      newExpanded.delete(chartId);
    } else {
      newExpanded.add(chartId);
    }
    setExpandedCharts(newExpanded);
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Target className="h-5 w-5" />;
      case 'performance': return <TrendingUp className="h-5 w-5" />;
      case 'quality': return <CheckCircle className="h-5 w-5" />;
      case 'velocity': return <Zap className="h-5 w-5" />;
      case 'engagement': return <Users className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getMetricColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200';
      case 'down': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatValue = (value: number, format: string, unit?: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return `${value.toFixed(1)}${unit ? ` ${unit}` : 'h'}`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return `${value.toFixed(0)}${unit ? ` ${unit}` : ''}`;
    }
  };

  const renderChart = (chart: ChartConfig) => {
    const isExpanded = expandedCharts.has(chart.id);
    
    return (
      <motion.div
        key={chart.id}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        layout
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{chart.title}</h3>
              {chart.description && (
                <p className="text-sm text-gray-600 mt-1">{chart.description}</p>
              )}
            </div>
            <button
              onClick={() => toggleChartExpansion(chart.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4"
            >
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-600">Chart visualization would render here</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {chart.data.length} data points • {chart.type} chart
                  </p>
                </div>
              </div>
              
              {/* Chart Data Summary */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {chart.data.slice(0, 4).map((point, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {point.value.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">{point.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Business Intelligence</h2>
              <p className="text-gray-600">{board.title} • Advanced Analytics & Reporting</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={generateAnalytics}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'team', label: 'Team Analytics', icon: Users },
            { id: 'predictive', label: 'Predictive', icon: Brain },
            { id: 'insights', label: 'Insights', icon: Lightbulb }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Generating analytics...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && report && (
                <div className="p-6 space-y-6">
                  {/* Key Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {report.metrics.map(metric => (
                        <motion.div
                          key={metric.id}
                          className={`p-4 rounded-xl border ${getMetricColor(metric.trend)}`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getMetricIcon(metric.category)}
                              <span className="font-medium">{metric.name}</span>
                            </div>
                            {metric.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : metric.trend === 'down' ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <Activity className="h-4 w-4" />
                            )}
                          </div>
                          
                          <div className="text-2xl font-bold mb-1">
                            {formatValue(metric.value, metric.format, metric.unit)}
                          </div>
                          
                          {metric.target && (
                            <div className="text-sm opacity-75">
                              Target: {formatValue(metric.target, metric.format, metric.unit)}
                            </div>
                          )}
                          
                          {metric.description && (
                            <p className="text-xs mt-2 opacity-75">{metric.description}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Project Health */}
                  {projectHealth && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Health</h3>
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getHealthColor(projectHealth.overallHealth)}`}>
                              <Shield className="h-4 w-4" />
                              {projectHealth.overallHealth.toUpperCase()}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Overall Health</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {projectHealth.completionRate.toFixed(1)}%
                            </div>
                            <p className="text-sm text-gray-600">Completion Rate</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {projectHealth.teamEngagement.toFixed(0)}%
                            </div>
                            <p className="text-sm text-gray-600">Team Engagement</p>
                          </div>
                        </div>
                        
                        {projectHealth.riskFactors.length > 0 && (
                          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                            <h4 className="font-medium text-yellow-800 mb-2">Risk Factors</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {projectHealth.riskFactors.map((risk, index) => (
                                <li key={index}>• {risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {projectHealth.recommendations.length > 0 && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {projectHealth.recommendations.map((rec, index) => (
                                <li key={index}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Charts */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Charts</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {report.charts.map(chart => renderChart(chart))}
                    </div>
                  </div>
                </div>
              )}

              {/* Team Analytics Tab */}
              {activeTab === 'team' && (
                <div className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Team Productivity Metrics</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {teamMetrics.map(member => (
                      <motion.div
                        key={member.userId}
                        className="bg-white rounded-xl border border-gray-200 p-6"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{member.userName}</h4>
                            <p className="text-sm text-gray-600">Team Member</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tasks Completed</span>
                            <span className="font-medium">{member.tasksCompleted}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">In Progress</span>
                            <span className="font-medium">{member.tasksInProgress}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Velocity Score</span>
                            <span className="font-medium">{member.velocityScore.toFixed(0)}/100</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Quality Score</span>
                            <span className="font-medium">{member.qualityScore.toFixed(0)}/100</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Burnout Risk</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.burnoutRisk === 'high' ? 'bg-red-100 text-red-700' :
                              member.burnoutRisk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {member.burnoutRisk.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Streak Days</span>
                            <span className="font-medium">{member.streakDays}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predictive Analytics Tab */}
              {activeTab === 'predictive' && predictiveAnalytics && (
                <div className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Completion Prediction */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Project Completion Prediction</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-600">Estimated Completion</span>
                          <div className="text-xl font-bold text-gray-900">
                            {predictiveAnalytics.projectCompletionPrediction.estimatedDate.toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-600">Confidence Level</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${predictiveAnalytics.projectCompletionPrediction.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {predictiveAnalytics.projectCompletionPrediction.confidence}%
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-gray-600">Key Factors</span>
                          <ul className="mt-2 space-y-1">
                            {predictiveAnalytics.projectCompletionPrediction.factors.map((factor, index) => (
                              <li key={index} className="text-sm text-gray-700">• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Risk Assessment</h4>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Overall Risk</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            predictiveAnalytics.riskAssessment.overallRisk === 'high' ? 'bg-red-100 text-red-700' :
                            predictiveAnalytics.riskAssessment.overallRisk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {predictiveAnalytics.riskAssessment.overallRisk.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Delay Risk</span>
                            <span className="font-medium">{predictiveAnalytics.riskAssessment.delayRisk.toFixed(0)}%</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Quality Risk</span>
                            <span className="font-medium">{predictiveAnalytics.riskAssessment.qualityRisk.toFixed(0)}%</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Resource Risk</span>
                            <span className="font-medium">{predictiveAnalytics.riskAssessment.resourceRisk.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resource Needs */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
                      <h4 className="font-semibold text-gray-900 mb-4">Resource Analysis</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Workload Distribution</h5>
                          <div className="space-y-2">
                            {Object.entries(predictiveAnalytics.resourceNeeds.workloadDistribution).map(([member, workload]) => (
                              <div key={member} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{member}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${Math.min((workload / 10) * 100, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-8">{workload}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Skill Gaps</h5>
                          {predictiveAnalytics.resourceNeeds.skillGaps.length > 0 ? (
                            <div className="space-y-2">
                              {predictiveAnalytics.resourceNeeds.skillGaps.map((skill, index) => (
                                <span key={index} className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm mr-2 mb-2">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">No significant skill gaps detected</p>
                          )}
                          
                          {predictiveAnalytics.resourceNeeds.additionalTeamMembers && predictiveAnalytics.resourceNeeds.additionalTeamMembers > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-700">
                                Recommendation: Consider adding {predictiveAnalytics.resourceNeeds.additionalTeamMembers} additional team member(s)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights Tab */}
              {activeTab === 'insights' && (
                <div className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
                  
                  {insights.length > 0 ? (
                    <div className="space-y-4">
                      {insights.map(insight => (
                        <motion.div
                          key={insight.id}
                          className="bg-white rounded-xl border border-gray-200 p-6"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {getSeverityIcon(insight.severity)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  insight.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                  insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {insight.severity.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {insight.confidence}% confidence
                                </span>
                              </div>
                              
                              <p className="text-gray-700 mb-3">{insight.description}</p>
                              
                              {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Suggested Actions:</h5>
                                  <ul className="space-y-1">
                                    {insight.suggestedActions.map((action, index) => (
                                      <li key={index} className="text-sm text-gray-600">• {action}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                                <span>Type: {insight.type}</span>
                                <span>•</span>
                                <span>Detected: {insight.detectedAt.toLocaleDateString()}</span>
                                {insight.actionable && (
                                  <>
                                    <span>•</span>
                                    <span className="text-green-600">Actionable</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h4>
                      <p className="text-gray-600">
                        Generate more data by using your board to get AI-powered insights and recommendations.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}; 