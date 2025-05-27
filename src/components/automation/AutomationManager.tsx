'use client';

import React, { useState, useEffect } from 'react';
import { BoardAutomation, AutomationRule, Board, List, Label } from '@/types';
import { 
  getBoardAutomations, 
  createBoardAutomation, 
  updateBoardAutomation, 
  deleteBoardAutomation,
  BUILT_IN_AUTOMATION_TEMPLATES 
} from '@/services/automationService';
import { X, Plus, Settings, Zap, Clock, Tag, Users, CheckSquare, ArrowRight } from 'lucide-react';

interface AutomationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  lists: List[];
}

export const AutomationManager: React.FC<AutomationManagerProps> = ({
  isOpen,
  onClose,
  board,
  lists,
}) => {
  const [automations, setAutomations] = useState<BoardAutomation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'templates'>('active');
  const [editingAutomation, setEditingAutomation] = useState<BoardAutomation | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAutomations();
    }
  }, [isOpen, board.id]);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const boardAutomations = await getBoardAutomations(board.id);
      setAutomations(boardAutomations);
    } catch (error) {
      console.error('Error loading automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (template: any) => {
    try {
      const newAutomation = {
        boardId: board.id,
        name: template.name,
        description: template.description,
        rules: template.rules,
        isActive: true,
        createdBy: '', // Will be set by the service
      };

      await createBoardAutomation(newAutomation);
      await loadAutomations();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating automation:', error);
    }
  };

  const handleCreateCustomRule = async (ruleName: string, ruleType: string) => {
    try {
      let rules: AutomationRule[] = [];
      
      // Create a simple rule based on type
      switch (ruleType) {
        case 'feature_development':
          rules = [{
            id: 'feature-checklist',
            type: 'add_checklist',
            trigger: { type: 'card_created' },
            action: {
              type: 'add_checklist',
              checklistTemplate: {
                title: 'Development Checklist',
                items: [
                  { id: '1', text: 'Requirements review', completed: false, createdAt: new Date(), updatedAt: new Date() },
                  { id: '2', text: 'Technical design', completed: false, createdAt: new Date(), updatedAt: new Date() },
                  { id: '3', text: 'Implementation', completed: false, createdAt: new Date(), updatedAt: new Date() },
                  { id: '4', text: 'Code review', completed: false, createdAt: new Date(), updatedAt: new Date() },
                  { id: '5', text: 'Testing', completed: false, createdAt: new Date(), updatedAt: new Date() }
                ]
              }
            },
            isActive: true,
            conditions: [{
              type: 'title_contains',
              operator: 'contains',
              value: 'feature'
            }]
          }];
          break;
        case 'bug_workflow':
          rules = [{
            id: 'bug-auto-label',
            type: 'assign_labels',
            trigger: { type: 'card_created' },
            action: {
              type: 'add_labels',
              labelIds: ['bug']
            },
            isActive: true,
            conditions: [{
              type: 'title_contains',
              operator: 'contains',
              value: 'bug'
            }]
          }];
          break;
        case 'done_automation':
          const doneList = lists.find(l => l.title.toLowerCase().includes('done'));
          if (doneList) {
            rules = [{
              id: 'done-completion',
              type: 'assign_labels',
              trigger: { type: 'card_moved', listId: doneList.id },
              action: {
                type: 'add_labels',
                labelIds: ['completed']
              },
              isActive: true
            }];
          }
          break;
      }

      const newAutomation = {
        boardId: board.id,
        name: ruleName,
        description: `Custom automation rule: ${ruleName}`,
        rules,
        isActive: true,
        createdBy: '', // Will be set by the service
      };

      await createBoardAutomation(newAutomation);
      await loadAutomations();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating custom automation:', error);
    }
  };

  const handleToggleAutomation = async (automation: BoardAutomation) => {
    try {
      await updateBoardAutomation(automation.id, {
        isActive: !automation.isActive
      });
      await loadAutomations();
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      await deleteBoardAutomation(automationId);
      await loadAutomations();
    } catch (error) {
      console.error('Error deleting automation:', error);
    }
  };

  const formatTrigger = (rule: AutomationRule) => {
    switch (rule.trigger.type) {
      case 'card_created':
        return 'When a card is created';
      case 'card_moved':
        const list = lists.find(l => l.id === rule.trigger.listId);
        return `When a card is moved to "${list?.title || 'Unknown List'}"`;
      case 'label_added':
        const label = board.labels?.find(l => l.id === rule.trigger.labelId);
        return `When label "${label?.name || 'Unknown Label'}" is added`;
      case 'due_date_approaching':
        return `${rule.trigger.daysBeforeDue || 1} days before due date`;
      default:
        return rule.trigger.type;
    }
  };

  const formatAction = (rule: AutomationRule) => {
    switch (rule.action.type) {
      case 'set_due_date':
        const offset = rule.action.dueDateOffset;
        if (offset) {
          return `Set due date to ${offset.value} ${offset.type} from ${offset.from}`;
        }
        return 'Set due date';
      case 'add_labels':
        return `Add ${rule.action.labelIds?.length || 0} labels`;
      case 'assign_members':
        return `Assign ${rule.action.memberIds?.length || 0} members`;
      case 'move_to_list':
        const targetList = lists.find(l => l.id === rule.action.targetListId);
        return `Move to "${targetList?.title || 'Unknown List'}"`;
      case 'add_checklist':
        return `Add checklist "${rule.action.checklistTemplate?.title || 'Checklist'}"`;
      default:
        return rule.action.type;
    }
  };

  const getRuleIcon = (ruleType: string) => {
    switch (ruleType) {
      case 'due_date':
        return <Clock className="h-4 w-4" />;
      case 'assign_labels':
        return <Tag className="h-4 w-4" />;
      case 'assign_members':
        return <Users className="h-4 w-4" />;
      case 'add_checklist':
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-semibold">Board Automation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setSelectedTab('active')}
            className={`px-4 py-2 font-medium ${
              selectedTab === 'active'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Rules ({automations.filter(a => a.isActive).length})
          </button>
          <button
            onClick={() => setSelectedTab('templates')}
            className={`px-4 py-2 font-medium ${
              selectedTab === 'templates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {selectedTab === 'active' && (
            <div className="space-y-4">
              {/* Create Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Automation Rules</h3>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Rule
                </button>
              </div>

              {/* Create Form */}
              {showCreateForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Create Quick Automation Rule</h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    <button
                      onClick={() => handleCreateCustomRule('Feature Development Workflow', 'feature_development')}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CheckSquare className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">Feature Development</span>
                      </div>
                      <p className="text-xs text-gray-600">Auto-add development checklist to cards with "feature" in title</p>
                    </button>
                    
                    <button
                      onClick={() => handleCreateCustomRule('Bug Workflow', 'bug_workflow')}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-red-300 text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-sm">Bug Workflow</span>
                      </div>
                      <p className="text-xs text-gray-600">Auto-label cards with "bug" in title</p>
                    </button>
                    
                    <button
                      onClick={() => handleCreateCustomRule('Done List Automation', 'done_automation')}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-green-300 text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm">Done Automation</span>
                      </div>
                      <p className="text-xs text-gray-600">Auto-label cards moved to Done list</p>
                    </button>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : automations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No automation rules yet</p>
                  <p className="text-sm">Create rules to automate your workflow</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {automations.map((automation) => (
                    <div
                      key={automation.id}
                      className={`p-4 border rounded-lg ${
                        automation.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{automation.name}</h4>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                automation.isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {automation.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          {automation.description && (
                            <p className="text-sm text-gray-600 mb-3">{automation.description}</p>
                          )}

                          {/* Rules */}
                          <div className="space-y-2">
                            {automation.rules.map((rule, index) => (
                              <div key={index} className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  {getRuleIcon(rule.type)}
                                  <span>{formatTrigger(rule)}</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                                <div className="flex items-center gap-2 text-gray-900">
                                  {getRuleIcon(rule.action.type)}
                                  <span>{formatAction(rule)}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>Executed {automation.executionCount} times</span>
                            {automation.lastExecuted && (
                              <span>
                                Last run: {new Date(automation.lastExecuted).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleToggleAutomation(automation)}
                            className={`px-3 py-1 text-sm rounded ${
                              automation.isActive
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {automation.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => setEditingAutomation(automation)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAutomation(automation.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Automation Templates</h3>
              <p className="text-gray-600">
                Choose from pre-built automation templates to quickly set up common workflows.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {BUILT_IN_AUTOMATION_TEMPLATES.map((template, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      <button
                        onClick={() => handleCreateFromTemplate(template)}
                        className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
                      >
                        Use Template
                      </button>
                    </div>

                    {/* Template Rules Preview */}
                    <div className="space-y-2">
                      {template.rules.slice(0, 2).map((rule, ruleIndex) => (
                        <div key={ruleIndex} className="flex items-center gap-2 text-xs text-gray-500">
                          {getRuleIcon(rule.type)}
                          <span>{formatTrigger(rule as AutomationRule)}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{formatAction(rule as AutomationRule)}</span>
                        </div>
                      ))}
                      {template.rules.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{template.rules.length - 2} more rules
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 