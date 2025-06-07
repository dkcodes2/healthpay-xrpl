import type { NextApiRequest, NextApiResponse } from 'next';
import { issueRLUSDToBeneficiary } from '../../lib/xrpl-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    let { beneficiaryAddress, amount, memo } = req.body;
    if (!beneficiaryAddress || !amount) {
      return res.status(400).json({ error: 'beneficiaryAddress and amount are required' });
    }
    const result = await issueRLUSDToBeneficiary({ beneficiaryAddress, amount, memo });
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 