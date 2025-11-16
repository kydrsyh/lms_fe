import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../components/templates';
import { Card, Button, Modal, Input } from '../../components/atoms';
import {
  settingsApi,
  AppSetting,
  SettingCategory,
  SettingUpdatePayload,
} from '../../api/settingsApi';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandler';
import { format } from 'date-fns';
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  Square3Stack3DIcon,
  CreditCardIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const SettingsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [settingToEdit, setSettingToEdit] = useState<AppSetting | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showSensitive, setShowSensitive] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all settings
  const {
    data: settingsResponse,
    isLoading,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getAll,
    onError: (error) => {
      showErrorToast(error, 'Failed to load settings');
    },
  });

  // Update setting mutation
  const updateMutation = useMutation({
    mutationFn: ({
      key,
      payload,
    }: {
      key: string;
      payload: SettingUpdatePayload;
    }) => settingsApi.update(key, payload),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries(['settings']);
      setEditModalOpen(false);
      setSettingToEdit(null);
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to update setting');
    },
  });

  const settings = settingsResponse?.data || [];

  // Filter settings
  const filteredSettings = useMemo(() => {
    let result = settings;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      result = result.filter(
        (s) =>
          s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [settings, selectedCategory, searchQuery]);

  // Group by category
  const settingsByCategory = useMemo(() => {
    return filteredSettings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {} as Record<string, AppSetting[]>);
  }, [filteredSettings]);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; enabled: number }> = {};
    settings.forEach((s) => {
      if (!stats[s.category]) {
        stats[s.category] = { total: 0, enabled: 0 };
      }
      stats[s.category].total++;
      if (s.valueType === 'boolean' && s.parsedValue === true) {
        stats[s.category].enabled++;
      }
    });
    return stats;
  }, [settings]);

  const categories = [
    { 
      value: 'all', 
      label: 'All Settings', 
      icon: Square3Stack3DIcon,
      color: 'text-slate-600 bg-slate-100'
    },
    { 
      value: SettingCategory.FEATURES, 
      label: 'Features', 
      icon: SparklesIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    { 
      value: SettingCategory.INTEGRATIONS, 
      label: 'Integrations', 
      icon: Cog6ToothIcon,
      color: 'text-purple-600 bg-purple-100'
    },
    { 
      value: SettingCategory.SYSTEM, 
      label: 'System', 
      icon: Square3Stack3DIcon,
      color: 'text-amber-600 bg-amber-100'
    },
    { 
      value: SettingCategory.BRANDING, 
      label: 'Branding', 
      icon: CreditCardIcon,
      color: 'text-pink-600 bg-pink-100'
    },
  ];

  const handleEdit = (setting: AppSetting) => {
    setSettingToEdit(setting);
    
    if (setting.valueType === 'boolean') {
      setEditValue(setting.parsedValue ? 'true' : 'false');
    } else if (setting.valueType === 'json') {
      setEditValue(JSON.stringify(setting.parsedValue, null, 2));
    } else {
      setEditValue(String(setting.parsedValue));
    }
    
    setEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!settingToEdit) return;

    let value: string | number | boolean | object = editValue;

    if (settingToEdit.valueType === 'boolean') {
      value = editValue === 'true';
    } else if (settingToEdit.valueType === 'number') {
      value = parseFloat(editValue);
      if (isNaN(value)) {
        showErrorToast(new Error('Invalid number'), 'Please enter a valid number');
        return;
      }
    } else if (settingToEdit.valueType === 'json') {
      try {
        value = JSON.parse(editValue);
      } catch (e) {
        showErrorToast(new Error('Invalid JSON'), 'Please enter valid JSON');
        return;
      }
    }

    updateMutation.mutate({
      key: settingToEdit.key,
      payload: { value },
    });
  };

  const toggleSensitiveVisibility = (id: number) => {
    setShowSensitive((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderValue = (setting: AppSetting) => {
    if (setting.isSensitive && !showSensitive[setting.id]) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">••••••••</span>
          <button
            onClick={() => toggleSensitiveVisibility(setting.id)}
            className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
            title="Show value"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (setting.isSensitive && showSensitive[setting.id]) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-slate-700">{setting.value}</span>
          <button
            onClick={() => toggleSensitiveVisibility(setting.id)}
            className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
            title="Hide value"
          >
            <EyeSlashIcon className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (setting.valueType === 'boolean') {
      return (
        <div className="flex items-center">
          <div
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              setting.parsedValue ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                setting.parsedValue ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
          <span className={`ml-3 text-sm font-medium ${
            setting.parsedValue ? 'text-green-700' : 'text-slate-600'
          }`}>
            {setting.parsedValue ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );
    }

    if (setting.valueType === 'json') {
      return (
        <details className="text-xs">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
            View JSON
          </summary>
          <pre className="mt-2 bg-slate-50 p-3 rounded border border-slate-200 overflow-x-auto text-slate-700">
            {JSON.stringify(setting.parsedValue, null, 2)}
          </pre>
        </details>
      );
    }

    return <span className="font-mono text-sm text-slate-700">{String(setting.parsedValue)}</span>;
  };

  const getCategoryColor = (category: SettingCategory) => {
    switch (category) {
      case SettingCategory.FEATURES:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case SettingCategory.INTEGRATIONS:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case SettingCategory.SYSTEM:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case SettingCategory.BRANDING:
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Application Settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Loading settings...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Application Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Application Settings</h1>
              <p className="text-indigo-100 text-lg">
                Configure feature flags, integrations, and system settings for client deployments
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{settings.length}</div>
              <div className="text-sm text-indigo-100">Total Settings</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="shadow-md">
          <div className="p-4">
            <Input
              type="text"
              placeholder="Search settings by key or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </Card>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = cat.value === 'all' ? settings.length : (categoryStats[cat.value]?.total || 0);
            const enabled = cat.value === 'all' 
              ? Object.values(categoryStats).reduce((sum, s) => sum + s.enabled, 0)
              : (categoryStats[cat.value]?.enabled || 0);
            
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === cat.value
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900">{cat.label}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {count} total {cat.value !== 'all' && `· ${enabled} enabled`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Settings List */}
        {filteredSettings.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <div className="text-slate-400 text-5xl mb-4">🔍</div>
              <p className="text-slate-600 text-lg">No settings found</p>
              <p className="text-slate-500 text-sm mt-2">
                {searchQuery ? 'Try different search terms' : 'No settings in this category'}
              </p>
            </div>
          </Card>
        ) : selectedCategory === 'all' ? (
          // Show grouped by category
          <div className="space-y-6">
            {Object.entries(settingsByCategory).map(([category, categorySettings]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 capitalize flex items-center gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm border ${getCategoryColor(category as SettingCategory)}`}>
                    {category}
                  </span>
                  <span className="text-slate-500 text-sm font-normal">
                    ({categorySettings.length} settings)
                  </span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {categorySettings.map((setting) => (
                    <Card key={setting.id} className="hover:shadow-md transition-shadow">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-mono text-sm font-semibold text-slate-900 truncate">
                                {setting.key}
                              </h4>
                              {!setting.isEditable && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  Read-only
                                </span>
                              )}
                            </div>
                            {setting.description && (
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {setting.description}
                              </p>
                            )}
                          </div>
                          {setting.isEditable && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(setting)}
                              className="ml-3 flex-shrink-0"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex-1">
                            {renderValue(setting)}
                          </div>
                          <span className="text-xs text-slate-400 ml-2">
                            {setting.valueType}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          Updated {format(new Date(setting.updatedAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show single category
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSettings.map((setting) => (
              <Card key={setting.id} className="hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-mono text-sm font-semibold text-slate-900 truncate">
                          {setting.key}
                        </h4>
                        {!setting.isEditable && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Read-only
                          </span>
                        )}
                      </div>
                      {setting.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    {setting.isEditable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(setting)}
                        className="ml-3 flex-shrink-0"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex-1">
                      {renderValue(setting)}
                    </div>
                    <span className="text-xs text-slate-400 ml-2">
                      {setting.valueType}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Updated {format(new Date(setting.updatedAt), 'MMM d, yyyy')}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSettingToEdit(null);
          }}
          title="Edit Setting"
        >
          <div className="space-y-5">
            {settingToEdit && (
              <>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-xs text-slate-500 mb-1">Setting Key</div>
                  <div className="font-mono text-sm font-semibold text-slate-900">
                    {settingToEdit.key}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    {settingToEdit.description || 'No description available'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Value ({settingToEdit.valueType})
                  </label>
                  {settingToEdit.valueType === 'boolean' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setEditValue('true')}
                        className={`p-4 rounded-lg border-2 font-medium transition-all ${
                          editValue === 'true'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <CheckIcon className="w-5 h-5 mx-auto mb-1" />
                        Enabled
                      </button>
                      <button
                        onClick={() => setEditValue('false')}
                        className={`p-4 rounded-lg border-2 font-medium transition-all ${
                          editValue === 'false'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <XMarkIcon className="w-5 h-5 mx-auto mb-1" />
                        Disabled
                      </button>
                    </div>
                  ) : settingToEdit.valueType === 'json' ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={10}
                      className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="Enter valid JSON"
                    />
                  ) : (
                    <Input
                      type={settingToEdit.valueType === 'number' ? 'number' : 'text'}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={`Enter ${settingToEdit.valueType} value`}
                      className="font-mono"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditModalOpen(false);
                      setSettingToEdit(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleUpdate}
                    disabled={updateMutation.isLoading}
                  >
                    {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default SettingsManagement;
