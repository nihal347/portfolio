import { ReturnButton } from '../components/ReturnButton'
import { TerminalText } from '../components/TerminalText'
import { Cpu, Database, Globe, Wrench, BrainCircuit, Layers, Eye, Server, Cloud } from 'lucide-react'
import { useContent } from '../hooks/useContent'

const ICON_MAP: Record<string, React.ReactNode> = {
  'LANGUAGES': <Layers size={14} />,
  'AI / ML': <BrainCircuit size={14} />,
  'COMPUTER VISION': <Eye size={14} />,
  'DATA SCIENCE': <Database size={14} />,
  'BACKEND & APIS': <Server size={14} />,
  'FRONTEND': <Globe size={14} />,
  'DATABASES': <Database size={14} />,
  'DEVOPS & TOOLS': <Wrench size={14} />,
  'AUTOMATION': <Cpu size={14} />,
  'CLOUD & DEPLOY': <Cloud size={14} />,
}

export function TechStack() {
  const { content } = useContent()
  const categories = content.techStack

  return (
    <>
    <div className="fixed inset-0 z-30 overflow-y-auto" style={{ background: 'rgba(2,3,8,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-6xl w-full mx-auto space-y-6 animate-fade-in pt-16 pb-24 px-4">
        
        <div className="text-center mb-8">
          <h2 className="font-pixel text-lg text-white mb-2">TECH STACK</h2>
          <div className="text-[10px] font-mono" style={{ color: 'rgba(57,255,143,0.5)' }}>
            // SYSTEMS & TOOLS // CLICK SATELLITES FOR DETAILS
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.title} className="border p-5" style={{
              borderColor: 'rgba(57,255,143,0.2)',
              background: 'rgba(2,3,8,0.8)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 20px rgba(57,255,143,0.05), inset 0 0 15px rgba(57,255,143,0.02)'
            }}>
              <h3 className="flex items-center gap-2 font-pixel text-[10px] text-white mb-4 pb-2" style={{ borderBottom: '1px solid rgba(57,255,143,0.2)' }}>
                <span style={{ color: 'rgba(57,255,143,0.8)' }}>{ICON_MAP[cat.title] || <Layers size={14} />}</span> {cat.title}
              </h3>
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono" style={{ color: 'rgba(57,255,143,0.8)' }}>{item.name}</span>
                      <span className="text-[8px] font-mono" style={{ color: 'rgba(57,255,143,0.4)' }}>{item.status}</span>
                    </div>
                    <div className="h-1.5 border" style={{ borderColor: 'rgba(57,255,143,0.15)', background: 'rgba(2,3,8,0.5)' }}>
                      <div className="h-full transition-all duration-500" style={{
                        width: `${item.level}%`,
                        background: `linear-gradient(to right, #39ff8f, rgba(57,255,143,0.3))`,
                        boxShadow: '0 0 6px rgba(57,255,143,0.4)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border p-4 text-center" style={{
          borderColor: 'rgba(57,255,143,0.15)',
          background: 'rgba(2,3,8,0.6)',
        }}>
          <TerminalText text={`> ${content.techKeywords}`} speed={15} />
        </div>
      </div>
    </div>
    <ReturnButton />
    </>
  )
}
