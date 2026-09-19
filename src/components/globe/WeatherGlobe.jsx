import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Globe, RotateCw, ZoomIn, ZoomOut, MapPin } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

// Converts Latitude/Longitude to 3D Cartesian Vector on Sphere of radius R
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Procedural fallback texture generator if network/assets fail
function createFallbackTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (type === 'day') {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0a1a33');
    grad.addColorStop(0.5, '#12335f');
    grad.addColorStop(1, '#0a1a33');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#1e4028';
    ctx.beginPath();
    ctx.arc(300, 200, 140, 0, Math.PI * 2);
    ctx.arc(600, 260, 180, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'night') {
    ctx.fillStyle = '#010308';
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#FDE047';
    for (let i = 0; i < 600; i++) {
      ctx.fillRect(Math.random() * 1024, 100 + Math.random() * 300, 1.5, 1.5);
    }
  } else if (type === 'clouds') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#ffffff';
    ctx.filter = 'blur(16px)';
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * 1024, 100 + Math.random() * 300, 70, 25, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // specular
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function WeatherGlobe() {
  const containerRef = useRef(null);
  const location = useWeatherStore((s) => s.location);
  const favorites = useWeatherStore((s) => s.favorites);

  const [autoRotate, setAutoRotate] = useState(true);
  const cameraRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.z = 2.75;
    cameraRef.current = camera;

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Load NASA Blue Marble High-Res Local Textures
    const textureLoader = new THREE.TextureLoader();

    const loadTexture = (path, type) =>
      textureLoader.load(
        path,
        (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.needsUpdate = true;
        },
        undefined,
        () => createFallbackTexture(type)
      );

    const dayTexture = loadTexture('/textures/earth/earth_day_2048.jpg', 'day');
    const nightTexture = loadTexture('/textures/earth/earth_lights_2048.png', 'night');
    const cloudsTexture = loadTexture('/textures/earth/earth_clouds_2048.png', 'clouds');
    const specularTexture = loadTexture('/textures/earth/earth_specular_2048.jpg', 'specular');

    const earthRadius = 1.0;
    const sunWorldDir = new THREE.Vector3(3.0, 1.2, 2.5).normalize();

    // 4. Photorealistic Earth Surface Shader with Day/Night Terminator Blending
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        uDayMap: { value: dayTexture },
        uNightMap: { value: nightTexture },
        uSpecularMap: { value: specularTexture },
        uSunDirection: { value: sunWorldDir },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uDayMap;
        uniform sampler2D uNightMap;
        uniform sampler2D uSpecularMap;
        uniform vec3 uSunDirection;

        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 norm = normalize(vWorldNormal);
          vec3 sunDir = normalize(uSunDirection);

          // Sunlight dot product determines Day/Night boundary
          float sunDot = dot(norm, sunDir);

          vec4 dayColor = texture2D(uDayMap, vUv);
          vec4 nightColor = texture2D(uNightMap, vUv);
          float specular = texture2D(uSpecularMap, vUv).r;

          // Smooth day/night blend across the terminator
          float dayFactor = smoothstep(-0.15, 0.22, sunDot);
          float nightFactor = smoothstep(0.18, -0.22, sunDot);

          // Ocean specular reflection (sun glint)
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 reflectDir = reflect(-sunDir, norm);
          float specIntensity = pow(max(dot(viewDir, reflectDir), 0.0), 30.0) * specular;
          vec3 oceanGlint = vec3(0.5, 0.8, 1.0) * specIntensity * 1.5 * dayFactor;

          // Diffuse daylight illumination
          float diffuse = max(sunDot, 0.0) * 0.9 + 0.12;
          vec3 litDay = dayColor.rgb * diffuse;

          // Warm city lights illumination on dark hemisphere
          vec3 glowingNight = nightColor.rgb * vec3(1.15, 1.0, 0.8) * nightFactor * 1.6;

          // Final combined color
          vec3 color = litDay * dayFactor + glowingNight + oceanGlint;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // 5. Independent Rotating Cloud Layer Sphere
    const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.018, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);

    // 6. Rayleigh Atmosphere Halo Rim Glow
    const glowGeo = new THREE.SphereGeometry(earthRadius + 0.065, 48, 48);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          gl_FragColor = vec4(0.24, 0.7, 1.0, 1.0) * intensity * 1.4;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // 7. Coordinate Marker Pins attached to Earth
    const pinGroup = new THREE.Group();
    earthMesh.add(pinGroup);

    // Active City Pin
    const activePos = latLonToVector3(location.lat, location.lon, earthRadius + 0.022);
    const pinGeo = new THREE.SphereGeometry(0.024, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: '#38BDF8' });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.copy(activePos);
    pinGroup.add(pinMesh);

    // Pulsing Beacon Ring
    const ringGeo = new THREE.RingGeometry(0.035, 0.054, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#60A5FA',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(activePos);
    ringMesh.lookAt(activePos.clone().multiplyScalar(2));
    pinGroup.add(ringMesh);

    // Favorite City Pins (Warm amber)
    favorites.forEach((fav) => {
      const fPos = latLonToVector3(fav.lat, fav.lon, earthRadius + 0.022);
      const fGeo = new THREE.SphereGeometry(0.016, 12, 12);
      const fMat = new THREE.MeshBasicMaterial({ color: '#F59E0B' });
      const fMesh = new THREE.Mesh(fGeo, fMat);
      fMesh.position.copy(fPos);
      pinGroup.add(fMesh);
    });

    // 8. Initial Orientation targeting selected location
    const targetPhi = (90 - location.lat) * (Math.PI / 180);
    const targetTheta = (location.lon + 180) * (Math.PI / 180);
    earthMesh.rotation.y = -targetTheta - Math.PI / 2;
    earthMesh.rotation.x = targetPhi - Math.PI / 2;

    // 9. Interactive Drag & Touch Orbit Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
      dragVelocity = { x: 0, y: 0 };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      dragVelocity = { x: dx * 0.005, y: dy * 0.005 };
      earthMesh.rotation.y += dragVelocity.x;
      earthMesh.rotation.x += dragVelocity.y;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        dragVelocity = { x: 0, y: 0 };
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouse.x;
      const dy = e.touches[0].clientY - prevMouse.y;
      dragVelocity = { x: dx * 0.005, y: dy * 0.005 };
      earthMesh.rotation.y += dragVelocity.x;
      earthMesh.rotation.x += dragVelocity.y;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onWheel = (e) => {
      // Cooperative gesture: Only zoom camera if Ctrl or Cmd key is pressed
      // Normal wheel scrolling passes straight through to scroll the page!
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        camera.position.z = Math.max(1.8, Math.min(4.2, camera.position.z + e.deltaY * 0.002));
      }
    };

    const canvasDom = renderer.domElement;
    canvasDom.style.touchAction = 'pan-y';
    canvasDom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvasDom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);
    canvasDom.addEventListener('wheel', onWheel, { passive: false });

    // 10. Animation Loop
    let animId;
    let pulseScale = 1;
    let pulseDir = 0.01;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Continual smooth planetary motion
      if (autoRotate && !isDragging) {
        earthMesh.rotation.y += 0.001;
      } else if (!isDragging && (Math.abs(dragVelocity.x) > 0.0001 || Math.abs(dragVelocity.y) > 0.0001)) {
        earthMesh.rotation.y += dragVelocity.x;
        earthMesh.rotation.x += dragVelocity.y;
        dragVelocity.x *= 0.92;
        dragVelocity.y *= 0.92;
      }

      // Independent weather cloud rotation
      cloudMesh.rotation.y += 0.0013;

      // Pulse active beacon ring
      pulseScale += pulseDir;
      if (pulseScale > 1.35) pulseDir = -0.01;
      if (pulseScale < 0.95) pulseDir = 0.01;
      ringMesh.scale.set(pulseScale, pulseScale, 1);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight || 420;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvasDom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      canvasDom.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [location, favorites, autoRotate]);

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(1.8, cameraRef.current.position.z - 0.3);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(4.2, cameraRef.current.position.z + 0.3);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Planet Earth 3D
            </h3>
            <p className="text-xs text-slate-400">
              NASA Blue Marble planetary atmosphere & coordinates for {location.name}
            </p>
          </div>
        </div>

        {/* Controls: Rotate & Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              autoRotate
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-sm'
                : 'bg-white/[0.04] text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
            <span>{autoRotate ? 'Rotating' : 'Static'}</span>
          </button>

          <div className="flex rounded-full bg-white/[0.04] border border-white/10 p-0.5">
            <button
              onClick={zoomIn}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={zoomOut}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-80 sm:h-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#030712] to-[#080E1A] border border-white/10 shadow-inner flex items-center justify-center">
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Selected City Pin Marker Card */}
        <div className="absolute top-4 left-4 glass-panel rounded-xl px-3 py-2 text-xs border border-white/10 backdrop-blur-md shadow-xl flex items-center gap-2 pointer-events-none">
          <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <div className="font-semibold text-white">{location.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">
              {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
            </div>
          </div>
        </div>

        {/* Drag Hint */}
        <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 font-medium glass-pill px-2.5 py-1 rounded-full pointer-events-none">
          Drag to rotate · Ctrl + scroll or buttons to zoom
        </div>
      </div>
    </div>
  );
}

export default WeatherGlobe;
