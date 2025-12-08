'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: '🏠',
      activeIcon: '🏠',
    },
    {
      name: 'Wallet',
      href: '/wallet',
      icon: '💰',
      activeIcon: '💰',
    },
    {
      name: 'Add',
      href: '/add',
      icon: '➕',
      isCenter: true,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: '📊',
      activeIcon: '📊',
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: '👤',
      activeIcon: '👤',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E6C288] shadow-lg z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            
            if (item.isCenter) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-8"
                >
                  <div className="w-16 h-16 bg-[#4A3B32] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4A3B32]/90 active:scale-95 transition-all border-4 border-white">
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                </Link>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg transition-all ${
                  isActive
                    ? 'text-[#4A3B32]'
                    : 'text-[#4A3B32]/40 hover:text-[#4A3B32]/70'
                }`}
              >
                <span className="text-2xl mb-1">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isActive ? 'text-[#4A3B32]' : 'text-[#4A3B32]/40'
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#4A3B32] rounded-t-full" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

