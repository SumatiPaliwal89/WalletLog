// src/routes/receipt.ts
import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Custom error class for scan-related errors
class ScanError extends Error {
  userMessage: string;
  statusCode: number;
  
  constructor(message: string, userMessage: string, statusCode = 500) {
    super(message);
    this.userMessage = userMessage;
    this.statusCode = statusCode;
    this.name = 'ScanError';
  }
}

router.post('/', async (req: Request, res: Response) => {
  console.log('POST /api/scan hit');
  
  try {
    const { file_data } = req.body;

    // Validate input
    if (!file_data) {
      throw new ScanError(
        'No file data provided',
        'Please upload a receipt image to scan',
        400
      );
    }

    const veryfi_url = 'https://api.veryfi.com/api/v7/partner/documents';
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'CLIENT-ID': process.env.VERYFI_CLIENT_ID!,
      'AUTHORIZATION': `apikey ${process.env.VERYFI_USERNAME!}:${process.env.VERYFI_API_KEY!}`,
    };

    const veryfiResponse = await axios.post(veryfi_url, { file_data }, { headers });

    // Validate Veryfi response
    if (!veryfiResponse.data || !veryfiResponse.data.total) {
      throw new ScanError(
        'Invalid response from Veryfi API',
        'We couldn\'t read the receipt details. Please try again or enter manually.',
        422
      );
    }

    // Process and format the response
    const fdate = veryfiResponse.data.date ? veryfiResponse.data.date.split(' ')[0] : new Date().toISOString().split('T')[0];
    
    const processedData = {
      merchant: veryfiResponse.data.vendor?.name || 'Unknown Merchant',
      total: veryfiResponse.data.total,
      date: fdate,
      items: veryfiResponse.data.line_items || [],
      category: veryfiResponse.data.category || 'other'
    };

    res.json(processedData);

  } catch (error: any) {
    console.error('Scan API error:', error.response?.data || error.message || error);
    
    if (error instanceof ScanError) {
      res.status(error.statusCode).json({
        error: error.userMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } else if (error.response?.status === 401) {
      res.status(401).json({
        error: 'Invalid API credentials. Please contact support.',
        details: 'Veryfi API authentication failed'
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
        details: 'Veryfi API rate limit exceeded'
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(504).json({
        error: 'Scanning service timed out. Please try again.',
        details: 'API request timeout'
      });
    } else {
      res.status(500).json({
        error: 'Failed to scan receipt. Please try again or enter details manually.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

export default router;