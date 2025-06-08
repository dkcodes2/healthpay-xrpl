'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createTestWalletWithDID, issueVerifiableCredential, resolveXrplDID } from '@/lib/xrpl-did-service';
import { DIDDocument, VerifiableCredential } from '@/types/did';
import { format } from 'date-fns';

export default function XRPLDIDTestPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [did, setDid] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [didDocument, setDidDocument] = useState<DIDDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateWallet = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { wallet: newWallet, did: newDid } = await createTestWalletWithDID();
      setWallet(newWallet);
      setDid(newDid);
      setMessage(`Created new wallet: ${newWallet.address} (DID: ${newDid})`);
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      setMessage('Error creating wallet: ' + (error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCredential = async () => {
    if (!wallet || !recipientAddress) {
      setMessage('Please create a wallet and enter a recipient address');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const credential: VerifiableCredential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'IdentityAttestation'],
        issuer: did,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: did,
          name: 'Test User',
          nationality: 'SG',
          birthDate: '1990-01-01'
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date().toISOString(),
          verificationMethod: `${did}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof'
        },
        status: 'valid'
      };

      const txHash = await issueVerifiableCredential(wallet, recipientAddress, credential);
      setMessage(`Issued credential. Transaction hash: ${txHash}`);
    } catch (error: any) {
      console.error('Error issuing credential:', error);
      setMessage('Error issuing credential: ' + (error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDID = async () => {
    if (!recipientAddress) {
      setMessage('Please enter an address to verify');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const recipientDID = `did:xrpl:testnet:${recipientAddress}`;
      const doc = await resolveXrplDID(recipientDID);
      if (doc) {
        setDidDocument(doc);
        setMessage('DID document found');
      } else {
        setMessage('No DID document found');
        setDidDocument(null);
      }
    } catch (error: any) {
      console.error('Error verifying DID:', error);
      setMessage('Error verifying DID: ' + (error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">XRPL DID Test Page</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Management</h2>
          <div className="space-y-4">
            <Button 
              onClick={handleCreateWallet} 
              disabled={loading || !!wallet}
            >
              {loading ? 'Creating...' : 'Create Test Wallet'}
            </Button>
            {wallet && (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-mono text-sm break-all">
                  Address: {wallet.address}
                </p>
                <p className="font-mono text-sm break-all mt-2">
                  Public Key: {wallet.publicKey}
                </p>
                <p className="font-mono text-sm break-all mt-2">
                  DID: {did}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Credential Operations</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Recipient XRPL address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
              <Button 
                onClick={handleIssueCredential} 
                disabled={loading || !wallet || !recipientAddress}
              >
                {loading ? 'Issuing...' : 'Issue Credential'}
              </Button>
              <Button 
                onClick={handleVerifyDID} 
                disabled={loading || !recipientAddress}
              >
                {loading ? 'Verifying...' : 'Verify DID'}
              </Button>
            </div>
          </div>
        </Card>

        {message && (
          <Card className="p-4 bg-blue-50">
            <p className="text-blue-800">{message}</p>
          </Card>
        )}

        {didDocument && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">DID Document</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">DID</h3>
                <p className="font-mono text-sm break-all">{didDocument.id}</p>
              </div>
              {didDocument.verificationMethod && (
                <div>
                  <h3 className="font-medium">Verification Method</h3>
                  <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">
                    {JSON.stringify(didDocument.verificationMethod, null, 2)}
                  </pre>
                </div>
              )}
              {didDocument.credentials && didDocument.credentials.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Credentials</h3>
                  <div className="space-y-4">
                    {didDocument.credentials.map((credential, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{credential.type}</h4>
                          <Badge className={
                            credential.status === 'valid' ? 'bg-green-500' :
                            credential.status === 'revoked' ? 'bg-red-500' :
                            'bg-gray-500'
                          }>
                            {credential.status}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>Issuer: {credential.issuerDID}</p>
                          <p>Issued: {format(credential.issueDate, 'PPP')}</p>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(credential.data, null, 2)}
                          </pre>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
} 