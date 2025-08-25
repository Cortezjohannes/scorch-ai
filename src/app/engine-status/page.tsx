import EngineStatusDashboard from '@/components/EngineStatusDashboard'

export default function EngineStatusPage() {
  return (
    <div className="min-h-screen text-white" style={{ fontFamily: 'League Spartan, sans-serif' }}>
      {/* Fire Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-20 -z-10"
      >
        <source src="/fire_background.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10">
        <EngineStatusDashboard />
      </div>
    </div>
  )
}