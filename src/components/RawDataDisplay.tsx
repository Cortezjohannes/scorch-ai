'use client'

interface RawDataDisplayProps {
  data: any
  title: string
  description?: string
}

export default function RawDataDisplay({ data, title, description }: RawDataDisplayProps) {
  return (
    <div className="bg-black border border-red-500 rounded p-6 my-4">
      <h3 className="text-red-400 font-bold mb-4">🔍 {title} - RAW DATA QA MODE</h3>
      {description && (
        <p className="text-red-300 text-sm mb-4">{description}</p>
      )}
      <div className="text-red-300 text-sm mb-4">
        Data Type: {typeof data} | Keys: {data && typeof data === 'object' ? Object.keys(data).join(', ') : 'N/A'}
      </div>
      <pre className="whitespace-pre-wrap text-green-400 font-mono text-xs leading-relaxed bg-gray-900 p-4 rounded border border-green-500 overflow-auto max-h-96">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

