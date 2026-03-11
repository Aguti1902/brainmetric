'use client'

import { useEffect, useState } from 'react'
import { FaSearch, FaFilter, FaSync, FaUndo, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refundingId, setRefundingId] = useState<string | null>(null)
  const [refundModal, setRefundModal] = useState<{show: boolean, transaction: any}>({show: false, transaction: null})
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('requested_by_customer')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0)

  // Auto-refresh cada 60 segundos
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-actualizando transacciones...')
      loadTransactions()
    }, 60000)

    return () => clearInterval(refreshInterval)
  }, [search, statusFilter])

  // Cargar cuando cambian filtros
  useEffect(() => {
    loadTransactions()
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

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('_', Date.now().toString()) // Cache buster
      
      const response = await fetch(`/api/admin/transactions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.data)
        setLastUpdate(new Date())
        setSecondsSinceUpdate(0)
        console.log('✅ Transacciones actualizadas:', new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeSince = (seconds: number) => {
    if (seconds < 60) return `hace ${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `hace ${minutes}m`
  }

  const openRefundModal = (transaction: any) => {
    setRefundModal({show: true, transaction})
    setRefundAmount((transaction.amount - transaction.amount_refunded).toFixed(2))
  }

  const handleRefund = async () => {
    if (!refundModal.transaction) return
    
    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Monto inválido')
      return
    }
    
    if (amount > (refundModal.transaction.amount - refundModal.transaction.amount_refunded)) {
      alert('El monto excede el disponible para reembolso')
      return
    }
    
    setRefundingId(refundModal.transaction.id)
    try {
      const response = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chargeId: refundModal.transaction.id,
          amount: amount,
          reason: refundReason,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Reembolso procesado exitosamente')
        setRefundModal({show: false, transaction: null})
        loadTransactions()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      alert('Error procesando reembolso')
    } finally {
      setRefundingId(null)
    }
  }

  const getStatusBadge = (status: string, refunded: boolean) => {
    if (refunded) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 flex items-center gap-1">
        <FaUndo /> Reembolsado
      </span>
    }
    
    if (status === 'succeeded') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1">
        <FaCheckCircle /> Exitoso
      </span>
    }
    
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1">
      <FaTimesCircle /> Fallido
    </span>
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-gray-600 mt-1">Gestiona pagos y reembolsos</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Última actualización: {formatTimeSince(secondsSinceUpdate)} • Auto-refresh cada 60s
          </p>
        </div>
        <button
          onClick={loadTransactions}
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

          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="succeeded">Exitosos</option>
              <option value="failed">Fallidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Total Transacciones</p>
          <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Exitosas</p>
          <p className="text-2xl font-bold text-green-600">
            {transactions.filter(t => t.status === 'succeeded').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Reembolsadas</p>
          <p className="text-2xl font-bold text-orange-600">
            {transactions.filter(t => t.refunded).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Total Ingresos</p>
          <p className="text-2xl font-bold text-[#6366F1]">
            €{transactions.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron transacciones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {transaction.id.substring(0, 15)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.customer_name}</p>
                        <p className="text-sm text-gray-500">{transaction.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-bold text-gray-900">€{transaction.amount.toFixed(2)}</p>
                        {transaction.amount_refunded > 0 && (
                          <p className="text-xs text-orange-600">
                            Reembolsado: €{transaction.amount_refunded.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status, transaction.refunded)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.created).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.status === 'succeeded' && !transaction.refunded && (
                        <button
                          onClick={() => openRefundModal(transaction)}
                          className="text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1"
                        >
                          <FaUndo />
                          Reembolsar
                        </button>
                      )}
                      {transaction.refunded && (
                        <span className="text-gray-400 text-xs">Ya reembolsado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModal.show && refundModal.transaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Procesar Reembolso</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Transacción</p>
              <p className="font-mono text-sm">{refundModal.transaction.id}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-medium">{refundModal.transaction.customer_email}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Monto disponible para reembolso</p>
              <p className="text-xl font-bold text-gray-900">
                €{(refundModal.transaction.amount - refundModal.transaction.amount_refunded).toFixed(2)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto a reembolsar (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo
              </label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              >
                <option value="requested_by_customer">Solicitado por cliente</option>
                <option value="duplicate">Duplicado</option>
                <option value="fraudulent">Fraudulento</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRefundModal({show: false, transaction: null})}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRefund}
                disabled={refundingId !== null}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {refundingId ? 'Procesando...' : 'Reembolsar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

