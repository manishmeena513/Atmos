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

export function WeatherGlobe() {
  const containerRef = useRef(null);
  const location = useWeatherStore((s) => s.location);
  const favorites = useWeatherStore((s) => s.favorites);

  const [autoRotate, setAutoRotate] = useState(false);
  const [textureError, setTextureError] = useState(false);

  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const earthMeshRef = useRef(null);
  const cloudMeshRef = useRef(null);
  const activePinRef = useRef(null);
  const ringMeshRef = useRef(null);
  const favPinsGroupRef = useRef(null);
  const isVisibleRef = useRef(true);

  // Target rotation for smooth camera/globe transition
  const targetRotationRef = useRef({ y: 0, x: 0, active: false });

  // 1. Initialize Scene & WebGL once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

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
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (path) =>
      textureLoader.load(
        path,
        (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.needsUpdate = true;
        },
        undefined,
        (err) => {
          console.warn(`NASA Earth texture load failure at ${path}:`, err);
          setTextureError(true);
        }
      );

    const dayTexture = loadTexture('/textures/earth/earth_day_2048.jpg');
    const nightTexture = loadTexture('/textures/earth/earth_lights_2048.png');
    const cloudsTexture = loadTexture('/textures/earth/earth_clouds_2048.png');
    const specularTexture = loadTexture('/textures/earth/earth_specular_2048.jpg');

    const earthRadius = 1.0;
    const sunWorldDir = new THREE.Vector3(3.0, 1.2, 2.5).normalize();

    // 4. Photorealistic Earth Surface Shader with Day/Night Terminator
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

          float sunDot = dot(norm, sunDir);
          vec4 dayColor = texture2D(uDayMap, vUv);
          vec4 nightColor = texture2D(uNightMap, vUv);
          float specular = texture2D(uSpecularMap, vUv).r;

          float dayFactor = smoothstep(-0.15, 0.22, sunDot);
          float nightFactor = smoothstep(0.18, -0.22, sunDot);

          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 reflectDir = reflect(-sunDir, norm);
          float specIntensity = pow(max(dot(viewDir, reflectDir), 0.0), 30.0) * specular;
          vec3 oceanGlint = vec3(0.5, 0.8, 1.0) * specIntensity * 1.5 * dayFactor;

          float diffuse = max(sunDot, 0.0) * 0.9 + 0.12;
          vec3 litDay = dayColor.rgb * diffuse;
          vec3 glowingNight = nightColor.rgb * vec3(1.15, 1.0, 0.8) * nightFactor * 1.6;

          vec3 color = litDay * dayFactor + glowingNight + oceanGlint;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMeshRef.current = earthMesh;
    scene.add(earthMesh);

    // 5. Cloud Layer Sphere
    const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.018, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    cloudMeshRef.current = cloudMesh;
    scene.add(cloudMesh);

    // 6. Atmosphere Halo
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

    // 7. Pin Group attached to Earth
    const pinGroup = new THREE.Group();
    earthMesh.add(pinGroup);

    // Active Pin & Ring
    const pinGeo = new THREE.SphereGeometry(0.024, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: '#38BDF8' });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    activePinRef.current = pinMesh;
    pinGroup.add(pinMesh);

    const ringGeo = new THREE.RingGeometry(0.035, 0.054, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#60A5FA',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMeshRef.current = ringMesh;
    pinGroup.add(ringMesh);

    // Favorites Pin Group
    const favPinsGroup = new THREE.Group();
    favPinsGroupRef.current = favPinsGroup;
    pinGroup.add(favPinsGroup);

    // 8. Interaction handling
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      targetRotationRef.current.active = false;
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
        targetRotationRef.current.active = false;
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

    // 9. Intersection Observer for battery & GPU throttling
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 10. Animation Loop
    let animId;
    let pulseScale = 1;
    let pulseDir = 0.01;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      // Smooth transition to target location coordinates
      if (targetRotationRef.current.active) {
        const { y: ty, x: tx } = targetRotationRef.current;
        earthMesh.rotation.y += (ty - earthMesh.rotation.y) * 0.06;
        earthMesh.rotation.x += (tx - earthMesh.rotation.x) * 0.06;

        if (
          Math.abs(ty - earthMesh.rotation.y) < 0.001 &&
          Math.abs(tx - earthMesh.rotation.x) < 0.001
        ) {
          targetRotationRef.current.active = false;
        }
      } else if (autoRotate && !isDragging) {
        earthMesh.rotation.y += 0.001;
      } else if (!isDragging && (Math.abs(dragVelocity.x) > 0.0001 || Math.abs(dragVelocity.y) > 0.0001)) {
        earthMesh.rotation.y += dragVelocity.x;
        earthMesh.rotation.x += dragVelocity.y;
        dragVelocity.x *= 0.92;
        dragVelocity.y *= 0.92;
      }

      cloudMesh.rotation.y += 0.0012;

      // Pulse active beacon ring
      pulseScale += pulseDir;
      if (pulseScale > 1.35) pulseDir = -0.01;
      if (pulseScale < 0.95) pulseDir = 0.01;
      if (ringMeshRef.current) {
        ringMeshRef.current.scale.set(pulseScale, pulseScale, 1);
      }

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
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvasDom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      canvasDom.removeEventListener('wheel', onWheel);

      dayTexture?.dispose();
      nightTexture?.dispose();
      cloudsTexture?.dispose();
      specularTexture?.dispose();

      earthGeo?.dispose();
      earthMat?.dispose();
      cloudGeo?.dispose();
      cloudMat?.dispose();
      glowGeo?.dispose();
      glowMat?.dispose();
      pinGeo?.dispose();
      pinMat?.dispose();
      ringGeo?.dispose();
      ringMat?.dispose();

      renderer.dispose();
      if (container && renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate]);

  // 2. Smoothly rotate to new active city coordinates when location changes
  useEffect(() => {
    if (!earthMeshRef.current || !activePinRef.current || !ringMeshRef.current) return;

    const activePos = latLonToVector3(location.lat, location.lon, 1.022);
    activePinRef.current.position.copy(activePos);
    ringMeshRef.current.position.copy(activePos);
    ringMeshRef.current.lookAt(activePos.clone().multiplyScalar(2));

    const targetPhi = (90 - location.lat) * (Math.PI / 180);
    const targetTheta = (location.lon + 180) * (Math.PI / 180);
    const targetY = -targetTheta - Math.PI / 2;
    const targetX = targetPhi - Math.PI / 2;

    // Set target rotation for smooth animation transition
    targetRotationRef.current = { y: targetY, x: targetX, active: true };
  }, [location.lat, location.lon]);

  // 3. Update Favorite Pins without re-initializing WebGL
  useEffect(() => {
    const group = favPinsGroupRef.current;
    if (!group) return;

    // Clear old favorite meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      group.remove(child);
    }

    const fGeo = new THREE.SphereGeometry(0.016, 12, 12);
    const fMat = new THREE.MeshBasicMaterial({ color: '#F59E0B' });

    favorites.forEach((fav) => {
      // Don't duplicate active location pin
      if (Math.abs(fav.lat - location.lat) < 0.1 && Math.abs(fav.lon - location.lon) < 0.1) return;
      const fPos = latLonToVector3(fav.lat, fav.lon, 1.022);
      const fMesh = new THREE.Mesh(fGeo, fMat);
      fMesh.position.copy(fPos);
      group.add(fMesh);
    });
  }, [favorites, location.lat, location.lon]);

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

  const recenterCity = () => {
    const targetPhi = (90 - location.lat) * (Math.PI / 180);
    const targetTheta = (location.lon + 180) * (Math.PI / 180);
    targetRotationRef.current = {
      y: -targetTheta - Math.PI / 2,
      x: targetPhi - Math.PI / 2,
      active: true,
    };
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

        {/* Controls: Recenter, Rotate & Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={recenterCity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-white/[0.04] text-slate-300 border-white/10 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Recenter camera to active city"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Focus</span>
          </button>

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
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={zoomOut}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-80 sm:h-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#030712] to-[#080E1A] border border-white/10 shadow-inner flex items-center justify-center">
        {textureError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Globe className="w-10 h-10 text-slate-600 mb-2" />
            <div className="text-sm font-semibold text-white">Earth Visualization Unavailable</div>
            <div className="text-xs text-slate-400 mt-1 max-w-xs">
              Planetary telemetry textures could not be loaded.
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />
        )}

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
          Drag to orbit · Focus to target city
        </div>
      </div>
    </div>
  );
}

export default WeatherGlobe;
