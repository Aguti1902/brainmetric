'use client'

import { FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa'

export default function ExportResults() {
  const handleExportPDF = () => {
    // Implementación básica - se puede expandir con jsPDF
    alert('Función de exportación PDF en desarrollo. Por ahora, puedes usar "Imprimir" desde tu navegador.')
    window.print()
  }

  const handleExportJSON = () => {
    try {
      // Recopilar todos los datos
      const testResults = localStorage.getItem('testResults') || '{}'
      const testHistory = localStorage.getItem('testHistory') || '{}'
      const userData = localStorage.getItem('user_data') || '{}'

      const exportData = {
        exportDate: new Date().toISOString(),
        userData: JSON.parse(userData),
        testResults: JSON.parse(testResults),
        testHistory: JSON.parse(testHistory)
      }

      // Crear blob y descargar
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `brainmetric-results-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exportando resultados:', error)
      alert('Error al exportar resultados. Inténtalo de nuevo.')
    }
  }

  const handleExportCSV = () => {
    try {
      const testHistory = localStorage.getItem('testHistory')
      if (!testHistory) {
        alert('No hay historial de tests para exportar')
        return
      }

      const history = JSON.parse(testHistory)
      if (!history.tests || history.tests.length === 0) {
        alert('No hay tests completados para exportar')
        return
      }

      // Crear CSV
      let csv = 'Fecha,Test,Puntuación CI,Respuestas Correctas,Tiempo (min)\n'
      
      history.tests.forEach((test: any) => {
        const date = new Date(test.date).toLocaleDateString('es-ES')
        const time = Math.round(test.timeElapsed / 60)
        csv += `${date},Test CI,${test.iq},${test.correctAnswers},${time}\n`
      })

      // Descargar
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `brainmetric-history-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exportando CSV:', error)
      alert('Error al exportar historial. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] rounded-2xl shadow-xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-2">Exportar Resultados</h2>
      <p className="text-white/80 mb-8">Descarga todos tus datos y resultados</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Exportar PDF */}
        <button
          onClick={handleExportPDF}
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-6 transition-all duration-300 hover:scale-105 text-center"
        >
          <FaFilePdf className="text-5xl mx-auto mb-3 text-red-400" />
          <h3 className="font-bold text-lg mb-2">Exportar PDF</h3>
          <p className="text-sm text-white/80">
            Documento completo con todos tus resultados
          </p>
        </button>

        {/* Exportar JSON */}
        <button
          onClick={handleExportJSON}
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-6 transition-all duration-300 hover:scale-105 text-center"
        >
          <FaDownload className="text-5xl mx-auto mb-3 text-[#6366F1]" />
          <h3 className="font-bold text-lg mb-2">Exportar JSON</h3>
          <p className="text-sm text-white/80">
            Datos completos en formato JSON
          </p>
        </button>

        {/* Exportar CSV */}
        <button
          onClick={handleExportCSV}
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-6 transition-all duration-300 hover:scale-105 text-center"
        >
          <FaFileExcel className="text-5xl mx-auto mb-3 text-green-400" />
          <h3 className="font-bold text-lg mb-2">Exportar CSV</h3>
          <p className="text-sm text-white/80">
            Historial en formato Excel/CSV
          </p>
        </button>
      </div>

      <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <p className="text-sm text-white/90">
          💡 <strong>Consejo:</strong> Exporta tus datos regularmente para tener un registro de tu progreso a lo largo del tiempo.
        </p>
      </div>
    </div>
  )
}

