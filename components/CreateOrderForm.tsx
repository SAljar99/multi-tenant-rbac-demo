'use client';

import { useState, useCallback } from 'react';
import type { OrderStatus } from '@/lib/orders';
import { createOrder } from '@/lib/orders';

interface CreateOrderFormProps {
  tenantId: string;
  onOrderCreated: () => void;
}

export default function CreateOrderForm({
  tenantId,
  onOrderCreated,
}: CreateOrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!customerName.trim()) {
        setError('Customer name is required');
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await createOrder({
          tenantId,
          customerName,
          status,
        });
        setCustomerName('');
        setStatus('pending');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onOrderCreated();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create order');
      } finally {
        setIsLoading(false);
      }
    },
    [customerName, status, tenantId, onOrderCreated]
  );

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-blue-50 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Order</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              setError(null);
            }}
            placeholder="Enter customer name"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
            Order created successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
}
