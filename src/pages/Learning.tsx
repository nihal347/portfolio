import { ReturnButton } from '../components/ReturnButton'
import { TerminalText } from '../components/TerminalText'
import { BookOpen, Target, TrendingUp, Sparkles } from 'lucide-react'
import { useContent } from '../hooks/useContent'

const PATH_ICONS: Record<string, React.ReactNode> = {
  'CURRENT FOCUS': <Target size={14} />,
  'COMPLETED': <Sparkles size={14} />,
  'ROADMAP': <TrendingUp size={14} />,
}

export function Learning() {
  const { content } = useContent()
  const { paths, books } = content.learning

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(2,3,8,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-5xl w-full mx-auto space-y-6 animate-fade-in pt-16 pb-24 px-4">
        
        <div className="text-center mb-6">
          <h2 className="font-pixel text-lg text-white mb-2">LEARNING</h2>
          <div className="text-[10px] font-mono" style={{ color: 'rgba(200,180,140,0.5)' }}>
            // SKILL PROGRESSION & KNOWLEDGE BASE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paths.map((path) => (
            <div key={path.title} className="border p-5" style={{
              borderColor: 'rgba(200,180,140,0.2)',
              background: 'rgba(2,3,8,0.8)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 20px rgba(200,180,140,0.05), inset 0 0 15px rgba(200,180,140,0.02)'
            }}>
              <h3 className="flex items-center gap-2 font-pixel text-[10px] text-white mb-4 pb-2" style={{ borderBottom: '1px solid rgba(200,180,140,0.2)' }}>
                <span style={{ color: 'rgba(200,180,140,0.8)' }}>{PATH_ICONS[path.title] || <Target size={14} />}</span> {path.title}
              </h3>
              <div className="space-y-4">
                {path.items.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono" style={{ color: 'rgba(200,180,140,0.8)' }}>{item.name}</span>
                      <span className="text-[8px] font-mono" style={{
                        color: item.status === 'Done' || item.status === 'Complete' ? '#39ff8f' :
                               item.status === 'Active' || item.status === 'In Progress' ? '#fbbf24' :
                               'rgba(200,180,140,0.4)'
                      }}>{item.status}</span>
                    </div>
                    <div className="h-1.5 border" style={{ borderColor: 'rgba(200,180,140,0.15)', background: 'rgba(2,3,8,0.5)' }}>
                      <div className="h-full transition-all duration-500" style={{
                        width: `${item.progress}%`,
                        background: item.progress === 100
                          ? 'linear-gradient(to right, #39ff8f, rgba(57,255,143,0.5))'
                          : 'linear-gradient(to right, var(--color-jupiter), rgba(200,180,140,0.3))',
                        boxShadow: item.progress === 100 ? '0 0 6px rgba(57,255,143,0.4)' : 'none'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border p-5" style={{
          borderColor: 'rgba(200,180,140,0.2)',
          background: 'rgba(2,3,8,0.8)',
          backdropFilter: 'blur(8px)',
        }}>
          <h3 className="flex items-center gap-2 font-pixel text-[10px] text-white mb-4 pb-2" style={{ borderBottom: '1px solid rgba(200,180,140,0.2)' }}>
            <BookOpen size={14} style={{ color: 'rgba(200,180,140,0.8)' }} /> READING LIST
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {books.map((book) => (
              <div key={book.title} className="flex items-center gap-3 p-2 border" style={{
                borderColor: 'rgba(200,180,140,0.1)',
                background: 'rgba(200,180,140,0.02)'
              }}>
                <div className="w-8 h-10 border flex items-center justify-center shrink-0" style={{
                  borderColor: 'rgba(200,180,140,0.3)',
                  background: 'rgba(200,180,140,0.05)',
                  color: 'rgba(200,180,140,0.6)'
                }}>
                  <BookOpen size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-white truncate">{book.title}</p>
                  <p className="text-[8px] font-mono" style={{ color: 'rgba(200,180,140,0.4)' }}>{book.author}</p>
                </div>
                <span className="text-[8px] font-mono px-1 border shrink-0" style={{
                  color: book.status === 'Complete' ? '#39ff8f' : book.status === 'Reading' ? '#fbbf24' : 'rgba(200,180,140,0.4)',
                  borderColor: book.status === 'Complete' ? 'rgba(57,255,143,0.3)' : book.status === 'Reading' ? 'rgba(251,191,36,0.3)' : 'rgba(200,180,140,0.2)'
                }}>{book.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border p-4 text-center" style={{
          borderColor: 'rgba(200,180,140,0.15)',
          background: 'rgba(2,3,8,0.6)',
        }}>
          <TerminalText text="> Knowledge is the fuel of innovation. Keep learning..." speed={20} />
        </div>
      </div>
    </div>
    <ReturnButton color="rgba(200,180,140,0.6)" />
    </>
  )
}
