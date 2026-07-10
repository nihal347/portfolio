import { TerminalText } from '../components/TerminalText'
import { ReturnButton } from '../components/ReturnButton'
import { User, Code2, Database, BrainCircuit, TerminalSquare } from 'lucide-react'
import { useContent } from '../hooks/useContent'

const GROUP_ICONS: Record<string, React.ReactNode> = {
  'Languages': <Code2 size={14} />,
  'AI/ML': <BrainCircuit size={14} />,
  'Backend': <Database size={14} />,
  'Tools': <TerminalSquare size={14} />,
}

export function Profile() {
  const { content } = useContent()
  const { profile } = content

  const bioText = `> Class: Self-Taught Developer
> Base: Earth (Sec-42)

Loading bio...
$ cat about.txt

${profile.bio}`

  return (
    <>
    <div className="fixed inset-0 z-30 overflow-y-auto" style={{ background: 'rgba(2,3,8,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-5xl w-full mx-auto space-y-6 animate-fade-in text-left pt-16 pb-24 px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1 border p-6 flex flex-col items-center text-center" style={{ 
            borderColor: 'rgba(58,123,213,0.4)', 
            background: 'rgba(2,3,8,0.75)', 
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 30px rgba(58,123,213,0.1), inset 0 0 20px rgba(58,123,213,0.05)' 
          }}>
             <div className="w-32 h-32 border-2 flex items-center justify-center mb-5 relative" style={{ 
               borderColor: 'rgba(58,123,213,0.5)', 
               background: 'rgba(58,123,213,0.08)' 
             }}>
                <User size={60} style={{ color: 'rgba(109,179,242,0.8)' }} />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ background: '#39ff8f' }} />
             </div>
             <h2 className="font-pixel text-xl mb-1 text-white">{profile.name}</h2>
             <p className="text-xs mb-4" style={{ color: 'rgba(109,179,242,0.6)' }}>{profile.title}</p>
             <div className="w-full text-left text-[11px] space-y-1.5 pt-4 font-mono" style={{ borderTop: '1px solid rgba(58,123,213,0.3)', color: 'rgba(109,179,242,0.5)' }}>
                <p>&gt; {profile.languages}</p>
                <p>&gt; {profile.focus}</p>
                <p>&gt; {profile.project}</p>
                <p className="animate-pulse mt-3" style={{ color: 'var(--color-earth)' }}>&gt; STATUS: ACTIVE</p>
             </div>
          </div>

          {/* Bio Section */}
          <div className="md:col-span-2 border p-6" style={{ 
            borderColor: 'rgba(58,123,213,0.4)', 
            background: 'rgba(2,3,8,0.75)', 
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 30px rgba(58,123,213,0.1), inset 0 0 20px rgba(58,123,213,0.05)' 
          }}>
             <div className="text-sm md:text-base leading-relaxed min-h-[200px]" style={{ color: 'rgba(109,179,242,0.9)' }}>
                <TerminalText text={bioText} speed={15} glitch={true} />
             </div>
          </div>
        </div>

        {/* Skills */}
        <div className="border p-6" style={{ 
          borderColor: 'rgba(58,123,213,0.4)', 
          background: 'rgba(2,3,8,0.75)', 
          backdropFilter: 'blur(8px)',
          boxShadow: '0 0 30px rgba(58,123,213,0.1), inset 0 0 20px rgba(58,123,213,0.05)' 
        }}>
            <h3 className="font-pixel text-sm mb-5 pb-3 text-white" style={{ borderBottom: '1px solid rgba(58,123,213,0.3)' }}>SKILL_TREE.sys</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {profile.skillGroups.map((group) => (
                  <SkillGroup key={group.title} title={group.title} icon={GROUP_ICONS[group.title] || <Code2 size={14} />}>
                    {group.skills.map((skill) => (
                      <SkillNode key={skill.name} name={skill.name} level={skill.level} status={skill.status} />
                    ))}
                  </SkillGroup>
                ))}
            </div>
        </div>
      </div>
    </div>
    <ReturnButton color="rgba(58,123,213,0.6)" />
    </>
  )
}

function SkillGroup({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-white/80 pb-2 text-xs" style={{ borderBottom: '1px solid rgba(58,123,213,0.2)' }}>
                {icon} {title}
            </h4>
            <div className="flex flex-col gap-3 pl-3" style={{ borderLeft: '1px solid rgba(58,123,213,0.2)' }}>
                {children}
            </div>
        </div>
    )
}

function SkillNode({ name, level, status }: { name: string; level: number; status: string }) {
    return (
        <div className="group relative">
            <div className="flex items-center gap-2 cursor-crosshair">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-earth)', opacity: 0.5 }}></div>
                <span className="text-[11px]" style={{ color: 'rgba(109,179,242,0.8)' }}>{name}</span>
            </div>
            <div className="mt-1 h-[4px] border ml-3.5" style={{ borderColor: 'rgba(58,123,213,0.15)' }}>
              <div className="h-full transition-all duration-500" style={{ width: `${level}%`, background: `linear-gradient(to right, var(--color-earth), rgba(58,123,213,0.3))` }} />
            </div>
            
            <div className="absolute left-6 top-0 bg-black/90 border p-2 text-[10px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 min-w-[140px] pointer-events-none -translate-y-2 group-hover:-translate-y-3" style={{ borderColor: 'var(--color-earth)', boxShadow: '0 0 10px rgba(58,123,213,0.3)' }}>
                <p className="text-white/50 mb-1">{level}% mastered</p>
                <p style={{ color: 'var(--color-earth)' }}>&gt; {status.toLowerCase()}</p>
            </div>
        </div>
    )
}
