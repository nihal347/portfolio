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

export class SpaceEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bodies: Body[] = [];
  stars: {x: number, y: number, layer: number, brightness: number}[] = [];
  nebulaClouds: {x: number, y: number, radius: number, color: string, opacity: number}[] = [];
  
  MU = 800000;
  cx = 0;
  cy = 0;
  
  ship = { x: 0, y: 0, vx: 0, vy: 0 };
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

    this.ship = { x: this.cx, y: this.cy + 40, vx: 0, vy: 0 };
    this.mouseX = this.cx;
    this.mouseY = this.cy;

    // Solar system inspired planets with 3D shading colors
    this.bodies = [
      this.circularBody(110, Math.PI*0.5, {
        name:'comms',    
        label:'COMMS', 
        baseColor:'#c45a3c',
        highlightColor:'#e8956a',
        shadowColor:'#6b2a1a',
        radius: 6,
        hasRing: false,
        rotationAngle: 0
      }),
      this.circularBody(185, Math.PI*1.2, {
        name:'profile',  
        label:'PROFILE',     
        baseColor:'#3a7bd5',
        highlightColor:'#6db3f2',
        shadowColor:'#1a3a6b',
        radius: 12,
        hasRing: true,
        ringColor: 'rgba(180,200,220,0.4)',
        rotationAngle: 0
      }),
      this.circularBody(275, Math.PI*0.1, {
        name:'missions', 
        label:'MISSIONS',    
        baseColor:'#8b5a2b',
        highlightColor:'#c4915a',
        shadowColor:'#4a2f15',
        radius: 10,
        hasRing: false,
        rotationAngle: 0
      })
    ];
  }
  
  resize() {
      this.cx = this.canvas.width / 2;
      this.cy = this.canvas.height / 2;
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

    // Ship
    const ax = (this.mouseX - this.ship.x) * 34;
    const ay = (this.mouseY - this.ship.y) * 34;
    this.ship.vx += ax*dt; this.ship.vy += ay*dt;
    const damp = Math.pow(0.04, dt);
    this.ship.vx *= damp; this.ship.vy *= damp;
    this.ship.x += this.ship.vx*dt; this.ship.y += this.ship.vy*dt;
  }

  draw(t: number, drawLabels = true) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    
    // Deep space background with gradient
    const bgGrad = this.ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(W, H) * 0.7);
    bgGrad.addColorStop(0, 'rgba(10,12,25,1)');
    bgGrad.addColorStop(0.5, 'rgba(5,7,15,1)');
    bgGrad.addColorStop(1, 'rgba(2,3,8,1)');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, W, H);

    // Nebula clouds for depth
    this.nebulaClouds.forEach(cloud => {
      const parallaxX = cloud.x + (this.mouseX - this.cx) * 0.01;
      const parallaxY = cloud.y + (this.mouseY - this.cy) * 0.01;
      const grad = this.ctx.createRadialGradient(parallaxX, parallaxY, 0, parallaxX, parallaxY, cloud.radius);
      grad.addColorStop(0, cloud.color + cloud.opacity + ')');
      grad.addColorStop(1, cloud.color + '0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(parallaxX, parallaxY, cloud.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Stars with twinkling effect
    this.stars.forEach(s => {
      const layer = this.layers[s.layer];
      let px = (s.x + (this.mouseX - this.cx)*layer.speed*-1) % W;
      let py = (s.y + (this.mouseY - this.cy)*layer.speed*-1) % H;
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
    sunGrad.addColorStop(0.3, 'rgba(255,200,100,0.9)');
    sunGrad.addColorStop(0.6, 'rgba(255,150,50,0.5)');
    sunGrad.addColorStop(1, 'rgba(255,100,20,0)');
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

    // Orbit rings with depth effect
    [110, 185, 275].forEach((r, i) => {
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

      // Label with background
      if (drawLabels) {
        const labelY = b.y - b.radius - 16;
        this.ctx.font = "8px 'Press Start 2P', monospace";
        this.ctx.textAlign = 'center';
        
        // Label background
        const textWidth = this.ctx.measureText(b.label).width;
        this.ctx.fillStyle = b.hover ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(b.x - textWidth/2 - 4, labelY - 8, textWidth + 8, 12);
        
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

    // Ship with engine glow
    this.ctx.save();
    this.ctx.translate(this.ship.x, this.ship.y);
    const angle = Math.atan2(this.ship.vy, this.ship.vx);
    this.ctx.rotate(angle);
    this.ctx.imageSmoothingEnabled = false;
    const s = 3;
    
    // Engine exhaust
    const exhaustLength = Math.min(12, Math.hypot(this.ship.vx, this.ship.vy) * 0.5);
    if (exhaustLength > 1) {
      const exhaustGrad = this.ctx.createLinearGradient(-s, 0, -s - exhaustLength, 0);
      exhaustGrad.addColorStop(0, 'rgba(77,243,255,0.8)');
      exhaustGrad.addColorStop(0.5, 'rgba(77,243,255,0.3)');
      exhaustGrad.addColorStop(1, 'rgba(77,243,255,0)');
      this.ctx.fillStyle = exhaustGrad;
      this.ctx.fillRect(-s - exhaustLength, -s * 0.5, exhaustLength, s);
    }
    
    // Ship body
    const blocks = [
      [3,-1],[3,0],[3,1],
      [2,-1],[2,0],[2,1],
      [1,-2],[1,2],
      [0,-1],[0,1],
      [-1,-1],[-1,0],[-1,1],
      [-2,0]
    ];
    this.ctx.fillStyle = '#4df3ff';
    blocks.forEach(p => { this.ctx.fillRect(p[0]*s, p[1]*s, s, s); });
    
    // Cockpit highlight
    this.ctx.fillStyle = '#dffcff';
    this.ctx.fillRect(2*s, -0.5*s, s, s);
    this.ctx.restore();
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
