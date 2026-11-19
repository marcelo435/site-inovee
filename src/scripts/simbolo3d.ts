// ─────────────────────────────────────────────────────────────
// Símbolo da Inovee em 3D (Three.js) — versão leve
// Uma esfera única com as faixas do logo pintadas numa textura gerada
// no navegador (prata, azul com "mapa-múndi" e linhas finas entre elas),
// relevo leve nas linhas, luz azul correndo pelas frestas e o anel azul
// aberto no topo. Sem pós-processamento: roda leve em qualquer aparelho.
// ─────────────────────────────────────────────────────────────
import * as THREE from 'three';

/** Larguras relativas das faixas, de cima para baixo (prata, azul, prata…), como no logo. */
/** Faixas (prata, azul, prata…), todas com a mesma altura visível, como no logo. */
// (as de baixo um pouco maiores para compensar a vista de cima e todas aparecerem iguais)
const LARGURAS = [1, 1.04, 1.08, 1.12, 1.17, 1.22, 1.28, 1.35, 1.43, 1.52, 1.6];

/**
 * Limites das faixas em fração do ângulo polar (0 = polo de cima, 1 = polo de baixo).
 * A esfera é fatiada por planos horizontais igualmente espaçados (como no logo),
 * então todas as faixas têm a mesma altura na tela.
 */
function limitesFaixas() {
  const total = LARGURAS.reduce((a, b) => a + b, 0);
  const lim = [0];
  let acc = 0;
  for (const l of LARGURAS) {
    acc += l / total;
    const y = 1 - 2 * acc; // altura de +1 (topo) a -1 (base)
    lim.push(Math.acos(Math.max(-1, Math.min(1, y))) / Math.PI);
  }
  return lim;
}

/**
 * Ruído suave periódico em x (para o mapa dar a volta no globo sem emenda).
 * Os valores da grade são calculados uma vez numa tabela (antes era um Map com
 * chaves em texto, ~10x mais lento — travava a página por mais de 1 s).
 */
function criarRuido(periodo: number, linhas: number, semente: number) {
  const tab = new Float64Array(periodo * linhas);
  for (let iy = 0; iy < linhas; iy++) {
    for (let ix = 0; ix < periodo; ix++) {
      const h = Math.sin(ix * 127.1 + iy * 311.7 + semente * 74.7) * 43758.5453;
      tab[iy * periodo + ix] = h - Math.floor(h);
    }
  }
  return (x: number, y: number) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const tx = x - ix;
    const ty = y - iy;
    const fx = tx * tx * (3 - 2 * tx);
    const fy = ty * ty * (3 - 2 * ty);
    const x0 = ((ix % periodo) + periodo) % periodo;
    const x1 = (x0 + 1) % periodo;
    const l0 = iy * periodo;
    const l1 = l0 + periodo;
    const a = tab[l0 + x0] + (tab[l0 + x1] - tab[l0 + x0]) * fx;
    const b = tab[l1 + x0] + (tab[l1 + x1] - tab[l1 + x0]) * fx;
    return a + (b - a) * fy;
  };
}

/**
 * Textura do globo azul (tons de cinza, usada pelo shader):
 * canal vermelho = continentes, canal verde = linhas de latitude/longitude.
 */
function criarMapaGlobo(celular: boolean) {
  const W = celular ? 512 : 1024;
  const H = W / 2;
  const tela = document.createElement("canvas");
  tela.width = W;
  tela.height = H;
  const c = tela.getContext("2d")!;
  const img = c.createImageData(W, H);
  const oitavas = [
    { f: 3, a: 0.55 },
    { f: 6, a: 0.25 },
    { f: 12, a: 0.13 },
    { f: 24, a: 0.07 },
  ].map((o, i) => ({ ...o, n: criarRuido(o.f * 2, o.f + 2, 11 + i) }));
  for (let y = 0; y < H; y++) {
    const lat = Math.abs(y / H - 0.5) * 2; // 0 no equador, 1 nos polos
    for (let x = 0; x < W; x++) {
      let n = 0;
      for (const o of oitavas) n += o.n((x / W) * o.f * 2, (y / H) * o.f) * o.a;
      n -= lat * lat * 0.25; // menos terra perto dos polos
      const terra = Math.min(1, Math.max(0, (n - 0.5) / 0.05)); // borda nítida, como um mapa
      const i = (y * W + x) * 4;
      img.data[i] = terra * 255;
      img.data[i + 1] = 0;
      img.data[i + 2] = 0;
      img.data[i + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
  // linhas de latitude/longitude (canal verde)
  c.globalCompositeOperation = "lighter";
  c.strokeStyle = "rgb(0, 120, 0)";
  c.lineWidth = Math.max(1, W / 1024);
  for (let k = 1; k < 12; k++) {
    const y = (k / 12) * H;
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(W, y);
    c.stroke();
  }
  for (let k = 0; k < 24; k++) {
    const x = (k / 24) * W;
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, H);
    c.stroke();
  }
  const tex = new THREE.CanvasTexture(tela);
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

/** Textura das lâminas prateadas: branco em cima, cinza-claro embaixo e filete cromado na borda de baixo. */
function criarTexturaLamina() {
  const tela = document.createElement("canvas");
  tela.width = 4;
  tela.height = 512;
  const c = tela.getContext("2d")!;
  const g = c.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#f3f5f8");
  g.addColorStop(0.35, "#ffffff");
  g.addColorStop(0.8, "#e1e5eb");
  g.addColorStop(0.865, "#cdd3dc");
  // filete cromado
  g.addColorStop(0.88, "#7c8594");
  g.addColorStop(0.915, "#ffffff");
  g.addColorStop(0.95, "#aab2be");
  g.addColorStop(0.985, "#6d7686");
  g.addColorStop(1, "#59616f");
  c.fillStyle = g;
  c.fillRect(0, 0, 4, 512);
  const tex = new THREE.CanvasTexture(tela);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** "Estúdio" virtual leve: reflexos brancos e azuis no material. */
function criarEstudio(renderer: THREE.WebGLRenderer) {
  const estudio = new THREE.Scene();
  estudio.add(new THREE.Mesh(new THREE.SphereGeometry(20, 16, 8), new THREE.MeshBasicMaterial({ color: 0x0b1020, side: THREE.BackSide })));
  const painel = (w: number, h: number, cor: [number, number, number], pos: [number, number, number]) => {
    const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    mat.color.setRGB(...cor);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    estudio.add(m);
  };
  painel(14, 4, [1.6, 1.7, 1.9], [-2, 9, 4]); // luz de cima
  painel(16, 8, [0.8, 0.85, 0.95], [0, 2, 12]); // rebatedor frontal
  painel(3, 12, [0.3, 0.6, 1.8], [-9, 0, 2]); // azul à esquerda
  painel(3, 10, [0.6, 0.9, 1.6], [9, 0, 0]); // azul-claro à direita
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(estudio, 0.04).texture;
  pmrem.dispose();
  return tex;
}

export function iniciarSimbolo(container: HTMLElement) {
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const celular = window.matchMedia('(max-width: 760px)').matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    container.classList.add('sem-3d'); // sem WebGL: mostra o logo como imagem
    return;
  }
  let qualidade = Math.min(window.devicePixelRatio, celular ? 1.25 : 1.5);
  renderer.setPixelRatio(qualidade);
  renderer.setClearColor(0x000000, 0); // fundo transparente: aparece o fundo da página
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  cena.environment = criarEstudio(renderer);
  cena.environmentIntensity = 0.7;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  // ── Hierarquia: posição/escala → mouse → inclinação → giro ──
  const base = new THREE.Group();
  const mouse = new THREE.Group();
  const inclinacao = new THREE.Group();
  const esfera = new THREE.Group();
  base.add(mouse);
  mouse.add(inclinacao);
  inclinacao.add(esfera);
  cena.add(base);
  const ESCALA_ESFERA = 1.33; // esfera maior em relação ao anel
  inclinacao.scale.setScalar(ESCALA_ESFERA);
  mouse.scale.z = 0.5; // achata a profundidade: visual mais plano, como o desenho do logo
  inclinacao.rotation.set(0.24, 0, 0); // reto, vista um pouco de cima (faixas curvam como no logo)
  // textura parada (não gira)

  // ── Globo azul por dentro (com mapa-múndi), como no logo ───
  const R = 1.5;
  const seg = celular ? 72 : 112;
  const lim = limitesFaixas();
  const globoMat = new THREE.ShaderMaterial({
    uniforms: { uMapa: { value: criarMapaGlobo(celular) } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMapa;
      varying vec2 vUv;
      varying vec3 vNormal;
      vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }
      void main() {
        vec3 n = normalize(vNormal);
        float frente = clamp(n.z, 0.0, 1.0);
        // azul profundo nas bordas, azul-claro no centro (como no logo)
        vec3 cor = mix(lin(vec3(0.03, 0.17, 0.66)), lin(vec3(0.07, 0.36, 0.90)), pow(frente, 0.7));
        // brilho azul-claro um pouco acima e à direita do centro
        float brilho = pow(max(dot(n, normalize(vec3(0.25, 0.2, 1.0))), 0.0), 10.0);
        cor += lin(vec3(0.40, 0.75, 1.0)) * brilho * 0.35;
        vec4 m = texture2D(uMapa, vUv);
        cor += lin(vec3(0.30, 0.58, 0.95)) * m.r * (0.55 + 0.45 * frente); // continentes em azul-claro
        cor += lin(vec3(0.3, 0.6, 1.0)) * m.g * 0.2; // linhas do globo
        gl_FragColor = vec4(cor, 1.0);
        #include <colorspace_fragment>
      }
    `,
    toneMapped: false,
  });
  const globo = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, seg, seg / 2), globoMat);
  globo.rotation.y = -0.9; // trecho do "mapa" que fica de frente
  esfera.add(globo);

  // ── Lâminas prateadas por fora ─────────────────────────────
  const laminaMat = new THREE.MeshStandardMaterial({
    map: criarTexturaLamina(),
    metalness: 0.1,
    roughness: 0.35,
    envMapIntensity: 0.7,
  });
  laminaMat.emissiveMap = laminaMat.map;
  laminaMat.emissive = new THREE.Color(0xffffff);
  laminaMat.emissiveIntensity = 0.42; // menos sombra nas bordas = menos "bola"
  const separadores: number[] = []; // borda de baixo de cada lâmina (onde corre a luz)
  for (let i = 0; i < LARGURAS.length; i += 2) {
    const t1 = lim[i] * Math.PI;
    const t2 = lim[i + 1] * Math.PI;
    esfera.add(new THREE.Mesh(new THREE.SphereGeometry(R, seg, Math.max(8, Math.round((t2 - t1) * 30)), 0, Math.PI * 2, t1, t2 - t1), laminaMat));
    if (i + 1 < LARGURAS.length - 1) separadores.push(lim[i + 1]);
  }

  // ── Luz azul correndo pelos filetes das lâminas ────────────
  const vertexUv = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const luzMat = new THREE.ShaderMaterial({
    uniforms: {
      uTempo: { value: 0 },
      uSep: { value: separadores.map((f) => 1 - f) }, // em coordenada uv.y
    },
    vertexShader: vertexUv,
    fragmentShader: /* glsl */ `
      uniform float uTempo;
      uniform float uSep[${separadores.length}];
      varying vec2 vUv;
      void main() {
        float total = 0.0;
        for (int i = 0; i < ${separadores.length}; i++) {
          float fi = float(i);
          float linha = smoothstep(0.004, 0.0, abs(vUv.y - uSep[i]));
          float sentido = mod(fi, 2.0) < 1.0 ? 1.0 : -1.0;
          float h = fract(uTempo * (0.22 + 0.03 * fi) * sentido + fi * 0.37);
          float d = fract((h - vUv.x) * sentido);
          float rastro = pow(smoothstep(0.28, 0.0, d), 2.2);
          total += linha * (0.06 + rastro * 2.0);
        }
        vec3 cor = mix(vec3(0.25, 0.6, 1.0), vec3(0.75, 0.9, 1.0), clamp(total - 1.0, 0.0, 1.0));
        gl_FragColor = vec4(cor, clamp(total, 0.0, 1.0)); // sem luz = transparente
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  esfera.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.003, seg, seg / 2), luzMat));

  // ── Anel azul do logo: quase fechado, aberto no topo, grosso embaixo ──
  const arco = Math.PI * 1.8;
  const raioExterno = R * 1.66;
  const meiaLargura = 0.16;
  // anel deslocado para cima: embaixo fica colado na esfera e vai se abrindo para o topo (como no logo)
  const deslocAnel = raioExterno - 2 * meiaLargura - R * ESCALA_ESFERA * 1.04;
  const raioCentro = raioExterno - meiaLargura;
  const anelGeo = new THREE.TorusGeometry(raioCentro, meiaLargura, 16, celular ? 140 : 200, arco);
  const pos = anelGeo.attributes.position;
  const cores = new Float32Array(pos.count * 3);
  const claro = new THREE.Color(0x3a9bff);
  const escuro = new THREE.Color(0x0b47d6);
  const tmp = new THREE.Color();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let a = Math.atan2(v.y, v.x);
    if (a < -0.01) a += Math.PI * 2;
    const t = THREE.MathUtils.clamp(a / arco, 0, 1);
    const f = Math.pow(Math.sin(Math.PI * t), 0.75) * 0.96 + 0.04;
    const cx = Math.cos(a) * raioCentro;
    const cy = Math.sin(a) * raioCentro;
    const novoCentro = raioExterno - meiaLargura * f; // borda externa circular
    pos.setXYZ(i, Math.cos(a) * novoCentro + (v.x - cx) * f, Math.sin(a) * novoCentro + (v.y - cy) * f, v.z * f * 0.5);
    // degradê: azul-claro nas pontas, mais profundo embaixo (como no logo)
    tmp.copy(claro).lerp(escuro, Math.pow(f, 1.5));
    cores.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  anelGeo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  anelGeo.computeVertexNormals();
  const anel = new THREE.Mesh(anelGeo, new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.2, roughness: 0.35 }));

  const brilhoAnelMat = new THREE.ShaderMaterial({
    uniforms: { uTempo: { value: 0 } },
    vertexShader: vertexUv,
    fragmentShader: /* glsl */ `
      uniform float uTempo;
      varying vec2 vUv;
      void main() {
        float h = fract(uTempo * 0.28);
        float d = fract(h - vUv.x);
        float a = 0.08 + pow(smoothstep(0.3, 0.0, d), 2.0) * 1.6;
        // some nas pontas, onde o anel afina
        a *= smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
        gl_FragColor = vec4(vec3(0.6, 0.85, 1.0), clamp(a, 0.0, 1.0));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  // a luz corre sobre a face da frente do anel, acompanhando o afinamento até as pontas
  const caminhoLuz = new THREE.Curve<THREE.Vector3>();
  caminhoLuz.getPoint = (t: number, alvoV = new THREE.Vector3()) => {
    const a = t * arco;
    const f = Math.pow(Math.sin(Math.PI * t), 0.75) * 0.96 + 0.04;
    const r = raioExterno - meiaLargura * f;
    return alvoV.set(Math.cos(a) * r, Math.sin(a) * r, meiaLargura * f * 0.5 + 0.004);
  };
  const brilhoAnel = new THREE.Mesh(new THREE.TubeGeometry(caminhoLuz, 200, 0.011, 6, false), brilhoAnelMat);

  const grupoAnel = new THREE.Group();
  grupoAnel.add(anel, brilhoAnel);
  grupoAnel.rotation.z = Math.PI / 2 + (Math.PI * 2 - arco) / 2; // abertura centralizada no topo
  grupoAnel.position.y = deslocAnel;
  mouse.add(grupoAnel);

  // ── Luzes ──────────────────────────────────────────────────
  const chave = new THREE.DirectionalLight(0xffffff, 1.5); // brilho no alto à esquerda, como no logo
  chave.position.set(-4, 5, 6);
  const contra = new THREE.DirectionalLight(0x5aa0ff, 0.8);
  contra.position.set(4, -2, -4);
  cena.add(chave, contra, new THREE.HemisphereLight(0xffffff, 0x9fb3d9, 0.6));

  // ── Layout responsivo ──────────────────────────────────────
  let baseY = 0;
  const ajustar = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const meiaAltura = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const meiaLarguraTela = meiaAltura * camera.aspect;
    if (camera.aspect < 0.85) {
      const escala = Math.min(1.15, (meiaLarguraTela * 0.9) / 2.55, (meiaAltura * 0.85) / 2.7);
      base.scale.setScalar(escala);
      baseY = meiaAltura * 0.02;
      base.position.set(0, baseY, 0);
    } else {
      // centraliza no espaço livre à direita do texto, alinhado ao meio do bloco de texto
      const texto = container.parentElement?.querySelector('.hero-inner > div');
      const caixa = container.getBoundingClientRect();
      const r = texto?.getBoundingClientRect();
      // mesma largura útil do site (.wrap: até 1280 px, com margem lateral)
      const margem = Math.max(20, Math.min(56, w * 0.04));
      const livreFim = (w + Math.min(w - 2 * margem, 1280)) / 2;
      const livreIni = r ? r.right - caixa.left + 32 : w * 0.55;
      const cx = (livreIni + livreFim) / 2;
      const cy = r ? r.top - caixa.top + r.height / 2 : h / 2;
      const pxPorUnidade = w / (2 * meiaLarguraTela);
      const larguraSimbolo = 2 * raioExterno * 1.04; // em unidades do mundo, com folga
      const escala = Math.min(0.82, meiaAltura / 3.55, (livreFim - livreIni) / pxPorUnidade / larguraSimbolo);
      base.scale.setScalar(escala);
      // o anel é deslocado para cima; compensa para o centro visual cair no ponto certo
      baseY = -(cy / h - 0.5) * 2 * meiaAltura - deslocAnel * escala;
      base.position.set((cx / w - 0.5) * 2 * meiaLarguraTela, baseY, 0);
    }
  };
  ajustar();
  // Mudar o tamanho do canvas apaga o desenho; no modo "reduzir animações" não há
  // animação redesenhando, então redesenha o quadro parado (quadro é definido abaixo,
  // e estes callbacks só rodam depois que a função termina).
  const reajustar = () => {
    ajustar();
    if (reduzir) quadro(3.1);
  };
  new ResizeObserver(reajustar).observe(container);
  document.fonts?.ready.then(reajustar);

  // ── Interação com o mouse ──────────────────────────────────
  const alvo = { x: 0, y: 0 };
  if (!reduzir) {
    window.addEventListener(
      'pointermove',
      (e) => {
        alvo.x = (e.clientX / window.innerWidth - 0.5) * 2;
        alvo.y = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true },
    );
  }

  // ── Animação ───────────────────────────────────────────────
  const quadro = (t: number) => {
    luzMat.uniforms.uTempo.value = t;
    brilhoAnelMat.uniforms.uTempo.value = t;
    inclinacao.rotation.x = 0.24 + Math.sin(t * 0.35) * 0.02;
    base.position.y = baseY + Math.sin(t * 0.8) * 0.04;
    mouse.rotation.y += (alvo.x * 0.25 - mouse.rotation.y) * 0.05;
    mouse.rotation.x += (alvo.y * 0.15 - mouse.rotation.x) * 0.05;
    renderer.render(cena, camera);
  };

  const inicio = performance.now();
  let visivel = true;
  let rodando = false;
  // qualidade adaptativa: se o aparelho estiver lento, reduz a resolução
  let ultimo = performance.now();
  let somaDt = 0;
  let quadros = 0;

  const loop = () => {
    if (!visivel || document.hidden) {
      rodando = false;
      return;
    }
    const agora = performance.now();
    if (quadros < 120) {
      somaDt += agora - ultimo;
      quadros++;
      if (quadros === 120 && somaDt / 120 > 22 && qualidade > 1) {
        qualidade = 1;
        renderer.setPixelRatio(qualidade);
        ajustar();
      }
    }
    ultimo = agora;
    quadro((agora - inicio) / 1000);
    requestAnimationFrame(loop);
  };

  const iniciar = () => {
    if (rodando || reduzir) return;
    rodando = true;
    ultimo = performance.now();
    requestAnimationFrame(loop);
  };

  window.addEventListener('inovee:tema', () => reduzir && quadro(3.1));

  if (reduzir) {
    quadro(3.1); // um quadro estático
  } else {
    new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel) iniciar();
    }).observe(container);
    document.addEventListener('visibilitychange', () => !document.hidden && iniciar());
    iniciar();
  }

  container.classList.add('pronto');
}
