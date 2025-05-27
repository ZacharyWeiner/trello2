'use client';

import React, { useState, useEffect } from 'react';
import { CardTemplate, TemplateCategory } from '@/types';
import { 
  getAllTemplates, 
  getTemplatesByCategory, 
  BUILT_IN_CATEGORIES,
  applyTemplate 
} from '@/services/templateService';
import { X, Search, Clock, Users, CheckSquare, Tag, Sparkles } from 'lucide-react';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (templateData: any) => void;
  listId: string;
  boardId: string;
  position: number;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  listId,
  boardId,
  position,
}) => {
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [categories] = useState<TemplateCategory[]>(BUILT_IN_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [customizations, setCustomizations] = useState({
    title: '',
    assignees: [] as string[],
    dueDate: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      let loadedTemplates: CardTemplate[];
      if (selectedCategory === 'all') {
        loadedTemplates = await getAllTemplates();
      } else {
        loadedTemplates = await getTemplatesByCategory(selectedCategory);
      }
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateSelect = (template: CardTemplate) => {
    setSelectedTemplate(template);
    setCustomizations({
      title: template.title,
      assignees: template.assignees || [],
      dueDate: '',
    });
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const templateData = await applyTemplate(
        selectedTemplate,
        listId,
        boardId,
        position,
        {
          title: customizations.title || selectedTemplate.title,
          assignees: customizations.assignees,
          dueDate: customizations.dueDate ? new Date(customizations.dueDate) : undefined,
        }
      );

      onApplyTemplate(templateData);
      onClose();
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📋';
  };

  const formatAutomationRules = (template: CardTemplate) => {
    if (!template.automationRules || template.automationRules.length === 0) {
      return 'No automation';
    }

    return template.automationRules.map(rule => {
      switch (rule.type) {
        case 'due_date':
          const offset = rule.action.dueDateOffset;
          if (offset) {
            return `Auto due date: ${offset.value} ${offset.type} from ${offset.from}`;
          }
          return 'Auto due date';
        case 'assign_labels':
          return `Auto labels: ${rule.action.labelIds?.length || 0} labels`;
        case 'assign_members':
          return `Auto assign: ${rule.action.memberIds?.length || 0} members`;
        default:
          return `Auto ${rule.type}`;
      }
    }).join(', ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-semibold">Choose a Template</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📋</span>
                  <span>All Templates</span>
                </div>
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Template List */}
            <div className="w-1/2 p-4 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          {template.description && (
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          )}
                          
                          {/* Template Stats */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {template.labels && template.labels.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                <span>{template.labels.length} labels</span>
                              </div>
                            )}
                            {template.checklists && template.checklists.length > 0 && (
                              <div className="flex items-center gap-1">
                                <CheckSquare className="h-3 w-3" />
                                <span>{template.checklists.length} checklists</span>
                              </div>
                            )}
                            {template.automationRules && template.automationRules.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                <span>Auto</span>
                              </div>
                            )}
                          </div>
                          
                          {template.isBuiltIn && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                              Built-in
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredTemplates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No templates found</p>
                      <p className="text-sm">Try adjusting your search or category filter</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Template Preview */}
            <div className="w-1/2 border-l bg-gray-50 p-4 overflow-y-auto">
              {selectedTemplate ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h3>
                    {selectedTemplate.description && (
                      <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
                    )}
                  </div>

                  {/* Customization */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Customize</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Title
                      </label>
                      <input
                        type="text"
                        value={customizations.title}
                        onChange={(e) => setCustomizations({ ...customizations, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={selectedTemplate.title}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={customizations.dueDate}
                        onChange={(e) => setCustomizations({ ...customizations, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Template Preview */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Preview</h4>
                    
                    {selectedTemplate.labels && selectedTemplate.labels.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Labels</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTemplate.labels.map((label, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: label.color, color: 'white' }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTemplate.checklists && selectedTemplate.checklists.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Checklists</p>
                        <div className="space-y-2">
                          {selectedTemplate.checklists.map((checklist, index) => (
                            <div key={index} className="bg-white p-3 rounded border">
                              <p className="font-medium text-sm">{checklist.title}</p>
                              <p className="text-xs text-gray-500">{(checklist.items || []).length} items</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTemplate.automationRules && selectedTemplate.automationRules.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Automation</p>
                        <div className="bg-purple-50 p-3 rounded border border-purple-200">
                          <p className="text-sm text-purple-700">
                            {formatAutomationRules(selectedTemplate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <div className="pt-4 border-t">
                    <button
                      onClick={handleApplyTemplate}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Apply Template
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a template to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 