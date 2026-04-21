'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Search, Plus } from 'lucide-react'

interface TagSelectorProps {
  label?: string
  placeholder?: string
  availableTags: { id: string; name: string; nameEs?: string }[]
  selectedTags: string[]
  onChange: (tagIds: string[]) => void
  minSelections?: number
  maxSelections?: number
  lang?: 'en' | 'es'
  t?: (key: string) => string
}

export function TagSelector({
  label,
  placeholder,
  availableTags,
  selectedTags,
  onChange,
  minSelections = 0,
  maxSelections,
  lang = 'en',
  t
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')

  const filteredTags = availableTags.filter(tag => {
    const name = lang === 'es' && tag.nameEs ? tag.nameEs : tag.name
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const selectedObjects = availableTags.filter(t => selectedTags.includes(t.id))
  const unselectedTags = availableTags.filter(t => !selectedTags.includes(t.id))
  const dropdownTags = searchQuery ? filteredTags : unselectedTags

  const handleSelect = (tagId: string) => {
    const canAdd = !maxSelections || selectedTags.length < maxSelections
    
    if (canAdd) {
      onChange([...selectedTags, tagId])
      setSearchQuery('')
      setError('')
    } else if (maxSelections) {
      setError(t ? t('tagSelector.maxSelections').replace('{max}', String(maxSelections)) 
        : `Maximum ${maxSelections} specialties allowed`)
    }
  }

  const handleRemove = (tagId: string) => {
    const canRemove = selectedTags.length > minSelections
    
    if (canRemove) {
      onChange(selectedTags.filter(id => id !== tagId))
      setError('')
    } else {
      setError(t ? t('tagSelector.minSelections').replace('{min}', String(minSelections))
        : `At least ${minSelections} specialty required`)
    }
  }

  useEffect(() => {
    if (selectedTags.length >= minSelections) {
      setError('')
    }
  }, [selectedTags.length, minSelections])

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-on-surface">
          {label}
        </label>
      )}

      <div className="relative">
        <div 
          className={`
            min-h-[52px] bg-surface-container rounded-xl border-2 transition-all cursor-pointer
            flex flex-wrap gap-2 p-2 items-center
            ${error ? 'border-error' : 'border-outline-variant focus-within:border-primary'}
            ${isOpen ? 'ring-2 ring-primary/20' : ''}
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedObjects.length === 0 ? (
            <span className="text-on-surface-variant px-2">
              {placeholder || (t ? t('tagSelector.select') : (lang === 'en' ? 'Select...' : 'Seleccionar...'))}
            </span>
          ) : (
            selectedObjects.map(tag => (
              <motion.span
                key={tag.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                  bg-primary/10 text-primary
                `}
              >
                {lang === 'es' && tag.nameEs ? tag.nameEs : tag.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(tag.id)
                  }}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            ))
          )}
          
          <Search className="w-4 h-4 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                absolute z-50 w-full mt-2
                bg-surface-container rounded-xl border border-outline-variant
                shadow-xl max-h-[240px] overflow-y-auto
              `}
            >
              {dropdownTags.length === 0 ? (
                <div className="p-4 text-center text-on-surface-variant text-sm">
                  {t ? t('tagSelector.noOptions') : (lang === 'en' ? 'No options available' : 'Sin opciones disponibles')}
                </div>
              ) : (
                <div className="p-2">
                  {dropdownTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleSelect(tag.id)}
                      className={`
                        w-full text-left px-4 py-3 rounded-lg text-sm
                        hover:bg-surface-container-high transition-colors
                        flex items-center justify-between
                        ${selectedTags.includes(tag.id) ? 'bg-primary/10' : ''}
                      `}
                    >
                      <span>{lang === 'es' && tag.nameEs ? tag.nameEs : tag.name}</span>
                      {selectedTags.includes(tag.id) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      {minSelections > 0 && (
        <p className="text-xs text-on-surface-variant">
          {t ? t('tagSelector.minRequired').replace('{min}', String(minSelections)) 
            : (lang === 'en' ? `${minSelections} minimum required` : `Mínimo ${minSelections} requerida`)}
        </p>
      )}
    </div>
  )
}