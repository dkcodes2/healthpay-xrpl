'use client';

import { DIDVerification } from '@/components/did-verification';

export default function DIDTestPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">DID Verification Test Page</h1>
        <p className="text-gray-600 mb-8">
          This page allows you to test the DID verification functionality. Use the sample buttons below to test different scenarios.
        </p>
        <DIDVerification />
      </div>
    </main>
  );
} 