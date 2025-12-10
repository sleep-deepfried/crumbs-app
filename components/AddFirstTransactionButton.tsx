'use client'

import { useAddTransaction } from './AddTransactionContext'

export default function AddFirstTransactionButton() {
  const { openModal } = useAddTransaction()

  return (
    <button
      onClick={openModal}
      className="inline-block bg-[#4A3B32] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#4A3B32]/90 active:scale-95 transition-all shadow-lg"
    >
      ✨ Add First Transaction
    </button>
  )
}

