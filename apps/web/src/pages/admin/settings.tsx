import React, { useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    organizationName: 'TechVentures',
    email: 'admin@techventures.com',
    timezone: 'America/New_York',
    language: 'en',
    twoFactor: true,
    dataRetention: '90days',
  });

  const handleChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage organization settings and preferences</p>
        </div>

        {/* Organization Settings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Organization</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => handleChange('organizationName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>Europe/London</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Security Settings */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Security</h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={(e) => handleChange('twoFactor', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">Require two-factor authentication</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Retention</label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => handleChange('dataRetention', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30days">30 days</option>
                  <option value="90days">90 days</option>
                  <option value="1year">1 year</option>
                  <option value="indefinite">Indefinite</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Integrations */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Connected Integrations</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Slack</p>
                  <p className="text-sm text-gray-600">Connected</p>
                </div>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">Disconnect</button>
              </div>

              <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Stripe</p>
                  <p className="text-sm text-gray-600">Connected</p>
                </div>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">Disconnect</button>
              </div>

              <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Gmail</p>
                  <p className="text-sm text-gray-600">Not connected</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Connect</button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Save Changes
          </button>
          <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
            Cancel
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
