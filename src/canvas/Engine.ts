export interface Vector2 {
  x: number;
  y: number;
}

export interface Body {
  name: string;
  label: string;
  color: string;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hover?: boolean;
  baseColor: string;
  highlightColor: string;
  shadowColor: string;
  ringColor?: string;
  hasRing?: boolean;
  rotationAngle?: number;
  // Large planet texture data
  textureSeed?: number;
  craterSeed?: number;
  bandSeed?: number;
}

export interface Asteroid {
  name: string;
  label: string;
  orbitRadius: number;
  angle: number;
  speed: number;
  size: number;
  x: number;
  y: number;
  hover?: boolean;
}

export interface Satellite {
  name: string;
  status: string;
  experience: string;
  level: number;
  description: string;
  usedFor: string[];
  orbitRadius: number;
  angle: number;
  speed: number;
  size: number;
  x: number;
  y: number;
  hover?: boolean;
  paused?: boolean;
}

export interface Project {
  name: string;
  description: string;
  tech: string[];
  github: string;
  tags: string[];
}

export interface LearningItem {
  name: string
  category: string
  progress: number
  description: string
}

export class SpaceEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bodies: Body[] = [];
  asteroids: Asteroid[] = [];
  satellites: Satellite[] = [];
  projects: Project[] = [];
  learningItems: LearningItem[] = [];
  hoveredSatellite: Satellite | null = null;
  hoveredAsteroid: Asteroid | null = null;
  hoveredProjectIndex: number = -1;
  stars: {x: number, y: number, layer: number, brightness: number}[] = [];
  nebulaClouds: {x: number, y: number, radius: number, color: string, opacity: number}[] = [];
  distantNebula = { x: 0, y: 0, radius: 500, color: [90, 50, 140], opacity: 0.18 };
  galaxy: { x: number, y: number, stars: { angle: number, dist: number, arm: number, size: number, brightness: number }[], coreStars: { x: number, y: number, size: number, brightness: number }[] } = { x: 0, y: 0, stars: [], coreStars: [] };
  scrollY = 0;
  projectScrollY = 0;
  
  MU = 200000;
  cx = 0;
  cy = 0;
  
  mouseX = 0;
  mouseY = 0;
  
  layers = [
    { count: 120, speed: 0.015, size: 0.8, color: 'rgba(180,200,255,0.4)' },
    { count: 80, speed: 0.035, size: 1.2, color: 'rgba(200,220,255,0.6)' },
    { count: 40, speed: 0.06, size: 1.8, color: 'rgba(220,240,255,0.8)' },
    { count: 15, speed: 0.1, size: 2.5, color: 'rgba(255,255,255,0.95)' }
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error("No 2D context");
    this.ctx = context;
    this.resize();
    
    // Initialize stars with brightness
    this.layers.forEach((layer, li) => {
      for(let i=0; i<layer.count; i++){
        this.stars.push({ 
          x: Math.random()*this.canvas.width, 
          y: Math.random()*this.canvas.height, 
          layer: li,
          brightness: 0.5 + Math.random() * 0.5
        });
      }
    });

    // Initialize nebula clouds for background depth
    for(let i=0; i<6; i++){
      this.nebulaClouds.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: 100 + Math.random() * 200,
        color: ['rgba(40,20,80,', 'rgba(20,40,80,', 'rgba(60,20,40,', 'rgba(20,60,60,'][Math.floor(Math.random()*4)],
        opacity: 0.03 + Math.random() * 0.04
      });
    }

    // Distant nebula — top-right corner, large soft glow
    this.distantNebula.x = this.canvas.width * 0.82;
    this.distantNebula.y = this.canvas.height * 0.18;
    this.distantNebula.radius = Math.max(this.canvas.width, this.canvas.height) * 0.45;

    // Pixelated galaxy — bottom-left corner
    this.galaxy.x = this.canvas.width * 0.15;
    this.galaxy.y = this.canvas.height * 0.82;
    const galCenterX = this.canvas.width * 0.15;
    const galCenterY = this.canvas.height * 0.82;
    // Spiral arm stars
    for (let arm = 0; arm < 3; arm++) {
      const armOffset = (arm / 3) * Math.PI * 2;
      for (let i = 0; i < 180; i++) {
        const t = i / 180;
        const dist = t * 160 + Math.random() * 30;
        const spiralAngle = armOffset + t * Math.PI * 3 + (Math.random() - 0.5) * 0.6;
        this.galaxy.stars.push({
          angle: spiralAngle,
          dist,
          arm,
          size: (1 - t * 0.6) * (1 + Math.floor(Math.random() * 2)),
          brightness: 0.4 + Math.random() * 0.6
        });
      }
    }
    // Core glow stars
    for (let i = 0; i < 80; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * 25;
      this.galaxy.coreStars.push({
        x: galCenterX + Math.cos(a) * d,
        y: galCenterY + Math.sin(a) * d,
        size: 1 + Math.floor(Math.random() * 2),
        brightness: 0.5 + Math.random() * 0.5
      });
    }

    // Solar system inspired planets with 3D shading colors
    this.bodies = [
      this.circularBody(70, Math.PI*0.5, {
        name:'about',    
        label:'ABOUT ME', 
        baseColor:'#8a8a8a',
        highlightColor:'#b0b0b0',
        shadowColor:'#4a4a4a',
        radius: 6,
        hasRing: false,
        rotationAngle: 0
      }),
      this.circularBody(120, Math.PI*1.2, {
        name:'techstack', 
        label:'TECH STACK',    
        baseColor:'#c49a3c',
        highlightColor:'#e8c56a',
        shadowColor:'#6b5a1a',
        radius: 10,
        hasRing: false,
        rotationAngle: 0
      }),
      this.circularBody(175, Math.PI*0.1, {
        name:'projects', 
        label:'PROJECTS',    
        baseColor:'#2a6b3a',
        highlightColor:'#4aa86a',
        shadowColor:'#1a3a25',
        radius: 9,
        hasRing: false,
        rotationAngle: 0
      }),
      this.circularBody(230, Math.PI*1.8, {
        name:'missions', 
        label:'MISSIONS',    
        baseColor:'#5a3a8b',
        highlightColor:'#8a6abf',
        shadowColor:'#2a1a4a',
        radius: 12,
        hasRing: false,
        rotationAngle: 0
      }),
      this.circularBody(320, Math.PI*0.8, {
        name:'learning', 
        label:'LEARNING',    
        baseColor:'#8b6a2b',
        highlightColor:'#c49a5a',
        shadowColor:'#4a3a15',
        radius: 10,
        hasRing: true,
        ringColor: 'rgba(200,180,140,0.4)',
        rotationAngle: 0
      }),
      this.circularBody(400, Math.PI*1.5, {
        name:'comms',  
        label:'COMMS',     
        baseColor:'#c45a3c',
        highlightColor:'#e8956a',
        shadowColor:'#6b2a1a',
        radius: 5,
        hasRing: false,
        rotationAngle: 0
      })
    ];

    // Tech stack asteroid belt between profile (185) and missions (275)
    const techStack = [
      'Python', 'C', 'C#', 'JavaScript', 'SQL',
      'PyTorch', 'TensorFlow', 'Scikit-learn', 'LangChain', 'LangGraph',
      'Hugging Face', 'RAG', 'NLP', 'Deep Learning', 'Computer Vision',
      'OpenCV', 'YOLO', 'OCR', 'NumPy', 'Pandas', 'Matplotlib',
      'FastAPI', 'Flask', 'REST APIs', 'WebSockets', 'React',
      'HTML5', 'CSS3', 'Three.js', 'PostgreSQL', 'SQLite', 'MongoDB',
      'FAISS', 'ChromaDB', 'Git', 'GitHub', 'Docker', 'Jupyter Notebook',
      'VS Code', 'Linux', 'Postman', 'Playwright', 'Selenium',
      'BeautifulSoup', 'Requests', 'Render', 'Vercel', 'GitHub Actions',
      'DSA', 'OOP', 'Multithreading', 'Async Programming', 'Agentic AI',
      'Feature Engineering', 'Data Preprocessing', 'Software Design',
      'Data Structures', 'Algorithms', 'Prompt Engineering'
    ];
    
    const beltRadius = 275;
    techStack.forEach((name, i) => {
      const angle = (i / techStack.length) * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.04;
      const size = 2 + Math.random() * 2;
      const orbitOffset = (Math.random() - 0.5) * 20;
      this.asteroids.push({
        name,
        label: name,
        orbitRadius: beltRadius + orbitOffset,
        angle,
        speed,
        size,
        x: this.cx + (beltRadius + orbitOffset) * Math.cos(angle),
        y: this.cy + (beltRadius + orbitOffset) * Math.sin(angle),
      });
    });

    // Tech stack satellites for zoomed view
    const techData = [
      { name: 'PYTHON', status: 'ONLINE', experience: '4+ Years', level: 90, description: 'Core language for AI/ML and automation', usedFor: ['Machine Learning', 'Automation', 'Backend', 'APIs', 'Data Analysis'], category: 'CORE SYSTEMS' },
      { name: 'C', status: 'ONLINE', experience: '1+ Years', level: 75, description: 'Low-level systems programming', usedFor: ['Systems Programming', 'Performance'], category: 'CORE SYSTEMS' },
      { name: 'C#', status: 'ONLINE', experience: '1+ Years', level: 65, description: 'Object-oriented application development', usedFor: ['Desktop Apps', 'Game Dev'], category: 'CORE SYSTEMS' },
      { name: 'JAVASCRIPT', status: 'ONLINE', experience: '2+ Years', level: 70, description: 'Web development and scripting', usedFor: ['Frontend', 'Web Apps', 'Node.js'], category: 'CORE SYSTEMS' },
      { name: 'C#', status: 'ONLINE', experience: '1+ Years', level: 65, description: 'Object-oriented application development', usedFor: ['Desktop Apps', 'Game Dev', 'Unity'], category: 'CORE SYSTEMS' },
      { name: 'SQL', status: 'ONLINE', experience: '2+ Years', level: 60, description: 'Database query language', usedFor: ['Data Queries', 'Database Management'], category: 'CORE SYSTEMS' },
      { name: 'PYTORCH', status: 'ONLINE', experience: '1+ Years', level: 55, description: 'Deep learning framework', usedFor: ['Neural Networks', 'Research', 'Model Training'], category: 'AI MODULES' },
      { name: 'TENSORFLOW', status: 'LEARNING', experience: '6+ Months', level: 45, description: 'Production ML platform', usedFor: ['Deep Learning', 'Deployment'], category: 'AI MODULES' },
      { name: 'SCIKIT-LEARN', status: 'ONLINE', experience: '2+ Years', level: 60, description: 'Machine learning library for Python', usedFor: ['ML Models', 'Data Mining', 'Classification'], category: 'AI MODULES' },
      { name: 'LANGCHAIN', status: 'ONLINE', experience: '1+ Years', level: 65, description: 'LLM application framework', usedFor: ['LLMs', 'RAG', 'Agents'], category: 'AI MODULES' },
      { name: 'HUGGING FACE', status: 'ONLINE', experience: '1+ Years', level: 55, description: 'Transformer models platform', usedFor: ['NLP', 'LLMs', 'Model Hub'], category: 'AI MODULES' },
      { name: 'OPENCV', status: 'ONLINE', experience: '1+ Years', level: 60, description: 'Computer vision library', usedFor: ['Image Processing', 'Object Detection', 'OCR'], category: 'AI MODULES' },
      { name: 'FASTAPI', status: 'ONLINE', experience: '1+ Years', level: 65, description: 'Modern async API framework', usedFor: ['REST APIs', 'Microservices', 'WebSockets'], category: 'WEB MODULES' },
      { name: 'FLASK', status: 'ONLINE', experience: '2+ Years', level: 70, description: 'Lightweight web framework', usedFor: ['APIs', 'Web Apps', 'Backends'], category: 'WEB MODULES' },
      { name: 'REACT', status: 'ONLINE', experience: '2+ Years', level: 75, description: 'Frontend UI library', usedFor: ['Web Apps', 'UI Components', 'SPA'], category: 'WEB MODULES' },
      { name: 'POSTGRESQL', status: 'ONLINE', experience: '1+ Years', level: 55, description: 'Advanced relational database', usedFor: ['Data Storage', 'Backend DB'], category: 'DATA CORE' },
      { name: 'MONGODB', status: 'LEARNING', experience: '6+ Months', level: 50, description: 'NoSQL document database', usedFor: ['Data Storage', 'Backend DB'], category: 'DATA CORE' },
      { name: 'SQLITE', status: 'ONLINE', experience: '2+ Years', level: 65, description: 'Lightweight SQL database', usedFor: ['Local Storage', 'Embedded DB'], category: 'DATA CORE' },
      { name: 'FAISS', status: 'LEARNING', experience: '3+ Months', level: 45, description: 'Vector similarity search', usedFor: ['Vector DB', 'RAG', 'Embeddings'], category: 'DATA CORE' },
      { name: 'NUMPY', status: 'ONLINE', experience: '3+ Years', level: 70, description: 'Numerical computing library', usedFor: ['Data Processing', 'Math Operations'], category: 'DATA CORE' },
      { name: 'PANDAS', status: 'ONLINE', experience: '3+ Years', level: 65, description: 'Data manipulation and analysis', usedFor: ['Data Analysis', 'CSV Processing'], category: 'DATA CORE' },
      { name: 'GIT', status: 'ONLINE', experience: '3+ Years', level: 80, description: 'Version control system', usedFor: ['Code Management', 'Collaboration'], category: 'SHIP TOOLS' },
      { name: 'GITHUB', status: 'ONLINE', experience: '3+ Years', level: 80, description: 'Code hosting platform', usedFor: ['Repositories', 'CI/CD', 'Portfolio'], category: 'SHIP TOOLS' },
      { name: 'DOCKER', status: 'LEARNING', experience: '3+ Months', level: 40, description: 'Containerization platform', usedFor: ['Deployment', 'Containers'], category: 'SHIP TOOLS' },
      { name: 'VS CODE', status: 'ONLINE', experience: '3+ Years', level: 90, description: 'Primary code editor', usedFor: ['Development', 'Debugging', 'Extensions'], category: 'SHIP TOOLS' },
      { name: 'JUPYTER', status: 'ONLINE', experience: '2+ Years', level: 85, description: 'Interactive notebooks', usedFor: ['Data Science', 'Prototyping', 'Visualization'], category: 'SHIP TOOLS' },
      { name: 'LINUX', status: 'ONLINE', experience: '2+ Years', level: 65, description: 'Unix-based operating system', usedFor: ['Development', 'Servers', 'CLI'], category: 'SHIP TOOLS' },
      { name: 'PLAYWRIGHT', status: 'ONLINE', experience: '1+ Years', level: 55, description: 'Browser automation', usedFor: ['Web Automation', 'Testing', 'Scraping'], category: 'AUTOMATION SUITE' },
      { name: 'SELENIUM', status: 'ONLINE', experience: '1+ Years', level: 60, description: 'Browser automation', usedFor: ['Web Automation', 'Testing'], category: 'AUTOMATION SUITE' },
      { name: 'BEAUTIFULSOUP', status: 'ONLINE', experience: '2+ Years', level: 70, description: 'Web scraping library', usedFor: ['Scraping', 'HTML Parsing'], category: 'AUTOMATION SUITE' },
      { name: 'REQUESTS', status: 'ONLINE', experience: '3+ Years', level: 80, description: 'HTTP client library', usedFor: ['API Calls', 'Web Requests'], category: 'AUTOMATION SUITE' },
      { name: 'HTML5', status: 'ONLINE', experience: '3+ Years', level: 85, description: 'Markup language for web pages', usedFor: ['Web Structure', 'Semantic HTML'], category: 'FRONTEND' },
      { name: 'CSS3', status: 'ONLINE', experience: '3+ Years', level: 80, description: 'Styling and layout', usedFor: ['Styling', 'Responsive Design', 'Animations'], category: 'FRONTEND' },
      { name: 'THREE.JS', status: 'LEARNING', experience: '3+ Months', level: 40, description: '3D graphics library', usedFor: ['3D Rendering', 'WebGL', 'Visualization'], category: 'FRONTEND' },
    ];

    const satOrbits = [50, 75, 100, 130, 160];
    let catIndex = 0;
    let satInCat = 0;
    techData.forEach((tech, i) => {
      if (i > 0 && tech.category !== techData[i-1].category) {
        catIndex = (catIndex + 1) % satOrbits.length;
        satInCat = 0;
      }
      const orbitR = satOrbits[catIndex];
      const angle = (satInCat / 6) * Math.PI * 2 + catIndex * 0.5;
      const speed = 0.15 + Math.random() * 0.1;
      this.satellites.push({
        ...tech,
        orbitRadius: orbitR,
        angle,
        speed,
        size: 4,
        x: 0,
        y: 0,
      });
      satInCat++;
    });

    // Projects data
    this.projects = [
      {
        name: 'SIJI',
        description: 'AI desktop assistant with voice interaction, LLMs, and automation',
        tech: ['Python', 'FastAPI', 'LangChain'],
        github: 'https://github.com/Nihal347/SIJI',
        tags: ['AI', 'Assistant', 'LLMs']
      },
      {
        name: 'genesis',
        description: 'AI civilization simulator with emergent behavior',
        tech: ['Python', 'PyTorch', 'OpenGL'],
        github: 'https://github.com/Nihal347/genesis',
        tags: ['AI', 'Simulation', 'Algorithms']
      },
      {
        name: 'Orbital',
        description: 'N-body gravity simulator with real-time visualization',
        tech: ['Python', 'OpenGL', 'NumPy'],
        github: 'https://github.com/Nihal347/Orbital',
        tags: ['Physics', 'Simulation', 'GPU']
      },
      {
        name: 'ASTROmind',
        description: 'Space intelligence dashboard with NASA APIs and 3D visualization',
        tech: ['Python', 'React', 'Three.js', 'FastAPI'],
        github: 'https://github.com/Nihal347/ASTROmind',
        tags: ['Full-Stack', '3D', 'Space']
      },
      {
        name: 'vision-OS',
        description: 'Computer vision platform with real-time detection and OCR',
        tech: ['Python', 'OpenCV', 'YOLO', 'FastAPI', 'React'],
        github: 'https://github.com/Nihal347/vision-OS',
        tags: ['CV', 'Detection', 'AI']
      },
      {
        name: 'Fake-News-Detection-System',
        description: 'Machine learning model that can detect fake news',
        tech: ['Python', 'Jupyter Notebook', 'Scikit-learn'],
        github: 'https://github.com/Nihal347/Fake-News-Detection-System',
        tags: ['ML', 'NLP', 'Classification']
      },
      {
        name: 'sentiment-analysis',
        description: 'Movie review sentiment analysis with Naive Bayes using 50K IMDB reviews',
        tech: ['Python', 'NLP', 'Scikit-learn'],
        github: 'https://github.com/Nihal347/sentiment-analysis',
        tags: ['NLP', 'Sentiment', 'ML']
      },
      {
        name: 'banking-system',
        description: 'Small banking system built in Python',
        tech: ['Python'],
        github: 'https://github.com/Nihal347/banking-system',
        tags: ['Python', 'Backend', 'Finance']
      },
      {
        name: 'automation-projects',
        description: 'Collection of automation projects and scripts',
        tech: ['Python', 'Selenium', 'BeautifulSoup'],
        github: 'https://github.com/Nihal347/automation-projects',
        tags: ['Automation', 'Scraping', 'Scripts']
      },
    ];

    this.learningItems = [
      { name: 'RUST', category: 'LANGUAGES', progress: 30, description: 'Systems programming, memory safety' },
      { name: 'WEBASSEMBLY', category: 'COMPILER', progress: 20, description: 'Browser-native fast execution' },
      { name: 'KUBERNETES', category: 'DEVOPS', progress: 45, description: 'Container orchestration at scale' },
      { name: 'THREE.JS', category: 'GRAPHICS', progress: 55, description: '3D rendering in the browser' },
      { name: 'NEURAL NETWORKS', category: 'AI/ML', progress: 70, description: 'Deep learning architectures' },
      { name: 'REINFORCEMENT LEARNING', category: 'AI/ML', progress: 40, description: 'Agent-based learning systems' },
      { name: 'GO', category: 'LANGUAGES', progress: 35, description: 'Concurrent backend services' },
      { name: 'ASTRO', category: 'WEB', progress: 60, description: 'Static-first web framework' },
      { name: 'EDGE COMPUTING', category: 'INFRA', progress: 25, description: 'Distributed edge deployment' },
      { name: 'QUANTUM COMPUTING', category: '前沿', progress: 15, description: 'Qubits and quantum gates' },
      { name: 'COMPUTER VISION', category: 'AI/ML', progress: 65, description: 'Image recognition and detection' },
      { name: 'NLP', category: 'AI/ML', progress: 75, description: 'Natural language processing' },
    ];
  }
  
  resize() {
      this.cx = this.canvas.width / 2;
      this.cy = this.canvas.height / 2;
  }

  async loadContent() {
    try {
      const res = await fetch('/content.json?t=' + Date.now())
      if (!res.ok) return
      const data = await res.json()

      // Rebuild asteroids
      this.asteroids = []
      const beltRadius = 275
      const asteroidNames: string[] = data.asteroidBelt || []
      asteroidNames.forEach((name: string, i: number) => {
        const angle = (i / asteroidNames.length) * Math.PI * 2
        const speed = 0.08 + Math.random() * 0.04
        const size = 2 + Math.random() * 2
        const orbitOffset = (Math.random() - 0.5) * 20
        this.asteroids.push({
          name,
          label: name,
          orbitRadius: beltRadius + orbitOffset,
          angle,
          speed,
          size,
          x: this.cx + (beltRadius + orbitOffset) * Math.cos(angle),
          y: this.cy + (beltRadius + orbitOffset) * Math.sin(angle),
        })
      })

      // Rebuild satellites
      this.satellites = []
      const techData: any[] = data.satellites || []
      const satOrbits = [50, 75, 100, 130, 160]
      let catIndex = 0
      let satInCat = 0
      techData.forEach((tech: any, i: number) => {
        if (i > 0 && tech.category !== techData[i - 1].category) {
          catIndex = (catIndex + 1) % satOrbits.length
          satInCat = 0
        }
        const orbitR = satOrbits[catIndex]
        const angle = (satInCat / 6) * Math.PI * 2 + catIndex * 0.5
        const speed = 0.15 + Math.random() * 0.1
        this.satellites.push({
          ...tech,
          orbitRadius: orbitR,
          angle,
          speed,
          size: 4,
          x: 0,
          y: 0,
        })
        satInCat++
      })
    } catch (err) {
      console.error('Failed to load content for engine:', err)
    }
  }

  openProjectLink() {
    if (this.hoveredProjectIndex >= 0 && this.hoveredProjectIndex < this.projects.length) {
      const project = this.projects[this.hoveredProjectIndex];
      window.open(project.github, '_blank', 'noopener,noreferrer');
    }
  }

  circularBody(r: number, theta0: number, opts: any): Body {
    const v = Math.sqrt(this.MU / r);
    return {
      name: opts.name, 
      label: opts.label, 
      color: opts.baseColor, 
      radius: opts.radius,
      baseColor: opts.baseColor,
      highlightColor: opts.highlightColor,
      shadowColor: opts.shadowColor,
      hasRing: opts.hasRing,
      ringColor: opts.ringColor,
      rotationAngle: opts.rotationAngle || 0,
      textureSeed: Math.random() * 1000,
      craterSeed: Math.random() * 1000,
      bandSeed: Math.random() * 1000,
      x: this.cx + r*Math.cos(theta0), 
      y: this.cy + r*Math.sin(theta0),
      vx: -v*Math.sin(theta0), 
      vy: v*Math.cos(theta0)
    };
  }

  setMousePos(x: number, y: number) {
      this.mouseX = x;
      this.mouseY = y;
  }

  private drawDistantNebula(t: number) {
    const n = this.distantNebula;
    const breathe = 1 + Math.sin(t * 0.0002) * 0.12;
    const r = n.radius * breathe;
    const [cr, cg, cb] = n.color;

    // Wide outer glow
    const g1 = this.ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
    g1.addColorStop(0, `rgba(${cr},${cg},${cb},${n.opacity})`);
    g1.addColorStop(0.15, `rgba(${cr},${cg},${cb},${n.opacity * 0.8})`);
    g1.addColorStop(0.4, `rgba(${cr},${cg},${cb},${n.opacity * 0.35})`);
    g1.addColorStop(0.7, `rgba(${cr},${cg},${cb},${n.opacity * 0.1})`);
    g1.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    this.ctx.fillStyle = g1;
    this.ctx.beginPath();
    this.ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner core — brighter pink/magenta wisp
    const shift = Math.sin(t * 0.00015) * 0.5 + 0.5;
    const coreR = Math.floor(120 + shift * 60);
    const coreG = Math.floor(40 + (1 - shift) * 30);
    const coreB = Math.floor(130 + shift * 50);
    const g2 = this.ctx.createRadialGradient(n.x - r * 0.1, n.y + r * 0.05, 0, n.x, n.y, r * 0.4);
    g2.addColorStop(0, `rgba(${coreR},${coreG},${coreB},${n.opacity * 1.5})`);
    g2.addColorStop(0.4, `rgba(${coreR},${coreG},${coreB},${n.opacity * 0.6})`);
    g2.addColorStop(1, `rgba(${coreR},${coreG},${coreB},0)`);
    this.ctx.fillStyle = g2;
    this.ctx.beginPath();
    this.ctx.arc(n.x, n.y, r * 0.4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // @ts-ignore — reserved for future use
  private _drawGalaxy(t: number) {
    const g = this.galaxy;
    const rotation = t * 0.00003;
    const cx = g.x;
    const cy = g.y;

    // Soft core glow
    const coreGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    coreGrad.addColorStop(0, 'rgba(200,180,255,0.12)');
    coreGrad.addColorStop(0.5, 'rgba(150,120,200,0.05)');
    coreGrad.addColorStop(1, 'rgba(100,80,150,0)');
    this.ctx.fillStyle = coreGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    this.ctx.fill();

    // Core stars — bright pixel cluster
    this.galaxy.coreStars.forEach(s => {
      const flicker = 0.7 + Math.sin(t * 0.005 + s.x * 0.1) * 0.3;
      const alpha = s.brightness * flicker;
      this.ctx.fillStyle = `rgba(220,210,255,${alpha.toFixed(2)})`;
      this.ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    });

    // Spiral arm stars — pixelated
    const armColors = [
      [140, 160, 255],  // blue
      [180, 140, 220],  // purple
      [200, 170, 140],  // warm
    ];

    g.stars.forEach(s => {
      const a = s.angle + rotation;
      const px = cx + Math.cos(a) * s.dist;
      const py = cy + Math.sin(a) * s.dist * 0.55; // elliptical tilt
      const flicker = 0.6 + Math.sin(t * 0.003 + s.dist * 0.05) * 0.4;
      const alpha = s.brightness * flicker * 0.7;
      const c = armColors[s.arm];
      this.ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha.toFixed(2)})`;
      this.ctx.fillRect(Math.floor(px), Math.floor(py), s.size, s.size);
    });

    // Dust lane hint — darker arc between arms
    this.ctx.save();
    this.ctx.globalAlpha = 0.04;
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 60, rotation + 1, rotation + 2.5);
    this.ctx.arc(cx, cy, 20, rotation + 2.5, rotation + 1, true);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  update(dt: number) {
    // Planets
    this.bodies.forEach(b => {
      const dx = b.x - this.cx;
      const dy = b.y - this.cy;
      const r = Math.sqrt(dx*dx + dy*dy) || 1;
      const aMag = this.MU / (r*r);
      const ax = -aMag * dx/r;
      const ay = -aMag * dy/r;
      b.vx += ax*dt; b.vy += ay*dt;
      b.x += b.vx*dt; b.y += b.vy*dt;
      
      // Hover state
      b.hover = Math.hypot(this.mouseX - b.x, this.mouseY - b.y) < b.radius + 12;
    });

    // Asteroid belt
    this.hoveredAsteroid = null;
    this.asteroids.forEach(a => {
      a.angle += a.speed * dt;
      a.x = this.cx + a.orbitRadius * Math.cos(a.angle);
      a.y = this.cy + a.orbitRadius * Math.sin(a.angle);
      a.hover = Math.hypot(this.mouseX - a.x, this.mouseY - a.y) < a.size + 8;
      if (a.hover) this.hoveredAsteroid = a;
    });
  }

  draw(t: number, drawLabels = true, showOrbits = true, radarActive = false, scanActive = false) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    
    // Deep space background with gradient
    const bgGrad = this.ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(W, H) * 0.7);
    bgGrad.addColorStop(0, 'rgba(10,12,25,1)');
    bgGrad.addColorStop(0.5, 'rgba(5,7,15,1)');
    bgGrad.addColorStop(1, 'rgba(2,3,8,1)');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, W, H);

    // Distant nebula for depth
    this.drawDistantNebula(t);

    // Nebula clouds for depth
    this.nebulaClouds.forEach(cloud => {
      const grad = this.ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
      grad.addColorStop(0, cloud.color + cloud.opacity + ')');
      grad.addColorStop(1, cloud.color + '0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Stars with twinkling effect
    this.stars.forEach(s => {
      const layer = this.layers[s.layer];
      let px = s.x % W;
      let py = s.y % H;
      if(px<0) px+=W; if(py<0) py+=H;
      
      // Twinkle effect
      const twinkle = 0.7 + Math.sin(t * 0.003 + s.x * 0.1) * 0.3;
      const alpha = parseFloat(layer.color.match(/[\d.]+(?=\))/)?.[0] || '1') * s.brightness * twinkle;
      
      this.ctx.fillStyle = layer.color.replace(/[\d.]+\)/, alpha.toFixed(2) + ')');
      this.ctx.fillRect(px, py, layer.size, layer.size);
      
      // Add glow to brightest stars
      if (layer.size > 2) {
        this.ctx.fillStyle = layer.color.replace(/[\d.]+\)/, (alpha * 0.3).toFixed(2) + ')');
        this.ctx.beginPath();
        this.ctx.arc(px, py, layer.size * 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Hub Core - Sun with corona effect
    const pulse = 1 + Math.sin(t/600)*0.06;
    const coronaPulse = 1 + Math.sin(t/800)*0.1;
    
    // Outer corona glow
    const coronaGrad = this.ctx.createRadialGradient(this.cx, this.cy, 8, this.cx, this.cy, 80*coronaPulse);
    coronaGrad.addColorStop(0, 'rgba(255,200,100,0.4)');
    coronaGrad.addColorStop(0.3, 'rgba(255,150,50,0.15)');
    coronaGrad.addColorStop(0.7, 'rgba(255,100,20,0.05)');
    coronaGrad.addColorStop(1, 'rgba(255,80,0,0)');
    this.ctx.fillStyle = coronaGrad;
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, 80*coronaPulse, 0, Math.PI*2);
    this.ctx.fill();
    
    // Inner sun glow
    const sunGrad = this.ctx.createRadialGradient(this.cx, this.cy, 2, this.cx, this.cy, 30*pulse);
    sunGrad.addColorStop(0, 'rgba(255,240,200,1)');
    sunGrad.addColorStop(0.4, 'rgba(255,180,50,0.8)');
    sunGrad.addColorStop(1, 'rgba(255,100,0,0)');
    this.ctx.fillStyle = sunGrad;
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, 30*pulse, 0, Math.PI*2);
    this.ctx.fill();
    
    // Sun core
    this.ctx.fillStyle = '#fff8e0';
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, 6, 0, Math.PI*2);
    this.ctx.fill();
    
    // Sun surface detail (pixel style)
    this.ctx.fillStyle = 'rgba(255,220,150,0.6)';
    this.ctx.fillRect(this.cx - 2, this.cy - 3, 2, 2);
    this.ctx.fillRect(this.cx + 2, this.cy + 1, 2, 2);

    // Scan pulse
    if (scanActive) {
      const scanRadius = (t % 3000) / 3000 * Math.max(W, H);
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.cx, this.cy, scanRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(57, 255, 143, ${1 - scanRadius / Math.max(W, H)})`;
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
      this.ctx.restore();
      
      // Highlight bodies during scan
      this.bodies.forEach(b => {
         const d = Math.hypot(b.x - this.cx, b.y - this.cy);
         if (Math.abs(d - scanRadius) < 30) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#39ff8f';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius + 5, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
         }
      });
    }

    // Radar sweep
    if (radarActive) {
      const radarAngle = (t / 1200) % (Math.PI * 2);
      const maxR = Math.max(W, H) * 0.6;
      
      // Radar sweep line
      const sweepGrad = this.ctx.createLinearGradient(this.cx, this.cy, this.cx + maxR * Math.cos(radarAngle), this.cy + maxR * Math.sin(radarAngle));
      sweepGrad.addColorStop(0, 'rgba(57,255,143,0.3)');
      sweepGrad.addColorStop(1, 'rgba(57,255,143,0)');
      this.ctx.strokeStyle = sweepGrad;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(this.cx, this.cy);
      this.ctx.lineTo(this.cx + maxR * Math.cos(radarAngle), this.cy + maxR * Math.sin(radarAngle));
      this.ctx.stroke();
      
      // Radar sweep arc (trail) - very subtle
      this.ctx.fillStyle = 'rgba(57,255,143,0.02)';
      this.ctx.beginPath();
      this.ctx.moveTo(this.cx, this.cy);
      this.ctx.arc(this.cx, this.cy, maxR, radarAngle - 0.3, radarAngle, false);
      this.ctx.closePath();
      this.ctx.fill();
      
      // Highlight planets as sweep passes
      this.bodies.forEach(b => {
        const angle = Math.atan2(b.y - this.cy, b.x - this.cx);
        const angleDiff = Math.abs(((angle - radarAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
        if (angleDiff < 0.2) {
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = '#39ff8f';
          this.ctx.strokeStyle = 'rgba(57,255,143,0.4)';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.arc(b.x, b.y, b.radius + 3, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.shadowBlur = 0;
        }
      });
    }

    // Orbit rings with depth effect
    if (showOrbits) {
      [70, 120, 175, 230, 320, 400].forEach((r, i) => {
        // Orbit path
        this.ctx.strokeStyle = `rgba(100,120,150,${0.15 - i * 0.03})`;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([4, 8]);
        this.ctx.beginPath();
        this.ctx.arc(this.cx, this.cy, r, 0, Math.PI*2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Orbit glow
        const orbitGrad = this.ctx.createRadialGradient(this.cx, this.cy, r - 2, this.cx, this.cy, r + 2);
        orbitGrad.addColorStop(0, 'rgba(100,150,200,0)');
        orbitGrad.addColorStop(0.5, 'rgba(100,150,200,0.05)');
        orbitGrad.addColorStop(1, 'rgba(100,150,200,0)');
        this.ctx.fillStyle = orbitGrad;
        this.ctx.beginPath();
        this.ctx.arc(this.cx, this.cy, r + 2, 0, Math.PI*2);
        this.ctx.fill();
      });
    }

    // Bodies - 3D planets with shading
    this.bodies.forEach(b => {
      this.ctx.save();
      
      // Update rotation
      if (b.rotationAngle !== undefined) {
        b.rotationAngle += 0.005;
      }
      
      // Planet shadow (3D effect)
      const shadowGrad = this.ctx.createRadialGradient(
        b.x - b.radius * 0.3, b.y - b.radius * 0.3, 0,
        b.x, b.y, b.radius * 1.2
      );
      shadowGrad.addColorStop(0, b.highlightColor);
      shadowGrad.addColorStop(0.5, b.baseColor);
      shadowGrad.addColorStop(1, b.shadowColor);
      
      // Main planet body
      this.ctx.fillStyle = shadowGrad;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
      this.ctx.fill();
      
      // Pixel-style surface details
      this.ctx.fillStyle = b.highlightColor + '80';
      const pixelSize = Math.max(2, Math.floor(b.radius / 4));
      for(let i = 0; i < 3; i++) {
        const px = b.x - b.radius * 0.4 + (i * pixelSize * 2);
        const py = b.y - b.radius * 0.2 + Math.sin((b.rotationAngle || 0) + i) * pixelSize;
        this.ctx.fillRect(px, py, pixelSize, pixelSize);
      }
      
      // Atmosphere glow
      this.ctx.shadowBlur = b.hover ? 30 : 15;
      this.ctx.shadowColor = b.baseColor;
      this.ctx.strokeStyle = b.hover ? b.highlightColor : b.baseColor + '60';
      this.ctx.lineWidth = b.hover ? 2 : 1;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius + 2, 0, Math.PI*2);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
      
      // Ring for profile planet (Saturn-like)
      if (b.hasRing && b.ringColor) {
        this.ctx.strokeStyle = b.ringColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(b.x, b.y, b.radius * 2, b.radius * 0.5, 0.3, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Second ring
        this.ctx.strokeStyle = b.ringColor.replace('0.4', '0.2');
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.ellipse(b.x, b.y, b.radius * 2.4, b.radius * 0.6, 0.3, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      
      this.ctx.restore();

      // Label — text only, no background box
      if (drawLabels) {
        const labelY = b.y - b.radius - 16;
        this.ctx.font = "8px 'Press Start 2P', monospace";
        this.ctx.textAlign = 'center';
        
        // Label text
        this.ctx.fillStyle = b.hover ? '#ffffff' : b.highlightColor;
        this.ctx.fillText(b.label, b.x, labelY);
        
        // Hover indicator
        if (b.hover) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
          this.ctx.font = "6px 'Press Start 2P', monospace";
          this.ctx.fillText('[ CLICK TO ENTER ]', b.x, b.y + b.radius + 16);
        }
      }
    });

    // Asteroid belt
    this.asteroids.forEach(a => {
      this.ctx.save();
      
      // Asteroid body
      const color = a.hover ? '#39ff8f' : 'rgba(150,170,200,0.7)';
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Glow on hover
      if (a.hover) {
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = '#39ff8f';
        this.ctx.strokeStyle = '#39ff8f';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }
      
      this.ctx.restore();
    });

    // Tooltip for hovered asteroid
    if (this.hoveredAsteroid) {
      const a = this.hoveredAsteroid;
      const tooltip = a.label.toUpperCase();
      this.ctx.save();
      this.ctx.font = "7px 'Press Start 2P', monospace";
      this.ctx.textAlign = 'center';
      const metrics = this.ctx.measureText(tooltip);
      const tw = metrics.width + 12;
      const th = 16;
      const tx = a.x;
      const ty = a.y - a.size - 10;
      
      // Tooltip background
      this.ctx.fillStyle = 'rgba(2,3,8,0.9)';
      this.ctx.strokeStyle = '#39ff8f';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(tx - tw/2, ty - th/2, tw, th, 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Tooltip text
      this.ctx.fillStyle = '#39ff8f';
      this.ctx.fillText(tooltip, tx, ty + 2);
      this.ctx.restore();
    }
  }

  drawTechStackZoomed(t: number) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // Background
    const bgGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
    bgGrad.addColorStop(0, 'rgba(15,12,25,1)');
    bgGrad.addColorStop(1, 'rgba(2,3,8,1)');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, W, H);

    // Planet
    const pulse = 1 + Math.sin(t / 600) * 0.03;
    const planetR = 50 * pulse;
    
    // Tech rings (Outer data rings)
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(t / 2000);
    this.ctx.strokeStyle = 'rgba(57,255,143,0.5)';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([8, 12, 25, 10, 4, 15, 40, 15]);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, planetR + 35, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.rotate(-t / 800);
    this.ctx.strokeStyle = 'rgba(57,255,143,0.3)';
    this.ctx.setLineDash([4, 6, 12, 8]);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, planetR + 20, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();

    // Base Planet
    const planetGrad = this.ctx.createRadialGradient(cx - 15, cy - 15, 0, cx, cy, planetR);
    planetGrad.addColorStop(0, '#e8c56a');
    planetGrad.addColorStop(0.5, '#c49a3c');
    planetGrad.addColorStop(1, '#6b5a1a');
    this.ctx.fillStyle = planetGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
    this.ctx.fill();

    // Tech surface lines (Circuitry/Grid overlay)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
    this.ctx.clip();
    
    this.ctx.strokeStyle = 'rgba(57,255,143,0.2)';
    this.ctx.lineWidth = 1;
    
    // Draw a curved grid to simulate a sphere
    for(let i = -45; i <= 45; i+= 15) {
      this.ctx.beginPath();
      // Vertical curves
      this.ctx.ellipse(cx, cy, Math.max(0.1, Math.abs(i)), planetR, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      // Horizontal curves
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, planetR, Math.max(0.1, Math.abs(i)), 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    // Glowing tech nodes on the surface
    this.ctx.fillStyle = '#39ff8f';
    const nodes = [
       {x: -25, y: -15}, {x: 10, y: -30}, {x: 25, y: 10}, {x: -15, y: 25}, {x: 5, y: 5}
    ];
    nodes.forEach((n, idx) => {
       const nx = cx + n.x;
       const ny = cy + n.y;
       
       // Pulse effect for nodes
       const nodePulse = 1 + Math.sin(t / 200 + idx) * 0.5;
       
       this.ctx.beginPath();
       this.ctx.arc(nx, ny, 2, 0, Math.PI*2);
       this.ctx.fill();
       
       this.ctx.beginPath();
       this.ctx.arc(nx, ny, 4 * nodePulse, 0, Math.PI*2);
       this.ctx.strokeStyle = 'rgba(57,255,143,0.6)';
       this.ctx.stroke();
    });
    
    // Connect nodes with circuit lines
    this.ctx.beginPath();
    this.ctx.moveTo(cx + nodes[0].x, cy + nodes[0].y);
    this.ctx.lineTo(cx + nodes[4].x, cy + nodes[4].y);
    this.ctx.lineTo(cx + nodes[1].x, cy + nodes[1].y);
    this.ctx.lineTo(cx + nodes[2].x, cy + nodes[2].y);
    this.ctx.lineTo(cx + nodes[4].x, cy + nodes[4].y);
    this.ctx.lineTo(cx + nodes[3].x, cy + nodes[3].y);
    this.ctx.strokeStyle = 'rgba(57,255,143,0.5)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.restore();

    // Planet glow
    this.ctx.shadowBlur = 40;
    this.ctx.shadowColor = '#39ff8f';
    this.ctx.strokeStyle = 'rgba(57,255,143,0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, planetR + 5, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Satellites
    this.hoveredSatellite = null;
    this.satellites.forEach(s => {
      s.angle += s.paused ? 0 : s.speed * 0.016;
      s.x = cx + s.orbitRadius * Math.cos(s.angle);
      s.y = cy + s.orbitRadius * Math.sin(s.angle);
      s.hover = Math.hypot(this.mouseX - s.x, this.mouseY - s.y) < s.size + 6;
      if (s.hover) {
        this.hoveredSatellite = s;
        s.paused = true;
      } else {
        s.paused = false;
      }

      // Orbit ring
      this.ctx.strokeStyle = 'rgba(100,120,150,0.1)';
      this.ctx.lineWidth = 0.5;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, s.orbitRadius, 0, Math.PI * 2);
      this.ctx.stroke();

      // Satellite dot
      this.ctx.fillStyle = s.hover ? '#39ff8f' : 'rgba(200,220,255,0.7)';
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();

      if (s.hover) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#39ff8f';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }
    });

    // Info panel for hovered satellite
    const hoveredSat = this.satellites.find(s => s.hover);
    if (hoveredSat) {
      const s = hoveredSat;
      const px = cx + 120;
      const py = cy - 80;
      const pw = 200;
      const ph = 160;

      this.ctx.fillStyle = 'rgba(2,3,8,0.92)';
      this.ctx.strokeStyle = '#39ff8f';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(px, py, pw, ph, 4);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#39ff8f';
      this.ctx.font = "bold 10px 'Press Start 2P', monospace";
      this.ctx.textAlign = 'left';
      this.ctx.fillText(s.name, px + 10, py + 20);

      this.ctx.font = "7px 'Press Start 2P', monospace";
      this.ctx.fillStyle = s.status === 'ONLINE' ? '#39ff8f' : '#e8c56a';
      this.ctx.fillText(`STATUS: ${s.status}`, px + 10, py + 38);

      this.ctx.fillStyle = 'rgba(57,255,143,0.6)';
      this.ctx.fillText(`EXPERIENCE: ${s.experience}`, px + 10, py + 54);

      // Level bar
      this.ctx.fillStyle = 'rgba(57,255,143,0.15)';
      this.ctx.fillRect(px + 10, py + 62, pw - 20, 6);
      this.ctx.fillStyle = '#39ff8f';
      this.ctx.fillRect(px + 10, py + 62, (pw - 20) * s.level / 100, 6);

      this.ctx.fillStyle = 'rgba(57,255,143,0.6)';
      this.ctx.font = "6px 'Press Start 2P', monospace";
      this.ctx.fillText('USED FOR:', px + 10, py + 82);

      s.usedFor.forEach((u, i) => {
        this.ctx.fillStyle = 'rgba(57,255,143,0.5)';
        this.ctx.fillText(`• ${u}`, px + 14, py + 96 + i * 12);
      });
    }
  }

  drawProjectsZoomed(t: number) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // Background
    const bgGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
    bgGrad.addColorStop(0, 'rgba(10,20,15,1)');
    bgGrad.addColorStop(1, 'rgba(2,3,8,1)');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, W, H);

    // Planet (centered top)
    const pulse = 1 + Math.sin(t / 600) * 0.03;
    const planetR = 25 * pulse;
    const px = W / 2;
    const py = 45;
    const planetGrad = this.ctx.createRadialGradient(px - 8, py - 8, 0, px, py, planetR);
    planetGrad.addColorStop(0, '#4aa86a');
    planetGrad.addColorStop(0.5, '#2a6b3a');
    planetGrad.addColorStop(1, '#1a3a25');
    this.ctx.fillStyle = planetGrad;
    this.ctx.beginPath();
    this.ctx.arc(px, py, planetR, 0, Math.PI * 2);
    this.ctx.fill();

    // Planet glow
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#2a6b3a';
    this.ctx.strokeStyle = 'rgba(42,107,58,0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(px, py, planetR + 4, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Title
    this.ctx.fillStyle = '#39ff8f';
    this.ctx.font = "bold 10px 'Press Start 2P', monospace";
    this.ctx.textAlign = 'center';
    this.ctx.fillText('// PROJECTS LOG', W / 2, 30);
    this.ctx.fillStyle = 'rgba(57,255,143,0.5)';
    this.ctx.font = "6px 'Press Start 2P', monospace";
    this.ctx.fillText(`TOTAL: ${this.projects.length} MISSIONS`, W / 2, 88);
    this.ctx.textAlign = 'left';

    // Scrollable project cards
    const cardW = 280;
    const cardH = 90;
    const gap = 12;
    const cols = 3;
    const totalGridW = cols * cardW + (cols - 1) * gap;
    const startX = (W - totalGridW) / 2;
    const startY = 100;
    const totalRows = Math.ceil(this.projects.length / cols);
    const totalContentH = totalRows * (cardH + gap);
    const visibleH = H - 110;

    // Clamp scroll
    const maxScroll = Math.max(0, totalContentH - visibleH);
    this.projectScrollY = Math.max(0, Math.min(this.projectScrollY, maxScroll));

    // Clip scrollable area
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(20, 95, W - 40, visibleH + 10);
    this.ctx.clip();

    this.hoveredProjectIndex = -1;
    this.projects.forEach((p, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cardX = startX + col * (cardW + gap);
      const cardY = startY + row * (cardH + gap) - this.projectScrollY;

      // Skip if off screen
      if (cardY + cardH < 95 || cardY > H) return;

      // Check hover
      const isHovered = this.mouseX >= cardX && this.mouseX <= cardX + cardW &&
                        this.mouseY >= cardY && this.mouseY <= cardY + cardH;
      if (isHovered) this.hoveredProjectIndex = i;

      // Card background
      this.ctx.fillStyle = isHovered ? 'rgba(57,255,143,0.1)' : 'rgba(2,3,8,0.9)';
      this.ctx.strokeStyle = isHovered ? '#39ff8f' : 'rgba(57,255,143,0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(cardX, cardY, cardW, cardH, 4);
      this.ctx.fill();
      this.ctx.stroke();

      // Project name
      this.ctx.fillStyle = '#39ff8f';
      this.ctx.font = "bold 9px 'Press Start 2P', monospace";
      this.ctx.textAlign = 'left';
      this.ctx.fillText(p.name, cardX + 12, cardY + 22);

      // Description
      this.ctx.fillStyle = 'rgba(57,255,143,0.6)';
      this.ctx.font = "6px 'Press Start 2P', monospace";
      const desc = p.description.length > 40 ? p.description.slice(0, 40) + '...' : p.description;
      this.ctx.fillText(desc, cardX + 12, cardY + 40);

      // Tech tags
      this.ctx.fillStyle = 'rgba(100,200,255,0.6)';
      this.ctx.font = "5px 'Press Start 2P', monospace";
      this.ctx.fillText(p.tech.join(' • '), cardX + 12, cardY + 56);

      // GitHub link
      this.ctx.fillStyle = '#39ff8f';
      this.ctx.font = "bold 6px 'Press Start 2P', monospace";
      this.ctx.fillText('GITHUB →', cardX + 12, cardY + 76);

      // Project index
      this.ctx.fillStyle = 'rgba(57,255,143,0.3)';
      this.ctx.font = "5px 'Press Start 2P', monospace";
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`#${String(i + 1).padStart(2, '0')}`, cardX + cardW - 10, cardY + 22);
      this.ctx.textAlign = 'left';
    });

    this.ctx.restore();

    // Scroll indicator
    if (maxScroll > 0) {
      const scrollbarH = Math.max(30, (visibleH / totalContentH) * visibleH);
      const scrollbarY = 100 + (this.projectScrollY / maxScroll) * (visibleH - scrollbarH);
      this.ctx.fillStyle = 'rgba(57,255,143,0.3)';
      this.ctx.fillRect(W - 18, 70, 4, visibleH);
      this.ctx.fillStyle = '#39ff8f';
      this.ctx.fillRect(W - 18, scrollbarY, 4, scrollbarH);
    }
  }

  drawSpaceBackground(t: number) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    
    const bgGrad = this.ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(W, H) * 0.7);
    bgGrad.addColorStop(0, 'rgba(10,12,25,1)');
    bgGrad.addColorStop(0.5, 'rgba(5,7,15,1)');
    bgGrad.addColorStop(1, 'rgba(2,3,8,1)');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, W, H);

    // Distant nebula for depth
    this.drawDistantNebula(t);

    this.nebulaClouds.forEach(cloud => {
      const grad = this.ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
      grad.addColorStop(0, cloud.color + cloud.opacity + ')');
      grad.addColorStop(1, cloud.color + '0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.stars.forEach(s => {
      const layer = this.layers[s.layer];
      let px = s.x % W;
      let py = s.y % H;
      if(px<0) px+=W; if(py<0) py+=H;
      const twinkle = 0.7 + Math.sin(t * 0.003 + s.x * 0.1) * 0.3;
      const alpha = parseFloat(layer.color.match(/[\d.]+(?=\))/)?.[0] || '1') * s.brightness * twinkle;
      this.ctx.fillStyle = layer.color.replace(/[\d.]+\)/, alpha.toFixed(2) + ')');
      this.ctx.fillRect(px, py, layer.size, layer.size);
    });
  }

  drawLearningZoomed(t: number) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // Background
    const bgGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
    bgGrad.addColorStop(0, 'rgba(15,12,25,1)');
    bgGrad.addColorStop(1, 'rgba(2,3,8,1)');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, W, H);

    // Planet (top center, small)
    const pulse = 1 + Math.sin(t / 600) * 0.03;
    const planetR = 25 * pulse;
    const px = W / 2;
    const py = 45;
    const planetGrad = this.ctx.createRadialGradient(px - 8, py - 8, 0, px, py, planetR);
    planetGrad.addColorStop(0, '#c49a5a');
    planetGrad.addColorStop(0.5, '#8b6a2b');
    planetGrad.addColorStop(1, '#4a3a15');
    this.ctx.fillStyle = planetGrad;
    this.ctx.beginPath();
    this.ctx.arc(px, py, planetR, 0, Math.PI * 2);
    this.ctx.fill();

    // Ring
    this.ctx.strokeStyle = 'rgba(200,180,140,0.4)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py, planetR * 2, planetR * 0.4, 0.3, 0, Math.PI * 2);
    this.ctx.stroke();

    // Title
    this.ctx.fillStyle = '#39ff8f';
    this.ctx.font = "bold 10px 'Press Start 2P', monospace";
    this.ctx.textAlign = 'center';
    this.ctx.fillText('// LEARNING QUEUE', W / 2, 30);
    this.ctx.fillStyle = 'rgba(57,255,143,0.5)';
    this.ctx.font = "6px 'Press Start 2P', monospace";
    this.ctx.fillText(`${this.learningItems.length} ITEMS IN PROGRESS`, W / 2, 88);
    this.ctx.textAlign = 'left';

    // Learning items grid
    const cardW = 220;
    const cardH = 70;
    const gap = 10;
    const cols = 4;
    const totalGridW = cols * cardW + (cols - 1) * gap;
    const startX = (W - totalGridW) / 2;
    const startY = 105;

    this.learningItems.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cardX = startX + col * (cardW + gap);
      const cardY = startY + row * (cardH + gap);

      // Card background
      this.ctx.fillStyle = 'rgba(2,3,8,0.9)';
      this.ctx.strokeStyle = 'rgba(57,255,143,0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(cardX, cardY, cardW, cardH, 3);
      this.ctx.fill();
      this.ctx.stroke();

      // Category
      this.ctx.fillStyle = 'rgba(57,255,143,0.4)';
      this.ctx.font = "5px 'Press Start 2P', monospace";
      this.ctx.textAlign = 'left';
      this.ctx.fillText(item.category, cardX + 10, cardY + 14);

      // Name
      this.ctx.fillStyle = '#39ff8f';
      this.ctx.font = "bold 8px 'Press Start 2P', monospace";
      this.ctx.fillText(item.name, cardX + 10, cardY + 28);

      // Description
      this.ctx.fillStyle = 'rgba(57,255,143,0.5)';
      this.ctx.font = "5px 'Press Start 2P', monospace";
      const desc = item.description.length > 35 ? item.description.slice(0, 35) + '...' : item.description;
      this.ctx.fillText(desc, cardX + 10, cardY + 42);

      // Progress bar background
      this.ctx.fillStyle = 'rgba(57,255,143,0.1)';
      this.ctx.fillRect(cardX + 10, cardY + 52, cardW - 20, 5);

      // Progress bar fill
      this.ctx.fillStyle = item.progress >= 70 ? '#39ff8f' : item.progress >= 40 ? '#e8c56a' : '#ff6b6b';
      this.ctx.fillRect(cardX + 10, cardY + 52, (cardW - 20) * item.progress / 100, 5);

      // Progress text
      this.ctx.fillStyle = 'rgba(57,255,143,0.6)';
      this.ctx.font = "5px 'Press Start 2P', monospace";
      this.ctx.fillText(`${item.progress}%`, cardX + cardW - 30, cardY + 42);
    });
  }

  drawZoomedPlanet(planetName: string, t: number, _zoomProgress: number) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const b = this.bodies.find(body => body.name === planetName);
    if (!b) return;
    
    this.drawSpaceBackground(t);
    
    const planetRadius = Math.max(W, H) * 0.45;
    const cx = W * 0.5;
    const cy = H * 0.5;
    const time = t * 0.001;
    
    this.ctx.save();
    
    // Outer atmosphere glow
    const atmoRadius = planetRadius * 1.15;
    const atmoGrad = this.ctx.createRadialGradient(cx, cy, planetRadius * 0.9, cx, cy, atmoRadius);
    atmoGrad.addColorStop(0, b.baseColor + '00');
    atmoGrad.addColorStop(0.4, b.highlightColor + '15');
    atmoGrad.addColorStop(0.7, b.highlightColor + '08');
    atmoGrad.addColorStop(1, b.baseColor + '00');
    this.ctx.fillStyle = atmoGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, atmoRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Main planet body with 3D gradient
    const bodyGrad = this.ctx.createRadialGradient(
      cx - planetRadius * 0.3, cy - planetRadius * 0.3, planetRadius * 0.1,
      cx, cy, planetRadius
    );
    bodyGrad.addColorStop(0, b.highlightColor);
    bodyGrad.addColorStop(0.35, b.baseColor);
    bodyGrad.addColorStop(0.75, b.shadowColor);
    bodyGrad.addColorStop(1, this.darkenColor(b.shadowColor, 0.4));
    this.ctx.fillStyle = bodyGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, planetRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Planet texture bands (Jupiter/Mars style)
    if (b.bandSeed !== undefined) {
      this.ctx.globalAlpha = 0.15;
      const bandCount = planetName === 'missions' ? 8 : 5;
      for (let i = 0; i < bandCount; i++) {
        const bandY = cy - planetRadius + (planetRadius * 2 * (i + 0.5)) / bandCount;
        const bandHeight = planetRadius * 2 / bandCount * 0.4;
        const wobble = Math.sin(time * 0.3 + i * 1.5 + b.bandSeed) * 4;
        
        this.ctx.fillStyle = i % 2 === 0 ? b.highlightColor + '30' : b.shadowColor + '40';
        this.ctx.beginPath();
        this.ctx.ellipse(cx + wobble, bandY, planetRadius * 0.95, bandHeight, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1;
    }
    
    // Pixel-style craters / surface details
    if (b.craterSeed !== undefined) {
      const pixelSize = Math.max(4, Math.floor(planetRadius / 35));
      const craterCount = planetName === 'missions' ? 18 : 12;
      
      for (let i = 0; i < craterCount; i++) {
        const seed = b.craterSeed + i * 137.5;
        const angle = (seed % 360) * (Math.PI / 180) + time * 0.05;
        const dist = (seed * 7.3 % 100) / 100 * planetRadius * 0.85;
        
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist * 0.8;
        
        // Only draw if on the lit side
        const dx = px - cx;
        const dy = py - cy;
        if (dx * dx + dy * dy < planetRadius * planetRadius * 0.9) {
          const size = pixelSize * (1 + (seed % 3));
          const brightness = 0.3 + Math.cos(angle) * 0.3;
          
          this.ctx.globalAlpha = brightness;
          this.ctx.fillStyle = this.lerpColor(b.highlightColor, b.shadowColor, (dx + planetRadius) / (planetRadius * 2));
          this.ctx.fillRect(Math.floor(px / pixelSize) * pixelSize, Math.floor(py / pixelSize) * pixelSize, size, size);
          this.ctx.globalAlpha = 1;
        }
      }
    }
    
    // Terminator line (day/night boundary)
    const termGrad = this.ctx.createLinearGradient(cx - planetRadius, cy, cx + planetRadius, cy);
    termGrad.addColorStop(0, 'rgba(0,0,0,0)');
    termGrad.addColorStop(0.55, 'rgba(0,0,0,0)');
    termGrad.addColorStop(0.7, 'rgba(0,0,0,0.3)');
    termGrad.addColorStop(0.85, 'rgba(0,0,0,0.6)');
    termGrad.addColorStop(1, 'rgba(0,0,0,0.75)');
    this.ctx.fillStyle = termGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, planetRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Specular highlight
    const specGrad = this.ctx.createRadialGradient(
      cx - planetRadius * 0.35, cy - planetRadius * 0.35, 0,
      cx - planetRadius * 0.35, cy - planetRadius * 0.35, planetRadius * 0.5
    );
    specGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
    specGrad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    specGrad.addColorStop(1, 'rgba(255,255,255,0)');
    this.ctx.fillStyle = specGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, planetRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Rings (for profile / Saturn-like)
    if (b.hasRing && b.ringColor) {
      this.drawPlanetRings(cx, cy, planetRadius, b.ringColor, time);
    }
    
    // Edge glow
    this.ctx.strokeStyle = b.highlightColor + '40';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, planetRadius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.restore();
    
    // Floating particles around planet
    this.drawPlanetParticles(cx, cy, planetRadius, b.baseColor, t);
  }
  
  private drawPlanetRings(cx: number, cy: number, planetRadius: number, ringColor: string, time: number) {
    this.ctx.save();
    
    for (let r = 0; r < 3; r++) {
      const innerR = planetRadius * (1.4 + r * 0.25);
      const tilt = 0.25;
      
      // Ring segments for pixel feel
      const segments = 64;
      for (let i = 0; i < segments; i++) {
        const a1 = (i / segments) * Math.PI * 2;
        const a2 = ((i + 1) / segments) * Math.PI * 2;
        
        const opacity = (0.3 - r * 0.08) * (0.7 + Math.sin(time + i * 0.5) * 0.3);
        this.ctx.strokeStyle = ringColor.replace(/[\d.]+\)$/, opacity.toFixed(2) + ')');
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy, innerR, innerR * tilt, 0, a1, a2);
        this.ctx.stroke();
      }
    }
    
    this.ctx.restore();
  }
  
  private drawPlanetParticles(cx: number, cy: number, planetRadius: number, color: string, t: number) {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + t * 0.0003;
      const dist = planetRadius * (1.2 + Math.sin(t * 0.001 + i * 2) * 0.15);
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist * 0.4;
      const size = 1 + Math.sin(t * 0.005 + i) * 0.5;
      const alpha = 0.3 + Math.sin(t * 0.003 + i * 1.7) * 0.2;
      
      this.ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      this.ctx.fillRect(px, py, size, size);
    }
  }
  
  private darkenColor(hex: string, factor: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
  }
  
  private lerpColor(c1: string, c2: string, t: number): string {
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);
    const r = Math.floor(r1 + (r2 - r1) * t);
    const g = Math.floor(g1 + (g2 - g1) * t);
    const b = Math.floor(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${b})`;
  }
}
