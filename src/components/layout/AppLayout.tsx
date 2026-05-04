import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const mainPad = collapsed ? 'pl-[72px]' : 'pl-[248px]'

  return (
    <div className="min-h-svh bg-neutral-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={`min-h-svh transition-[padding] duration-300 ease-out ${mainPad}`}
      >
        <div className="mx-auto w-full max-w-[min(100%,1920px)] px-5 py-8 sm:px-6 lg:py-10 xl:px-8 2xl:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
