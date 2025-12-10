'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Plus, BarChart3, User } from 'lucide-react'
import { useAddTransaction } from './AddTransactionContext'
import AddTransactionModal from './AddTransactionModal'

export default function BottomNav() {
  const pathname = usePathname()
  const { isOpen, openModal, closeModal } = useAddTransaction()

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Wallet',
      href: '/wallet',
      icon: Wallet,
    },
    {
      name: 'Add',
      href: '/add',
      icon: Plus,
      isCenter: true,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ]

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E6C288] shadow-lg z-50"
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around h-20" role="list">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            if (item.isCenter) {
              return (
                <button
                  key={item.name}
                  onClick={openModal}
                  className="flex flex-col items-center justify-center -mt-8"
                  aria-label={`${item.name} - Open add transaction modal`}
                  aria-pressed={isOpen}
                >
                  <div className="w-16 h-16 bg-[#4A3B32] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4A3B32]/90 active:scale-95 transition-all border-4 border-white">
                    <Icon size={28} className="text-white" strokeWidth={2} aria-hidden="true" />
                  </div>
                </button>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg transition-all relative ${
                  isActive
                    ? 'text-[#4A3B32]'
                    : 'text-[#4A3B32]/70 hover:text-[#4A3B32]'
                }`}
                aria-label={`Navigate to ${item.name} page`}
                aria-current={isActive ? 'page' : undefined}
                role="listitem"
              >
                <Icon 
                  size={24} 
                  className="mb-1" 
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span
                  className={`text-[10px] font-semibold ${
                    isActive ? 'text-[#4A3B32]' : 'text-[#4A3B32]/70'
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#4A3B32] rounded-t-full"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
      
      {/* Modal */}
      <AddTransactionModal isOpen={isOpen} onClose={closeModal} />
    </nav>
  )
}

