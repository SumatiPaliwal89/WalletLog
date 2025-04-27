// components/ReceiptScannerPage.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, Save, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Define types
type ExpenseData = {
  amount: string;
  category: string;
  description: string;
  date: string;
};

type ReceiptData = {
  merchant: string;
  total: string;
  date: string;
  items: Array<{
    description: string;
    amount: string;
  }>;
  category: string; // Added category property
};

const ReceiptScannerPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [expense, setExpense] = useState<ExpenseData>({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const categories = [
    { id: 'food', name: 'Food', icon: '🍔', color: '#00F0FF' },
    { id: 'transport', name: 'Transport', icon: '🚌', color: '#9B6DFF' },
    { id: 'education', name: 'Education', icon: '📚', color: '#FF2E93' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#34D399' },
    { id: 'rent', name: 'Rent', icon: '🏠', color: '#FBBF24' },
    { id: 'other', name: 'Other', icon: '⚡', color: '#FB7185' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtractionError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum file size is 5MB.');
      return;
    }

    // Check file type
    if (!file.type.match('image/*')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    setIsUploading(true);

    // Create a preview of the uploaded image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target) {
        setUploadedImage(event.target.result as string);
        setIsUploading(false);
        processReceiptImage(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const processReceiptImage = async (file: File) => {
    setIsProcessing(true);
    setExtractionError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64String = reader.result as string;
        
        const token = localStorage.getItem('token'); // If you have token protected routes

        const response = await fetch('http://localhost:3000/api/receipt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            file_data: base64String,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to scan receipt');
        }
  
  
        const data = await response.json();
      
      // Map Veryfi response to our ReceiptData type
      const processedData: ReceiptData = {
        merchant: data.vendor?.name || 'Unknown Merchant',
        total: data.total,
        date: data.date || new Date().toISOString().split('T')[0],
        items: data.line_items || [], // Ensure 'items' is initialized
        category: data.category || 'other'
      };

      setReceiptData(processedData);
      setExpense({
        amount: processedData.total.toString(),
        category: processedData.category,
        description: processedData.merchant,
        date: processedData.date
      });
      setActiveCategory(processedData.category);

      toast.success('Receipt processed successfully');
    };
    } catch (error) {
      console.error('Veryfi processing error:', error);
      setExtractionError('Failed to extract data from receipt. Please try again or enter details manually.');
      toast.error('Error processing receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  

  const handleUploadClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = "image/*";
    // Remove capture attribute to allow file selection
    fileInputRef.current.removeAttribute('capture');
    fileInputRef.current.click();
  };

  const handleManualInputChange = (field: keyof ExpenseData, value: string) => {
    setExpense(prev => ({ ...prev, [field]: value }));
    
    if (field === 'category') {
      setActiveCategory(value);
    }
  };

  const handleSubmit = async () => {
    if (!expense.amount || !expense.category) {
      toast.error('Please provide at least amount and category');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });

      if (response.ok) {
        toast.success('Expense saved successfully!');
        // Reset form
        setExpense({
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        setActiveCategory(null);
        setUploadedImage(null);
        setReceiptData(null);
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      toast.error('Failed to save expense');
      console.error(error);
    }
  };

  const resetForm = () => {
    setExpense({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setActiveCategory(null);
    setUploadedImage(null);
    setReceiptData(null);
    setExtractionError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
          
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Receipt Scanner
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Upload a receipt image to automatically add an expense
            </p>
          </div>
        </div>

        {/* Upload Area */}
        {!uploadedImage && (
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-900/30 border border-blue-700 flex items-center justify-center">
                  <FileText size={32} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-medium">Upload Receipt Image</h3>
                <p className="text-gray-400 text-sm">
                  Upload a clear image of your receipt to automatically extract expense details
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                  
                  <button
                    onClick={handleUploadClick}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Upload size={20} /> Choose File
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Uploading State */}
        {isUploading && (
          <div className="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700 text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            </div>
            <p>Uploading receipt image...</p>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && uploadedImage && (
          <div className="mb-6">
            <div className="relative">
              <img 
                src={uploadedImage} 
                alt="Receipt" 
                className="w-full h-64 object-contain rounded-lg mb-4" 
              />
              <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-white font-medium">Scanning receipt...</p>
                <p className="text-gray-300 text-sm mt-2">Extracting expense details</p>
              </div>
            </div>
          </div>
        )}

        {/* Extraction Error */}
        {extractionError && uploadedImage && !isProcessing && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 mt-1" />
              <div>
                <h3 className="font-medium text-red-300">Extraction Failed</h3>
                <p className="text-sm text-gray-300 mt-1">{extractionError}</p>
              </div>
            </div>
            <div className="mt-4">
              <img 
                src={uploadedImage} 
                alt="Receipt" 
                className="w-full h-48 object-contain rounded-lg opacity-70" 
              />
            </div>
          </div>
        )}

        {/* Receipt Result */}
        {receiptData && uploadedImage && !isProcessing && !extractionError && (
          <div className="mb-6">
            <div className="relative mb-4">
              <img 
                src={uploadedImage} 
                alt="Receipt" 
                className="w-full h-48 object-contain rounded-lg" 
              />
              <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                <Check size={16} />
              </div>
            </div>
            
            <div className="p-4 bg-gray-750 rounded-lg border border-gray-700 mb-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Check size={18} className="text-green-400" />
                Extracted Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Merchant:</span>
                  <span className="font-medium">{receiptData.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="font-bold">₹{receiptData.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span>
                    {new Date(receiptData.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                {receiptData.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <span className="text-sm text-gray-400">Items:</span>
                    <ul className="mt-2 space-y-1">
                      {receiptData.items.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span>{item.description}</span>
                          <span>₹{item.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Edit Form (shows after extraction) */}
        {uploadedImage && !isProcessing && (
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-medium">
              {receiptData ? 'Review & Edit Details' : 'Enter Expense Details'}
            </h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Amount (₹)</label>
              <input
                type="number"
                value={expense.amount}
                onChange={(e) => handleManualInputChange('amount', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter amount"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleManualInputChange('category', category.id)}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                      activeCategory === category.id || expense.category === category.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{category.icon}</span>
                    <span className="text-xs">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Description</label>
              <input
                type="text"
                value={expense.description}
                onChange={(e) => handleManualInputChange('description', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="What's this expense for?"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Date</label>
              <input
                type="date"
                value={expense.date}
                onChange={(e) => handleManualInputChange('date', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {uploadedImage && !isProcessing && (
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <X size={18} /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!expense.amount || !expense.category}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              <Save size={18} /> Save Expense
            </button>
          </div>
        )}

        {/* Help Tips */}
        {!uploadedImage && !isUploading && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-blue-400" />
              <h3 className="text-lg font-semibold">Tips for Better Scanning</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
              <li>Ensure the receipt is well-lit and flat</li>
              <li>Capture the entire receipt in the frame</li>
              <li>Make sure text is clearly visible</li>
              <li>Avoid shadows and glare on the receipt</li>
              <li>You can always edit details after scanning</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScannerPage;