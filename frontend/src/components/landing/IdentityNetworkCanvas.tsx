import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export const IdentityNetworkCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (!checkWebGLSupport()) {
      setWebglAvailable(false);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 9.5;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    } catch {
      setWebglAvailable(false);
      return;
    }

    // Root group for all rotating elements
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // 2. Outer Geodesic Spherical Wireframe
    const sphereRadius = 3.6;
    const sphereGeo = new THREE.IcosahedronGeometry(sphereRadius, 2);
    const wireframeGeo = new THREE.WireframeGeometry(sphereGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0x182438,
      transparent: true,
      opacity: 0.35,
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
    networkGroup.add(wireframeMesh);

    // 3. Extract Node Positions on the Sphere Surface
    const positionAttr = sphereGeo.attributes.position;
    if (!positionAttr) {
      setWebglAvailable(false);
      return;
    }

    const uniqueNodes: THREE.Vector3[] = [];
    const thresholdSq = 0.001;

    for (let i = 0; i < positionAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(positionAttr, i);
      let isDuplicate = false;
      for (let j = 0; j < uniqueNodes.length; j++) {
        const existingNode = uniqueNodes[j];
        if (existingNode && v.distanceToSquared(existingNode) < thresholdSq) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        uniqueNodes.push(v);
      }
    }

    // 4. Create Node Points with Semantic Categorization (Neutral, Emerald Verified, Amber Audit)
    const nodeGeometry = new THREE.BufferGeometry();
    const nodePositions: number[] = [];
    const nodeColors: number[] = [];

    // Distinct colors
    const colorNeutral = new THREE.Color(0x475569); // Muted slate gray
    const colorEmerald = new THREE.Color(0x10b981); // Emerald verified
    const colorAmber = new THREE.Color(0xf59e0b); // Amber audit warning

    const emeraldCount = 6;
    const amberCount = 2;
    let emeraldAllocated = 0;
    let amberAllocated = 0;

    uniqueNodes.forEach((node, idx) => {
      nodePositions.push(node.x, node.y, node.z);

      if (emeraldAllocated < emeraldCount && (idx % 7 === 0 || idx === 12)) {
        nodeColors.push(colorEmerald.r, colorEmerald.g, colorEmerald.b);
        emeraldAllocated++;
      } else if (amberAllocated < amberCount && (idx === 19 || idx === 31)) {
        nodeColors.push(colorAmber.r, colorAmber.g, colorAmber.b);
        amberAllocated++;
      } else {
        nodeColors.push(colorNeutral.r, colorNeutral.g, colorNeutral.b);
      }
    });

    nodeGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(nodePositions, 3)
    );
    nodeGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(nodeColors, 3)
    );

    const nodeMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
    networkGroup.add(nodePoints);

    // 5. Connecting Lines Between Nodes (Dynamic Academic Ledger Graph)
    const lineIndices: number[] = [];
    const maxDistance = 2.1;

    for (let i = 0; i < uniqueNodes.length; i++) {
      const nodeA = uniqueNodes[i];
      if (!nodeA) continue;
      for (let j = i + 1; j < uniqueNodes.length; j++) {
        const nodeB = uniqueNodes[j];
        if (!nodeB) continue;
        const dist = nodeA.distanceTo(nodeB);
        if (dist <= maxDistance) {
          lineIndices.push(i, j);
        }
      }
    }

    const linesGeometry = new THREE.BufferGeometry().setFromPoints(uniqueNodes);
    linesGeometry.setIndex(lineIndices);

    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.25,
    });
    const networkLines = new THREE.LineSegments(linesGeometry, linesMaterial);
    networkGroup.add(networkLines);

    // 6. Subtle Central Geometric Object (Cryptographic Core)
    const coreGroup = new THREE.Group();

    // Inner wireframe octahedron
    const octaGeo = new THREE.OctahedronGeometry(1.3, 0);
    const octaWireframe = new THREE.WireframeGeometry(octaGeo);
    const octaMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.45,
    });
    const octaMesh = new THREE.LineSegments(octaWireframe, octaMat);
    coreGroup.add(octaMesh);

    // Inner subtle rotating ring
    const ringGeo = new THREE.RingGeometry(1.6, 1.62, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x064e3b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.8;
    coreGroup.add(ringMesh);

    networkGroup.add(coreGroup);

    // 7. Sparse Ambient Floating Particles
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePos.push(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10
      );
    }

    particleGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(particlePos, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.035,
      transparent: true,
      opacity: 0.35,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 8. Interactive Parallax & Animation Loop
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isVisible = true;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = nx * 0.15;
      targetRotationX = ny * 0.1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle visibility changes to save GPU cycles
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // IntersectionObserver to pause rendering when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();

      if (!prefersReducedMotion) {
        // Slow subtle rotation
        networkGroup.rotation.y += 0.0012;
        networkGroup.rotation.x += 0.0004;

        // Counter-rotation of cryptographic core
        coreGroup.rotation.y -= 0.0035;
        coreGroup.rotation.z += 0.0015;

        // Particle subtle drift
        particleSystem.rotation.y += 0.0002;

        // Smooth parallax interpolation
        networkGroup.rotation.y += (targetRotationY - networkGroup.rotation.y * 0.05) * 0.02;
        networkGroup.rotation.x += (targetRotationX - networkGroup.rotation.x * 0.05) * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();

      // Dispose Three.js resources
      sphereGeo.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      octaGeo.dispose();
      octaWireframe.dispose();
      octaMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {webglAvailable ? (
        <canvas ref={canvasRef} className="h-full w-full opacity-70" />
      ) : (
        /* Static CSS/SVG Fallback when WebGL is unsupported or disabled */
        <div className="absolute inset-0 flex items-center justify-center opacity-60">
          <div className="relative flex h-[500px] w-[500px] items-center justify-center">
            {/* Ambient concentric geodesic rings */}
            <div className="absolute h-[420px] w-[420px] rounded-full border border-emerald-500/10 animate-pulse" />
            <div className="absolute h-[340px] w-[340px] rounded-full border border-[#1b283d] opacity-50" />
            <div className="absolute h-[240px] w-[240px] rounded-full border border-emerald-500/20" />
            <div className="absolute h-[120px] w-[120px] rounded-full border border-[#1b283d] opacity-70" />

            {/* Glowing nodes fallback */}
            <div className="absolute top-12 left-28 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
            <div className="absolute top-44 right-16 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
            <div className="absolute bottom-20 left-36 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
            <div className="absolute bottom-32 right-24 h-1.5 w-1.5 rounded-full bg-slate-400" />
            <div className="absolute top-24 right-48 h-1.5 w-1.5 rounded-full bg-slate-400" />
            <div className="h-10 w-10 rotate-45 border border-emerald-400/40 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]" />
          </div>
        </div>
      )}

      {/* Subtle radial vignette gradient to keep text crisp and legible */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
    </div>
  );
};
