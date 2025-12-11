'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateOrderForm from '@/components/CreateOrderForm';
import OrderList from '@/components/OrderList';
import { seedDemoData } from '@/lib/orders';

export default function OrdersPage() {
  const { tenantId, role, username, logout } = useAuth();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId || !role || !username) {
      router.push('/login');
    }
  }, [tenantId, role, username, router]);

  const tenantName = tenantId === 'tenantA' ? 'Tenant A' : 'Tenant B';

  const handleOrderCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedError(null);
    try {
      await seedDemoData();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : 'Failed to seed demo data');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!tenantId || !role || !username) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold text-gray-900">Orders Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-gray-600">Tenant</p>
              <p className="font-semibold text-gray-900">{tenantName}</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-gray-600">Role</p>
              <p className="font-semibold text-gray-900 uppercase">{role}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-gray-600">User</p>
              <p className="font-semibold text-gray-900">{username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Seed button */}
        <div className="mb-6">
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:bg-gray-400 transition-colors text-sm font-medium"
          >
            {isSeeding ? 'Seeding...' : 'Seed Demo Data'}
          </button>
          {seedError && (
            <div className="mt-2 p-3 bg-red-50 text-red-700 rounded text-sm border border-red-200">
              {seedError}
            </div>
          )}
        </div>

        {/* Create Order Form */}
        <CreateOrderForm
          tenantId={tenantId}
          onOrderCreated={handleOrderCreated}
        />

        {/* Orders List */}
        <OrderList
          tenantId={tenantId}
          role={role}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
}
