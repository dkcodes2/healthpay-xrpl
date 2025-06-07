import type { NextApiRequest, NextApiResponse } from 'next';
import { payClinicWithRLUSD } from '../../lib/xrpl-service';

const REAL_CLINIC_ADDRESS = process.env.CLINIC_ADDRESS;
if (!REAL_CLINIC_ADDRESS) {
  throw new Error('CLINIC_ADDRESS is not set in environment variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    let { senderAddress, amount, memo } = req.body;
    if (!senderAddress || !amount) {
      return res.status(400).json({ error: 'senderAddress and amount are required' });
    }
    const result = await payClinicWithRLUSD({ 
      senderAddress, 
      destinationAddress: REAL_CLINIC_ADDRESS as string,
      amount, 
      memo 
    });
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 