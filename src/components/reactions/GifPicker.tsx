'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, TrendingUp, Smile, Heart, X, Loader2 } from 'lucide-react';

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onGifSelect: (gifUrl: string) => void;
  position?: { x: number; y: number };
}

interface GifResult {
  id: string;
  title: string;
  images: {
    fixed_height_small: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
  };
}

// Expanded search categories with more options
const GIF_CATEGORIES = [
  { id: 'trending', name: 'Trending', icon: TrendingUp, query: '' },
  { id: 'reactions', name: 'Reactions', icon: Smile, query: 'reaction' },
  { id: 'emotions', name: 'Emotions', icon: Heart, query: 'emotion' },
  { id: 'celebration', name: 'Party', icon: Zap, query: 'celebration party' },
  { id: 'work', name: 'Work', icon: Zap, query: 'work office' },
  { id: 'animals', name: 'Animals', icon: Heart, query: 'cute animals' },
  { id: 'funny', name: 'Funny', icon: Smile, query: 'funny comedy' },
  { id: 'sports', name: 'Sports', icon: Zap, query: 'sports victory' },
  { id: 'movies', name: 'Movies', icon: Heart, query: 'movie cinema' },
  { id: 'dance', name: 'Dance', icon: TrendingUp, query: 'dance dancing' },
  { id: 'food', name: 'Food', icon: Heart, query: 'food eating' },
  { id: 'gaming', name: 'Gaming', icon: Zap, query: 'gaming video games' },
];

export const GifPicker: React.FC<GifPickerProps> = ({
  isOpen,
  onClose,
  onGifSelect,
  position
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Note: In a real app, you'd want to store this in environment variables
  const GIPHY_API_KEY = 'demo_api_key'; // Replace with actual API key

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      loadTrendingGifs(); // Load trending GIFs when opened
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchGifs(searchQuery);
      }, 500);
    } else if (activeCategory === 'trending') {
      loadTrendingGifs();
    } else {
      const category = GIF_CATEGORIES.find(c => c.id === activeCategory);
      if (category?.query) {
        searchGifs(category.query);
      }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, activeCategory]);

  const loadTrendingGifs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, we'll use mock data
      // In a real app, you'd call: https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20
      const mockGifs: GifResult[] = [
        {
          id: '1',
          title: 'SpongeBob Excited',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '2',
          title: 'Thumbs Up Approval',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/111ebonMs90YLu/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '3',
          title: 'Team Collaboration',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '4',
          title: 'Victory Dance',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '5',
          title: 'Mind Blown',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '6',
          title: 'Confetti Celebration',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '7',
          title: 'Cat Typing',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '8',
          title: 'High Five',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '9',
          title: 'Applause',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/7rj2ZgttvgomY/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '10',
          title: 'Rocket Launch',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/BlVnrxJgTGsUw/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/BlVnrxJgTGsUw/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '11',
          title: 'Facepalm',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/XsUtdIeJ0MWMo/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/XsUtdIeJ0MWMo/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '12',
          title: 'Dancing Baby Groot',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/r1HGFou3mUwMw/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/r1HGFou3mUwMw/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '13',
          title: 'Shocked Pikachu',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/6nWhy3ulBL7GSuKrjm/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/6nWhy3ulBL7GSuKrjm/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '14',
          title: 'Office Celebration',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '15',
          title: 'Pizza Time',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/4ayiIWaq2VULC/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/4ayiIWaq2VULC/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '16',
          title: 'Cute Puppy',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/mCRJDo24UvJMA/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/mCRJDo24UvJMA/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '17',
          title: 'Typing Fast',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/LmNwrBhejkK9EFP504/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        },
        {
          id: '18',
          title: 'Success Kid',
          images: {
            fixed_height_small: {
              url: 'https://media.giphy.com/media/a0h7sAqON67nO/200.gif',
              width: '200',
              height: '150'
            },
            original: {
              url: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif',
              width: '400',
              height: '300'
            }
          }
        }
      ];
      
      setGifs(mockGifs);
    } catch (err) {
      setError('Failed to load trending GIFs');
      console.error('Error loading trending GIFs:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, we'll use mock data with category-specific GIFs
      // In a real app, you'd call: https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20
      
      // Add common search aliases for better matching
      const categoryGifs: Record<string, GifResult[]> = {
        // Main categories
        'celebration': [
          { id: 'party-1', title: 'Confetti Celebration', images: { fixed_height_small: { url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', width: '400', height: '300' } } },
          { id: 'party-2', title: 'Victory Dance', images: { fixed_height_small: { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', width: '400', height: '300' } } },
          { id: 'party-3', title: 'Office Celebration', images: { fixed_height_small: { url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif', width: '400', height: '300' } } },
          { id: 'party-4', title: 'Applause', images: { fixed_height_small: { url: 'https://media.giphy.com/media/7rj2ZgttvgomY/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif', width: '400', height: '300' } } },
          { id: 'party-5', title: 'High Five', images: { fixed_height_small: { url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', width: '400', height: '300' } } },
          { id: 'party-6', title: 'Success Kid', images: { fixed_height_small: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif', width: '400', height: '300' } } }
        ],
        'party': [
          { id: 'party-1', title: 'Confetti Celebration', images: { fixed_height_small: { url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', width: '400', height: '300' } } },
          { id: 'party-2', title: 'Victory Dance', images: { fixed_height_small: { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', width: '400', height: '300' } } },
          { id: 'party-3', title: 'Office Celebration', images: { fixed_height_small: { url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif', width: '400', height: '300' } } }
        ],
        'happy': [
          { id: 'happy-1', title: 'SpongeBob Excited', images: { fixed_height_small: { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', width: '400', height: '300' } } },
          { id: 'happy-2', title: 'Success Kid', images: { fixed_height_small: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif', width: '400', height: '300' } } },
          { id: 'happy-3', title: 'Thumbs Up', images: { fixed_height_small: { url: 'https://media.giphy.com/media/111ebonMs90YLu/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', width: '400', height: '300' } } }
        ],
        'excited': [
          { id: 'excited-1', title: 'SpongeBob Excited', images: { fixed_height_small: { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', width: '400', height: '300' } } },
          { id: 'excited-2', title: 'Victory Dance', images: { fixed_height_small: { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', width: '400', height: '300' } } },
          { id: 'excited-3', title: 'Mind Blown', images: { fixed_height_small: { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', width: '400', height: '300' } } }
        ],
        'success': [
          { id: 'success-1', title: 'Success Kid', images: { fixed_height_small: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif', width: '400', height: '300' } } },
          { id: 'success-2', title: 'Thumbs Up', images: { fixed_height_small: { url: 'https://media.giphy.com/media/111ebonMs90YLu/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', width: '400', height: '300' } } },
          { id: 'success-3', title: 'High Five', images: { fixed_height_small: { url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', width: '400', height: '300' } } }
        ],
        'thumbs up': [
          { id: 'thumbs-1', title: 'Thumbs Up', images: { fixed_height_small: { url: 'https://media.giphy.com/media/111ebonMs90YLu/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', width: '400', height: '300' } } },
          { id: 'thumbs-2', title: 'Success Kid', images: { fixed_height_small: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif', width: '400', height: '300' } } }
        ],
        'typing': [
          { id: 'typing-1', title: 'Cat Typing', images: { fixed_height_small: { url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', width: '400', height: '300' } } },
          { id: 'typing-2', title: 'Typing Fast', images: { fixed_height_small: { url: 'https://media.giphy.com/media/LmNwrBhejkK9EFP504/200.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif', width: '400', height: '300' } } }
        ],
        'reaction': [
          {
            id: 'reaction-1',
            title: 'Shocked Face',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/6nWhy3ulBL7GSuKrjm/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/6nWhy3ulBL7GSuKrjm/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'reaction-2',
            title: 'Facepalm',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/XsUtdIeJ0MWMo/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/XsUtdIeJ0MWMo/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'reaction-3',
            title: 'Mind Blown',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'reaction-4',
            title: 'Thumbs Up',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/111ebonMs90YLu/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', width: '400', height: '300' }
            }
          }
        ],
        'celebration party': [
          {
            id: 'party-1',
            title: 'Confetti Celebration',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'party-2',
            title: 'Victory Dance',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'party-3',
            title: 'Office Celebration',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'party-4',
            title: 'Applause',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/7rj2ZgttvgomY/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'party-5',
            title: 'High Five',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'party-6',
            title: 'Success Kid',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif', width: '400', height: '300' }
            }
          }
        ],
        'work office': [
          {
            id: 'work-1',
            title: 'Typing Fast',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/LmNwrBhejkK9EFP504/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'work-2',
            title: 'Cat Typing',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'work-3',
            title: 'Success Kid',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif', width: '400', height: '300' }
            }
          }
        ],
        'cute animals': [
          {
            id: 'animal-1',
            title: 'Cute Puppy',
          images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/mCRJDo24UvJMA/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/mCRJDo24UvJMA/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'animal-2',
            title: 'Cat Waving',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/ICOgUNjpvO0PC/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif', width: '400', height: '300' }
            }
          }
        ],
        'funny comedy': [
          {
            id: 'funny-1',
            title: 'SpongeBob Laughing',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'funny-2',
            title: 'Facepalm',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/XsUtdIeJ0MWMo/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/XsUtdIeJ0MWMo/giphy.gif', width: '400', height: '300' }
            }
          }
        ],
        'dance dancing': [
          {
            id: 'dance-1',
            title: 'Dancing Baby Groot',
          images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/r1HGFou3mUwMw/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/r1HGFou3mUwMw/giphy.gif', width: '400', height: '300' }
            }
          },
          {
            id: 'dance-2',
            title: 'Victory Dance',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', width: '400', height: '300' }
            }
          }
        ],
        'food eating': [
          {
            id: 'food-1',
            title: 'Pizza Time',
            images: {
              fixed_height_small: { url: 'https://media.giphy.com/media/4ayiIWaq2VULC/200.gif', width: '200', height: '150' },
              original: { url: 'https://media.giphy.com/media/4ayiIWaq2VULC/giphy.gif', width: '400', height: '300' }
            }
          }
        ]
      };

      // Smart search - find matching category with flexible matching
      let matchingGifs: GifResult[] = [];
      const searchTerm = query.toLowerCase();
      
      console.log('🔍 Searching for:', searchTerm);
      console.log('📋 Available categories:', Object.keys(categoryGifs));
      
      // Try exact match first
      if (categoryGifs[searchTerm]) {
        console.log('✅ Found exact match for:', searchTerm);
        matchingGifs = categoryGifs[searchTerm];
      } else {
        // Try partial matches
        for (const [key, gifs] of Object.entries(categoryGifs)) {
          if (key.includes(searchTerm) || searchTerm.includes(key.split(' ')[0])) {
            matchingGifs = gifs;
            break;
          }
        }
        
        // If no category match, check individual search terms
        if (matchingGifs.length === 0) {
          console.log('🔄 No exact match, trying keyword matching...');
          if (searchTerm.includes('celebration') || searchTerm.includes('party') || searchTerm.includes('confetti')) {
            console.log('🎉 Matched celebration keywords');
            matchingGifs = categoryGifs['celebration'] || categoryGifs['celebration party'] || [];
          } else if (searchTerm.includes('reaction') || searchTerm.includes('shocked') || searchTerm.includes('surprise')) {
            matchingGifs = categoryGifs['reaction'] || [];
          } else if (searchTerm.includes('work') || searchTerm.includes('office') || searchTerm.includes('typing')) {
            matchingGifs = categoryGifs['work office'] || categoryGifs['typing'] || [];
          } else if (searchTerm.includes('animal') || searchTerm.includes('cat') || searchTerm.includes('dog') || searchTerm.includes('puppy')) {
            matchingGifs = categoryGifs['cute animals'] || [];
          } else if (searchTerm.includes('funny') || searchTerm.includes('comedy') || searchTerm.includes('laugh')) {
            matchingGifs = categoryGifs['funny comedy'] || [];
          } else if (searchTerm.includes('dance') || searchTerm.includes('dancing')) {
            matchingGifs = categoryGifs['dance dancing'] || [];
          } else if (searchTerm.includes('food') || searchTerm.includes('eating') || searchTerm.includes('pizza')) {
            matchingGifs = categoryGifs['food eating'] || [];
          } else {
            // Default fallback with more variety
            matchingGifs = [
              {
                id: `search-${query}-1`,
                title: `${query} reaction`,
                images: {
                  fixed_height_small: { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/200.gif', width: '200', height: '150' },
                  original: { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', width: '400', height: '300' }
                }
              },
              {
                id: `search-${query}-2`,
                title: `${query} response`,
                images: {
                  fixed_height_small: { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif', width: '200', height: '150' },
                  original: { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', width: '400', height: '300' }
                }
              }
            ];
          }
        }
      }
      
      console.log('🎯 Final matching GIFs:', matchingGifs.length, matchingGifs.map(g => g.title));
      setGifs(matchingGifs);
    } catch (err) {
      setError('Failed to search GIFs');
      console.error('Error searching GIFs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
  };

  const handleGifClick = (gif: GifResult) => {
    onGifSelect(gif.images.original.url);
    onClose();
  };

  if (!isOpen) return null;

  const pickerStyle = position 
    ? { 
        position: 'fixed' as const, 
        left: position.x, 
        top: position.y,
        zIndex: 1000
      }
    : {};

  return (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-[480px] max-h-[600px] overflow-hidden"
        style={pickerStyle}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Choose a GIF</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for GIFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Quick Search Suggestions */}
          {!searchQuery && (
            <div className="mt-2 flex flex-wrap gap-1">
              {['happy', 'excited', 'thumbs up', 'celebration', 'typing', 'success'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 
                           rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 
                           transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 p-2 gap-1">
            {GIF_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

        {/* GIF Grid */}
        <div className="p-3 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading GIFs...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => searchQuery ? searchGifs(searchQuery) : loadTrendingGifs()}
                className="mt-2 text-xs text-blue-500 hover:text-blue-600"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && gifs.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No GIFs found</p>
              <p className="text-xs mt-1">Try searching for "reaction", "party", or "animals"</p>
            </div>
          )}

          {!loading && !error && gifs.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleGifClick(gif)}
                  className="relative group rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all transform hover:scale-105"
                  title={gif.title}
                >
                  <img
                    src={gif.images.fixed_height_small.url}
                    alt={gif.title}
                    className="w-full h-24 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{gif.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by GIPHY
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 