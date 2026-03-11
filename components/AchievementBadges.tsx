'use client'

import { FaTrophy, FaBrain, FaFire, FaStar, FaCrown, FaRocket, FaMedal, FaGem } from 'react-icons/fa'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

export function getAchievements(stats: any): Achievement[] {
  const totalTests = stats.totalTests || 0
  const averageIQ = stats.averageIQ || 0
  const highestIQ = stats.highestIQ || 0

  return [
    {
      id: 'first_test',
      title: 'Primer Paso',
      description: 'Completaste tu primer test',
      icon: <FaBrain className="text-3xl" />,
      color: 'from-blue-500 to-blue-600',
      unlocked: totalTests >= 1
    },
    {
      id: 'five_tests',
      title: 'Explorador Mental',
      description: 'Completaste 5 tests',
      icon: <FaStar className="text-3xl" />,
      color: 'from-purple-500 to-purple-600',
      unlocked: totalTests >= 5,
      progress: Math.min(totalTests, 5),
      maxProgress: 5
    },
    {
      id: 'ten_tests',
      title: 'Investigador Dedicado',
      description: 'Completaste 10 tests',
      icon: <FaTrophy className="text-3xl" />,
      color: 'from-yellow-500 to-yellow-600',
      unlocked: totalTests >= 10,
      progress: Math.min(totalTests, 10),
      maxProgress: 10
    },
    {
      id: 'genius',
      title: 'Genio Certificado',
      description: 'Alcanzaste un CI de 130+',
      icon: <FaCrown className="text-3xl" />,
      color: 'from-purple-500 to-purple-700',
      unlocked: highestIQ >= 130
    },
    {
      id: 'high_achiever',
      title: 'Alto Rendimiento',
      description: 'CI promedio superior a 115',
      icon: <FaRocket className="text-3xl" />,
      color: 'from-green-500 to-green-600',
      unlocked: averageIQ >= 115
    },
    {
      id: 'consistent',
      title: 'Consistencia',
      description: 'Mantén tu CI en 3 tests consecutivos (±5 puntos)',
      icon: <FaFire className="text-3xl" />,
      color: 'from-orange-500 to-orange-600',
      unlocked: false // Lógica más compleja requerida
    },
    {
      id: 'all_tests',
      title: 'Maestro de Tests',
      description: 'Completaste todos los tipos de tests disponibles',
      icon: <FaMedal className="text-3xl" />,
      color: 'from-pink-500 to-pink-600',
      unlocked: false // Requiere verificar tipos de tests
    },
    {
      id: 'perfect_score',
      title: 'Perfección',
      description: 'Obtén 20/20 en un test de CI',
      icon: <FaGem className="text-3xl" />,
      color: 'from-cyan-500 to-cyan-600',
      unlocked: false // Requiere verificar respuestas correctas
    }
  ]
}

export default function AchievementBadges({ stats }: { stats: any }) {
  const achievements = getAchievements(stats)
  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Logros Desbloqueados</h2>
          <p className="text-gray-600">Has desbloqueado {unlockedCount} de {achievements.length} logros</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-[#6366F1]">{unlockedCount}/{achievements.length}</div>
          <div className="text-sm text-gray-600">Completado</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative rounded-xl p-6 text-center transition-all duration-300 ${
              achievement.unlocked
                ? `bg-gradient-to-br ${achievement.color} text-white shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer`
                : 'bg-gray-100 text-gray-400 opacity-50'
            }`}
          >
            {/* Badge Icon */}
            <div className={`mb-4 ${achievement.unlocked ? '' : 'grayscale'}`}>
              {achievement.icon}
            </div>

            {/* Title */}
            <h3 className={`font-bold mb-2 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
              {achievement.title}
            </h3>

            {/* Description */}
            <p className={`text-xs ${achievement.unlocked ? 'text-white/90' : 'text-gray-400'}`}>
              {achievement.description}
            </p>

            {/* Progress Bar (if applicable) */}
            {achievement.progress !== undefined && achievement.maxProgress && (
              <div className="mt-4">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
                <p className="text-xs mt-1 opacity-90">
                  {achievement.progress}/{achievement.maxProgress}
                </p>
              </div>
            )}

            {/* Lock Icon for locked achievements */}
            {!achievement.unlocked && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔒</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

