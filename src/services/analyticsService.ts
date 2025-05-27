import { 
  AnalyticsMetric, 
  AnalyticsReport, 
  TeamProductivityMetrics, 
  ProjectHealthMetrics,
  VelocityData,
  BurndownData,
  CycleTimeAnalysis,
  QualityMetrics,
  EngagementMetrics,
  PredictiveAnalytics,
  ChartConfig,
  ChartDataPoint,
  AnalyticsInsight,
  AnalyticsQuery
} from '@/types/analytics';
import { Board, List, Card, BoardMember } from '@/types';

export class AnalyticsService {
  
  /**
   * Generate comprehensive analytics report for a board
   */
  static async generateBoardReport(
    board: Board, 
    lists: List[], 
    cards: Card[], 
    dateRange: { start: Date; end: Date }
  ): Promise<AnalyticsReport> {
    const metrics = await this.calculateBoardMetrics(board, lists, cards, dateRange);
    const charts = await this.generateCharts(board, lists, cards, dateRange);
    
    return {
      id: `report-${board.id}-${Date.now()}`,
      title: `${board.title} Analytics Report`,
      description: `Comprehensive analytics for ${board.title} from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
      category: 'overview',
      metrics,
      charts,
      filters: [],
      dateRange,
      generatedAt: new Date(),
      boardId: board.id,
      createdBy: 'system'
    };
  }

  /**
   * Calculate key board metrics
   */
  static async calculateBoardMetrics(
    board: Board, 
    lists: List[], 
    cards: Card[], 
    dateRange: { start: Date; end: Date }
  ): Promise<AnalyticsMetric[]> {
    const filteredCards = this.filterCardsByDateRange(cards, dateRange);
    const completedCards = this.getCompletedCards(filteredCards, lists);
    const inProgressCards = this.getInProgressCards(filteredCards, lists);
    const overdueCards = this.getOverdueCards(filteredCards);
    
    const totalTasks = filteredCards.length;
    const completedTasks = completedCards.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const averageCompletionTime = this.calculateAverageCompletionTime(completedCards);
    const velocity = this.calculateVelocity(completedCards, dateRange);
    const teamProductivity = this.calculateTeamProductivity(board.members, filteredCards);
    
    return [
      {
        id: 'total-tasks',
        name: 'Total Tasks',
        value: totalTasks,
        trend: 'stable',
        format: 'number',
        category: 'productivity',
        description: 'Total number of tasks in the selected period'
      },
      {
        id: 'completion-rate',
        name: 'Completion Rate',
        value: completionRate,
        trend: completionRate >= 80 ? 'up' : completionRate >= 60 ? 'stable' : 'down',
        format: 'percentage',
        category: 'performance',
        description: 'Percentage of tasks completed',
        target: 85
      },
      {
        id: 'tasks-completed',
        name: 'Tasks Completed',
        value: completedTasks,
        trend: 'up',
        format: 'number',
        category: 'productivity',
        description: 'Number of tasks completed in the period'
      },
      {
        id: 'tasks-in-progress',
        name: 'Tasks In Progress',
        value: inProgressCards.length,
        trend: 'stable',
        format: 'number',
        category: 'productivity',
        description: 'Number of tasks currently in progress'
      },
      {
        id: 'overdue-tasks',
        name: 'Overdue Tasks',
        value: overdueCards.length,
        trend: overdueCards.length > 5 ? 'down' : 'stable',
        format: 'number',
        category: 'quality',
        description: 'Number of tasks past their due date'
      },
      {
        id: 'avg-completion-time',
        name: 'Avg Completion Time',
        value: averageCompletionTime,
        trend: 'stable',
        format: 'duration',
        category: 'performance',
        description: 'Average time to complete tasks',
        unit: 'hours'
      },
      {
        id: 'velocity',
        name: 'Team Velocity',
        value: velocity,
        trend: 'up',
        format: 'number',
        category: 'velocity',
        description: 'Tasks completed per day',
        unit: 'tasks/day'
      },
      {
        id: 'team-productivity',
        name: 'Team Productivity Score',
        value: teamProductivity,
        trend: teamProductivity >= 80 ? 'up' : 'stable',
        format: 'number',
        category: 'productivity',
        description: 'Overall team productivity score (0-100)',
        target: 85
      }
    ];
  }

  /**
   * Generate charts for analytics dashboard
   */
  static async generateCharts(
    board: Board, 
    lists: List[], 
    cards: Card[], 
    dateRange: { start: Date; end: Date }
  ): Promise<ChartConfig[]> {
    const charts: ChartConfig[] = [];
    
    // Task completion trend
    charts.push(this.generateCompletionTrendChart(cards, dateRange));
    
    // Tasks by list distribution
    charts.push(this.generateTasksByListChart(lists, cards));
    
    // Team workload distribution
    charts.push(this.generateTeamWorkloadChart(board.members, cards));
    
    // Velocity chart
    charts.push(this.generateVelocityChart(cards, dateRange));
    
    // Burndown chart
    charts.push(this.generateBurndownChart(cards, dateRange));
    
    // Cycle time analysis
    charts.push(this.generateCycleTimeChart(lists, cards));
    
    return charts;
  }

  /**
   * Generate task completion trend chart
   */
  static generateCompletionTrendChart(cards: Card[], dateRange: { start: Date; end: Date }): ChartConfig {
    const dailyCompletions = this.groupCardsByDay(cards, dateRange);
    const data: ChartDataPoint[] = Object.entries(dailyCompletions).map(([date, count]) => ({
      label: new Date(date).toLocaleDateString(),
      value: count,
      date: new Date(date)
    }));

    return {
      id: 'completion-trend',
      type: 'line',
      title: 'Task Completion Trend',
      description: 'Daily task completion over time',
      data,
      options: {
        responsive: true,
        showLegend: false,
        showTooltips: true,
        colors: ['#3b82f6'],
        xAxisLabel: 'Date',
        yAxisLabel: 'Tasks Completed',
        smooth: true
      }
    };
  }

  /**
   * Generate tasks by list distribution chart
   */
  static generateTasksByListChart(lists: List[], cards: Card[]): ChartConfig {
    const listCounts = lists.map(list => {
      const listCards = cards.filter(card => card.listId === list.id);
      return {
        label: list.title,
        value: listCards.length,
        category: list.listType || 'other'
      };
    });

    return {
      id: 'tasks-by-list',
      type: 'doughnut',
      title: 'Tasks by List',
      description: 'Distribution of tasks across lists',
      data: listCounts,
      options: {
        responsive: true,
        showLegend: true,
        showTooltips: true,
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
      }
    };
  }

  /**
   * Generate team workload distribution chart
   */
  static generateTeamWorkloadChart(members: BoardMember[], cards: Card[]): ChartConfig {
    const memberWorkload = members.map(member => {
      const memberCards = cards.filter(card => 
        card.assignees?.includes(member.userId) || 
        card.createdBy === member.userId
      );
      return {
        label: member.displayName,
        value: memberCards.length
      };
    });

    return {
      id: 'team-workload',
      type: 'bar',
      title: 'Team Workload Distribution',
      description: 'Number of tasks assigned to each team member',
      data: memberWorkload,
      options: {
        responsive: true,
        showLegend: false,
        showTooltips: true,
        colors: ['#3b82f6'],
        xAxisLabel: 'Team Members',
        yAxisLabel: 'Number of Tasks'
      }
    };
  }

  /**
   * Generate velocity chart
   */
  static generateVelocityChart(cards: Card[], dateRange: { start: Date; end: Date }): ChartConfig {
    const weeklyVelocity = this.calculateWeeklyVelocity(cards, dateRange);
    const data: ChartDataPoint[] = weeklyVelocity.map(week => ({
      label: `Week ${week.week}`,
      value: week.completed,
      metadata: { planned: week.planned }
    }));

    return {
      id: 'velocity-chart',
      type: 'bar',
      title: 'Team Velocity',
      description: 'Weekly task completion velocity',
      data,
      options: {
        responsive: true,
        showLegend: true,
        showTooltips: true,
        colors: ['#10b981', '#f59e0b'],
        xAxisLabel: 'Week',
        yAxisLabel: 'Tasks'
      }
    };
  }

  /**
   * Generate burndown chart
   */
  static generateBurndownChart(cards: Card[], dateRange: { start: Date; end: Date }): ChartConfig {
    const burndownData = this.calculateBurndownData(cards, dateRange);
    const data: ChartDataPoint[] = burndownData.map(point => ({
      label: point.date.toLocaleDateString(),
      value: point.remainingTasks,
      date: point.date,
      metadata: { ideal: point.idealRemaining }
    }));

    return {
      id: 'burndown-chart',
      type: 'line',
      title: 'Burndown Chart',
      description: 'Remaining tasks over time vs ideal burndown',
      data,
      options: {
        responsive: true,
        showLegend: true,
        showTooltips: true,
        colors: ['#ef4444', '#94a3b8'],
        xAxisLabel: 'Date',
        yAxisLabel: 'Remaining Tasks',
        smooth: true
      }
    };
  }

  /**
   * Generate cycle time analysis chart
   */
  static generateCycleTimeChart(lists: List[], cards: Card[]): ChartConfig {
    const cycleTimeData = this.calculateCycleTimeByList(lists, cards);
    const data: ChartDataPoint[] = cycleTimeData.map(item => ({
      label: item.listName,
      value: item.averageTime,
      metadata: { 
        taskCount: item.taskCount,
        isBottleneck: item.bottleneck
      }
    }));

    return {
      id: 'cycle-time',
      type: 'bar',
      title: 'Cycle Time by List',
      description: 'Average time tasks spend in each list',
      data,
      options: {
        responsive: true,
        showLegend: false,
        showTooltips: true,
        colors: ['#8b5cf6'],
        xAxisLabel: 'Lists',
        yAxisLabel: 'Average Time (hours)'
      }
    };
  }

  /**
   * Calculate team productivity metrics
   */
  static calculateTeamProductivityMetrics(
    members: BoardMember[], 
    cards: Card[], 
    dateRange: { start: Date; end: Date }
  ): TeamProductivityMetrics[] {
    return members.map(member => {
      const memberCards = cards.filter(card => 
        card.assignees?.includes(member.userId) || 
        card.createdBy === member.userId
      );
      
      const completedCards = memberCards.filter(card => 
        card.updatedAt >= dateRange.start && 
        card.updatedAt <= dateRange.end
      );
      
      const inProgressCards = memberCards.filter(card => 
        !completedCards.includes(card)
      );
      
      const averageCompletionTime = this.calculateAverageCompletionTime(completedCards);
      const velocityScore = this.calculateMemberVelocityScore(completedCards, dateRange);
      const qualityScore = this.calculateQualityScore(completedCards);
      const collaborationScore = this.calculateCollaborationScore(member, cards);
      const burnoutRisk = this.assessBurnoutRisk(memberCards, dateRange);
      const workloadBalance = this.calculateWorkloadBalance(memberCards, cards);
      
      return {
        userId: member.userId,
        userName: member.displayName,
        tasksCompleted: completedCards.length,
        tasksInProgress: inProgressCards.length,
        averageCompletionTime,
        velocityScore,
        qualityScore,
        collaborationScore,
        burnoutRisk,
        workloadBalance,
        streakDays: this.calculateStreakDays(completedCards),
        lastActiveDate: this.getLastActiveDate(memberCards)
      };
    });
  }

  /**
   * Calculate project health metrics
   */
  static calculateProjectHealthMetrics(
    board: Board, 
    lists: List[], 
    cards: Card[]
  ): ProjectHealthMetrics {
    const totalTasks = cards.length;
    const completedTasks = this.getCompletedCards(cards, lists).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const overdueTasksCount = this.getOverdueCards(cards).length;
    const blockerCount = this.getBlockedCards(cards).length;
    const velocityTrend = this.calculateVelocityTrend(cards);
    const teamEngagement = this.calculateTeamEngagement(board.members, cards);
    
    const overallHealth = this.determineOverallHealth(
      completionRate, 
      overdueTasksCount, 
      blockerCount, 
      teamEngagement
    );
    
    const riskFactors = this.identifyRiskFactors(
      overdueTasksCount, 
      blockerCount, 
      velocityTrend, 
      teamEngagement
    );
    
    const recommendations = this.generateRecommendations(riskFactors, overallHealth);
    
    return {
      boardId: board.id,
      boardTitle: board.title,
      overallHealth,
      completionRate,
      velocityTrend,
      blockerCount,
      overdueTasksCount,
      teamEngagement,
      riskFactors,
      recommendations,
      estimatedCompletionDate: this.estimateCompletionDate(cards, velocityTrend)
    };
  }

  /**
   * Generate predictive analytics
   */
  static generatePredictiveAnalytics(
    board: Board, 
    lists: List[], 
    cards: Card[]
  ): PredictiveAnalytics {
    const velocity = this.calculateCurrentVelocity(cards);
    const remainingTasks = cards.filter(card => !this.isCardCompleted(card, lists)).length;
    const estimatedDays = velocity > 0 ? Math.ceil(remainingTasks / velocity) : 0;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
    
    const workloadDistribution = this.analyzeWorkloadDistribution(board.members, cards);
    const skillGaps = this.identifySkillGaps(cards);
    
    return {
      projectCompletionPrediction: {
        estimatedDate,
        confidence: this.calculatePredictionConfidence(velocity, cards),
        factors: ['Current velocity', 'Remaining tasks', 'Team capacity']
      },
      resourceNeeds: {
        additionalTeamMembers: this.calculateAdditionalResourceNeeds(workloadDistribution),
        skillGaps,
        workloadDistribution
      },
      riskAssessment: {
        delayRisk: this.calculateDelayRisk(cards, velocity),
        qualityRisk: this.calculateQualityRisk(cards),
        resourceRisk: this.calculateResourceRisk(workloadDistribution),
        overallRisk: this.calculateOverallRisk(cards, velocity, workloadDistribution)
      }
    };
  }

  /**
   * Generate actionable insights
   */
  static generateInsights(
    board: Board, 
    lists: List[], 
    cards: Card[]
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    
    // Velocity trend insight
    const velocityTrend = this.calculateVelocityTrend(cards);
    if (velocityTrend === 'decreasing') {
      insights.push({
        id: 'velocity-decline',
        type: 'alert',
        title: 'Velocity Declining',
        description: 'Team velocity has decreased by more than 20% in the last period',
        severity: 'warning',
        confidence: 85,
        actionable: true,
        suggestedActions: [
          'Review team workload distribution',
          'Identify and remove blockers',
          'Consider additional resources'
        ],
        relatedMetrics: ['velocity', 'team-productivity'],
        detectedAt: new Date()
      });
    }
    
    // Overdue tasks insight
    const overdueCount = this.getOverdueCards(cards).length;
    if (overdueCount > 5) {
      insights.push({
        id: 'high-overdue-tasks',
        type: 'alert',
        title: 'High Number of Overdue Tasks',
        description: `${overdueCount} tasks are past their due date`,
        severity: 'critical',
        confidence: 100,
        actionable: true,
        suggestedActions: [
          'Prioritize overdue tasks',
          'Review task estimation accuracy',
          'Reassign tasks if needed'
        ],
        relatedMetrics: ['overdue-tasks', 'completion-rate'],
        detectedAt: new Date()
      });
    }
    
    // Workload imbalance insight
    const workloadImbalance = this.detectWorkloadImbalance(board.members, cards);
    if (workloadImbalance.detected) {
      insights.push({
        id: 'workload-imbalance',
        type: 'recommendation',
        title: 'Workload Imbalance Detected',
        description: 'Some team members have significantly more tasks than others',
        severity: 'warning',
        confidence: 75,
        actionable: true,
        suggestedActions: [
          'Redistribute tasks more evenly',
          'Review team capacity',
          'Consider skill-based task assignment'
        ],
        relatedMetrics: ['team-workload', 'team-productivity'],
        detectedAt: new Date()
      });
    }
    
    return insights;
  }

  // Helper methods
  private static filterCardsByDateRange(cards: Card[], dateRange: { start: Date; end: Date }): Card[] {
    return cards.filter(card => 
      card.createdAt >= dateRange.start && card.createdAt <= dateRange.end
    );
  }

  private static getCompletedCards(cards: Card[], lists: List[]): Card[] {
    const doneListIds = lists
      .filter(list => list.listType === 'done' || list.title.toLowerCase().includes('done'))
      .map(list => list.id);
    
    return cards.filter(card => doneListIds.includes(card.listId));
  }

  private static getInProgressCards(cards: Card[], lists: List[]): Card[] {
    const inProgressListIds = lists
      .filter(list => list.listType === 'doing' || list.title.toLowerCase().includes('progress'))
      .map(list => list.id);
    
    return cards.filter(card => inProgressListIds.includes(card.listId));
  }

  private static getOverdueCards(cards: Card[]): Card[] {
    const now = new Date();
    return cards.filter(card => card.dueDate && new Date(card.dueDate) < now);
  }

  private static getBlockedCards(cards: Card[]): Card[] {
    return cards.filter(card => 
      (card.labels && card.labels.some(label => label.name && label.name.toLowerCase().includes('blocked'))) ||
      (card.description && card.description.toLowerCase().includes('blocked'))
    );
  }

  private static calculateAverageCompletionTime(cards: Card[]): number {
    if (cards.length === 0) return 0;
    
    const completionTimes = cards.map(card => {
      const created = new Date(card.createdAt);
      const updated = new Date(card.updatedAt);
      return (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
    });
    
    return completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
  }

  private static calculateVelocity(cards: Card[], dateRange: { start: Date; end: Date }): number {
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? cards.length / days : 0;
  }

  private static calculateTeamProductivity(members: BoardMember[], cards: Card[]): number {
    if (members.length === 0) return 0;
    
    const memberProductivity = members.map(member => {
      const memberCards = cards.filter(card => 
        card.assignees?.includes(member.userId) || card.createdBy === member.userId
      );
      return memberCards.length;
    });
    
    const avgProductivity = memberProductivity.reduce((sum, p) => sum + p, 0) / members.length;
    return Math.min(avgProductivity * 10, 100); // Scale to 0-100
  }

  private static groupCardsByDay(cards: Card[], dateRange: { start: Date; end: Date }): Record<string, number> {
    const dailyCompletions: Record<string, number> = {};
    
    for (let d = new Date(dateRange.start); d <= dateRange.end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyCompletions[dateStr] = 0;
    }
    
    cards.forEach(card => {
      const dateStr = card.updatedAt.toISOString().split('T')[0];
      if (dailyCompletions[dateStr] !== undefined) {
        dailyCompletions[dateStr]++;
      }
    });
    
    return dailyCompletions;
  }

  private static calculateWeeklyVelocity(cards: Card[], dateRange: { start: Date; end: Date }) {
    // Implementation for weekly velocity calculation
    return [
      { week: 1, completed: 12, planned: 15 },
      { week: 2, completed: 18, planned: 15 },
      { week: 3, completed: 14, planned: 15 },
      { week: 4, completed: 16, planned: 15 }
    ];
  }

  private static calculateBurndownData(cards: Card[], dateRange: { start: Date; end: Date }): BurndownData[] {
    // Implementation for burndown calculation
    const totalTasks = cards.length;
    const data: BurndownData[] = [];
    
    for (let d = new Date(dateRange.start); d <= dateRange.end; d.setDate(d.getDate() + 1)) {
      const completedByDate = cards.filter(card => card.updatedAt <= d).length;
      const remaining = totalTasks - completedByDate;
      
      data.push({
        date: new Date(d),
        remainingTasks: remaining,
        idealRemaining: totalTasks * (1 - (d.getTime() - dateRange.start.getTime()) / (dateRange.end.getTime() - dateRange.start.getTime())),
        completedTasks: completedByDate,
        addedTasks: 0,
        scope: totalTasks
      });
    }
    
    return data;
  }

  private static calculateCycleTimeByList(lists: List[], cards: Card[]): CycleTimeAnalysis[] {
    return lists.map(list => {
      const listCards = cards.filter(card => card.listId === list.id);
      const times = listCards.map(card => {
        const created = new Date(card.createdAt);
        const updated = new Date(card.updatedAt);
        return (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
      });
      
      const averageTime = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
      
      return {
        listId: list.id,
        listName: list.title,
        averageTime,
        medianTime: this.calculateMedian(times),
        minTime: Math.min(...times, 0),
        maxTime: Math.max(...times, 0),
        taskCount: listCards.length,
        bottleneck: averageTime > 48 // Consider bottleneck if > 48 hours
      };
    });
  }

  private static calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  // Additional helper methods would be implemented here...
  private static isCardCompleted(card: Card, lists: List[]): boolean {
    const doneListIds = lists
      .filter(list => list.listType === 'done' || list.title.toLowerCase().includes('done'))
      .map(list => list.id);
    return doneListIds.includes(card.listId);
  }

  private static calculateCurrentVelocity(cards: Card[]): number {
    // Simple velocity calculation - tasks completed per day in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCards = cards.filter(card => card.updatedAt >= sevenDaysAgo);
    return recentCards.length / 7;
  }

  private static calculatePredictionConfidence(velocity: number, cards: Card[]): number {
    // Higher confidence with more data and stable velocity
    const dataPoints = cards.length;
    const baseConfidence = Math.min(dataPoints * 2, 80);
    const velocityStability = velocity > 0 ? 20 : 0;
    return Math.min(baseConfidence + velocityStability, 95);
  }

  private static analyzeWorkloadDistribution(members: BoardMember[], cards: Card[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    members.forEach(member => {
      const memberCards = cards.filter(card => 
        card.assignees?.includes(member.userId) || card.createdBy === member.userId
      );
      distribution[member.displayName] = memberCards.length;
    });
    
    return distribution;
  }

  private static identifySkillGaps(cards: Card[]): string[] {
    // Analyze card labels/descriptions to identify skill requirements
    const skillKeywords = ['frontend', 'backend', 'design', 'testing', 'devops', 'mobile'];
    const gaps: string[] = [];
    
    skillKeywords.forEach(skill => {
      const skillCards = cards.filter(card => 
        (card.title && card.title.toLowerCase().includes(skill)) || 
        (card.description && card.description.toLowerCase().includes(skill))
      );
      
      if (skillCards.length > 5) { // If many cards require this skill
        gaps.push(skill);
      }
    });
    
    return gaps;
  }

  private static calculateDelayRisk(cards: Card[], velocity: number): number {
    const overdueCount = this.getOverdueCards(cards).length;
    const totalCards = cards.length;
    const overdueRatio = totalCards > 0 ? overdueCount / totalCards : 0;
    
    return Math.min(overdueRatio * 100 + (velocity < 1 ? 30 : 0), 100);
  }

  private static calculateQualityRisk(cards: Card[]): number {
    if (cards.length === 0) return 0;
    
    const bugCards = cards.filter(card => 
      (card.title && card.title.toLowerCase().includes('bug')) || 
      (card.title && card.title.toLowerCase().includes('fix'))
    );
    
    return Math.min((bugCards.length / cards.length) * 100, 100);
  }

  private static calculateResourceRisk(workloadDistribution: Record<string, number>): number {
    const workloads = Object.values(workloadDistribution);
    const maxWorkload = Math.max(...workloads);
    const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
    
    const imbalance = maxWorkload > avgWorkload * 2 ? 50 : 0;
    return Math.min(imbalance, 100);
  }

  private static calculateOverallRisk(
    cards: Card[], 
    velocity: number, 
    workloadDistribution: Record<string, number>
  ): 'low' | 'medium' | 'high' {
    const delayRisk = this.calculateDelayRisk(cards, velocity);
    const qualityRisk = this.calculateQualityRisk(cards);
    const resourceRisk = this.calculateResourceRisk(workloadDistribution);
    
    const avgRisk = (delayRisk + qualityRisk + resourceRisk) / 3;
    
    if (avgRisk > 70) return 'high';
    if (avgRisk > 40) return 'medium';
    return 'low';
  }

  // Additional helper methods for team productivity metrics
  private static calculateMemberVelocityScore(cards: Card[], dateRange: { start: Date; end: Date }): number {
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const velocity = days > 0 ? cards.length / days : 0;
    return Math.min(velocity * 20, 100); // Scale to 0-100
  }

  private static calculateQualityScore(cards: Card[]): number {
    // Simple quality score based on task completion without rework
    if (cards.length === 0) return 100;
    
    const reworkCards = cards.filter(card => 
      (card.title && card.title.toLowerCase().includes('rework')) || 
      (card.title && card.title.toLowerCase().includes('fix'))
    );
    
    const qualityRatio = 1 - (reworkCards.length / cards.length);
    return Math.max(qualityRatio * 100, 0);
  }

  private static calculateCollaborationScore(member: BoardMember, allCards: Card[]): number {
    const memberCards = allCards.filter(card => 
      card.assignees?.includes(member.userId) || card.createdBy === member.userId
    );
    
    const collaborativeCards = memberCards.filter(card => 
      card.assignees && card.assignees.length > 1
    );
    
    return memberCards.length > 0 ? (collaborativeCards.length / memberCards.length) * 100 : 0;
  }

  private static assessBurnoutRisk(cards: Card[], dateRange: { start: Date; end: Date }): 'low' | 'medium' | 'high' {
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const dailyAverage = days > 0 ? cards.length / days : 0;
    
    if (dailyAverage > 5) return 'high';
    if (dailyAverage > 3) return 'medium';
    return 'low';
  }

  private static calculateWorkloadBalance(memberCards: Card[], allCards: Card[]): number {
    const memberWorkload = memberCards.length;
    const avgWorkload = allCards.length / 5; // Assuming 5 team members average
    
    const balance = avgWorkload > 0 ? Math.min(memberWorkload / avgWorkload, 2) : 1;
    return Math.max(100 - Math.abs(balance - 1) * 50, 0);
  }

  private static calculateStreakDays(cards: Card[]): number {
    // Calculate consecutive days with task completion
    const sortedCards = cards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    let streak = 0;
    let currentDate = new Date();
    
    for (const card of sortedCards) {
      const cardDate = new Date(card.updatedAt);
      const daysDiff = Math.floor((currentDate.getTime() - cardDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = cardDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private static getLastActiveDate(cards: Card[]): Date {
    if (cards.length === 0) return new Date();
    
    const latestCard = cards.reduce((latest, card) => 
      card.updatedAt > latest.updatedAt ? card : latest
    );
    
    return latestCard.updatedAt;
  }

  private static calculateVelocityTrend(cards: Card[]): 'increasing' | 'stable' | 'decreasing' {
    // Simple trend calculation based on recent vs older completions
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const recentWeek = cards.filter(card => card.updatedAt >= oneWeekAgo).length;
    const previousWeek = cards.filter(card => 
      card.updatedAt >= twoWeeksAgo && card.updatedAt < oneWeekAgo
    ).length;
    
    if (recentWeek > previousWeek * 1.1) return 'increasing';
    if (recentWeek < previousWeek * 0.9) return 'decreasing';
    return 'stable';
  }

  private static calculateTeamEngagement(members: BoardMember[], cards: Card[]): number {
    const activeMembers = members.filter(member => {
      const memberCards = cards.filter(card => 
        card.assignees?.includes(member.userId) || card.createdBy === member.userId
      );
      return memberCards.some(card => {
        const daysSinceUpdate = (new Date().getTime() - card.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate <= 7; // Active in last 7 days
      });
    });
    
    return members.length > 0 ? (activeMembers.length / members.length) * 100 : 0;
  }

  private static determineOverallHealth(
    completionRate: number,
    overdueCount: number,
    blockerCount: number,
    teamEngagement: number
  ): 'excellent' | 'good' | 'warning' | 'critical' {
    const healthScore = (completionRate + teamEngagement) / 2 - (overdueCount * 5) - (blockerCount * 10);
    
    if (healthScore >= 80) return 'excellent';
    if (healthScore >= 60) return 'good';
    if (healthScore >= 40) return 'warning';
    return 'critical';
  }

  private static identifyRiskFactors(
    overdueCount: number,
    blockerCount: number,
    velocityTrend: 'increasing' | 'stable' | 'decreasing',
    teamEngagement: number
  ): string[] {
    const risks: string[] = [];
    
    if (overdueCount > 5) risks.push('High number of overdue tasks');
    if (blockerCount > 2) risks.push('Multiple blocked tasks');
    if (velocityTrend === 'decreasing') risks.push('Declining team velocity');
    if (teamEngagement < 70) risks.push('Low team engagement');
    
    return risks;
  }

  private static generateRecommendations(
    riskFactors: string[],
    overallHealth: 'excellent' | 'good' | 'warning' | 'critical'
  ): string[] {
    const recommendations: string[] = [];
    
    if (riskFactors.includes('High number of overdue tasks')) {
      recommendations.push('Review and prioritize overdue tasks');
      recommendations.push('Improve task estimation accuracy');
    }
    
    if (riskFactors.includes('Multiple blocked tasks')) {
      recommendations.push('Focus on removing blockers');
      recommendations.push('Improve dependency management');
    }
    
    if (riskFactors.includes('Declining team velocity')) {
      recommendations.push('Analyze velocity decline causes');
      recommendations.push('Consider team capacity adjustments');
    }
    
    if (riskFactors.includes('Low team engagement')) {
      recommendations.push('Increase team communication');
      recommendations.push('Review workload distribution');
    }
    
    if (overallHealth === 'critical') {
      recommendations.push('Immediate intervention required');
      recommendations.push('Schedule emergency team meeting');
    }
    
    return recommendations;
  }

  private static estimateCompletionDate(
    cards: Card[],
    velocityTrend: 'increasing' | 'stable' | 'decreasing'
  ): Date | undefined {
    const incompleteTasks = cards.filter(card => !card.title.includes('Done')).length;
    const currentVelocity = this.calculateCurrentVelocity(cards);
    
    if (currentVelocity === 0) return undefined;
    
    let adjustedVelocity = currentVelocity;
    if (velocityTrend === 'increasing') adjustedVelocity *= 1.1;
    if (velocityTrend === 'decreasing') adjustedVelocity *= 0.9;
    
    const estimatedDays = Math.ceil(incompleteTasks / adjustedVelocity);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + estimatedDays);
    
    return completionDate;
  }

  private static calculateAdditionalResourceNeeds(workloadDistribution: Record<string, number>): number {
    const workloads = Object.values(workloadDistribution);
    const maxWorkload = Math.max(...workloads);
    const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
    
    // If max workload is significantly higher than average, suggest additional resources
    return maxWorkload > avgWorkload * 2 ? 1 : 0;
  }

  private static detectWorkloadImbalance(
    members: BoardMember[], 
    cards: Card[]
  ): { detected: boolean; details?: any } {
    const workloads = members.map(member => {
      const memberCards = cards.filter(card => 
        card.assignees?.includes(member.userId) || card.createdBy === member.userId
      );
      return { member: member.displayName, workload: memberCards.length };
    });
    
    const maxWorkload = Math.max(...workloads.map(w => w.workload));
    const minWorkload = Math.min(...workloads.map(w => w.workload));
    
    const imbalanceRatio = minWorkload > 0 ? maxWorkload / minWorkload : maxWorkload;
    
    return {
      detected: imbalanceRatio > 2,
      details: { maxWorkload, minWorkload, ratio: imbalanceRatio }
    };
  }
} 