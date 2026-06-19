import * as React from "react";
import * as THREE from "three";

export type Stage =
  | "briefing"
  | "exploration"
  | "sas_crisis"
  | "sas_decision"
  | "sas_outcome"
  | "fluid_crisis"
  | "fluid_decision"
  | "fluid_outcome"
  | "debrief";

export type Choice = "exercise" | "medical" | "comms";

// ── MissionScene ──────────────────────────────────────────────────────────────

class MissionScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private raf = 0;
  private ro: ResizeObserver;

  // Camera
  private camPos = new THREE.Vector3(0, 0, 6);
  private camGoal = new THREE.Vector3(0, 0, 6);
  private lookPos = new THREE.Vector3(0, 0, 0);
  private lookGoal = new THREE.Vector3(0, 0, 0);

  // Look-around
  private lookEnabled = false;
  private lookYaw = 0;
  private lookPitch = 0;
  private isDragging = false;
  private lastPtr = { x: 0, y: 0 };

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(-99, -99);
  private interactives = new Map<Choice, THREE.Object3D>();

  // State
  private stage: Stage = "briefing";
  private briefingProgress = 0;
  private currentHover: Choice | null = null;

  // Callbacks
  private onInteract: (c: Choice) => void;
  private onHoverChange: (c: Choice | null) => void;

  // Scene refs
  private earth!: THREE.Mesh;
  private stars!: THREE.Points;
  private astronaut!: THREE.Group;
  private holoGroup!: THREE.Group;
  private emergencyLight!: THREE.PointLight;
  private keyLight!: THREE.DirectionalLight;
  private windowLight!: THREE.PointLight;

  // Dynamic materials
  private wallMat!: THREE.MeshStandardMaterial;
  private earthMat!: THREE.MeshStandardMaterial;
  private exerciseGlowMat!: THREE.MeshBasicMaterial;
  private medicalGlowMat!: THREE.MeshBasicMaterial;
  private commsGlowMat!: THREE.MeshBasicMaterial;
  private stripMat!: THREE.MeshBasicMaterial;

  constructor(
    canvas: HTMLCanvasElement,
    onInteract: (c: Choice) => void,
    onHoverChange: (c: Choice | null) => void,
  ) {
    this.onInteract = onInteract;
    this.onHoverChange = onHoverChange;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x02040c, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02040c);
    this.scene.fog = new THREE.FogExp2(0x02040c, 0.032);

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.05, 90);
    this.camera.position.copy(this.camPos);

    this.buildScene();
    this.bindEvents(canvas);

    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      const { width, height } = p.getBoundingClientRect();
      const w = Math.max(1, Math.floor(width));
      const h = Math.max(1, Math.floor(height));
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    };
    resize();
    this.ro = new ResizeObserver(resize);
    this.ro.observe(canvas.parentElement ?? canvas);
    this.raf = requestAnimationFrame(this.tick);
  }

  // ── Build ───────────────────────────────────────────────────────────────────

  private buildScene() {
    this.buildStars();
    this.buildEarth();
    this.buildModule();
    this.buildInteractives();
    this.buildAstronaut();
    this.buildHoloDisplay();
    this.buildLighting();
  }

  private buildStars() {
    // Point stars as fallback
    const count = 2200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 38;
      pos[i * 3] = (Math.random() - 0.5) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * r - 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xd8e4ff, size: 0.013, transparent: true, opacity: 0.7, depthWrite: false });
    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);

    // Galaxy texture sphere (replaces point stars when loaded)
    new THREE.TextureLoader().load("/texture/stars-galaxy.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(50, 32, 32),
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, depthWrite: false }),
      );
      this.scene.add(sphere);
      this.scene.remove(this.stars);
    });
  }

  private buildEarth() {
    this.earthMat = new THREE.MeshStandardMaterial({
      color: 0x2a4a7a, roughness: 0.75, metalness: 0.0,
      emissive: new THREE.Color(0x061018), emissiveIntensity: 0.4,
    });
    this.earth = new THREE.Mesh(new THREE.SphereGeometry(5, 64, 64), this.earthMat);
    this.earth.position.set(0, -6.5, -20);
    this.scene.add(this.earth);

    new THREE.TextureLoader().load("/texture/planet-earth.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      this.earthMat.map = tex;
      this.earthMat.color.setHex(0xffffff);
      this.earthMat.emissiveIntensity = 0.1;
      this.earthMat.needsUpdate = true;
    });

    // Atmosphere
    this.earth.add(new THREE.Mesh(
      new THREE.SphereGeometry(5.3, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x3ab8d8, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false }),
    ));
  }

  private buildModule() {
    const mod = new THREE.Group();
    this.scene.add(mod);

    this.wallMat = new THREE.MeshStandardMaterial({ color: 0x080e1c, side: THREE.BackSide, roughness: 0.92, metalness: 0.18 });
    const walls = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.15, 10, 40, 1, true), this.wallMat);
    walls.rotation.x = Math.PI / 2;
    mod.add(walls);

    const ribMat = new THREE.MeshStandardMaterial({ color: 0x141e30, roughness: 0.75, metalness: 0.55 });
    for (let z = -4.5; z <= 4.5; z += 1.1) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(2.14, 0.052, 8, 44), ribMat);
      rib.position.z = z;
      mod.add(rib);
    }

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x060b15, roughness: 0.95, metalness: 0.1 });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.06, 10), floorMat);
    floor.position.y = -2.12;
    mod.add(floor);

    const railMat = new THREE.MeshStandardMaterial({ color: 0x0d1828, roughness: 0.8, metalness: 0.5 });
    for (let z = -4.5; z <= 4.5; z += 0.55) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.015, 0.015), railMat);
      r.position.set(0, -2.09, z);
      mod.add(r);
    }
    for (let x = -1.8; x <= 1.8; x += 0.55) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 10), railMat);
      r.position.set(x, -2.09, 0);
      mod.add(r);
    }

    this.stripMat = new THREE.MeshBasicMaterial({ color: 0xb8d8ff });
    [-0.45, 0.45].forEach(x => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 9.2), this.stripMat);
      strip.position.set(x, 2.08, -0.25);
      mod.add(strip);
    });

    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a2840, roughness: 0.7, metalness: 0.6 });
    [-1.0, 0.0, 1.0].forEach(y => {
      [-1.85, 1.85].forEach(x => {
        const r = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 9.0), panelMat);
        r.position.set(x, y, -0.25);
        mod.add(r);
      });
    });

    const winRingMat = new THREE.MeshBasicMaterial({ color: 0x40b8d0, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending });
    const winRing = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.055, 16, 64), winRingMat);
    winRing.position.z = -4.6;
    mod.add(winRing);

    const winPaneMat = new THREE.MeshBasicMaterial({ color: 0x040e1c, transparent: true, opacity: 0.55 });
    const winPane = new THREE.Mesh(new THREE.CircleGeometry(0.88, 64), winPaneMat);
    winPane.position.z = -4.62;
    mod.add(winPane);

    const entryRingMat = new THREE.MeshStandardMaterial({ color: 0x1a2840, roughness: 0.6, metalness: 0.7 });
    const entryRing = new THREE.Mesh(new THREE.TorusGeometry(2.14, 0.1, 16, 48), entryRingMat);
    entryRing.position.z = 4.6;
    mod.add(entryRing);
  }

  private buildInteractives() {
    // Exercise frame (left)
    const exMat = new THREE.MeshStandardMaterial({ color: 0x22334e, roughness: 0.6, metalness: 0.55 });
    this.exerciseGlowMat = new THREE.MeshBasicMaterial({ color: 0x7c6cf0, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
    const exGroup = new THREE.Group();
    exGroup.position.set(-1.55, -1.05, -0.5);
    const postGeo = new THREE.CylinderGeometry(0.038, 0.038, 1.5, 8);
    [-0.28, 0.28].forEach(x => {
      const p = new THREE.Mesh(postGeo, exMat);
      p.position.x = x;
      exGroup.add(p);
    });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.64, 8), exMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.y = 0.58;
    exGroup.add(bar);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x3a4a6a, roughness: 0.8 });
    [[0.12, 0.28], [-0.12, -0.28]].forEach(([rz, ryOff]) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.15, 6), cableMat);
      c.rotation.z = rz;
      c.position.y = ryOff * 0.3;
      exGroup.add(c);
    });
    [-0.22, 0.22].forEach(x => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.12), new THREE.MeshStandardMaterial({ color: 0x1a2a42, roughness: 0.7, metalness: 0.4 }));
      p.position.set(x, -0.72, 0.08);
      exGroup.add(p);
    });
    const exGlow = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.014, 8, 36), this.exerciseGlowMat);
    exGlow.rotation.x = Math.PI / 2;
    exGroup.add(exGlow);
    exGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.6, 0.35), new THREE.MeshBasicMaterial({ visible: false })));
    this.scene.add(exGroup);
    this.interactives.set("exercise", exGroup);

    // Medical kit (right)
    this.medicalGlowMat = new THREE.MeshBasicMaterial({ color: 0x00dd77, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
    const medGroup = new THREE.Group();
    medGroup.position.set(1.55, -1.45, -0.5);
    const kitBody = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.36, 0.18), new THREE.MeshStandardMaterial({ color: 0x151e2e, roughness: 0.65, metalness: 0.35 }));
    const crossMat = new THREE.MeshBasicMaterial({ color: 0x00ee77 });
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.065, 0.02), crossMat);
    crossH.position.z = 0.1;
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.24, 0.02), crossMat);
    crossV.position.z = 0.1;
    [[0.23, 0.16], [-0.23, 0.16], [0.23, -0.16], [-0.23, -0.16]].forEach(([x, y]) => {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), new THREE.MeshBasicMaterial({ color: 0x00cc66 }));
      led.position.set(x, y, 0.1);
      medGroup.add(led);
    });
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.36, 8), new THREE.MeshStandardMaterial({ color: 0x2a3a55, metalness: 0.8, roughness: 0.3 }));
    hinge.rotation.z = Math.PI / 2;
    hinge.position.y = 0.19;
    medGroup.add(hinge);
    medGroup.add(kitBody, crossH, crossV);
    medGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.4), new THREE.MeshBasicMaterial({ visible: false })));
    this.scene.add(medGroup);
    this.interactives.set("medical", medGroup);

    // Comms panel (far wall)
    this.commsGlowMat = new THREE.MeshBasicMaterial({ color: 0x4CC9F0, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
    const commsGroup = new THREE.Group();
    commsGroup.position.set(0, 0.22, -3.7);
    const commsBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.07), new THREE.MeshStandardMaterial({ color: 0x0d1628, roughness: 0.5, metalness: 0.65 }));
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x4CC9F0, transparent: true, opacity: 0.5 });
    const frameData: [number[], number[]][] = [
      [[1.15, 0.025, 0.015], [0, 0.36, 0.04]],
      [[1.15, 0.025, 0.015], [0, -0.36, 0.04]],
      [[0.025, 0.72, 0.015], [0.575, 0, 0.04]],
      [[0.025, 0.72, 0.015], [-0.575, 0, 0.04]],
    ];
    frameData.forEach(([size, pos]) => {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), frameMat);
      edge.position.set(pos[0], pos[1], pos[2]);
      commsGroup.add(edge);
    });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x4CC9F0, transparent: true, opacity: 0.55 });
    for (let i = 0; i < 6; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.022, 0.01), lineMat);
      line.position.set(0, 0.27 - i * 0.11, 0.042);
      commsGroup.add(line);
    }
    [0x00ee66, 0xffbb00, 0x4CC9F0].forEach((c, i) => {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), new THREE.MeshBasicMaterial({ color: c }));
      led.position.set(-0.4 + i * 0.12, -0.28, 0.05);
      commsGroup.add(led);
    });
    const commsGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.68), this.commsGlowMat);
    commsGlow.position.z = 0.06;
    commsGroup.add(commsGlow, commsBody);
    commsGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 0.4), new THREE.MeshBasicMaterial({ visible: false })));
    this.scene.add(commsGroup);
    this.interactives.set("comms", commsGroup);
  }

  private buildAstronaut() {
    this.astronaut = new THREE.Group();
    this.astronaut.position.set(-0.35, -0.75, -2.6);
    this.astronaut.rotation.y = 0.25;
    this.buildPrimitiveAstronaut();
    this.scene.add(this.astronaut);
  }

  private buildPrimitiveAstronaut() {
    const suitMat = new THREE.MeshStandardMaterial({ color: 0xd8dde8, roughness: 0.8, metalness: 0.15 });
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xeeeeff, roughness: 0.15, metalness: 0.35, transparent: true, opacity: 0.88 });
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x4CC9F0, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending });
    const accentMat = new THREE.MeshBasicMaterial({ color: 0x6C5CE7 });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 18), helmetMat);
    head.position.y = 0.88;
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.175, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), visorMat);
    visor.rotation.x = -0.15;
    head.add(visor);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.62, 14), suitMat);
    torso.position.y = 0.36;
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.192, 0.172, 0.045, 14), accentMat);
    stripe.position.y = 0.45;
    const plss = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.36, 0.11), suitMat);
    plss.position.set(0, 0.36, -0.165);
    const armGeo = new THREE.CylinderGeometry(0.062, 0.052, 0.48, 10);
    const lArm = new THREE.Mesh(armGeo, suitMat);
    lArm.position.set(-0.27, 0.32, 0);
    lArm.rotation.z = 0.35;
    const rArm = new THREE.Mesh(armGeo, suitMat);
    rArm.position.set(0.27, 0.32, 0);
    rArm.rotation.z = -0.35;
    const legGeo = new THREE.CylinderGeometry(0.07, 0.062, 0.52, 10);
    const lLeg = new THREE.Mesh(legGeo, suitMat);
    lLeg.position.set(-0.1, -0.1, 0);
    lLeg.rotation.z = 0.08;
    const rLeg = new THREE.Mesh(legGeo, suitMat);
    rLeg.position.set(0.1, -0.1, 0);
    rLeg.rotation.z = -0.08;
    this.astronaut.add(head, torso, stripe, plss, lArm, rArm, lLeg, rLeg);
  }

  private buildHoloDisplay() {
    this.holoGroup = new THREE.Group();
    this.holoGroup.position.set(0.82, 0.32, -1.55);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x6C5CE7, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
    const borderMat = new THREE.LineBasicMaterial({ color: 0x9d88ff, transparent: true, opacity: 0.55 });
    const barMat1 = new THREE.MeshBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.85 });
    const barMat2 = new THREE.MeshBasicMaterial({ color: 0x4CC9F0, transparent: true, opacity: 0.85 });
    const labelMat = new THREE.MeshBasicMaterial({ color: 0x8880cc, transparent: true, opacity: 0.7 });
    const trackMat = new THREE.MeshBasicMaterial({ color: 0x1a1040, transparent: true, opacity: 0.5 });

    const bg = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.52), bgMat);
    const bl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.82, 0.52)), borderMat);
    const header = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.045, 0.002), new THREE.MeshBasicMaterial({ color: 0x9d88ff, transparent: true, opacity: 0.4 }));
    header.position.y = 0.237;

    const hrTrack = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.042), trackMat);
    hrTrack.position.set(-0.08, 0.07, 0.001);
    const hrFill = new THREE.Mesh(new THREE.PlaneGeometry(0.37, 0.03), barMat1);
    hrFill.position.set(-0.175, 0.07, 0.002);
    const o2Track = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.042), trackMat);
    o2Track.position.set(-0.08, -0.06, 0.001);
    const o2Fill = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.03), barMat2);
    o2Fill.position.set(-0.135, -0.06, 0.002);

    [-0.07, -0.2].forEach((y, i) => {
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.016, 8), i === 0 ? barMat1 : barMat2);
      dot.position.set(-0.36, y, 0.002);
      this.holoGroup.add(dot);
    });

    const div = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.006, 0.001), labelMat);
    div.position.y = -0.13;
    [0x4CC9F0, 0x9d88ff, 0xff9966].forEach((c, i) => {
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.012, 8), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7 }));
      dot.position.set(-0.24 + i * 0.22, -0.2, 0.002);
      this.holoGroup.add(dot);
    });

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 6), new THREE.MeshStandardMaterial({ color: 0x1a2840, roughness: 0.7, metalness: 0.6 }));
    arm.rotation.z = 0.3;
    arm.position.set(-0.35, -0.42, 0);
    this.holoGroup.add(bg, bl, header, hrTrack, hrFill, o2Track, o2Fill, div, arm);
    this.scene.add(this.holoGroup);
  }

  private buildLighting() {
    this.scene.add(new THREE.AmbientLight(0x1a2540, 1.1));
    this.keyLight = new THREE.DirectionalLight(0xddeeff, 2.0);
    this.keyLight.position.set(0, 3.5, 1.5);
    this.scene.add(this.keyLight);
    this.windowLight = new THREE.PointLight(0x3ab8d8, 1.8, 18);
    this.windowLight.position.set(0, 0, -4.5);
    this.scene.add(this.windowLight);
    const stbdLight = new THREE.PointLight(0x6C5CE7, 0.9, 12);
    stbdLight.position.set(2.2, 0.5, -1);
    this.scene.add(stbdLight);
    const portLight = new THREE.PointLight(0xffd0a0, 0.6, 10);
    portLight.position.set(-2.2, 0.5, -1);
    this.scene.add(portLight);
    this.emergencyLight = new THREE.PointLight(0xff2200, 0, 12);
    this.emergencyLight.position.set(0, 1.6, -1);
    this.scene.add(this.emergencyLight);
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  private bindEvents(canvas: HTMLCanvasElement) {
    canvas.addEventListener("pointerdown", this.handlePointerDown);
    canvas.addEventListener("pointermove", this.handlePointerMove);
    canvas.addEventListener("pointerup", this.handlePointerUp);
    canvas.addEventListener("click", this.handleClick);
  }

  private handlePointerDown = (e: PointerEvent) => {
    this.isDragging = true;
    this.lastPtr = { x: e.clientX, y: e.clientY };
  };

  private handlePointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    if (this.isDragging && this.lookEnabled) {
      this.lookYaw -= (e.clientX - this.lastPtr.x) * 0.0035;
      this.lookPitch = Math.max(-0.55, Math.min(0.55, this.lookPitch - (e.clientY - this.lastPtr.y) * 0.0028));
      this.lastPtr = { x: e.clientX, y: e.clientY };
    }
  };

  private handlePointerUp = () => { this.isDragging = false; };

  private handleClick = (e: MouseEvent) => {
    const allowed = ["exploration", "sas_decision", "fluid_decision"];
    if (!allowed.includes(this.stage)) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const m = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(m, this.camera);
    for (const [id, obj] of this.interactives) {
      if (this.raycaster.intersectObjects([obj], true).length > 0) {
        this.onInteract(id);
        break;
      }
    }
  };

  // ── Stage ────────────────────────────────────────────────────────────────────

  setStage(stage: Stage) {
    this.stage = stage;
    this.lookEnabled = false;
    this.setGlows(0, 0, 0);
    this.renderer.domElement.style.cursor = "default";

    switch (stage) {
      case "briefing":
        this.camGoal.set(0, 0.1, 5.5);
        this.lookGoal.set(0, 0, 0);
        break;

      case "exploration":
        this.lookEnabled = true;
        this.lookYaw = 0;
        this.lookPitch = -0.1;
        this.camGoal.set(0, 0.1, 1.4);
        this.lookGoal.set(0, -0.05, -1.5);
        this.setGlows(0.55, 0.55, 0.55);
        this.renderer.domElement.style.cursor = "grab";
        break;

      case "sas_crisis":
        this.camGoal.set(0, 0.35, 1.0);
        this.lookGoal.set(-0.35, -0.3, -2.6); // Look toward astronaut
        this.emergencyLight.color.setHex(0xff8800); // Amber for SAS
        this.emergencyLight.intensity = 1.8;
        this.keyLight.intensity = 0.6;
        this.wallMat.emissive = new THREE.Color(0x120800);
        this.wallMat.emissiveIntensity = 0.2;
        this.stripMat.color.setHex(0xffaa33);
        break;

      case "sas_decision":
        this.camGoal.set(0, 0.1, 0.7);
        this.lookGoal.set(0, -0.1, -1.5);
        this.setGlows(0.85, 0.9, 0.85);
        break;

      case "sas_outcome":
        break;

      case "fluid_crisis":
        this.camGoal.set(0, 0.35, 1.0);
        this.lookGoal.set(0, 0, -1.5);
        this.emergencyLight.color.setHex(0xff2200); // Red for fluid
        this.emergencyLight.intensity = 3.2;
        this.keyLight.intensity = 0.4;
        this.wallMat.emissive = new THREE.Color(0x1a0400);
        this.wallMat.emissiveIntensity = 0.3;
        this.stripMat.color.setHex(0xff4422);
        break;

      case "fluid_decision":
        this.camGoal.set(0, 0.1, 0.7);
        this.lookGoal.set(0, -0.1, -1.5);
        this.setGlows(0.85, 0.9, 0.85);
        break;

      case "fluid_outcome":
        break;

      case "debrief":
        this.camGoal.set(0, 0.4, 5.0);
        this.lookGoal.set(0, -0.25, -2.0);
        this.emergencyLight.intensity = 0;
        this.keyLight.intensity = 1.3;
        this.keyLight.color.setHex(0xcce8ff);
        this.wallMat.emissiveIntensity = 0;
        this.stripMat.color.setHex(0xb8d8ff);
        break;
    }
  }

  setChoice(choice: Choice) {
    const targets: Record<Choice, [number, number, number][]> = {
      exercise: [[-0.9, -0.3, 0.5], [-1.55, -1.05, -0.5]],
      medical:  [[1.1, -0.4, 0.5],  [1.55, -1.45, -0.5]],
      comms:    [[0, 0.1, -0.8],    [0, 0.22, -3.7]],
    };
    const [cam, look] = targets[choice];
    this.camGoal.set(...cam);
    this.lookGoal.set(...look);
  }

  setChoiceOutcome(good: boolean) {
    if (good) {
      this.emergencyLight.intensity = 0;
      this.keyLight.intensity = 1.5;
      this.keyLight.color.setHex(0xaaffd4);
      this.wallMat.emissive = new THREE.Color(0x001a0a);
      this.wallMat.emissiveIntensity = 0.1;
      this.stripMat.color.setHex(0x88ffcc);
    } else {
      this.emergencyLight.intensity = 0.9;
      this.keyLight.intensity = 0.8;
      this.keyLight.color.setHex(0xffd8a0);
      this.stripMat.color.setHex(0xffcc66);
    }
  }

  returnToExploration() {
    this.camGoal.set(0, 0.1, 1.4);
    this.lookGoal.set(0, -0.05, -1.5);
    this.lookEnabled = true;
    this.lookYaw = 0;
    this.lookPitch = -0.1;
  }

  setBriefingProgress(p: number) {
    this.briefingProgress = p;
  }

  private setGlows(ex: number, med: number, com: number) {
    this.exerciseGlowMat.opacity = ex;
    this.medicalGlowMat.opacity = med;
    this.commsGlowMat.opacity = com;
  }

  // ── Tick ─────────────────────────────────────────────────────────────────────

  private tick = (ms: number) => {
    this.raf = requestAnimationFrame(this.tick);
    const t = ms * 0.001;

    this.earth.rotation.y = t * 0.04;
    this.stars.rotation.y = t * 0.008;
    this.stars.rotation.x = t * 0.004;
    this.astronaut.position.y = -0.75 + Math.sin(t * 0.55) * 0.038;
    this.astronaut.rotation.z = Math.sin(t * 0.35) * 0.018;
    this.holoGroup.position.y = 0.32 + Math.sin(t * 0.72 + 1.1) * 0.022;
    this.holoGroup.rotation.y = Math.sin(t * 0.2) * 0.025;

    const isEmergency = ["sas_crisis", "fluid_crisis", "sas_decision", "fluid_decision"].includes(this.stage);
    if (isEmergency && this.emergencyLight.intensity > 0.3) {
      const freq = this.stage === "fluid_crisis" || this.stage === "fluid_decision" ? 2.8 : 1.8;
      this.emergencyLight.intensity = this.emergencyLight.intensity * 0.95 + (this.emergencyLight.intensity + Math.sin(t * freq) * 0.8) * 0.05;
    }

    const interactive = this.stage === "sas_decision" || this.stage === "fluid_decision" || this.stage === "exploration";
    if (interactive) {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      let found: Choice | null = null;
      for (const [id, obj] of this.interactives) {
        const hit = this.raycaster.intersectObjects([obj], true).length > 0;
        obj.scale.lerp(new THREE.Vector3(hit ? 1.065 : 1, hit ? 1.065 : 1, hit ? 1.065 : 1), 0.12);
        if (hit) found = id;
      }
      if (found !== this.currentHover) {
        this.currentHover = found;
        this.onHoverChange(found);
        if (this.stage === "sas_decision" || this.stage === "fluid_decision") {
          this.renderer.domElement.style.cursor = found ? "pointer" : "default";
        }
      }
    }

    if (this.stage === "briefing") {
      const p = this.briefingProgress;
      this.camGoal.set(0, 0.05 * p, 5.5 - p * 4.2);
      this.lookGoal.set(0, -0.05 * p, -1 - p * 0.5);
    } else if (this.lookEnabled) {
      const dist = 4.5;
      this.lookGoal.set(
        Math.sin(this.lookYaw) * dist,
        Math.sin(this.lookPitch) * dist * 0.7,
        -0.5 - Math.cos(this.lookYaw) * dist,
      );
    }

    this.camPos.lerp(this.camGoal, 0.042);
    this.lookPos.lerp(this.lookGoal, 0.042);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.lookPos);
    this.renderer.render(this.scene, this.camera);
  };

  // ── Dispose ──────────────────────────────────────────────────────────────────

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener("pointerdown", this.handlePointerDown);
    canvas.removeEventListener("pointermove", this.handlePointerMove);
    canvas.removeEventListener("pointerup", this.handlePointerUp);
    canvas.removeEventListener("click", this.handleClick);
    canvas.style.cursor = "default";
    this.renderer.dispose();
  }
}

// ── React wrapper ─────────────────────────────────────────────────────────────

type Props = {
  stage: Stage;
  choice: Choice | null;
  briefingProgress: number;
  onInteract: (c: Choice) => void;
  onHoverChange: (c: Choice | null) => void;
  outcomeGood?: boolean | null;
  zoomTarget?: Choice | null;
  className?: string;
};

export function SpaceScene({ stage, choice, briefingProgress, onInteract, onHoverChange, outcomeGood, zoomTarget, className }: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const sceneRef = React.useRef<MissionScene | null>(null);
  const onInteractRef = React.useRef(onInteract);
  const onHoverRef = React.useRef(onHoverChange);

  React.useEffect(() => { onInteractRef.current = onInteract; }, [onInteract]);
  React.useEffect(() => { onHoverRef.current = onHoverChange; }, [onHoverChange]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new MissionScene(canvas, (c) => onInteractRef.current(c), (c) => onHoverRef.current(c));
    sceneRef.current = scene;
    return () => { scene.dispose(); sceneRef.current = null; };
  }, []);

  React.useEffect(() => { sceneRef.current?.setStage(stage); }, [stage]);
  React.useEffect(() => { if (choice) sceneRef.current?.setChoice(choice); }, [choice]);
  React.useEffect(() => { sceneRef.current?.setBriefingProgress(briefingProgress); }, [briefingProgress]);
  React.useEffect(() => { if (outcomeGood != null) sceneRef.current?.setChoiceOutcome(outcomeGood); }, [outcomeGood]);
  React.useEffect(() => {
    if (zoomTarget) sceneRef.current?.setChoice(zoomTarget);
    else if (stage === "exploration") sceneRef.current?.returnToExploration();
  }, [zoomTarget, stage]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
