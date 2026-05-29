// Fluid hover effect — Three.js + custom GLSL.
//
// Renders a fullscreen quad through a fragment shader that displaces an
// (optional) image texture and a UI overlay (rasterised buttons or a custom
// draw callback) along the cursor's smoothed velocity vector. The result
// smears under fast mouse motion and settles into a soft "suction" pull at
// rest.
//
// Usage:
//   import { createFluidHover } from './js/fluid-hover.js';
//
//   // With a background image and a row of pill buttons
//   createFluidHover({
//     container: document.getElementById('app'),
//     image: 'photo.jpg',
//     buttons: [{ label: 'Go', primary: true, onClick: () => {} }],
//   });
//
//   // Imageless: distort only what `customDraw` paints onto the overlay.
//   // Renderer is transparent so the host section's bg shows through.
//   createFluidHover({
//     container: document.getElementById('experiments-cover'),
//     imageless: true,
//     customDraw: (ctx, { width, height, dpr }) => {
//       ctx.fillStyle = '#fff';
//       ctx.textAlign = 'center';
//       ctx.font = `${160 * dpr}px serif`;
//       ctx.fillText('experiments', width / 2, height / 2);
//     },
//   });

import * as THREE from 'three';

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */`
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uTex;
  uniform sampler2D uOverlay;
  uniform vec2  uTexSize;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform vec2  uMouseVel;
  uniform float uStrength;
  uniform float uRadius;
  uniform float uChroma;
  uniform float uTime;
  uniform float uImageless;

  vec2 coverUv(vec2 uv, vec2 res, vec2 tex) {
    float rRes = res.x / res.y;
    float rTex = tex.x / tex.y;
    vec2 scale = (rRes > rTex)
      ? vec2(1.0, rTex / rRes)
      : vec2(rRes / rTex, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  float aspectDist(vec2 a, vec2 b, vec2 res) {
    vec2 d = (a - b) * vec2(res.x / res.y, 1.0);
    return length(d);
  }

  void main() {
    vec2 uv = vUv;
    float d = aspectDist(uv, uMouse, uResolution);
    float falloff = exp(-uRadius * d);

    vec2 disp = uMouseVel * uStrength * falloff;
    vec2 pull = (uMouse - uv) * 0.15 * falloff;

    float ca = uChroma * falloff * (0.5 + length(uMouseVel) * 6.0);
    vec2 dir = normalize(uMouseVel + vec2(1e-6));
    vec2 caShift = dir * ca;

    // background image sample (skipped visually in imageless mode, but we
    // still sample the placeholder so the shader stays branch-free)
    vec2 sampleUv = coverUv(uv + disp + pull, uResolution, uTexSize);
    float r = texture2D(uTex, coverUv(uv + disp + pull + caShift, uResolution, uTexSize)).r;
    float g = texture2D(uTex, sampleUv).g;
    float b = texture2D(uTex, coverUv(uv + disp + pull - caShift, uResolution, uTexSize)).b;
    vec3 bg = vec3(r, g, b);

    // overlay (UI / text) shares the same displacement field
    vec2 ovUv = uv + disp + pull;
    float aL  = texture2D(uOverlay, ovUv + caShift).a;  // alpha at +CA shift
    float or_ = texture2D(uOverlay, ovUv + caShift).r;
    float og  = texture2D(uOverlay, ovUv          ).g;
    float ob  = texture2D(uOverlay, ovUv - caShift).b;
    float oa  = texture2D(uOverlay, ovUv          ).a;
    float aR  = texture2D(uOverlay, ovUv - caShift).a;  // alpha at -CA shift
    vec3 ov   = vec3(or_, og, ob);

    // Chromatic accents for the imageless overlay. Naive RGB-channel CA is
    // invisible on dark text (rgb ~ 0 everywhere — shifting it samples zero),
    // so the accents are driven from the *alpha-mask* deltas at the channel-
    // shifted positions. Where the smear pulls the alpha sideways, the
    // leading edge picks up a red tint and the trailing edge a cyan tint —
    // the classic NTSC/CRT chroma misalignment look (red / cyan are the
    // complementary chroma-subcarrier pair that bled apart on old sets).
    // The 0.45 multiplier keeps the fringes subtle: a hint of glitch rather
    // than a saturated rainbow.
    float fR = max(aL - oa, 0.0);  // band on the +shift side → red phosphor
    float fB = max(aR - oa, 0.0);  // band on the -shift side → cyan phosphor
    const float kFringeStrength = 0.45;
    vec3  fringePre = (vec3(1.00, 0.05, 0.10) * fR
                    +  vec3(0.00, 0.80, 0.95) * fB) * kFringeStrength;
    float fringeA   = clamp((fR + fB) * kFringeStrength, 0.0, 1.0);

    // composite text-over-fringe in premultiplied space, then convert back
    vec3  ovPre  = ov * oa + fringePre * (1.0 - oa);
    float ovA    = oa + fringeA * (1.0 - oa);
    vec3  ovOut  = (ovA > 0.0001) ? ovPre / ovA : vec3(0.0);

    // imageless: render only the overlay (with fringes) so the host page's
    // background shows through. otherwise composite overlay over bg.
    float mask = step(0.5, uImageless);
    vec3  outc = mix(mix(bg, ov, oa), ovOut, mask);
    float outA = mix(1.0,             ovA,   mask);
    gl_FragColor = vec4(outc, outA);
  }
`;

function roundRectPath(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y,     x + w, y + h, r);
  c.arcTo(x + w, y + h, x,     y + h, r);
  c.arcTo(x,     y + h, x,     y,     r);
  c.arcTo(x,     y,     x + w, y,     r);
  c.closePath();
}

// 1×1 transparent placeholder used until setImage() lands a real texture (or
// permanently in imageless mode). Lets the shader sample uTex unconditionally.
function makePlaceholderTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

export function createFluidHover(opts = {}) {
  const {
    container,
    image = null,
    imageless = false,
    buttons = [],
    customDraw = null,
    clearColor = 0x0b0b0c,
    strength = 0.18,
    radius   = 9.0,
    chroma   = 0.012,
    decay    = 0.94,
    buttonStyle = {
      width: 260, height: 80, gap: 28, fontSize: 22,
      fontWeight: 600, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fillPrimary:   'rgba(255,255,255,0.92)',
      fillSecondary: 'rgba(15,15,17,0.35)',
      stroke:        'rgba(255,255,255,0.85)',
      textPrimary:   '#0b0b0c',
      textSecondary: '#ffffff',
    },
  } = opts;

  if (!container) throw new Error('createFluidHover: `container` is required');

  // --- renderer + scene ------------------------------------------------------
  // alpha:true in imageless mode so the host page shows through where the
  // overlay is transparent (i.e. everywhere except the rasterised text).
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: imageless });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (imageless) renderer.setClearColor(0x000000, 0);
  else           renderer.setClearColor(clearColor, 1);
  container.appendChild(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // --- overlay canvas (UI) ---------------------------------------------------
  const overlay  = document.createElement('canvas');
  const octx     = overlay.getContext('2d');
  const overlayTex = new THREE.CanvasTexture(overlay);
  overlayTex.colorSpace       = THREE.SRGBColorSpace;
  overlayTex.minFilter        = THREE.LinearFilter;
  overlayTex.magFilter        = THREE.LinearFilter;
  overlayTex.generateMipmaps  = false;
  overlayTex.premultiplyAlpha = false;

  const placeholderTex = makePlaceholderTexture();

  // --- uniforms --------------------------------------------------------------
  const uniforms = {
    uTex:        { value: placeholderTex },
    uTexSize:    { value: new THREE.Vector2(1, 1) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
    uMouseVel:   { value: new THREE.Vector2(0, 0) },
    uStrength:   { value: strength },
    uRadius:     { value: radius },
    uChroma:     { value: chroma },
    uTime:       { value: 0 },
    uOverlay:    { value: overlayTex },
    uImageless:  { value: imageless ? 1 : 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: imageless,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const quad = new THREE.Mesh(geometry, material);
  scene.add(quad);

  // --- texture loader --------------------------------------------------------
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');

  function applyTexture(tex) {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    const old = uniforms.uTex.value;
    uniforms.uTex.value = tex;
    if (old && old !== placeholderTex) old.dispose();
    const img = tex.image;
    uniforms.uTexSize.value.set(
      img.width  || img.naturalWidth  || 1,
      img.height || img.naturalHeight || 1,
    );
  }

  function setImage(src) {
    if (!src) return;
    if (src instanceof HTMLImageElement || src instanceof HTMLCanvasElement) {
      applyTexture(new THREE.Texture(src));
      uniforms.uTex.value.needsUpdate = true;
      return;
    }
    loader.load(src, applyTexture, undefined, () => { /* offline-safe */ });
  }
  if (image) setImage(image);

  // --- buttons / custom overlay drawing -------------------------------------
  const items = buttons.map((b) => ({ ...b, rect: { x: 0, y: 0, w: 0, h: 0 } }));
  let hoverIdx = -1;

  function layoutButtons() {
    const dpr = renderer.getPixelRatio();
    const W = overlay.width, H = overlay.height;
    const bw  = buttonStyle.width  * dpr;
    const bh  = buttonStyle.height * dpr;
    const gap = buttonStyle.gap    * dpr;
    const cy = H / 2 - bh / 2;
    const cx = W / 2;

    const total = items.length * bw + Math.max(0, items.length - 1) * gap;
    let x = cx - total / 2;
    for (const it of items) {
      it.rect.x = x; it.rect.y = cy; it.rect.w = bw; it.rect.h = bh;
      x += bw + gap;
    }
  }

  function drawOverlay() {
    const dpr = renderer.getPixelRatio();
    octx.clearRect(0, 0, overlay.width, overlay.height);

    if (typeof customDraw === 'function') {
      // Hand the raw 2D context to the caller. Caller may draw anything; we
      // just flag the texture for re-upload afterwards.
      customDraw(octx, {
        width: overlay.width,
        height: overlay.height,
        dpr,
      });
      overlayTex.needsUpdate = true;
      return;
    }

    if (!items.length) {
      overlayTex.needsUpdate = true;
      return;
    }

    octx.font = `${buttonStyle.fontWeight} ${buttonStyle.fontSize * dpr}px ${buttonStyle.fontFamily}`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const r  = it.rect;
      const hovered = i === hoverIdx;
      const filled = !!it.primary !== hovered;
      octx.fillStyle   = filled ? buttonStyle.fillPrimary : buttonStyle.fillSecondary;
      octx.strokeStyle = buttonStyle.stroke;
      octx.lineWidth   = 1 * dpr;
      roundRectPath(octx, r.x, r.y, r.w, r.h, r.h / 2);
      octx.fill();
      octx.stroke();
      octx.fillStyle = filled ? buttonStyle.textPrimary : buttonStyle.textSecondary;
      octx.fillText(it.label, r.x + r.w / 2, r.y + r.h / 2 + 1 * dpr);
    }
    overlayTex.needsUpdate = true;
  }

  function hitTest(cssX, cssY) {
    const dpr = renderer.getPixelRatio();
    const x = cssX * dpr, y = cssY * dpr;
    for (let i = 0; i < items.length; i++) {
      const r = items[i].rect;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
    }
    return -1;
  }

  // --- input -----------------------------------------------------------------
  const target = new THREE.Vector2(0.5, 0.5);
  const prev   = new THREE.Vector2(0.5, 0.5);
  let decayValue = decay;

  function onPointerMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    // Guard against a zero-sized rect — happens when the host section is
    // display:none (e.g. cd-section navigation hides off-screen pages).
    // Skipping the update keeps target/velocity finite for when the section
    // becomes visible again.
    if (rect.width <= 0 || rect.height <= 0) return;
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    target.x = cx / rect.width;
    target.y = 1.0 - cy / rect.height;

    if (items.length === 0) return;
    const i = hitTest(cx, cy);
    if (i !== hoverIdx) {
      hoverIdx = i;
      drawOverlay();
      renderer.domElement.classList.toggle('hot', i >= 0);
    }
  }

  function onClick(e) {
    if (items.length === 0) return;
    const rect = renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const i = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (i >= 0 && typeof items[i].onClick === 'function') items[i].onClick();
  }

  window.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('click', onClick);

  // --- resize ----------------------------------------------------------------
  function resize() {
    const w = container.clientWidth  || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const dpr = renderer.getPixelRatio();
    renderer.setSize(w, h);
    uniforms.uResolution.value.set(w, h);
    overlay.width  = Math.max(1, Math.floor(w * dpr));
    overlay.height = Math.max(1, Math.floor(h * dpr));
    layoutButtons();
    drawOverlay();
  }
  window.addEventListener('resize', resize);
  resize();

  // --- loop ------------------------------------------------------------------
  const clock = new THREE.Clock();
  let rafId = 0;
  let running = true;

  function tick() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 1 / 30);

    const smoothing = 1 - Math.pow(0.001, dt);
    const sm = uniforms.uMouse.value;
    prev.copy(sm);
    sm.lerp(target, smoothing);

    const instVx = (sm.x - prev.x) / Math.max(dt, 1e-3);
    const instVy = (sm.y - prev.y) / Math.max(dt, 1e-3);
    const vel = uniforms.uMouseVel.value;
    vel.x = vel.x * decayValue + instVx * (1 - decayValue) * 0.06;
    vel.y = vel.y * decayValue + instVy * (1 - decayValue) * 0.06;

    uniforms.uTime.value += dt;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  // --- public API ------------------------------------------------------------
  const settableUniforms = { strength: 'uStrength', radius: 'uRadius', chroma: 'uChroma' };

  return {
    renderer,
    canvas: renderer.domElement,

    set(name, value) {
      if (name === 'decay') { decayValue = +value; return; }
      const key = settableUniforms[name];
      if (key) uniforms[key].value = +value;
    },

    setImage,

    redrawOverlay: drawOverlay,

    // Halt the render loop. The shader state is preserved, so a later
    // resume() picks up smoothly. Use when the canvas is fully covered by
    // another element so we're not painting frames the user can't see.
    pause() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
      rafId = 0;
    },

    resume() {
      if (running) return;
      running = true;
      // Drain the clock's accumulated delta so the next tick doesn't get a
      // huge dt that would yank the smoothing.
      clock.getDelta();
      rafId = requestAnimationFrame(tick);
    },

    destroy() {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('click', onClick);
      geometry.dispose();
      material.dispose();
      overlayTex.dispose();
      if (placeholderTex) placeholderTex.dispose();
      if (uniforms.uTex.value && uniforms.uTex.value !== placeholderTex) {
        uniforms.uTex.value.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
