import type { NextApiRequest, NextApiResponse } from 'next';
import { issueHealthCredits } from '../../lib/xrpl-service';

const REAL_BENEFICIARY_ADDRESS = 'YrNgSzNmhUWnmLUwFraznhM2xX1fp62u86Y';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    let { recipientAddress, amount, memo } = req.body;
    if (!recipientAddress || !amount) {
      return res.status(400).json({ error: 'recipientAddress and amount are required' });
    }
    if (recipientAddress === 'BENEFICIARY_ADDRESS') {
      recipientAddress = REAL_BENEFICIARY_ADDRESS;
    }
    const result = await issueHealthCredits({ recipientAddress, amount, memo });
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 