'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, Salad, Dumbbell, BookOpen, Target } from 'lucide-react'

const navItems = [
  { href: '/', label: '總覽', icon: LayoutDashboard },
  { href: '/finance', label: '財務收支', icon: Wallet },
  { href: '/diet', label: '飲食紀錄', icon: Salad },
  { href: '/exercise', label: '運動紀錄', icon: Dumbbell },
  { href: '/journal', label: '生活日記', icon: BookOpen },
  { href: '/career', label: '生涯規劃', icon: Target },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-zinc-900 text-zinc-100 flex flex-col py-6 px-3 shrink-0">
      <div className="mb-8 px-3">
        <h1 className="text-lg font-bold text-white">生活重啟</h1>
        <p className="text-xs text-zinc-400 mt-0.5">好好生活，從今天開始</p>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
