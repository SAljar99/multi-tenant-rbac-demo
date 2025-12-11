'use client';

import { useState, useCallback } from 'react';
import type { Order, OrderStatus } from '@/lib/orders';
import type { Role } from '@/app/context/AuthContext';
import { updateOrderStatus, deleteOrder } from '@/lib/orders';

interface OrderItemProps {
  order: Order;
  role: Role;
  tenantId: string;
  onStatusChange: () => void;
  onDelete: () => void;
}

export default function OrderItem({
  order,
  role,
  tenantId,
  onStatusChange,
  onDelete,
}: OrderItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = useCallback(
    async (newStatus: OrderStatus) => {
      setIsLoading(true);
      setError(null);
      try {
        await updateOrderStatus({
          orderId: order.id,
          newStatus,
          tenantId,
          role,
        });
        onStatusChange();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update order');
      } finally {
        setIsLoading(false);
      }
    },
    [order.id, tenantId, role, onStatusChange]
  );

  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await deleteOrder({
        orderId: order.id,
        tenantId,
        role,
      });
      onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setIsLoading(false);
    }
  }, [order.id, tenantId, role, onDelete]);

  const availableStatuses: OrderStatus[] = ['pending', 'in_progress', 'completed'];

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-3 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{order.customerName}</h3>
          <p className="text-sm text-gray-600">Order ID: {order.id.substring(0, 8)}...</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            order.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : order.status === 'in_progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {order.status}
        </span>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {availableStatuses.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={isLoading || order.status === status}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              order.status === status
                ? 'bg-gray-200 text-gray-600 cursor-default'
                : isLoading
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700'
            }`}
          >
            {status}
          </button>
        ))}

        {role === 'admin' && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className={`px-3 py-1 text-sm rounded transition-colors ml-auto ${
              isLoading
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
            }`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
