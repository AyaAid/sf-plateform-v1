import * as React from "react";
import * as THREE from "three";

type Props = {
  className?: string;
  progress01?: number;
  pulse?: number;
  onUserPulse?: () => void;
};

export function SpaceScene({ className, progress01 = 0, pulse = 0, onUserPulse }: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const progressRef = React.useRef(progress01);
  const pulseRef = React.useRef(pulse);

  React.useEffect(() => {
    progressRef.current = progress01;
  }, [progress01]);

  React.useEffect(() => {
    pulseRef.current = pulse;
  }, [pulse]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.1, 3.2);

    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(2, 1.2, 2.5);
    scene.add(key);

    const fill = new THREE.AmbientLight(0x6c5ce7, 0.35);
    scene.add(fill);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 22;
      pos[i * 3 + 0] = (Math.random() - 0.5) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * r;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xe8ecff,
      size: 0.012,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const earthGeo = new THREE.SphereGeometry(1, 96, 96);
    const earthMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#121a2e"),
      roughness: 0.9,
      metalness: 0.05,
      emissive: new THREE.Color("#070b18"),
      emissiveIntensity: 0.85,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(0, -0.25, 0);
    scene.add(earth);

    const atmoGeo = new THREE.SphereGeometry(1.045, 96, 96);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#4CC9F0"),
      transparent: true,
      opacity: 0.10,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    earth.add(atmo);

    const rimGeo = new THREE.RingGeometry(1.03, 1.28, 160);
    const rimMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#6C5CE7"),
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.33;
    scene.add(rim);

    let raf = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)), false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const tick = (t: number) => {
      const time = t * 0.0001;
      const progress = Math.min(1, Math.max(0, progressRef.current));
      const pulseStrength = Math.min(1, Math.max(0, pulseRef.current));
      earth.rotation.y = time * 0.9;
      stars.rotation.y = time * 0.12;
      stars.rotation.x = time * 0.06;
      starMat.opacity = 0.55 + progress * 0.35 + pulseStrength * 0.25;
      atmoMat.opacity = 0.06 + progress * 0.10 + pulseStrength * 0.22;
      rimMat.opacity = 0.12 + progress * 0.20 + pulseStrength * 0.28;
      earthMat.emissiveIntensity = 0.7 + progress * 0.5 + pulseStrength * 0.6;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement ?? canvas);

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();

      starGeo.dispose();
      starMat.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onPointerDown={onUserPulse}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
