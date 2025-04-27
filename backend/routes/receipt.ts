import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
router.post('/', async (req: Request, res: Response) => {

    console.log('POST /api/scan hit');
  
  
  try {
    const { file_data } = req.body;

    const veryfi_url = 'https://api.veryfi.com/api/v7/partner/documents';
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'CLIENT-ID': process.env.VERYFI_CLIENT_ID!,
      'AUTHORIZATION': `apikey ${process.env.VERYFI_USERNAME!}:${process.env.VERYFI_API_KEY!}`,
    };

    const veryfiResponse = await axios.post(veryfi_url, { file_data }, { headers });

    res.json(veryfiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong with Veryfi.' });
  }
});

export default router;
