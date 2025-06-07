import type { NextApiRequest, NextApiResponse } from 'next';
import { redeemHealthCredits } from '../../lib/xrpl-service';

const REAL_BENEFICIARY_ADDRESS = 'YrNgSzNmhUWnmLUwFraznhM2xX1fp62u86Y';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    let { patientAddress, amount, serviceDescription } = req.body;
    if (!patientAddress || !amount || !serviceDescription) {
      return res.status(400).json({ error: 'patientAddress, amount, and serviceDescription are required' });
    }
    if (patientAddress === 'BENEFICIARY_ADDRESS') {
      patientAddress = REAL_BENEFICIARY_ADDRESS;
    }
    const result = await redeemHealthCredits({ patientAddress, amount, serviceDescription });
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 