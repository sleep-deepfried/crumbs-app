import Link from 'next/link'

export default function FAB() {
  return (
    <Link href="/add">
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#4A3B32] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#4A3B32]/90 active:scale-95 transition-all btn-touch z-50"
        aria-label="Add Transaction"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </Link>
  )
}

