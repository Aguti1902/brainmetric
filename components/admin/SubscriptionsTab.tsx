'use client'

import { useEffect, useState } from 'react'
import { FaSearch, FaFilter, FaSync, FaTrash, FaCheckCircle, FaHourglassHalf, FaBan } from 'react-icons/fa'

export default function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0)

  // Auto-refresh cada 60 segundos
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-actualizando suscripciones...')
      loadSubscriptions()
    }, 60000)

    return () => clearInterval(refreshInterval)
  }, [search, statusFilter])

  // Cargar cuando cambian filtros
  useEffect(() => {
    loadSubscriptions()
  }, [search, statusFilter])

  // Contador de tiempo desde última actualización
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)
      setSecondsSinceUpdate(diff)
    }, 1000)

    return () => clearInterval(timer)
  }, [lastUpdate])

  const loadSubscriptions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('_', Date.now().toString()) // Cache buster
      
      const response = await fetch(`/api/admin/subscriptions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setSubscriptions(data.data)
        setLastUpdate(new Date())
        setSecondsSinceUpdate(0)
        console.log('✅ Suscripciones actualizadas:', new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeSince = (seconds: number) => {
    if (seconds < 60) return `hace ${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `hace ${minutes}m`
  }

  const handleCancelSubscription = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta suscripción?')) return
    
    setCancelingId(id)
    try {
      const response = await fetch(`/api/admin/subscriptions?id=${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Suscripción cancelada exitosamente')
        loadSubscriptions()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Error cancelando suscripción')
    } finally {
      setCancelingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle, label: 'Activa' },
      trialing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaHourglassHalf, label: 'Trial' },
      canceled: { bg: 'bg-red-100', text: 'text-red-800', icon: FaBan, label: 'Cancelada' },
      past_due: { bg: 'bg-orange-100', text: 'text-orange-800', icon: FaBan, label: 'Vencida' },
    }
    
    const config = statusConfig[status] || statusConfig.canceled
    const Icon = config.icon
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.bg} ${config.text}`}>
        <Icon />
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suscripciones</h1>
          <p className="text-gray-600 mt-1">Gestiona todas las suscripciones activas</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Última actualización: {formatTimeSince(secondsSinceUpdate)} • Auto-refresh cada 60s
          </p>
        </div>
        <button
          onClick={loadSubscriptions}
          disabled={loading}
          className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
          Actualizar Ahora
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email, ID o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="trialing">En Trial</option>
              <option value="canceled">Canceladas</option>
              <option value="past_due">Vencidas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Activas</p>
          <p className="text-2xl font-bold text-green-600">
            {subscriptions.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">En Trial</p>
          <p className="text-2xl font-bold text-blue-600">
            {subscriptions.filter(s => s.status === 'trialing').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Canceladas</p>
          <p className="text-2xl font-bold text-red-600">
            {subscriptions.filter(s => s.status === 'canceled').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron suscripciones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {sub.id.substring(0, 15)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sub.customer_name}</p>
                        <p className="text-sm text-gray-500">{sub.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      €{sub.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sub.current_period_end).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {sub.status !== 'canceled' && (
                        <button
                          onClick={() => handleCancelSubscription(sub.id)}
                          disabled={cancelingId === sub.id}
                          className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                          <FaTrash />
                          {cancelingId === sub.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

