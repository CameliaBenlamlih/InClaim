import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';

export default function Autocomplete({ 
  value, 
  onChange, 
  onSelect,
  options = [], 
  placeholder = 'Search...', 
  label,
  error,
  disabled = false,
  formatOption = (opt) => opt.toString(),
  renderOption,
  icon: Icon = MapPin,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleSelect = (option) => {
    const formatted = formatOption(option);
    setInputValue(formatted);
    onSelect(option);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    onSelect(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen || options.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (options[highlightedIndex]) {
          handleSelect(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
          <Icon className="w-4 h-4" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-12 pr-10 py-3 border bg-white rounded-sm
            text-sm
            transition-all duration-200 outline-none
            ${error 
              ? 'border-red-200 focus:border-red-400' 
              : 'border-dark-200 focus:border-dark-500'
            }
            ${disabled ? 'bg-dark-100 cursor-not-allowed opacity-50' : ''}
            placeholder:text-dark-400 text-dark-900
          `}
        />

        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-dark-200/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-dark-500" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-400 font-mono">{error}</p>
      )}

      <AnimatePresence>
        {isOpen && options.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-surface border border-dark-200 rounded-sm shadow-lg overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {options.map((option, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full text-left px-4 py-3 transition-colors text-sm
                    ${highlightedIndex === index 
                      ? 'bg-dark-100 text-dark-900' 
                      : 'hover:bg-dark-50 text-dark-600'
                    }
                  `}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderOption ? renderOption(option) : formatOption(option)}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
