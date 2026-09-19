"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { WORLDS, UI } from "../data/worlds";

/* ============================================================
   LE VOYAGE — décollage, vol, atterrissage sur chaque planète,
   journal de bord, redécollage. Style low-poly chaud, cinéma.
   ============================================================ */

const INTRO = 0.07;           // part du scroll pour le décollage
const OUTRO = 0.02;
const N = WORLDS.length;
const SEG = (1 - INTRO - OUTRO) / N;

// positions des planètes le long de la route
function planetPose(i) {
  const w = WORLDS[i];
  const z = -(i + 1) * 560;
  const x = (i % 2 === 0 ? -1 : 1) * (190 + (i * 23) % 70);
  const y = ((i * 41) % 110) - 55;
  return { x, y, z, size: w.size };
}

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.max(0, Math.min(1, t));
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export default function Experience() {
  const canvasRef = useRef(null);
  const panelRefs = useRef([]);
  const dotRefs = useRef([]);
  const heroRef = useRef(null);
  const progRef = useRef(null);

  const [lang, setLang] = useState("fr");
  const [cvOpen, setCvOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [toast, setToast] = useState("");
  const t = (obj) => (typeof obj === "string" ? obj : obj[lang]);

  /* ---------------- chatbot scripté ---------------- */
  const ANS = {
    hello: { fr: "Salut 👋 Je suis le double virtuel de Samy. Pose-moi tes questions sur son stage, ses compétences ou ses projets.", en: "Hi 👋 I'm Samy's virtual double. Ask me about his internship, skills or projects." },
    stage: { fr: "Je cherche un stage de 8 semaines à partir de mai 2027, en cybersécurité et réseau. Temps plein, Île-de-France.", en: "I'm looking for an 8-week internship from May 2027, in cybersecurity and networking. Full-time, Paris region." },
    competences: { fr: "Réseau : Cisco/CCNA, VLAN, OSPF/EIGRP, VoIP. Systèmes : Linux, Windows Server, Debian. Cyber : sécurité réseau, cryptographie. Dev : Python, PHP, GNS3, Wireshark.", en: "Network: Cisco/CCNA, VLAN, OSPF/EIGRP, VoIP. Systems: Linux, Windows Server, Debian. Cyber: network security, cryptography. Dev: Python, PHP, GNS3, Wireshark." },
    projet: { fr: "Mon projet phare : la SAÉ 24 — une infra réseau GNS3 complète avec un serveur Python/MySQL affiché sur le web.", en: "My flagship project: SAÉ 24 — a complete GNS3 network infra with a Python/MySQL server displayed on the web." },
    contact: { fr: "Le mieux : ssaidj1@condorcet93.fr, ou via LinkedIn / GitHub (shoonqlf).", en: "Best: ssaidj1@condorcet93.fr, or via LinkedIn / GitHub (shoonqlf)." },
    fallback: { fr: "Bonne question ! Écris-moi directement : ssaidj1@condorcet93.fr", en: "Good question! Write to me directly: ssaidj1@condorcet93.fr" },
  };
  const SUGG = [
    [{ fr: "Quel stage ?", en: "What internship?" }, "stage"],
    [{ fr: "Compétences ?", en: "Skills?" }, "competences"],
    [{ fr: "Meilleur projet ?", en: "Best project?" }, "projet"],
    [{ fr: "Contact ?", en: "Contact?" }, "contact"],
  ];
  const findIntent = (txt) => {
    const s = " " + txt.toLowerCase() + " ";
    if (/stage|intern|cherch|poste/.test(s)) return "stage";
    if (/comp|skill|techno|outil|maitris/.test(s)) return "competences";
    if (/projet|project|sae|saé|fier|meilleur|best/.test(s)) return "projet";
    if (/contact|mail|email|linkedin|github|joindre/.test(s)) return "contact";
    if (/bonjour|salut|hello|hey|coucou|hi /.test(s)) return "hello";
    return "fallback";
  };
  const ask = (text, key) => {
    setMsgs((m) => [...m, { who: "me", text }]);
    setTimeout(() => setMsgs((m) => [...m, { who: "bot", text: t(ANS[key || findIntent(text)]) }]), 420);
  };
  const openChat = () => {
    setChatOpen(true);
    setMsgs((m) => (m.length ? m : [{ who: "bot", text: t(ANS.hello) }]));
  };

  /* ---------------- easter egg CTF ---------------- */
  useEffect(() => {
    try {
      console.log("%c✦ Tiens, un curieux dans la console…", "color:#FF4E8C;font-size:14px;font-weight:bold");
      console.log("%cTu as l'œil d'un pentester. Indice : tape le prénom du pilote, quelque part sur la page. 🌙", "color:#FFC24B;font-size:12px");
    } catch (e) {}
    let buf = "";
    const onKey = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key && e.key.length === 1) {
        buf = (buf + e.key.toLowerCase()).slice(-6);
        if (buf.includes("samy")) {
          buf = "";
          setToast("🚩 SAMY{Pr3m13r_c0nt4ct} — bien joué, continue de fouiller 👀");
          setTimeout(() => setToast(""), 4200);
        }
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  /* ============================================================
     SCÈNE 3D
     ============================================================ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d0710, 0.0011);
    const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 9000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(innerWidth, innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    /* ---- lumières ---- */
    scene.add(new THREE.AmbientLight(0x3a2438, 1.1));
    const key = new THREE.DirectionalLight(0xffe0b8, 2.4);
    key.position.set(0.8, 0.7, 0.4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff6fae, 0.55);
    rim.position.set(-0.7, 0.1, -0.8);
    scene.add(rim);

    /* ---- étoiles (2 couches) ---- */
    const mkStars = (count, size, spread, op) => {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
        pos[i * 3 + 2] = 400 - Math.random() * 6200;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const m = new THREE.PointsMaterial({ size, color: 0xfff0e0, transparent: true, opacity: op, depthWrite: false, sizeAttenuation: true });
      const p = new THREE.Points(g, m);
      scene.add(p);
      return p;
    };
    mkStars(5200, 2.6, 2400, 0.9);
    mkStars(8000, 1.3, 3200, 0.55);

    /* ---- nébuleuses discrètes ---- */
    const glowTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const x = c.getContext("2d");
      const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgba(255,255,255,.6)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 128, 128);
      const t = new THREE.CanvasTexture(c);
      return t;
    })();
    const neb = (color, x, y, z, s, o) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.position.set(x, y, z);
      sp.scale.set(s, s, 1);
      scene.add(sp);
    };
    neb(0xe0407a, -420, 160, -700, 700, 0.10);
    neb(0x8b5cf6, 460, -140, -1500, 800, 0.09);
    neb(0xffc24b, -380, 200, -2400, 700, 0.08);
    neb(0xff8a5b, 420, 120, -3300, 760, 0.09);
    neb(0xe0407a, -420, -100, -4200, 800, 0.08);

    /* ---- sol de départ (pas de tir) ---- */
    const ground = new THREE.Group();
    const gDisc = new THREE.Mesh(
      new THREE.CircleGeometry(900, 48),
      new THREE.MeshStandardMaterial({ color: 0x241019, roughness: 1 })
    );
    gDisc.rotation.x = -Math.PI / 2;
    ground.add(gDisc);
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 18, 3, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a1e2c, roughness: 0.9, flatShading: true })
    );
    pad.position.y = 1.5;
    ground.add(pad);
    for (let i = 0; i < 14; i++) {
      const h = 6 + Math.random() * 26;
      const hill = new THREE.Mesh(
        new THREE.ConeGeometry(8 + Math.random() * 22, h, 5),
        new THREE.MeshStandardMaterial({ color: 0x2c1420, roughness: 1, flatShading: true })
      );
      const a = Math.random() * Math.PI * 2;
      const d = 120 + Math.random() * 500;
      hill.position.set(Math.cos(a) * d, h / 2, Math.sin(a) * d);
      ground.add(hill);
    }
    scene.add(ground);

    /* ---- LA FUSÉE (low-poly chaude) ---- */
    const rocket = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xfff3e9, roughness: 0.5, flatShading: true });
    const accMat = new THREE.MeshStandardMaterial({ color: 0xff4e8c, roughness: 0.55, flatShading: true });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a1522, roughness: 0.8, flatShading: true });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.5, 10, 10), bodyMat);
    body.position.y = 5.5;
    rocket.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(2.1, 4.4, 10), accMat);
    nose.position.y = 12.7;
    rocket.add(nose);
    const winMat = new THREE.MeshStandardMaterial({ color: 0xffc24b, emissive: 0xff8a5b, emissiveIntensity: 0.9, roughness: 0.3 });
    const win = new THREE.Mesh(new THREE.SphereGeometry(0.95, 10, 10), winMat);
    win.position.set(0, 8, 2.15);
    rocket.add(win);
    for (let i = 0; i < 3; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.6, 3.4), accMat);
      const a = (i / 3) * Math.PI * 2;
      fin.position.set(Math.cos(a) * 2.5, 1.6, Math.sin(a) * 2.5);
      fin.lookAt(0, 1.6, 0);
      rocket.add(fin);
    }
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 1.6, 10), darkMat);
    nozzle.position.y = -0.2;
    rocket.add(nozzle);
    // flamme
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffc24b, transparent: true, opacity: 0.95 });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(1.5, 7, 10), flameMat);
    flame.rotation.x = Math.PI;
    flame.position.y = -4.4;
    rocket.add(flame);
    const flameIn = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4.6, 8), new THREE.MeshBasicMaterial({ color: 0xfff3e9 }));
    flameIn.rotation.x = Math.PI;
    flameIn.position.y = -3.4;
    rocket.add(flameIn);
    const rocketLight = new THREE.PointLight(0xff9e5e, 1.4, 90);
    rocketLight.position.y = -4;
    rocket.add(rocketLight);
    rocket.position.set(0, 3, 0);
    scene.add(rocket);

    /* ---- traînée de particules ---- */
    const TRAIL = 90;
    const trailGeo = new THREE.BufferGeometry();
    const trailPos = new Float32Array(TRAIL * 3);
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    const trailPts = new THREE.Points(trailGeo, new THREE.PointsMaterial({ size: 3.2, map: glowTex, color: 0xffb27a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(trailPts);
    const trail = [];

    /* ---- PLANÈTES stylisées + décor de surface ---- */
    const poses = WORLDS.map((_, i) => planetPose(i));
    const planetGroups = [];
    const mkDeco = (type, accent, size) => {
      const g = new THREE.Group();
      const m = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.6, flatShading: true, emissive: accent, emissiveIntensity: 0.25 });
      const add = (mesh, x, z) => {
        mesh.position.set(x, 0, z);
        g.add(mesh);
      };
      if (type === "antennas") {
        for (let i = 0; i < 3; i++) {
          const t = new THREE.Group();
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 6 + i, 6), m);
          mast.position.y = 3;
          const ball = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), m);
          ball.position.y = 6.4 + i;
          t.add(mast, ball);
          add(t, -5 + i * 5, i % 2 ? 3 : -3);
        }
      } else if (type === "city") {
        for (let i = 0; i < 5; i++) {
          const h = 2.5 + Math.random() * 5;
          add(new THREE.Mesh(new THREE.BoxGeometry(1.8, h, 1.8), m), -6 + i * 3, (i % 2 ? 1 : -1) * 2.4);
        }
        g.children.forEach((c) => { c.position.y = c.geometry?.parameters?.height ? c.geometry.parameters.height / 2 : c.position.y; });
      } else if (type === "fiber") {
        for (let i = 0; i < 3; i++) {
          const arc = new THREE.Mesh(new THREE.TorusGeometry(3 + i * 1.6, 0.14, 6, 24, Math.PI), m);
          arc.position.y = 0.2;
          arc.rotation.z = 0;
          add(arc, 0, 0);
        }
      } else if (type === "charts") {
        for (let i = 0; i < 5; i++) {
          const h = 1.5 + i * 1.15;
          const bar = new THREE.Mesh(new THREE.BoxGeometry(1.3, h, 1.3), m);
          bar.position.y = h / 2;
          add(bar, -4.5 + i * 2.3, 0);
        }
      } else if (type === "music") {
        for (let i = 0; i < 4; i++) {
          const h = 2 + Math.sin(i * 1.7) * 1.4 + 2;
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, h, 8), m);
          bar.position.y = h / 2;
          add(bar, -4 + i * 2.6, 0);
        }
      } else if (type === "home") {
        const base = new THREE.Mesh(new THREE.BoxGeometry(4, 2.6, 4), m);
        base.position.y = 1.3;
        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.2, 4), m);
        roof.position.y = 3.7;
        roof.rotation.y = Math.PI / 4;
        g.add(base, roof);
      }
      return g;
    };

    WORLDS.forEach((w, i) => {
      const p = poses[i];
      const g = new THREE.Group();
      g.position.set(p.x, p.y, p.z);
      const mat = w.star
        ? new THREE.MeshStandardMaterial({ color: w.color, emissive: w.color, emissiveIntensity: 0.85, roughness: 0.7, flatShading: true })
        : new THREE.MeshStandardMaterial({ color: w.color, roughness: 0.95, flatShading: true });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(w.size, 14, 10), mat);
      g.add(sphere);
      // calotte polaire claire (zone d'atterrissage)
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(w.size * 1.005, 14, 5, 0, Math.PI * 2, 0, 0.55),
        new THREE.MeshStandardMaterial({ color: 0xfff3e9, roughness: 1, flatShading: true, transparent: true, opacity: 0.22 })
      );
      g.add(cap);
      if (w.ring) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(w.size * 1.9, w.size * 0.07, 8, 48),
          new THREE.MeshStandardMaterial({ color: w.ring, roughness: 0.7, flatShading: true })
        );
        ring.rotation.x = Math.PI / 2.25;
        g.add(ring);
      }
      if (w.star) {
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: w.color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
        glow.scale.set(w.size * 5, w.size * 5, 1);
        g.add(glow);
      }
      const deco = mkDeco(w.deco, w.accent, w.size);
      deco.position.y = w.size;
      g.add(deco);
      scene.add(g);
      planetGroups.push(g);
    });

    /* ---- constellations entre les planètes + paquets ---- */
    const pts = [];
    for (let i = 0; i < poses.length - 1; i++) {
      pts.push(V(poses[i].x, poses[i].y, poses[i].z), V(poses[i + 1].x, poses[i + 1].y, poses[i + 1].z));
    }
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffc24b, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })));
    const packets = [];
    for (let i = 0; i < poses.length - 1; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe7b0, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.scale.set(9, 9, 1);
      scene.add(sp);
      packets.push({ sp, a: V(poses[i].x, poses[i].y, poses[i].z), b: V(poses[i + 1].x, poses[i + 1].y, poses[i + 1].z), t: Math.random(), v: 0.1 + Math.random() * 0.07 });
    }

    /* ============================================================
       CHORÉGRAPHIE : position fusée + caméra selon le scroll
       ============================================================ */
    const landPoint = (i) => {
      const p = poses[i];
      return V(p.x, p.y + p.size + 2.5, p.z);
    };
    const approachPoint = (i) => {
      const p = poses[i];
      return V(p.x, p.y + p.size * 2.6, p.z + p.size * 4.5 + 60);
    };
    const departPoint = (i) => {
      const p = poses[i];
      return V(p.x * 0.6, p.y + p.size * 3.6, p.z - p.size * 2.5);
    };
    const liftEnd = V(0, 170, -90);

    // état de la scène pour une valeur de scroll p ∈ [0,1]
    function pose(p) {
      let rocketPos, throttle, phase, worldIdx = -1, dwell = 0;
      if (p < INTRO) {
        const t = smooth(clamp01(p / INTRO));
        rocketPos = V(0, lerp(3, liftEnd.y, t), lerp(0, liftEnd.z, t * t));
        throttle = t < 0.08 ? t * 8 : 1;
        phase = "launch";
      } else {
        const q = (p - INTRO) / SEG;
        const i = Math.min(N - 1, Math.floor(q));
        const t = clamp01(q - i);
        worldIdx = i;
        const from = i === 0 ? liftEnd : departPoint(i - 1);
        const app = approachPoint(i);
        const land = landPoint(i);
        if (t < 0.4) {
          const k = smooth(t / 0.4);
          rocketPos = from.clone().lerp(app, k);
          throttle = 1;
          phase = "travel";
        } else if (t < 0.55) {
          const k = smooth((t - 0.4) / 0.15);
          rocketPos = app.clone().lerp(land, k);
          throttle = 0.55 - k * 0.3;
          phase = "descent";
        } else if (t < 0.82) {
          rocketPos = land.clone();
          throttle = 0;
          phase = "landed";
          dwell = smooth(clamp01(((t - 0.55) / 0.27) * 2)) * smooth(clamp01((0.82 - t) / 0.27 * 2));
        } else {
          const k = smooth((t - 0.82) / 0.18);
          rocketPos = land.clone().lerp(departPoint(i), k);
          throttle = 0.4 + k * 0.8;
          phase = "ascent";
        }
      }
      return { rocketPos, throttle, phase, worldIdx, dwell };
    }

    /* ---- scroll ---- */
    let target = 0;
    const readScroll = () => {
      const max = document.body.scrollHeight - innerHeight;
      target = max > 0 ? clamp01((window.pageYOffset || 0) / max) : 0;
    };
    addEventListener("scroll", readScroll, { passive: true });
    const onResize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    };
    addEventListener("resize", onResize);

    /* ---- centres des panneaux (pour l'UI) ---- */
    const centers = WORLDS.map((_, i) => INTRO + SEG * i + SEG * 0.68);

    /* ---- boucle ---- */
    let p = 0;
    const camPos = V(26, 12, 46);
    const camLook = V(0, 8, 0);
    const upQ = new THREE.Quaternion();
    const dirQ = new THREE.Quaternion();
    const UP = V(0, 1, 0);
    let prevRocket = V(0, 3, 0);
    let raf = 0;

    const frame = (now) => {
      p += (target - p) * (reduce ? 1 : 0.055);
      const st = pose(p);
      const { rocketPos, throttle, phase, worldIdx, dwell } = st;

      // fusée
      rocket.position.copy(rocketPos);
      const vel = rocketPos.clone().sub(prevRocket);
      prevRocket = rocketPos.clone();
      const speed = vel.length();
      if (speed > 0.02 && phase !== "landed") {
        dirQ.setFromUnitVectors(UP, vel.clone().normalize());
      } else {
        dirQ.identity();
      }
      rocket.quaternion.slerp(dirQ, 0.09);
      // flamme
      const fl = throttle * (1 + Math.sin(now * 0.04) * 0.18);
      flame.scale.set(Math.max(0.001, fl), Math.max(0.001, fl), Math.max(0.001, fl));
      flameIn.scale.copy(flame.scale);
      rocketLight.intensity = 0.4 + throttle * 1.6;
      // tremblement au décollage
      if (phase === "launch" && throttle > 0.5) {
        rocket.position.x += (Math.random() - 0.5) * 0.5;
        rocket.position.z += (Math.random() - 0.5) * 0.5;
      }
      // traînée
      if (throttle > 0.25) {
        trail.unshift(rocket.position.clone().add(V((Math.random() - 0.5) * 1.5, -3, (Math.random() - 0.5) * 1.5)));
        if (trail.length > TRAIL) trail.pop();
      } else if (trail.length) trail.pop();
      for (let i = 0; i < TRAIL; i++) {
        const pt = trail[i];
        trailPos[i * 3] = pt ? pt.x : 99999;
        trailPos[i * 3 + 1] = pt ? pt.y : 99999;
        trailPos[i * 3 + 2] = pt ? pt.z : 99999;
      }
      trailGeo.attributes.position.needsUpdate = true;

      // caméra selon la phase
      let cTarget, lTarget;
      if (phase === "launch") {
        cTarget = V(30, rocketPos.y * 0.85 + 10, rocketPos.z + 55);
        lTarget = V(0, rocketPos.y + 6, rocketPos.z);
      } else if (phase === "landed" && worldIdx >= 0) {
        const pp = poses[worldIdx];
        const a = now * 0.00012;
        const d = pp.size * 2.9 + 26;
        cTarget = V(pp.x + Math.sin(a) * d, pp.y + pp.size * 1.15, pp.z + Math.cos(a) * d);
        lTarget = V(pp.x, pp.y + pp.size * 0.8, pp.z);
      } else if (phase === "descent" && worldIdx >= 0) {
        const pp = poses[worldIdx];
        cTarget = V(pp.x + pp.size * 2.4, pp.y + pp.size * 1.6, pp.z + pp.size * 3.2);
        lTarget = rocketPos.clone();
      } else {
        const back = vel.lengthSq() > 0.0001 ? vel.clone().normalize().multiplyScalar(-34) : V(0, 0, 34);
        cTarget = rocketPos.clone().add(back).add(V(10, 8, 0));
        lTarget = rocketPos.clone().add(vel.clone().normalize().multiplyScalar(30));
      }
      camPos.lerp(cTarget, 0.06);
      camLook.lerp(lTarget, 0.08);
      camera.position.copy(camPos);
      camera.lookAt(camLook);

      // planètes qui tournent doucement
      for (let i = 0; i < planetGroups.length; i++) planetGroups[i].rotation.y = now * 0.00004 + i;
      // paquets
      for (const pk of packets) {
        pk.t += pk.v * 0.014;
        if (pk.t > 1) pk.t = 0;
        pk.sp.position.lerpVectors(pk.a, pk.b, pk.t);
        pk.sp.material.opacity = 0.35 + Math.sin(pk.t * Math.PI) * 0.45;
      }

      /* ---- UI liée au scroll ---- */
      if (progRef.current) progRef.current.style.width = p * 100 + "%";
      if (heroRef.current) {
        const h = Math.max(0, 1 - p / 0.05);
        heroRef.current.style.opacity = h;
        heroRef.current.style.pointerEvents = h > 0.2 ? "auto" : "none";
      }
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        const c = centers[i];
        const op = i === worldIdx && phase === "landed" ? dwell : Math.max(0, 1 - Math.abs(p - c) / 0.03) * 0.0;
        const finalOp = i === worldIdx && (phase === "landed") ? Math.max(op, dwell) : 0;
        el.style.opacity = finalOp;
        el.style.pointerEvents = finalOp > 0.5 ? "auto" : "none";
      });
      let near = 0, best = 9;
      centers.forEach((c, i) => {
        const d = Math.abs(p - c);
        if (d < best) { best = d; near = i; }
      });
      dotRefs.current.forEach((el, i) => {
        if (el) el.className = i === near && p > INTRO * 0.8 ? "on" : "";
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    readScroll();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", readScroll);
      removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  const goTo = (i) => {
    const c = INTRO + SEG * i + SEG * 0.68;
    const max = document.body.scrollHeight - innerHeight;
    window.scrollTo({ top: c * max, behavior: "smooth" });
  };

  /* ============================================================
     RENDU
     ============================================================ */
  return (
    <>
      <div className="bg" />
      <div className="spacer" />
      <canvas id="space" ref={canvasRef} />
      <div className="grain" />
      <div className="prog" ref={progRef} />

      <header className="top">
        <a href="#" className="brand"><span className="dot" />Samy Saïdj</a>
        <div className="top-right">
          <button className="langbtn" onClick={() => setLang(lang === "fr" ? "en" : "fr")}>
            {lang === "fr" ? <><b>FR</b> · EN</> : <>FR · <b>EN</b></>}
          </button>
          <button className="rec" onClick={() => setCvOpen(true)}>{t(UI.recruiter)}</button>
        </div>
      </header>

      {/* pas de tir */}
      <div className="hero" ref={heroRef}>
        <div className="eyebrow"><span className="ln l" />{t(UI.eyebrow)}<span className="ln r" /></div>
        <h1 className="hname">Samy Saïdj</h1>
        <p className="hsub">{t(UI.tagline)}</p>
        <div className="ready">{t(UI.ready)}</div>
        <a className="scroll" href="#" onClick={(e) => { e.preventDefault(); goTo(0); }}>
          <span className="cta">{t(UI.ignition)}</span>
          <span className="bar" />
          <span>{t(UI.scroll)}</span>
        </a>
      </div>

      {/* journaux de bord */}
      {WORLDS.map((w, i) => (
        <div key={w.id} className={`panel ${i % 2 ? "left" : "right"}`} ref={(el) => (panelRefs.current[i] = el)}>
          <div className="idx">{t(UI.logbook)} — {t(w.idx)}</div>
          <h2>{t(w.title)}</h2>
          <div className="cat">{t(w.cat)}</div>
          {w.contact ? (
            <div className="contact-links">
              <a href="mailto:ssaidj1@condorcet93.fr">✉️ ssaidj1@condorcet93.fr</a>
              <a href="https://www.linkedin.com/in/samy-saidj-02908b352" target="_blank" rel="noopener noreferrer">in LinkedIn</a>
              <a href="https://github.com/shoonqlf" target="_blank" rel="noopener noreferrer">⌥ GitHub — shoonqlf</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setCvOpen(true); }}>📄 {t(UI.dlCv)}</a>
            </div>
          ) : (
            <>
              <p>{t(w.desc)}</p>
              <div className="tags">{w.tags.map((tg) => <span key={tg}>{tg}</span>)}</div>
            </>
          )}
        </div>
      ))}

      {/* nav étoiles */}
      <div className="starnav">
        {WORLDS.map((w, i) => (
          <i key={w.id} title={typeof w.title === "string" ? w.title : w.title[lang]} ref={(el) => (dotRefs.current[i] = el)} onClick={() => goTo(i)} />
        ))}
      </div>

      {/* mode recruteur */}
      <div className={`cv ${cvOpen ? "on" : ""}`}>
        <button className="close" onClick={() => setCvOpen(false)}>×</button>
        <h1>Samy Saïdj</h1>
        <div className="role">Réseaux & Télécommunications · Cybersécurité</div>
        <h3>{lang === "fr" ? "Recherche" : "Looking for"}</h3>
        <p className="cvp">{lang === "fr" ? "Stage de 8 semaines à partir de mai 2027, en cybersécurité et réseau. Temps plein, Île-de-France." : "8-week internship from May 2027, in cybersecurity and networking. Full-time, Paris region."}</p>
        <h3>{lang === "fr" ? "Compétences" : "Skills"}</h3>
        <div className="grid">
          <div className="cvcard"><b>{lang === "fr" ? "Réseau" : "Network"}</b><span>Cisco / CCNA, VLAN, OSPF, EIGRP, VoIP</span></div>
          <div className="cvcard"><b>{lang === "fr" ? "Systèmes" : "Systems"}</b><span>Linux, Windows Server, Debian</span></div>
          <div className="cvcard"><b>Cyber</b><span>{lang === "fr" ? "Sécurité réseau, cryptographie" : "Network security, cryptography"}</span></div>
          <div className="cvcard"><b>Dev</b><span>Python, PHP, GNS3, Wireshark</span></div>
        </div>
        <h3>{lang === "fr" ? "Projets clés" : "Key projects"}</h3>
        <ul>
          <li><b>SAÉ 24</b> — {lang === "fr" ? "Infra réseau GNS3 + serveur Python/MySQL + web" : "GNS3 network infra + Python/MySQL server + web"}</li>
          <li><b>DriveElite</b> — {lang === "fr" ? "Site de location de voitures (PHP/MySQL)" : "Car rental site (PHP/MySQL)"}</li>
          <li><b>SAÉ 22</b> — {lang === "fr" ? "Communication par fibre optique (Arduino, FSK)" : "Optical fiber communication (Arduino, FSK)"}</li>
        </ul>
        <h3>Contact</h3>
        <p className="cvp">ssaidj1@condorcet93.fr · linkedin.com/in/samy-saidj-02908b352 · github.com/shoonqlf</p>
        <a className="dl" href="#">{t(UI.dlCv)} (PDF)</a>
      </div>

      {/* chatbot */}
      <button className={`chat-launch ${chatOpen ? "active" : ""}`} onClick={() => (chatOpen ? setChatOpen(false) : openChat())}>
        <span>💬</span><span>{t(UI.askSamy)}</span>
      </button>
      <div className={`chat-panel ${chatOpen ? "open" : ""}`}>
        <div className="chat-head">
          <div><strong>{t(UI.askSamy)}</strong><em>{t(UI.auto)}</em></div>
          <button className="chat-close" onClick={() => setChatOpen(false)}>×</button>
        </div>
        <div className="chat-body">
          {msgs.map((m, i) => <div key={i} className={`chat-msg ${m.who}`}>{m.text}</div>)}
        </div>
        <div className="chat-sugg">
          {SUGG.map(([label, key]) => (
            <button key={key} className="chat-chip" onClick={() => ask(t(label), key)}>{t(label)}</button>
          ))}
        </div>
        <ChatInput placeholder={t(UI.placeholder)} onSend={(v) => ask(v)} />
      </div>

      {toast && <div className="toast show">{toast}</div>}
    </>
  );
}

function ChatInput({ placeholder, onSend }) {
  const [v, setV] = useState("");
  const send = () => {
    const s = v.trim();
    if (!s) return;
    setV("");
    onSend(s);
  };
  return (
    <div className="chat-input">
      <input value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
      <button className="chat-send" onClick={send}>➤</button>
    </div>
  );
}
