'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface TestResult {
  name: string
  value: number
  color: string
}

export default function AllTestsComparison() {
  // Cargar todos los resultados de tests del localStorage
  const getTestResults = (): TestResult[] => {
    const results: TestResult[] = []
    
    try {
      const storedResults = localStorage.getItem('testResults')
      if (!storedResults) return []
      
      const parsed = JSON.parse(storedResults)

      // CI
      const ciHistory = localStorage.getItem('testHistory')
      if (ciHistory) {
        const history = JSON.parse(ciHistory)
        if (history.tests && history.tests.length > 0) {
          const latestCI = history.tests[0].iq
          results.push({
            name: 'CI',
            value: latestCI,
            color: '#6366F1'
          })
        }
      }

      // Personalidad (promedio de las 5 dimensiones)
      if (parsed.personality?.results) {
        const p = parsed.personality.results
        const avg = Math.round(
          (p.openness + p.conscientiousness + p.extraversion + p.agreeableness + p.neuroticism) / 5
        )
        results.push({
          name: 'Personalidad',
          value: avg,
          color: '#8b5cf6'
        })
      }

      // Inteligencia Emocional
      if (parsed.eq?.results) {
        results.push({
          name: 'Int. Emocional',
          value: parsed.eq.results.overallEQ,
          color: '#10b981'
        })
      }

      // TDAH (invertido - menor es mejor)
      if (parsed.adhd?.results) {
        const adhdPercentage = (parsed.adhd.results.totalScore / 72) * 100
        const invertedScore = 100 - adhdPercentage
        results.push({
          name: 'Control TDAH',
          value: Math.round(invertedScore),
          color: '#3b82f6'
        })
      }

      // Ansiedad (invertido - menor es mejor)
      if (parsed.anxiety?.results) {
        const anxietyPercentage = (parsed.anxiety.results.totalScore / 21) * 100
        const invertedScore = 100 - anxietyPercentage
        results.push({
          name: 'Calma',
          value: Math.round(invertedScore),
          color: '#ef4444'
        })
      }

      // Depresión (invertido - menor es mejor)
      if (parsed.depression?.results) {
        const depressionPercentage = (parsed.depression.results.totalScore / 27) * 100
        const invertedScore = 100 - depressionPercentage
        results.push({
          name: 'Bienestar',
          value: Math.round(invertedScore),
          color: '#6b7280'
        })
      }

    } catch (error) {
      console.error('Error loading test results:', error)
    }

    return results
  }

  const testResults = getTestResults()

  if (testResults.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Sin Comparativas Aún</h3>
        <p className="text-gray-600">
          Completa más tests para ver una comparación de todos tus resultados
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Comparativa de Todos tus Tests</h2>
      <p className="text-gray-600 mb-8">Vista general de tu perfil cognitivo y emocional</p>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={testResults}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#374151', fontSize: 12, fontWeight: 'bold' }}
          />
          <YAxis 
            domain={[0, 150]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '12px'
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
          />
          <Bar 
            dataKey="value" 
            fill="#6366F1"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          >
            {testResults.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {testResults.map((result) => (
          <div key={result.name} className="text-center">
            <div 
              className="w-full h-2 rounded-full mb-2"
              style={{ backgroundColor: result.color }}
            />
            <p className="text-sm font-semibold text-gray-700">{result.name}</p>
            <p className="text-2xl font-bold" style={{ color: result.color }}>
              {result.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Interpretación:</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• <strong>CI y Personalidad:</strong> Puntuaciones directas (mayor es mejor)</li>
          <li>• <strong>Control TDAH, Calma y Bienestar:</strong> Puntuaciones invertidas (mayor = menos síntomas)</li>
          <li>• <strong>Objetivo:</strong> Equilibrio general entre todas las áreas</li>
        </ul>
      </div>
    </div>
  )
}

