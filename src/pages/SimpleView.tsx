import { useStore } from '../store/useStore'
import { GitBranch, Mail, FileText } from 'lucide-react'

export function SimpleView() {
  const { toggleSimpleView } = useStore()
  
  return (
    <div className="fixed inset-0 z-[100] bg-white text-black overflow-y-auto font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Nihal</h1>
          <button 
            onClick={toggleSimpleView}
            className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors text-sm font-medium"
          >
            Switch to Interactive Mode
          </button>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">About Me</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            I'm a self-taught developer primarily focused on Python, currently forging a path toward AI/ML engineering. When I'm not training models or building tools like my JARVIS-styled AI assistant 'Siji', I'm usually gaming, watching anime, or playing guitar. My ultimate objective is to found a tech startup that pushes the boundaries of what's possible.
          </p>
          
          <h3 className="text-xl font-bold mb-3">Skills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <strong>Languages:</strong> Python, C, C#, HTML/CSS
            </div>
            <div>
              <strong>AI/ML:</strong> PyTorch, LangChain, LLMs
            </div>
            <div>
              <strong>Tools:</strong> Git, React, Docker
            </div>
            <div>
              <strong>Currently Learning:</strong> Linear Algebra, AI Agents
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Projects</h2>
          <div className="space-y-6">
            <ProjectCard 
                name="Siji v0.1"
                desc="In-progress JARVIS-styled AI assistant. Integrates LLMs, voice recognition, and system control into a single unified interface."
                tags={['Python', 'AI/ML']}
                links={[{ label: 'GitHub', url: '#' }, { label: 'Live', url: '#' }]}
            />
            <ProjectCard 
                name="GPT-4All + ESP32 Voice"
                desc="A voice assistant running locally via GPT-4All, interfacing with an ESP32 microcontroller for hardware control and sensory input."
                tags={['Hardware', 'C++', 'Python']}
                links={[{ label: 'GitHub', url: '#' }]}
            />
            <ProjectCard 
                name="CS50 AI Capstone"
                desc="Final project for Harvard's CS50 AI course. Implements various search algorithms, machine learning models, and optimization techniques."
                tags={['Python', 'AI', 'Algorithms']}
                links={[{ label: 'GitHub', url: '#' }]}
            />
            <ProjectCard 
                name="Web Scrapers & CLI Tools"
                desc="A collection of terminal tools and web scrapers built to automate mundane tasks and extract structured data from various sources."
                tags={['Python', 'CLI', 'Automation']}
                links={[{ label: 'GitHub', url: '#' }]}
            />
            <ProjectCard 
                name="Pomodoro Timer"
                desc="A sleek, distraction-free pomodoro timer with customizable intervals and native desktop notifications."
                tags={['Python', 'GUI']}
                links={[{ label: 'GitHub', url: '#' }]}
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Contact & Links</h2>
          <div className="flex gap-6">
            <a href="mailto:nihalakndo321@gmail.com" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium">
              <Mail size={20} /> Email Me
            </a>
            <a href="/resume.pdf" download className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium">
              <FileText size={20} /> Resume
            </a>
            <a href="https://github.com/Nihal347" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium">
              <GitBranch size={20} /> GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

function ProjectCard({ name, desc, tags, links }: { name: string, desc: string, tags: string[], links: {label: string, url: string}[] }) {
    return (
        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-gray-900">{name}</h3>
            <p className="text-gray-600 mb-4">{desc}</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {tags.map(t => <span key={t} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-sm font-medium">{t}</span>)}
            </div>
            <div className="flex gap-4">
                {links.map(l => (
                    <a key={l.label} href={l.url} className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                        {l.label}
                    </a>
                ))}
            </div>
        </div>
    )
}
