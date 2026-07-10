import { useState } from 'react'
import { TerminalText } from './TerminalText'
import { ReturnButton } from './ReturnButton'
import { useStore } from '../store/useStore'
import { Download, Send, Mail, ExternalLink } from 'lucide-react'

export function CommsPanel() {
  const { addExploration, unlockAchievement, achievements } = useStore()
  const [downloading, setDownloading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState('')

  const handleDownload = () => {
    setDownloading(true)
    setDownloadStatus('extracting resume.pdf...')
    
    setTimeout(() => {
        setDownloadStatus('OBTAINED: resume.pdf')
        
        setTimeout(() => {
            const link = document.createElement('a')
            link.href = (import.meta.env.BASE_URL || '/') + 'resume.pdf'
            link.download = 'nihal_resume.pdf'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            setDownloading(false)
            setDownloadStatus('')
            addExploration(10)
            
            if (!achievements.resumeDownloaded) {
                unlockAchievement('resumeDownloaded')
            }
        }, 1500)
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const web3FormsKey = '04a29f89-7406-47ec-8922-7c1f12d25712'
    
    if (web3FormsKey === 'YOUR_ACCESS_KEY_HERE' || !web3FormsKey) {
      const mailtoLink = `mailto:nihalakndo321@gmail.com?subject=Portfolio Contact from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`
      window.location.href = mailtoLink
      setFormStatus('Opening email client...')
    } else {
      setFormStatus('Sending...')
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: web3FormsKey,
          subject: 'Portfolio Contact',
          name: formData.name,
          email: formData.email,
          message: formData.message
        })
      }).then(() => {
        setFormStatus('Message sent!')
        setFormData({ name: '', email: '', message: '' })
      }).catch(() => {
        setFormStatus('Error. Try email link below.')
      })
    }
  }

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(2,3,8,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-5xl w-full mx-auto space-y-6 animate-fade-in text-left pt-16 pb-24 px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Resume Download */}
          <div className="border p-6" style={{ 
            borderColor: 'rgba(255,61,240,0.3)', 
            background: 'rgba(2,3,8,0.75)', 
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 30px rgba(255,61,240,0.08), inset 0 0 20px rgba(255,61,240,0.03)' 
          }}>
            <div className="flex items-center gap-2 mb-5 pb-3" style={{ borderBottom: '1px solid rgba(255,61,240,0.2)' }}>
              <Download size={16} style={{ color: 'var(--color-magenta)' }} />
              <h3 className="font-pixel text-sm text-white">RESUME</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-mono" style={{ color: 'rgba(255,61,240,0.6)' }}>
                &gt; Requesting secure document...
              </p>
              
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="w-full border transition-all py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-mono text-sm"
                style={{ 
                  background: 'rgba(255,61,240,0.08)', 
                  borderColor: 'rgba(255,61,240,0.4)', 
                  color: 'var(--color-magenta)' 
                }}
                onMouseEnter={e => { if (!downloading) { e.currentTarget.style.background = 'rgba(255,61,240,0.15)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255,61,240,0.15)' } }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,61,240,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                $ extract resume.pdf
              </button>
              
              {downloadStatus && (
                <div className="text-xs font-mono" style={{ color: 'var(--color-magenta)' }}>
                  <TerminalText text={downloadStatus} speed={20} />
                </div>
              )}
              
              <p className="text-[10px] font-mono" style={{ color: 'rgba(255,61,240,0.3)' }}>
                Note: Place your resume.pdf in the /public folder
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="border p-6" style={{ 
            borderColor: 'rgba(255,61,240,0.3)', 
            background: 'rgba(2,3,8,0.75)', 
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 30px rgba(255,61,240,0.08), inset 0 0 20px rgba(255,61,240,0.03)' 
          }}>
            <div className="flex items-center gap-2 mb-5 pb-3" style={{ borderBottom: '1px solid rgba(255,61,240,0.2)' }}>
              <Send size={16} style={{ color: 'var(--color-magenta)' }} />
              <h3 className="font-pixel text-sm text-white">SEND MESSAGE</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block mb-1 text-[11px] font-mono" style={{ color: 'rgba(255,61,240,0.5)' }}>--sender-name=</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent outline-none py-1.5 text-white text-xs font-mono" 
                  style={{ borderBottom: '1px solid rgba(255,61,240,0.3)' }}
                  onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--color-magenta)' }}
                  onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,61,240,0.3)' }}
                />
              </div>
              
              <div>
                <label className="block mb-1 text-[11px] font-mono" style={{ color: 'rgba(255,61,240,0.5)' }}>--sender-email=</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent outline-none py-1.5 text-white text-xs font-mono"
                  style={{ borderBottom: '1px solid rgba(255,61,240,0.3)' }}
                  onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--color-magenta)' }}
                  onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,61,240,0.3)' }}
                />
              </div>
              
              <div>
                <label className="block mb-1 text-[11px] font-mono" style={{ color: 'rgba(255,61,240,0.5)' }}>--payload=</label>
                <textarea 
                  name="message" 
                  required 
                  rows={4} 
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-transparent outline-none p-2 text-white text-xs font-mono resize-none mt-1"
                  style={{ border: '1px solid rgba(255,61,240,0.3)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-magenta)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,61,240,0.3)' }}
                ></textarea>
              </div>
              
              <button type="submit" className="w-full font-bold py-2.5 transition-all cursor-pointer font-mono text-sm" style={{ background: 'rgba(255,61,240,0.15)', border: '1px solid rgba(255,61,240,0.4)', color: 'var(--color-magenta)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,61,240,0.25)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255,61,240,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,61,240,0.15)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                &gt; execute send
              </button>
              
              {formStatus && (
                <p className="text-xs font-mono animate-pulse" style={{ color: 'var(--color-magenta)' }}>{formStatus}</p>
              )}
            </form>
          </div>

        </div>

        {/* Quick contact links */}
        <div className="border p-4 flex flex-wrap gap-3" style={{ 
          borderColor: 'rgba(255,61,240,0.2)', 
          background: 'rgba(2,3,8,0.6)', 
        }}>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(255,61,240,0.4)' }}>DIRECT LINKS:</span>
          <a href="mailto:nihalakndo321@gmail.com" className="flex items-center gap-1.5 text-[10px] font-mono transition-colors" style={{ color: 'rgba(255,61,240,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-magenta)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,61,240,0.5)' }}
          >
            <Mail size={10} /> Email
          </a>
          <a href="https://github.com/Nihal347" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-mono transition-colors" style={{ color: 'rgba(255,61,240,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-magenta)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,61,240,0.5)' }}
          >
            <ExternalLink size={10} /> GitHub
          </a>
        </div>
      </div>
    </div>
    <ReturnButton color="rgba(255,61,240,0.6)" />
    </>
  )
}
