'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateOrderForm from '@/components/CreateOrderForm';
import OrderList from '@/components/OrderList';

type TenantId = 'tenantA' | 'tenantB';
type Role = 'admin' | 'staff';

export default function OrdersPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState<TenantId | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read from localStorage on mount
    const savedUsername = localStorage.getItem('username');
    const savedTenantId = localStorage.getItem('tenantId') as TenantId | null;
    const savedRole = localStorage.getItem('role') as Role | null;

    if (!savedUsername || !savedTenantId || !savedRole) {
      router.push('/login');
      return;
    }

    setUsername(savedUsername);
    setTenantId(savedTenantId);
    setRole(savedRole);
    setIsLoading(false);
  }, [router]);

  const tenantName = tenantId === 'tenantA' ? 'Tenant A' : 'Tenant B';

  const handleOrderCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('role');
    router.push('/login');
  };

  if (isLoading || !tenantId || !role || !username) {
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
