# Boi de Fuga — Sobradinho (Produção 3D Real com Three.js)

Um jogo de perseguição e vaquejada em 3D real acelerado por WebGL (Three.js), com câmera em terceira pessoa que segue o vaqueiro e o cavalo Quarto de Milha em alta velocidade atrás de um boi Nelore barrento em fuga. O boi corre de costas para a câmera (correndo para a frente na direção da pista da Barragem de Sobradinho, exibindo dorso musculoso, cupim e chifres voltados para a frente), sobre uma estrada 3D contínua que margeia o Lago de Sobradinho à esquerda e o vertedouro da CHESF à direita.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões Confirmadas com o Usuário:**
> - **Tecnologia de Renderização:** 3D Real nativo com **Three.js** e WebGL, abandonando planos 2D estáticos colidindo com fotos e implementando geometria 3D, materiais PBR com iluminação solar da Caatinga e sombras projetadas.
> - **Ângulo de Câmera & Orientação dos Personagens:** Câmera de perseguição em terceira pessoa posicionada atrás do cavalo. O boi corre **para a frente** (afastando-se pela pista), com o jogador enxergando a garupa, o cupim, os chifres e a cauda em fuga, e não a face ou o focinho virados para trás.
> - **Ordem Estratégica de Produção de Agência:** Construção em etapas rigorosas começando pela **modelagem e animação 3D anatômica dos personagens** (Boi Nelore e Cavalo com Vaqueiro), seguida da montagem da pista 3D e do cenário geográfico de Sobradinho (Crista da Barragem, Morro do Cruzeiro e Rio São Francisco).

---

## 1. Overview & Core Concept

- **O que faz:** O jogador pilota em terceira pessoa um vaqueiro a cavalo em uma perseguição realista em 3D ao longo da crista da Barragem de Sobradinho. O objetivo é alcançar o boi Nelore que corre em disparada pela rodovia, desviar de obstáculos na pista (cavaletes de manutenção da CHESF e pedras) e lançar o laço nos chifres do boi no momento exato para a puxada final.
- **Público & Experiência:** Jogo de ação mobile fluido a 60 FPS, com física de galope, joystick analógico virtual responsivo, controles de espora e laço, e sonoplastia com locução de vaquejada.
- **Correção da Lógica Visual Anterior:** Elimina a sobreposição distorcida de malha sobre fotos aéreas da usina. No lugar disso, constrói uma cena 3D coesa onde a estrada de asfalto tem guard-rails reais, o paredão da barragem desce fisicamente em direção ao rio e o lago artificial se estende até o horizonte com reflexos solares.

---

## 2. User Experience & Visual Design

### Fluxo de Produção e Experiência do Usuário
1. **Modelagem 3D do Boi Nelore (Orientação Correta):**
   - Geometria tridimensional completa estruturada em grupos hierárquicos (`THREE.Group`): dorso, garupa musculosa, cupim zebuíno proeminente, pescoço rebaixado para corrida, chifres pontiagudos curvados para a frente, cauda com pêlos e 4 membros articulados (coxas, canelas e cascos).
   - Animação procedural de galope em 4 tempos com flexão das patas, oscilação de peso do cupim e balanço da cauda.
2. **Modelagem 3D do Cavalo Quarto de Milha & Vaqueiro:**
   - Cavalo alazão com musculatura modelada, sela de couro com fueiro e estribos de metal, patas com ferraduras metálicas.
   - Vaqueiro em postura de perseguição no dorso do animal, vestindo gibão de couro, perneiras e chapéu sertanejo meia-lua.
   - Braço direito animado girando o laço em perspectiva tridimensional sobre a cabeça quando em proximidade do alvo.
3. **Cenário 3D da Barragem de Sobradinho:**
   - **Pista 3D:** Rodovia de asfalto de 2 pistas sobre a muralha de concreto, com marcações de faixa amarela e guard-rails de segurança em ambos os lados.
   - **Margem Esquerda (Montante):** O gigantesco Lago de Sobradinho em malha de água com ondas e reflexo do céu.
   - **Margem Direita (Jusante):** O desnível de 41 metros do vertedouro de concreto, com pilares, as comportas e a espuma branca das águas do Rio São Francisco descarregadas.
   - **Pórtico Rolante Amarelo:** O guindaste monumental da CHESF modelado em vigas de aço amarelas sobre trilhos na crista da barragem.
   - **Fundo / Horizonte:** Silhueta 3D do Morro do Cruzeiro com sua torre de transmissão e céu ensolarado da Bahia.
4. **Câmera de Perseguição Suave (Chase Cam):**
   - A câmera segue a uma distância calculada atrás do cavalo com amortecimento elástico (`MathUtils.damp`), tilt suave nas curvas e aproximação cinematográfica no momento do laço.

---

## 3. Key Product Decisions & Trade-Offs

- **Three.js Nativo com Modelos Procedurais Ricos (Zero 404s):**
  - *Abordagem:* Construção dos personagens e do cenário através de geometrias procedurais compostas (`ExtrudeGeometry`, `CylinderGeometry`, `BufferGeometry`, materiais PBR `MeshStandardMaterial`), sem dependência de downloads de arquivos `.gltf` pesados ou externos quebrados.
  - *Por que:* Garante carregamento instantâneo no celular, sem telas de espera longas, além de permitir manipulação física e óssea direta das articulações em tempo real.
- **Física e Coordenadas em Eixo Z Real:**
  - *Abordagem:* O cavalo e o boi possuem coordenadas 3D reais no mundo (`position.z`, `position.x`, `position.y`).
  - *Por que:* A sensação de distância (metros reais diminuindo à medida que o cavalo se aproxima do boi) é geometricamente precisa e a mira do laço se torna 100% natural.
- **Layout dos Controles Tácteis:**
  - *Abordagem:* Joystick virtual flutuante no terço esquerdo inferior da tela e botões arcade de ação direta (`ESPORA ⚡` e `LAÇAR 🎯`) no canto direito inferior, sem cobrir a visão da pista.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    THREE.JS 3D VIEWPORT                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ TOP HUD: Distância Real · Velocidade · Laços Restantes │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ THREE.Scene & WebGLRenderer                            │  │
│  │                                                        │  │
│  │  [Câmera Chase 3D (Z-Forward Perspective)]             │  │
│  │  ├── NeloreBullModel3D (Face p/ frente, garupa visível)│  │
│  │  ├── HorseRiderModel3D (Vaqueiro + Quarto de Milha)    │  │
│  │  ├── DamRoadMesh3D (Pista de asfalto + guard-rails)    │  │
│  │  ├── SobradinhoLakeWater3D (Lago à esquerda)           │  │
│  │  ├── SpillwayConcreteWall3D (Vertedouro à direita)     │  │
│  │  ├── YellowGantryCrane3D (Pórtico CHESF monumental)    │  │
│  │  └── CruizeroMountainMesh3D (Morro no horizonte)       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────┬───────────────────────────┐  │
│  │ JOYSTICK VIRTUAL FLUTUANTE │ BOTÕES DE AÇÃO ARCADE     │  │
│  │ (Direção Analógica X)      │ [ESPORA ⚡]  [LAÇAR 🎯]    │  │
│  └────────────────────────────┴───────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │ Web Audio API Engine │        │ Server Express Proxy │
    │ (Cascos, Corda, Boi) │        │ (gemini-3.8-flash-tts)│
    └──────────────────────┘        └──────────────────────┘
```

### Pacotes a Instalar na Execução
- `three` e `@types/three` via comando único de instalação de dependências.

### Plano de Implementação por Etapas
1. **Passo 1 — Instalação e Configuração Three.js:** Instalar `three` e `@types/three`, configurar renderizador WebGL com tratamento de sombras e proporção de tela mobile.
2. **Passo 2 — Modelagem 3D do Boi Nelore:** Construir o modelo tridimensional composto do boi orientado para a frente (Z negativo), com hierarquia de patas dianteiras/traseiras, cupim, cauda e chifres, integrando o ciclo de galope.
3. **Passo 3 — Modelagem 3D do Cavalo & Vaqueiro:** Construir o cavalo Quarto de Milha com animação de galope e o vaqueiro sertanejo com rédeas e laço dinâmico.
4. **Passo 4 — Construção do Cenário 3D de Sobradinho:** Modelar a pista de asfalto da barragem com o lago do São Francisco na margem esquerda, a queda do vertedouro na margem direita, o pórtico amarelo da CHESF e o Morro do Cruzeiro.
5. **Passo 5 — Lógica de Gameplay & Controles:** Integrar a perseguição 3D com aceleração, desvio de obstáculos, travamento da mira do laço e transição para o minigame de puxada.
