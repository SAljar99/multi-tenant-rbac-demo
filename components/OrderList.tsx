'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Order } from '@/lib/orders';
import { getOrdersForTenant } from '@/lib/orders';
import type { Role } from '@/app/context/AuthContext';
import OrderItem from './OrderItem';

interface OrderListProps {
  tenantId: string;
  role: Role;
  refreshTrigger: number;
}

export default function OrderList({
  tenantId,
  role,
  refreshTrigger,
}: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getOrdersForTenant(tenantId);
      setOrders(fetchedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchOrders();
  }, [tenantId, refreshTrigger, fetchOrders]);

  if (isLoading) {
    return <div className="text-center text-gray-600 py-8">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No orders found. Create one to get started!
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Orders ({orders.length})
      </h2>
      {orders.map((order) => (
        <OrderItem
          key={order.id}
          order={order}
          role={role}
          tenantId={tenantId}
          onStatusChange={fetchOrders}
          onDelete={fetchOrders}
        />
      ))}
    </div>
  );
}
