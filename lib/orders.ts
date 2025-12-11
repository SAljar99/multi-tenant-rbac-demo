import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { TenantId, Role } from '@/app/context/AuthContext';

export type OrderStatus = 'pending' | 'in_progress' | 'completed';

export interface Order {
  id: string;
  tenantId: string;
  customerName: string;
  status: OrderStatus;
}

/**
 * Fetch all orders for a specific tenant.
 */
export async function getOrdersForTenant(tenantId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('tenantId', '==', tenantId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Order));
}

/**
 * Create a new order for a tenant.
 */
export async function createOrder({
  tenantId,
  customerName,
  status,
}: {
  tenantId: string;
  customerName: string;
  status: OrderStatus;
}): Promise<Order> {
  const docRef = await addDoc(collection(db, 'orders'), {
    tenantId,
    customerName,
    status,
  });
  return {
    id: docRef.id,
    tenantId,
    customerName,
    status,
  };
}

/**
 * Update an order's status with RBAC enforcement.
 * Admin: can change to any status.
 * Staff: can only change pending → in_progress.
 */
export async function updateOrderStatus({
  orderId,
  newStatus,
  tenantId,
  role,
}: {
  orderId: string;
  newStatus: OrderStatus;
  tenantId: string;
  role: Role;
}): Promise<void> {
  // Fetch the order to verify tenant and check RBAC
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }

  const order = orderSnap.data() as Order;

  // Verify tenant isolation
  if (order.tenantId !== tenantId) {
    throw new Error('Cross-tenant access denied');
  }

  // Enforce RBAC rules
  if (role === 'staff') {
    // Staff can only change pending → in_progress
    if (order.status !== 'pending' || newStatus !== 'in_progress') {
      throw new Error(
        'Permission denied: staff can only change status from pending to in_progress'
      );
    }
  }
  // Admin can change to any status (no restriction)

  // Update the order
  await updateDoc(orderRef, { status: newStatus });
}

/**
 * Delete an order with RBAC enforcement.
 * Admin: can delete.
 * Staff: cannot delete.
 */
export async function deleteOrder({
  orderId,
  tenantId,
  role,
}: {
  orderId: string;
  tenantId: string;
  role: Role;
}): Promise<void> {
  // Fetch the order to verify tenant and check RBAC
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }

  const order = orderSnap.data() as Order;

  // Verify tenant isolation
  if (order.tenantId !== tenantId) {
    throw new Error('Cross-tenant access denied');
  }

  // Enforce RBAC rules
  if (role !== 'admin') {
    throw new Error('Permission denied: only admins can delete orders');
  }

  // Delete the order
  await deleteDoc(orderRef);
}

/**
 * Seed demo data: creates tenants and sample orders.
 */
export async function seedDemoData(): Promise<void> {
  // Create tenants if they don't exist
  const tenantARef = doc(db, 'tenants', 'tenantA');
  const tenantBRef = doc(db, 'tenants', 'tenantB');

  const tenantASnap = await getDoc(tenantARef);
  if (!tenantASnap.exists()) {
    await setDoc(tenantARef, { name: 'Tenant A' });
  }

  const tenantBSnap = await getDoc(tenantBRef);
  if (!tenantBSnap.exists()) {
    await setDoc(tenantBRef, { name: 'Tenant B' });
  }

  // Create sample orders for Tenant A
  const ordersA = [
    { tenantId: 'tenantA', customerName: 'Alice Johnson', status: 'pending' as OrderStatus },
    { tenantId: 'tenantA', customerName: 'Bob Smith', status: 'in_progress' as OrderStatus },
    { tenantId: 'tenantA', customerName: 'Charlie Brown', status: 'completed' as OrderStatus },
  ];

  // Create sample orders for Tenant B
  const ordersB = [
    { tenantId: 'tenantB', customerName: 'Diana Ross', status: 'pending' as OrderStatus },
    { tenantId: 'tenantB', customerName: 'Eve Wilson', status: 'in_progress' as OrderStatus },
    { tenantId: 'tenantB', customerName: 'Frank Miller', status: 'completed' as OrderStatus },
  ];

  // Add orders to Firestore (skip if they already exist)
  const existingOrders = await getDocs(collection(db, 'orders'));
  if (existingOrders.size === 0) {
    for (const order of [...ordersA, ...ordersB]) {
      await addDoc(collection(db, 'orders'), order);
    }
  }
}
