'use client'

import { useEffect, useState } from 'react'
import { FaSync, FaChartLine, FaUsers, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaDollarSign, FaRobot, FaCreditCard, FaDownload } from 'react-icons/fa'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface DashboardData {
  kpis: any
  charts: any
  tables: any
  aiMetrics: any
}

export default function DashboardTab() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0)

  // Auto-refresh cada 60 segundos
  useEffect(() => {
    loadDashboardData()
    
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-actualizando dashboard...')
      loadDashboardData()
    }, 60000) // 60 segundos

    return () => clearInterval(refreshInterval)
  }, [])

  // Contador de tiempo desde última actualización
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)
      setSecondsSinceUpdate(diff)
    }, 1000)

    return () => clearInterval(timer)
  }, [lastUpdate])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/dashboard?_=' + Date.now()) // Cache buster
      const data = await response.json()
      
      if (data.success && data.data) {
        setDashboardData(data.data)
        setLastUpdate(new Date())
        setSecondsSinceUpdate(0)
        console.log('✅ Dashboard actualizado:', new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeSince = (seconds: number) => {
    if (seconds < 60) return `hace ${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `hace ${minutes}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen general de tu negocio</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Última actualización: {formatTimeSince(secondsSinceUpdate)} • Auto-refresh cada 60s
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
          Actualizar Ahora
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Suscripciones Activas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.kpis.activeSubscriptions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">En Trial</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.kpis.trialingSubscriptions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUsers className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Cancelaciones</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.kpis.cancelationsThisMonth}</p>
              <p className="text-xs text-orange-600 mt-1">Churn: {dashboardData.kpis.churnRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaTimesCircle className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">MRR</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">€{dashboardData.kpis.mrr.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaMoneyBillWave className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Ingresos Totales</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">€{dashboardData.kpis.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaDollarSign className="text-2xl text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Reembolsos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.kpis.refundsThisMonth}</p>
              <p className="text-xs text-red-600 mt-1">Total: €{dashboardData.kpis.totalRefunded.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FaTimesCircle className="text-2xl text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Conversión</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.kpis.conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-indigo-600 mt-1">Trial → Pago</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-2xl text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Cancelaciones IA</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.aiMetrics.cancelationsProcessed}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <FaRobot className="text-2xl text-cyan-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart - Ingresos Mensuales */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-[#6366F1]" />
            Ingresos Mensuales
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.charts.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`€${value.toFixed(2)}`, 'Ingresos']} />
                <Legend />
                <Bar dataKey="revenue" fill="#6366F1" name="Ingresos (€)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - Transacciones */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaCreditCard className="text-blue-500" />
            Transacciones Mensuales
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.charts.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Transacciones"
                  dot={{ fill: '#3B82F6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart - Ingresos Acumulados */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaDollarSign className="text-purple-500" />
            Tendencia de Ingresos
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.charts.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`€${value.toFixed(2)}`, 'Ingresos']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8B5CF6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Ingresos (€)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - MRR Growth */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaMoneyBillWave className="text-green-500" />
            Crecimiento MRR
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.charts.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`€${value.toFixed(2)}`, 'MRR']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="MRR Estimado (€)"
                  dot={{ fill: '#10B981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaCreditCard className="text-[#6366F1]" />
            Transacciones Recientes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.tables.recentTransactions.slice(0, 10).map((transaction: any) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {transaction.id.substring(0, 20)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.customer_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    €{transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.created).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

