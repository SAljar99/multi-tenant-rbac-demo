'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to the RBAC Demo
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          This is a demonstration of role-based access control (RBAC) in a multi-tenant application.
          <br />
          Log in to explore tenant isolation and permission-based workflows.
        </p>
        <button
          onClick={handleLoginClick}
          className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
}
