'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Plus, BarChart3, User } from 'lucide-react'
import { useAddTransaction } from './AddTransactionContext'
import AddTransactionModal from './AddTransactionModal'
import { Account } from '@/types'

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  accounts?: Account[];
}

export default function BottomNav({ activeTab, onTabChange, accounts = [] }: BottomNavProps) {
  const pathname = usePathname()
  const { isOpen, openModal, closeModal } = useAddTransaction()

  if (pathname?.startsWith('/auth')) {
    return null
  }


  const navItems = [
    {
      name: 'Home',
      id: 'home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Wallet',
      id: 'wallet',
      href: '/wallet',
      icon: Wallet,
    },
    {
      name: 'Add',
      id: 'add',
      href: '/add',
      icon: Plus,
      isCenter: true,
    },
    {
      name: 'Analytics',
      id: 'analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'Profile',
      id: 'profile',
      href: '/profile',
      icon: User,
    },
  ]

  const isControlled = activeTab !== undefined && onTabChange !== undefined;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E6C288] shadow-lg z-50"
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around h-20" role="list">
          {navItems.map((item) => {
            // Determine active state
            let isActive = false;
            if (isControlled) {
              isActive = activeTab === item.id;
            } else {
              isActive = pathname === item.href;
            }

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

            const className = `flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg transition-all relative ${
                  isActive
                    ? 'text-[#4A3B32]'
                    : 'text-[#4A3B32]/70 hover:text-[#4A3B32]'
                }`;

            if (isControlled && onTabChange) {
               return (
                <button
                  key={item.name}
                  onClick={() => onTabChange(item.id!)}
                  className={className}
                  aria-label={`Navigate to ${item.name}`}
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
                </button>
               )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={className}
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
      <AddTransactionModal isOpen={isOpen} onClose={closeModal} accounts={accounts} />
    </nav>
  )
}

