// components/VoiceExpenseInput.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Save, X, Check, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define types for better TypeScript support
type ExpenseData = {
  amount: string;
  category: string;
  description: string;
  date: string;
};

const VoiceExpenseInput = () => {
  const navigate = useNavigate();
  const annyangRef = useRef<any>(null);
  const [expense, setExpense] = useState<ExpenseData>({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [availableCommands, setAvailableCommands] = useState<string[]>([]);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    { id: 'food', name: 'Food', icon: '🍔', color: '#00F0FF' },
    { id: 'transport', name: 'Transport', icon: '🚌', color: '#9B6DFF' },
    { id: 'education', name: 'Education', icon: '📚', color: '#FF2E93' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#34D399' },
    { id: 'rent', name: 'Rent', icon: '🏠', color: '#FBBF24' },
    { id: 'other', name: 'Other', icon: '⚡', color: '#FB7185' },
  ];

  // Initialize speech recognition
  useEffect(() => {
    let annyangImport: any;

    // Check for browser support
    const checkVoiceSupport = () => {
      return 'SpeechRecognition' in window || 
             'webkitSpeechRecognition' in window ||
             'mozSpeechRecognition' in window ||
             'msSpeechRecognition' in window;
    };

    const setupSpeechRecognition = async () => {
      try {
        // First check if browser supports speech recognition
        if (!checkVoiceSupport()) {
          setVoiceSupported(false);
          toast.error('Speech recognition not supported in this browser');
          return;
        }

        // Dynamically import annyang
        annyangImport = await import('annyang');
        const annyang = annyangImport.default;
        
        if (!annyang) {
          setVoiceSupported(false);
          toast.error('Could not initialize voice recognition');
          return;
        }
        
        annyangRef.current = annyang;
        
        // Set language to English
        annyang.setLanguage('en-US');
        
        // Configure for continuous mode
        const recognition = annyang.getSpeechRecognizer();
        if (recognition) {
          recognition.interimResults = true;
          recognition.continuous = true;
        }
        
        // Define commands
        const commands = {
          // Basic commands
          'set amount *amount': (amount: string) => {
            const cleanAmount = amount.replace(/[^0-9.]/g, '');
            handleVoiceCommand(`Amount set to ${cleanAmount}`, () => {
              setExpense(prev => ({ ...prev, amount: cleanAmount }));
            });
          },
          'set category *category': (category: string) => {
            handleVoiceCommand(`Category set to ${category}`, () => {
              const matched = categories.find(c => 
                c.name.toLowerCase().includes(category.toLowerCase()) || 
                c.id.toLowerCase().includes(category.toLowerCase())
              );
              if (matched) {
                setExpense(prev => ({ ...prev, category: matched.id }));
                setActiveCategory(matched.id);
              } else {
                toast.error(`Category "${category}" not found`);
              }
            });
          },
          'set description *description': (description: string) => {
            handleVoiceCommand(`Description set to "${description}"`, () => {
              setExpense(prev => ({ ...prev, description }));
            });
          },
          'set date *date': (date: string) => {
            handleVoiceCommand(`Date set to ${date}`, () => {
              // Enhanced date parsing
              if (date.toLowerCase().includes('today')) {
                setExpense(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
              } else if (date.toLowerCase().includes('tomorrow')) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setExpense(prev => ({ ...prev, date: tomorrow.toISOString().split('T')[0] }));
              } else if (date.toLowerCase().includes('yesterday')) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setExpense(prev => ({ ...prev, date: yesterday.toISOString().split('T')[0] }));
              }
            });
          },

          // Compound commands
          'add expense *amount for *category': (amount: string, category: string) => {
            const cleanAmount = amount.replace(/[^0-9.]/g, '');
            handleVoiceCommand(`Added ₹${cleanAmount} for ${category}`, () => {
              const matched = categories.find(c => 
                c.name.toLowerCase().includes(category.toLowerCase()) || 
                c.id.toLowerCase().includes(category.toLowerCase())
              );
              if (matched) {
                setExpense(prev => ({
                  ...prev,
                  amount: cleanAmount,
                  category: matched.id
                }));
                setActiveCategory(matched.id);
              } else {
                toast.error(`Category "${category}" not found`);
                setExpense(prev => ({
                  ...prev,
                  amount: cleanAmount,
                }));
              }
            });
          },
          'spent *amount on *category': (amount: string, category: string) => {
            const cleanAmount = amount.replace(/[^0-9.]/g, '');
            handleVoiceCommand(`Spent ₹${cleanAmount} on ${category}`, () => {
              const matched = categories.find(c => 
                c.name.toLowerCase().includes(category.toLowerCase()) || 
                c.id.toLowerCase().includes(category.toLowerCase())
              );
              if (matched) {
                setExpense(prev => ({
                  ...prev,
                  amount: cleanAmount,
                  category: matched.id
                }));
                setActiveCategory(matched.id);
              } else {
                toast.error(`Category "${category}" not found`);
                setExpense(prev => ({
                  ...prev,
                  amount: cleanAmount,
                }));
              }
            });
          },

          // Navigation commands
          'save expense': () => {
            handleVoiceCommand('Saving expense...', handleSubmit);
          },
          'save': () => {
            handleVoiceCommand('Saving expense...', handleSubmit);
          },
          'go back': () => {
            handleVoiceCommand('Going back', () => navigate(-1));
          },
          'clear all': () => {
            handleVoiceCommand('Cleared all fields', () => {
              setExpense({
                amount: '',
                category: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
              });
              setActiveCategory(null);
            });
          },
          'reset': () => {
            handleVoiceCommand('Reset all fields', () => {
              setExpense({
                amount: '',
                category: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
              });
              setActiveCategory(null);
            });
          }
        };

        annyang.addCommands(commands);
        setAvailableCommands([
          '"Set amount [number]"',
          '"Set category [category]"',
          '"Add expense [amount] for [category]"',
          '"Spent [amount] on [category]"',
          '"Save expense"',
          '"Clear all"'
        ]);

        // Debug mode
        annyang.debug(true);

        // Add event listeners
        annyang.addCallback('start', () => {
          console.log('Voice recognition started');
          setIsListening(true);
        });

        annyang.addCallback('end', () => {
          console.log('Voice recognition ended');
          setIsListening(false);
        });

        annyang.addCallback('resultNoMatch', (phrases: string[]) => {
          console.log('No match found for:', phrases);
          toast.info('Did not recognize: ' + phrases[0]);
        });

        // Error handling
        annyang.addCallback('error', (err: any) => {
          console.error('Voice recognition error:', err);
          toast.error(`Voice error: ${err.error || 'Unknown error'}`);
          setIsListening(false);
        });

        annyang.addCallback('errorNetwork', () => {
          toast.error('Network error - check your connection');
          setIsListening(false);
        });

        annyang.addCallback('errorPermissionBlocked', () => {
          toast.error('Microphone access blocked - check browser permissions');
          setIsListening(false);
        });

        annyang.addCallback('errorPermissionDenied', () => {
          toast.error('Microphone access denied - check browser permissions');
          setIsListening(false);
        });
      } catch (error) {
        console.error('Error setting up voice recognition:', error);
        setVoiceSupported(false);
        toast.error('Failed to initialize voice recognition');
      }
    };

    setupSpeechRecognition();

    // Cleanup
    return () => {
      if (annyangRef.current) {
        annyangRef.current.abort();
        annyangRef.current.removeCommands();
      }
    };
  }, [navigate]);

  const handleVoiceCommand = (feedback: string, action: () => void) => {
    setLastCommand(feedback);
    action();
    toast.success(feedback);
  };

  const toggleVoice = async () => {
    try {
      if (isListening) {
        if (annyangRef.current) {
          annyangRef.current.abort();
        }
        setIsListening(false);
      } else {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        if (annyangRef.current) {
          annyangRef.current.start({ autoRestart: true, continuous: true });
          setIsListening(true);
          toast.info('Listening... Try saying: "Add expense 50 for food"');
        } else {
          toast.error('Voice recognition not initialized');
        }
      }
    } catch (err) {
      console.error('Microphone access error:', err);
      toast.error('Microphone access denied. Please enable permissions in browser settings.');
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
        setExpense({
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        setActiveCategory(null);
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      toast.error('Failed to save expense');
      console.error(error);
    }
  };

  const handleManualInputChange = (field: keyof ExpenseData, value: string) => {
    setExpense(prev => ({ ...prev, [field]: value }));
    
    if (field === 'category') {
      setActiveCategory(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Voice Expense Entry
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {voiceSupported ? 'Use your voice to add expenses' : 'Voice not supported, use manual entry'}
            </p>
          </div>
          
          <button
            onClick={toggleVoice}
            disabled={!voiceSupported}
            className={`p-3 rounded-full transition-all ${
              !voiceSupported 
                ? 'bg-gray-700 cursor-not-allowed opacity-50' 
                : isListening
                  ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30'
                  : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <Volume2 size={24} /> : <Mic size={24} />}
          </button>
        </div>

        {/* Voice Status */}
        {isListening && (
          <div className="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                <div className="w-2 h-8 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-8 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                <div className="w-2 h-8 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '600ms'}}></div>
                <div className="w-2 h-8 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '900ms'}}></div>
              </div>
              <span className="font-medium">Listening for commands...</span>
            </div>
            <div className="text-sm text-blue-300">
              <p className="mb-2">Try saying:</p>
              <ul className="list-disc pl-5 space-y-1">
                {availableCommands.map((cmd, i) => (
                  <li key={i}>{cmd}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Last Command Feedback */}
        {lastCommand && (
          <div className="mb-6 p-3 bg-green-900/30 rounded-lg border border-green-700 flex items-center gap-2">
            <Check size={18} className="text-green-400" />
            <span>{lastCommand}</span>
          </div>
        )}

       
        {/* Expense Preview */}
        <div className="mb-6 p-4 rounded-lg bg-gray-750 border border-gray-700">
          <h3 className="text-lg font-medium mb-3">Expense Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount:</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {expense.amount ? `₹${expense.amount}` : 'Not set'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Category:</span>
              <div className="flex items-center gap-2">
                {expense.category && (
                  <span className="text-lg">
                    {categories.find(c => c.id === expense.category)?.icon}
                  </span>
                )}
                <span className="capitalize">
                  {expense.category 
                    ? categories.find(c => c.id === expense.category)?.name 
                    : 'Not set'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Description:</span>
              <span className="text-right max-w-xs truncate">
                {expense.description || 'Not set'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Date:</span>
              <span>
                {new Date(expense.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setExpense({
                amount: '',
                category: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
              });
              setLastCommand('');
              setActiveCategory(null);
            }}
            className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <X size={18} /> Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={!expense.amount || !expense.category}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            <Save size={18} /> Save Expense
          </button>
        </div>

        {/* Help Section */}
        {!isListening && voiceSupported && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-blue-400" />
              <h3 className="text-lg font-semibold">Voice Command Guide</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <p className="font-medium text-blue-300">Basic commands:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>"Set amount [number]" (e.g., "Set amount 50")</li>
                  <li>"Set category [category]" (e.g., "Set category food")</li>
                  <li>"Set description [text]" (e.g., "Set description lunch with friends")</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-300">Advanced commands:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>"Add expense [amount] for [category]" (e.g., "Add expense 30 for transport")</li>
                  <li>"Spent [amount] on [category]" (e.g., "Spent 45 on food")</li>
                  <li>"Save expense" or "Save" - Submits the current expense</li>
                  <li>"Clear all" or "Reset" - Resets all fields</li>
                </ul>
              </div>
              <div className="pt-3 text-center">
                <button
                  onClick={toggleVoice}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                >
                  <Mic size={16} /> Tap to start voice input
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Not Supported Message */}
        {!voiceSupported && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start gap-3">
              <MicOff size={22} className="text-red-400 mt-1" />
              <div>
                <h3 className="font-medium text-red-300">Voice Recognition Not Supported</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Your browser doesn't support voice recognition. Please try using a modern browser like Chrome, Edge, or Firefox, or use the manual input form above.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceExpenseInput;