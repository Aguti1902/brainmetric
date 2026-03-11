'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import DashboardTab from '@/components/admin/DashboardTab'
import SubscriptionsTab from '@/components/admin/SubscriptionsTab'
import TransactionsTab from '@/components/admin/TransactionsTab'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      
      if (!data.isAdmin) {
        router.push('/es/login')
        return
      }
      
      setIsAdmin(true)
      setUserEmail(data.email || '')
      setLoading(false)
    } catch (error) {
      console.error('Error verificando admin:', error)
      router.push('/es/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userEmail={userEmail}
      />
      
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'subscriptions' && <SubscriptionsTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
      </div>
    </div>
  )
}
