'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AddTransactionContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const AddTransactionContext = createContext<AddTransactionContextType | undefined>(undefined)

export function AddTransactionProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <AddTransactionContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </AddTransactionContext.Provider>
  )
}

export function useAddTransaction() {
  const context = useContext(AddTransactionContext)
  if (context === undefined) {
    throw new Error('useAddTransaction must be used within AddTransactionProvider')
  }
  return context
}

