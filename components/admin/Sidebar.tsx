'use client'

import { FaChartLine, FaUsers, FaCreditCard, FaCog, FaSignOutAlt, FaHome } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userEmail: string
}

export default function Sidebar({ activeTab, onTabChange, userEmail }: SidebarProps) {
  const router = useRouter()
  
  const handleLogout = () => {
    document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/es/login')
  }
  
  const menuItems = [
    { id: 'dashboard', icon: FaChartLine, label: 'Dashboard', color: 'text-[#6366F1]' },
    { id: 'subscriptions', icon: FaUsers, label: 'Suscripciones', color: 'text-blue-500' },
    { id: 'transactions', icon: FaCreditCard, label: 'Transacciones', color: 'text-purple-500' },
  ]
  
  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-lg flex items-center justify-center">
            <FaHome className="text-xl text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">MindMetric</h1>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>
      
      {/* User Info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#6366F1] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{userEmail}</p>
            <p className="text-gray-400 text-xs">Administrador</p>
          </div>
        </div>
      </div>
      
      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#6366F1] text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className={`text-xl ${isActive ? 'text-white' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-900 hover:text-white transition-all"
        >
          <FaSignOutAlt className="text-xl" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

