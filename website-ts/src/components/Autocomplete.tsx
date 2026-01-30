'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface Option {
  value: string
  label: string
}

interface AutocompleteProps {
  options: Option[]
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function Autocomplete({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Search...',
  className = '' 
}: AutocompleteProps) {
  const { theme } = useTheme()
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  
  // Track the display value before clearing on focus (for restoring if user cancels)
  const previousLabelRef = useRef<string>('')
  // Track if we just made a selection (to prevent blur from overwriting)
  const justSelectedRef = useRef(false)

  // Find selected option label
  const selectedOption = options.find(o => o.value === value)

  // Filter options based on input
  const filteredOptions = inputValue.trim() === ''
    ? options
    : options.filter(o => 
        o.label.toLowerCase().includes(inputValue.toLowerCase())
      )

  // Update input value when selection changes externally
  useEffect(() => {
    if (selectedOption && !isOpen) {
      setInputValue(selectedOption.label)
      previousLabelRef.current = selectedOption.label
    }
  }, [selectedOption, isOpen])

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredOptions.length])

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsOpen(true)
    setHighlightedIndex(0)
  }

  const handleInputFocus = () => {
    // Store current value before clearing
    previousLabelRef.current = inputValue
    // Clear the input for easy searching
    setInputValue('')
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    // Delay closing to allow click on option
    setTimeout(() => {
      setIsOpen(false)
      // Only restore if user didn't just select something new
      if (!justSelectedRef.current && selectedOption) {
        setInputValue(selectedOption.label)
      }
      justSelectedRef.current = false
    }, 200)
  }

  const handleOptionClick = (option: Option) => {
    // Mark that we just made a selection (prevents blur from overwriting)
    justSelectedRef.current = true
    onChange(option.value)
    // Show the newly selected player
    setInputValue(option.label)
    previousLabelRef.current = option.label
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const bgColor = theme === 'dark' ? '#21262d' : '#ffffff'
  const borderColor = theme === 'dark' ? '#30363d' : '#d0d7de'
  const textColor = theme === 'dark' ? '#f0f6fc' : '#1f2328'
  const textSecondary = theme === 'dark' ? '#8b949e' : '#57606a'
  const hoverBg = theme === 'dark' ? '#30363d' : '#f3f4f6'
  const highlightBg = theme === 'dark' ? '#388bfd30' : '#0969da20'

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          color: textColor,
        }}
      />
      
      {/* Dropdown arrow */}
      <div 
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: textSecondary }}
      >
        ▼
      </div>

      {/* Dropdown list */}
      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-lg border shadow-lg"
          style={{
            backgroundColor: bgColor,
            borderColor: borderColor,
          }}
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className="px-3 py-2 cursor-pointer transition-colors duration-100 text-sm"
              style={{
                backgroundColor: index === highlightedIndex ? highlightBg : 'transparent',
                color: textColor,
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {isOpen && inputValue.trim() !== '' && filteredOptions.length === 0 && (
        <div
          className="absolute z-50 w-full mt-1 px-3 py-2 rounded-lg border text-sm"
          style={{
            backgroundColor: bgColor,
            borderColor: borderColor,
            color: textSecondary,
          }}
        >
          No players found
        </div>
      )}
    </div>
  )
}
