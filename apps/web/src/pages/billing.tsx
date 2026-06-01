import React, { useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    features: ['Up to 100 investors', 'Basic CRM', 'Email campaigns', '1 team member'],
    current: false,
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    features: ['Up to 1000 investors', 'Advanced CRM + AI', 'Unlimited campaigns', 'Up to 5 team members', 'Priority support'],
    current: true,
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: '/month',
    features: ['Unlimited investors', 'Full platform access', 'Dedicated account manager', 'Custom integrations', '24/7 support'],
    current: false,
  },
];

export default function Billing() {
  const [tab, setTab] = useState('overview');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('overview')}
            className={`px-6 py-3 font-medium border-b-2 ${
              tab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-6 py-3 font-medium border-b-2 ${
              tab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Billing History
          </button>
          <button
            onClick={() => setTab('usage')}
            className={`px-6 py-3 font-medium border-b-2 ${
              tab === 'usage'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Usage
          </button>
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Current Plan</h2>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-3xl font-bold text-gray-900">Professional</p>
                  <p className="text-gray-600 mt-1">$99/month</p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium text-sm">Active</span>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Next billing date: <span className="font-medium text-gray-900">June 15, 2026</span></p>
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Upgrade Plan
              </button>
            </div>

            {/* Plans Comparison */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Available Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`p-6 rounded-lg border-2 ${
                      plan.current
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {plan.current && (
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold mb-3">
                        Current Plan
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-4">
                      {plan.price}
                      <span className="text-base font-normal text-gray-600">{plan.period}</span>
                    </p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <span className="text-green-600 mr-3">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {!plan.current && (
                      <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
                        Upgrade to {plan.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Billing Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Card</p>
                  <p className="font-medium text-gray-900">Visa ending in 4242</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expires</p>
                  <p className="font-medium text-gray-900">12/2028</p>
                </div>
              </div>
              <button className="mt-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium text-sm">
                Update Payment Method
              </button>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3].map((item) => (
                  <tr key={item} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">May 15, 2026</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Professional Plan</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">$99.00</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'usage' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Team Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">4 / 5</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Investors Database</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">328 / 1,000</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '33%'}}></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Startups Tracked</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">45 / Unlimited</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
