/**
 * 3D Procedural Models for Boi de Fuga — Sobradinho (Three.js)
 * High-fidelity, composite procedural 3D models with anatomically correct forward orientation.
 * - Nelore Bull: Oriented forward (-Z), running away from camera, showing muscular haunches, cupim, and horns.
 * - Vaqueiro on Horse: Quarto de Milha with rider in traditional leather armor, animated gallop, and spinning lasso.
 * - Sobradinho Dam: Concrete spillway wall, 2-lane road crest, lake on left, foaming river on right, yellow gantry crane.
 */

import * as THREE from 'three';

/*
[LAYOUT ARCHETYPE]: Mobile Arcade 2.5D Fullscreen Console
[RADIUS & BORDERS]: rounded-none to rounded (max 4px), high-contrast borders
[ACCENT LOGIC]: Bahia Golden Ochre (#F59E0B) & Rio São Francisco Deep Aqua (#0284C7)
*/

// Reusable Materials Palette (Physical & Standard PBR)
export function createGameMaterials() {
  // Pelagem barrenta do Nelore
  const bullCoat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.65,
    metalness: 0.1,
  });

  const bullCupim = new THREE.MeshStandardMaterial({
    color: 0xc26112,
    roughness: 0.6,
    metalness: 0.05,
  });

  const hornMat = new THREE.MeshStandardMaterial({
    color: 0xf5eedc,
    roughness: 0.4,
    metalness: 0.15,
  });

  const hoofMat = new THREE.MeshStandardMaterial({
    color: 0x1f1712,
    roughness: 0.5,
    metalness: 0.3,
  });

  // Cavalo Alazão e Vaqueiro
  const horseCoat = new THREE.MeshStandardMaterial({
    color: 0x5a2307,
    roughness: 0.55,
    metalness: 0.15,
  });

  const leatherArmor = new THREE.MeshStandardMaterial({
    color: 0xa45a19,
    roughness: 0.7,
    metalness: 0.1,
  });

  const leatherHat = new THREE.MeshStandardMaterial({
    color: 0x854312,
    roughness: 0.75,
    metalness: 0.05,
  });

  const horseshoeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.3,
    metalness: 0.85,
  });

  const ropeMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.5,
    metalness: 0.2,
  });

  // Barragem e Infraestrutura
  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.9,
    metalness: 0.05,
  });

  const roadLineMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
  });

  const roadWhiteLineMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.85,
    metalness: 0.1,
  });

  const yellowCraneMat = new THREE.MeshStandardMaterial({
    color: 0xeab308, // Amarelo industrial CHESF
    roughness: 0.4,
    metalness: 0.6,
  });

  const waterLakeMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.4,
  });

  const foamWaterMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.1,
  });

  return {
    bullCoat,
    bullCupim,
    hornMat,
    hoofMat,
    horseCoat,
    leatherArmor,
    leatherHat,
    horseshoeMat,
    ropeMat,
    asphaltMat,
    roadLineMat,
    roadWhiteLineMat,
    concreteMat,
    yellowCraneMat,
    waterLakeMat,
    foamWaterMat,
  };
}

export type GameMaterials = ReturnType<typeof createGameMaterials>;

// 1. MODELO 3D DO BOI NELORE BARRENTO (Orientado para a frente em -Z)
export interface BullModelRef {
  group: THREE.Group;
  legFL: THREE.Group;
  legFR: THREE.Group;
  legBL: THREE.Group;
  legBR: THREE.Group;
  cupim: THREE.Mesh;
  tail: THREE.Group;
  head: THREE.Group;
}

export function createBullModel3D(mats: GameMaterials): BullModelRef {
  const group = new THREE.Group();
  group.name = 'BullModel';

  // 1. Tronco Musculoso do Nelore (Alongado em Z)
  const bodyGeo = new THREE.CylinderGeometry(0.85, 0.95, 2.8, 16);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, mats.bullCoat);
  body.position.set(0, 1.8, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Garupa traseira abaulada
  const rumpGeo = new THREE.SphereGeometry(0.92, 16, 16);
  const rump = new THREE.Mesh(rumpGeo, mats.bullCoat);
  rump.position.set(0, 1.8, 1.2);
  rump.castShadow = true;
  group.add(rump);

  // Peito dianteiro
  const chestGeo = new THREE.SphereGeometry(0.9, 16, 16);
  const chest = new THREE.Mesh(chestGeo, mats.bullCoat);
  chest.position.set(0, 1.8, -1.2);
  chest.castShadow = true;
  group.add(chest);

  // 2. Cupim Gigante de Zebu / Nelore (Na parte dianteira superior do dorso)
  const cupimGeo = new THREE.SphereGeometry(0.68, 16, 16);
  cupimGeo.scale(0.85, 1.25, 0.95);
  const cupim = new THREE.Mesh(cupimGeo, mats.bullCupim);
  cupim.position.set(0, 2.7, -0.7);
  cupim.castShadow = true;
  group.add(cupim);

  // 3. Cabeça e Chifres (Inclinada para a frente em -Z)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.0, -1.8);

  const headGeo = new THREE.ConeGeometry(0.45, 1.3, 12);
  headGeo.rotateX(-Math.PI / 2);
  const headMesh = new THREE.Mesh(headGeo, mats.bullCoat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Focinho
  const snoutGeo = new THREE.BoxGeometry(0.48, 0.35, 0.4);
  const snout = new THREE.Mesh(snoutGeo, mats.bullCupim);
  snout.position.set(0, -0.2, -0.65);
  headGroup.add(snout);

  // Orelhas de Zebu caídas lateralmente
  const earGeo = new THREE.ConeGeometry(0.14, 0.6, 8);
  earGeo.rotateZ(Math.PI / 3);
  const earL = new THREE.Mesh(earGeo, mats.bullCoat);
  earL.position.set(-0.48, 0.1, 0.1);
  headGroup.add(earL);

  const earR = earL.clone();
  earR.rotation.z = -Math.PI / 1.5;
  earR.position.set(0.48, 0.1, 0.1);
  headGroup.add(earR);

  // Chifres em Arco Grandiosos (Apontando para cima e para a frente)
  const hornCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, 0.25, 0.1),
    new THREE.Vector3(-0.85, 0.75, -0.1),
    new THREE.Vector3(-1.15, 1.35, -0.3),
    new THREE.Vector3(-0.85, 1.75, -0.45),
  ]);
  const hornGeoL = new THREE.TubeGeometry(hornCurveL, 16, 0.12, 8, false);
  const hornL = new THREE.Mesh(hornGeoL, mats.hornMat);
  hornL.castShadow = true;
  headGroup.add(hornL);

  const hornCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.35, 0.25, 0.1),
    new THREE.Vector3(0.85, 0.75, -0.1),
    new THREE.Vector3(1.15, 1.35, -0.3),
    new THREE.Vector3(0.85, 1.75, -0.45),
  ]);
  const hornGeoR = new THREE.TubeGeometry(hornCurveR, 16, 0.12, 8, false);
  const hornR = new THREE.Mesh(hornGeoR, mats.hornMat);
  hornR.castShadow = true;
  headGroup.add(hornR);

  group.add(headGroup);

  // 4. Rabo com Vassoura (Na traseira em +Z)
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 2.1, 1.8);

  const tailStemGeo = new THREE.CylinderGeometry(0.06, 0.04, 1.2, 8);
  tailStemGeo.translate(0, -0.6, 0);
  const tailStem = new THREE.Mesh(tailStemGeo, mats.bullCoat);
  tailGroup.add(tailStem);

  const tuftGeo = new THREE.ConeGeometry(0.16, 0.45, 8);
  tuftGeo.rotateX(Math.PI);
  const tuft = new THREE.Mesh(tuftGeo, mats.hoofMat);
  tuft.position.set(0, -1.3, 0);
  tailGroup.add(tuft);
  group.add(tailGroup);

  // 5. Quatro Patas Articuladas para Animação de Galope
  function makeLeg(x: number, z: number) {
    const legRoot = new THREE.Group();
    legRoot.position.set(x, 1.6, z);

    // Coxa / Ombro
    const upperGeo = new THREE.CylinderGeometry(0.28, 0.2, 0.9, 10);
    upperGeo.translate(0, -0.45, 0);
    const upper = new THREE.Mesh(upperGeo, mats.bullCoat);
    upper.castShadow = true;
    legRoot.add(upper);

    // Canela
    const lowerGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.85, 8);
    lowerGeo.translate(0, -1.15, 0);
    const lower = new THREE.Mesh(lowerGeo, mats.bullCoat);
    lower.castShadow = true;
    legRoot.add(lower);

    // Casco bipartido
    const hoofGeo = new THREE.BoxGeometry(0.26, 0.2, 0.32);
    const hoof = new THREE.Mesh(hoofGeo, mats.hoofMat);
    hoof.position.set(0, -1.6, -0.05);
    hoof.castShadow = true;
    legRoot.add(hoof);

    group.add(legRoot);
    return legRoot;
  }

  const legFL = makeLeg(-0.55, -0.9);
  const legFR = makeLeg(0.55, -0.9);
  const legBL = makeLeg(-0.58, 1.1);
  const legBR = makeLeg(0.58, 1.1);

  return {
    group,
    legFL,
    legFR,
    legBL,
    legBR,
    cupim,
    tail: tailGroup,
    head: headGroup,
  };
}

// 2. MODELO 3D DO CAVALO QUARTO DE MILHA COM VAQUEIRO SERTANEJO
export interface HorseRiderModelRef {
  group: THREE.Group;
  legFL: THREE.Group;
  legFR: THREE.Group;
  legBL: THREE.Group;
  legBR: THREE.Group;
  tail: THREE.Group;
  lassoMesh: THREE.Mesh;
}

export function createHorseRiderModel3D(mats: GameMaterials): HorseRiderModelRef {
  const group = new THREE.Group();
  group.name = 'HorseRiderModel';

  // --- O CAVALO QUARTO DE MILHA ---
  // 1. Corpo Musculoso Alazão (Alongado em Z)
  const horseBodyGeo = new THREE.CylinderGeometry(0.8, 0.9, 2.7, 16);
  horseBodyGeo.rotateX(Math.PI / 2);
  const horseBody = new THREE.Mesh(horseBodyGeo, mats.horseCoat);
  horseBody.position.set(0, 1.9, 0);
  horseBody.castShadow = true;
  group.add(horseBody);

  // Garupa arredondada forte
  const rumpGeo = new THREE.SphereGeometry(0.88, 16, 16);
  const rump = new THREE.Mesh(rumpGeo, mats.horseCoat);
  rump.position.set(0, 1.9, 1.1);
  rump.castShadow = true;
  group.add(rump);

  // Peito
  const chestGeo = new THREE.SphereGeometry(0.85, 16, 16);
  const chest = new THREE.Mesh(chestGeo, mats.horseCoat);
  chest.position.set(0, 1.95, -1.1);
  chest.castShadow = true;
  group.add(chest);

  // Pescoço e Cabeça do Cavalo
  const neckGeo = new THREE.CylinderGeometry(0.42, 0.65, 1.5, 12);
  neckGeo.rotateX(-Math.PI / 3.8);
  neckGeo.translate(0, 0.7, -0.4);
  const neck = new THREE.Mesh(neckGeo, mats.horseCoat);
  neck.position.set(0, 2.0, -1.2);
  neck.castShadow = true;
  group.add(neck);

  const horseHeadGeo = new THREE.BoxGeometry(0.46, 0.55, 0.9);
  horseHeadGeo.rotateX(-Math.PI / 6);
  const horseHead = new THREE.Mesh(horseHeadGeo, mats.horseCoat);
  horseHead.position.set(0, 3.1, -1.9);
  horseHead.castShadow = true;
  group.add(horseHead);

  // Orelhas do Cavalo
  const horseEarGeo = new THREE.ConeGeometry(0.1, 0.35, 6);
  const earL = new THREE.Mesh(horseEarGeo, mats.horseCoat);
  earL.position.set(-0.2, 3.45, -1.75);
  group.add(earL);
  const earR = earL.clone();
  earR.position.set(0.2, 3.45, -1.75);
  group.add(earR);

  // Rabo do Cavalo
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 2.2, 1.7);
  const horseTailGeo = new THREE.ConeGeometry(0.24, 1.4, 8);
  horseTailGeo.rotateX(Math.PI);
  const horseTail = new THREE.Mesh(horseTailGeo, mats.hoofMat);
  horseTail.position.set(0, -0.6, 0.15);
  tailGroup.add(horseTail);
  group.add(tailGroup);

  // Sela e Arreios
  const saddleGeo = new THREE.BoxGeometry(1.0, 0.3, 1.2);
  const saddle = new THREE.Mesh(saddleGeo, mats.leatherArmor);
  saddle.position.set(0, 2.65, 0.1);
  saddle.castShadow = true;
  group.add(saddle);

  // Estribos de Aço
  const stirrupGeo = new THREE.TorusGeometry(0.14, 0.03, 6, 12);
  const stirrupL = new THREE.Mesh(stirrupGeo, mats.horseshoeMat);
  stirrupL.position.set(-0.65, 1.5, 0.1);
  group.add(stirrupL);
  const stirrupR = stirrupL.clone();
  stirrupR.position.set(0.65, 1.5, 0.1);
  group.add(stirrupR);

  // Patas do Cavalo (Articuladas)
  function makeHorseLeg(x: number, z: number) {
    const legRoot = new THREE.Group();
    legRoot.position.set(x, 1.7, z);

    const upperGeo = new THREE.CylinderGeometry(0.24, 0.18, 1.0, 8);
    upperGeo.translate(0, -0.5, 0);
    const upper = new THREE.Mesh(upperGeo, mats.horseCoat);
    upper.castShadow = true;
    legRoot.add(upper);

    const lowerGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.9, 8);
    lowerGeo.translate(0, -1.25, 0);
    const lower = new THREE.Mesh(lowerGeo, mats.horseCoat);
    lower.castShadow = true;
    legRoot.add(lower);

    // Ferradura metálica
    const shoeGeo = new THREE.CylinderGeometry(0.15, 0.16, 0.15, 8);
    const shoe = new THREE.Mesh(shoeGeo, mats.horseshoeMat);
    shoe.position.set(0, -1.75, 0);
    shoe.castShadow = true;
    legRoot.add(shoe);

    group.add(legRoot);
    return legRoot;
  }

  const legFL = makeHorseLeg(-0.5, -0.8);
  const legFR = makeHorseLeg(0.5, -0.8);
  const legBL = makeHorseLeg(-0.52, 1.0);
  const legBR = makeHorseLeg(0.52, 1.0);

  // --- O VAQUEIRO SERTANEJO ---
  // Tronco com Gibão de Couro Tradicional
  const riderTorsoGeo = new THREE.BoxGeometry(0.72, 0.95, 0.48);
  const riderTorso = new THREE.Mesh(riderTorsoGeo, mats.leatherArmor);
  riderTorso.position.set(0, 3.25, 0.15);
  riderTorso.castShadow = true;
  group.add(riderTorso);

  // Pernas com Perneiras de Couro
  const riderLegGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.9, 8);
  const riderLegL = new THREE.Mesh(riderLegGeo, mats.leatherArmor);
  riderLegL.position.set(-0.45, 2.3, 0.15);
  riderLegL.rotation.z = 0.25;
  group.add(riderLegL);

  const riderLegR = new THREE.Mesh(riderLegGeo, mats.leatherArmor);
  riderLegR.position.set(0.45, 2.3, 0.15);
  riderLegR.rotation.z = -0.25;
  group.add(riderLegR);

  // Braço Esquerdo (Segurando as rédeas)
  const armLGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.75, 8);
  armLGeo.rotateX(-Math.PI / 3);
  const armL = new THREE.Mesh(armLGeo, mats.leatherArmor);
  armL.position.set(-0.45, 3.2, -0.2);
  group.add(armL);

  // Braço Direito (Erguido segurando o laço)
  const armRGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.85, 8);
  armRGeo.rotateX(Math.PI / 4);
  const armR = new THREE.Mesh(armRGeo, mats.leatherArmor);
  armR.position.set(0.48, 3.5, 0.05);
  group.add(armR);

  // Cabeça e Chapéu de Couro Sertanejo
  const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
  const head = new THREE.Mesh(headGeo, mats.leatherHat);
  head.position.set(0, 3.95, 0.15);
  group.add(head);

  // Chapéu Meia-Lua Tradicional de Vaquejada
  const brimGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.06, 16);
  const brim = new THREE.Mesh(brimGeo, mats.leatherHat);
  brim.position.set(0, 4.05, 0.15);
  brim.castShadow = true;
  group.add(brim);

  const crownGeo = new THREE.ConeGeometry(0.3, 0.35, 12);
  const crown = new THREE.Mesh(crownGeo, mats.leatherHat);
  crown.position.set(0, 4.25, 0.15);
  group.add(crown);

  // Laço em Rotação 3D Overhead
  const lassoGeo = new THREE.TorusGeometry(0.85, 0.05, 8, 24);
  lassoGeo.rotateX(Math.PI / 2);
  const lassoMesh = new THREE.Mesh(lassoGeo, mats.ropeMat);
  lassoMesh.position.set(0.65, 4.3, -0.2);
  lassoMesh.castShadow = true;
  group.add(lassoMesh);

  return {
    group,
    legFL,
    legFR,
    legBL,
    legBR,
    tail: tailGroup,
    lassoMesh,
  };
}

// 3. CENÁRIO 3D DA BARRAGEM DE SOBRADINHO (CHESF)
export interface DamEnvironmentRef {
  group: THREE.Group;
  roadMesh: THREE.Mesh;
  lakeWaterMesh: THREE.Mesh;
  gantryCrane: THREE.Group;
  updateRoad: (playerZ: number) => void;
}

export function createDamEnvironment3D(mats: GameMaterials): DamEnvironmentRef {
  const group = new THREE.Group();
  group.name = 'DamEnvironment';

  const ROAD_WIDTH = 12.0;
  const SEGMENT_LENGTH = 400.0;

  // 1. Pista de Asfalto sobre a Crista da Barragem
  const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH, 1, 30);
  roadGeo.rotateX(-Math.PI / 2);
  const roadMesh = new THREE.Mesh(roadGeo, mats.asphaltMat);
  roadMesh.position.set(0, 0, -SEGMENT_LENGTH / 2);
  roadMesh.receiveShadow = true;
  group.add(roadMesh);

  // Linha Central Amarela Pontilhada
  const centerLineGeo = new THREE.PlaneGeometry(0.3, SEGMENT_LENGTH, 1, 1);
  centerLineGeo.rotateX(-Math.PI / 2);
  const centerLine = new THREE.Mesh(centerLineGeo, mats.roadLineMat);
  centerLine.position.set(0, 0.02, -SEGMENT_LENGTH / 2);
  group.add(centerLine);

  // Linhas Laterais Brancas Contínuas
  const lineGeo = new THREE.PlaneGeometry(0.25, SEGMENT_LENGTH, 1, 1);
  lineGeo.rotateX(-Math.PI / 2);
  const lineL = new THREE.Mesh(lineGeo, mats.roadWhiteLineMat);
  lineL.position.set(-ROAD_WIDTH * 0.46, 0.02, -SEGMENT_LENGTH / 2);
  group.add(lineL);

  const lineR = lineL.clone();
  lineR.position.set(ROAD_WIDTH * 0.46, 0.02, -SEGMENT_LENGTH / 2);
  group.add(lineR);

  // Guard-rails de concreto / jersey barriers nos dois lados da pista
  const barrierGeo = new THREE.BoxGeometry(0.5, 0.9, SEGMENT_LENGTH);
  const barrierL = new THREE.Mesh(barrierGeo, mats.concreteMat);
  barrierL.position.set(-ROAD_WIDTH * 0.52, 0.45, -SEGMENT_LENGTH / 2);
  barrierL.castShadow = true;
  barrierL.receiveShadow = true;
  group.add(barrierL);

  const barrierR = new THREE.Mesh(barrierGeo, mats.concreteMat);
  barrierR.position.set(ROAD_WIDTH * 0.52, 0.45, -SEGMENT_LENGTH / 2);
  barrierR.castShadow = true;
  barrierR.receiveShadow = true;
  group.add(barrierR);

  // 2. LADO ESQUERDO: O Grande Lago de Sobradinho (Montante)
  const lakeGeo = new THREE.PlaneGeometry(400, SEGMENT_LENGTH, 10, 10);
  lakeGeo.rotateX(-Math.PI / 2);
  const lakeMesh = new THREE.Mesh(lakeGeo, mats.waterLakeMat);
  lakeMesh.position.set(-206, -0.4, -SEGMENT_LENGTH / 2);
  lakeMesh.receiveShadow = true;
  group.add(lakeMesh);

  // Talude de pedras (enrocamento) entre a pista e o lago
  const riprapGeo = new THREE.BoxGeometry(6, 1.2, SEGMENT_LENGTH);
  const riprap = new THREE.Mesh(riprapGeo, mats.concreteMat);
  riprap.position.set(-ROAD_WIDTH * 0.5 - 3.2, -0.3, -SEGMENT_LENGTH / 2);
  group.add(riprap);

  // 3. LADO DIREITO: Paredão de Concreto e Vertedouro da CHESF (Queda de 41 metros para o rio)
  const wallGeo = new THREE.BoxGeometry(14, 40, SEGMENT_LENGTH);
  const damWall = new THREE.Mesh(wallGeo, mats.concreteMat);
  damWall.position.set(ROAD_WIDTH * 0.5 + 7.5, -20, -SEGMENT_LENGTH / 2);
  damWall.receiveShadow = true;
  group.add(damWall);

  // Rio São Francisco abaixo do vertedouro com espuma branca
  const riverGeo = new THREE.PlaneGeometry(350, SEGMENT_LENGTH, 1, 1);
  riverGeo.rotateX(-Math.PI / 2);
  const riverMesh = new THREE.Mesh(riverGeo, mats.foamWaterMat);
  riverMesh.position.set(190, -39.8, -SEGMENT_LENGTH / 2);
  group.add(riverMesh);

  // 4. PÓRTICO ROLANTE AMARELO MONUMENTAL DA CHESF (Guindaste)
  const gantryCrane = new THREE.Group();
  gantryCrane.name = 'CHESF_GantryCrane';

  // Perna esquerda amarela
  const legCraneGeo = new THREE.BoxGeometry(1.6, 16, 2.2);
  const craneLegL = new THREE.Mesh(legCraneGeo, mats.yellowCraneMat);
  craneLegL.position.set(-ROAD_WIDTH * 0.5 - 1.8, 8, 0);
  craneLegL.castShadow = true;
  gantryCrane.add(craneLegL);

  // Perna direita amarela
  const craneLegR = new THREE.Mesh(legCraneGeo, mats.yellowCraneMat);
  craneLegR.position.set(ROAD_WIDTH * 0.5 + 1.8, 8, 0);
  craneLegR.castShadow = true;
  gantryCrane.add(craneLegR);

  // Viga horizontal superior
  const beamGeo = new THREE.BoxGeometry(ROAD_WIDTH + 6, 2.4, 3.0);
  const craneBeam = new THREE.Mesh(beamGeo, mats.yellowCraneMat);
  craneBeam.position.set(0, 15.5, 0);
  craneBeam.castShadow = true;
  gantryCrane.add(craneBeam);

  // Cabine de controle no pórtico
  const cabGeo = new THREE.BoxGeometry(3.5, 2.8, 3.5);
  const craneCab = new THREE.Mesh(cabGeo, mats.hornMat);
  craneCab.position.set(-ROAD_WIDTH * 0.25, 18, 0);
  gantryCrane.add(craneCab);

  gantryCrane.position.set(0, 0, -180);
  group.add(gantryCrane);

  // 5. HORIZONTE: O Morro do Cruzeiro de Sobradinho
  const hillGroup = new THREE.Group();
  hillGroup.position.set(-60, 15, -450);

  // Silhueta vulcânica com topo reto
  const hillGeo = new THREE.CylinderGeometry(40, 110, 85, 18);
  const hillMesh = new THREE.Mesh(
    hillGeo,
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 })
  );
  hillGroup.add(hillMesh);

  // Antena de comunicação no topo com luz de balizamento vermelha
  const mastGeo = new THREE.CylinderGeometry(0.4, 0.8, 35, 6);
  const mast = new THREE.Mesh(mastGeo, mats.horseshoeMat);
  mast.position.set(0, 55, 0);
  hillGroup.add(mast);

  const redBeaconGeo = new THREE.SphereGeometry(1.5, 8, 8);
  const redBeaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const beacon = new THREE.Mesh(redBeaconGeo, redBeaconMat);
  beacon.position.set(0, 72, 0);
  hillGroup.add(beacon);

  group.add(hillGroup);

  // Função para movimentar a estrada infinitamente conforme o jogador avança
  function updateRoad(playerZ: number) {
    const segmentIndex = Math.floor((-playerZ + SEGMENT_LENGTH * 0.5) / SEGMENT_LENGTH);
    const targetZ = -segmentIndex * SEGMENT_LENGTH - SEGMENT_LENGTH * 0.5;

    roadMesh.position.z = targetZ;
    centerLine.position.z = targetZ;
    lineL.position.z = targetZ;
    lineR.position.z = targetZ;
    barrierL.position.z = targetZ;
    barrierR.position.z = targetZ;
    lakeMesh.position.z = targetZ;
    riprap.position.z = targetZ;
    damWall.position.z = targetZ;
    riverMesh.position.z = targetZ;

    // Reposiciona o pórtico a cada ciclo
    gantryCrane.position.z = targetZ + 50;
    hillGroup.position.z = playerZ - 380;
  }

  return {
    group,
    roadMesh,
    lakeWaterMesh: lakeMesh,
    gantryCrane,
    updateRoad,
  };
}

// 4. OBSTÁCULOS 3D (Mandacaru, Pedra Granítica e Cavalete CHESF)
export function createObstacle3D(type: 'mandacaru' | 'pedra' | 'cavalete', mats: GameMaterials): THREE.Group {
  const group = new THREE.Group();

  if (type === 'mandacaru') {
    // Mandacaru com braços espinhosos
    const cactusMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
    const stemGeo = new THREE.CylinderGeometry(0.35, 0.4, 3.2, 10);
    const stem = new THREE.Mesh(stemGeo, cactusMat);
    stem.position.y = 1.6;
    stem.castShadow = true;
    group.add(stem);

    // Braço esquerdo
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.4, 8), cactusMat);
    armL.position.set(-0.65, 2.2, 0);
    armL.rotation.z = Math.PI / 2.2;
    armL.castShadow = true;
    group.add(armL);

    // Braço direito
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.6, 8), cactusMat);
    armR.position.set(0.7, 2.6, 0);
    armR.rotation.z = -Math.PI / 2.2;
    armR.castShadow = true;
    group.add(armR);
  } else if (type === 'pedra') {
    // Rocha Granítica da Caatinga
    const rockGeo = new THREE.DodecahedronGeometry(1.1, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.y = 0.9;
    rock.scale.set(1.4, 0.9, 1.2);
    rock.castShadow = true;
    group.add(rock);
  } else {
    // Cavalete de Obras CHESF
    const barricadeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.5 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });

    const barGeo = new THREE.BoxGeometry(2.4, 0.5, 0.15);
    const bar = new THREE.Mesh(barGeo, barricadeMat);
    bar.position.y = 1.2;
    bar.castShadow = true;
    group.add(bar);

    // Pés
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6);
    const leg1 = new THREE.Mesh(legGeo, woodMat);
    leg1.position.set(-0.95, 0.7, 0.35);
    leg1.rotation.x = 0.3;
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeo, woodMat);
    leg2.position.set(-0.95, 0.7, -0.35);
    leg2.rotation.x = -0.3;
    group.add(leg2);

    const leg3 = new THREE.Mesh(legGeo, woodMat);
    leg3.position.set(0.95, 0.7, 0.35);
    leg3.rotation.x = 0.3;
    group.add(leg3);

    const leg4 = new THREE.Mesh(legGeo, woodMat);
    leg4.position.set(0.95, 0.7, -0.35);
    leg4.rotation.x = -0.3;
    group.add(leg4);
  }

  return group;
}

// 5. ATUALIZADORES DE ANIMAÇÃO 3D (Ciclos de Galope & Física)
export function animateBullModel(
  bull: BullModelRef,
  time: number,
  speed: number,
  steerX: number
) {
  const gallopSpeed = speed * 1.15;
  const cycle = (time * gallopSpeed) % (Math.PI * 2);

  // Rotação das patas dianteiras e traseiras em 4 tempos
  const legAmp = 0.65;
  bull.legFL.rotation.x = Math.sin(cycle) * legAmp;
  bull.legFR.rotation.x = Math.sin(cycle + 0.4) * legAmp;
  bull.legBL.rotation.x = Math.sin(cycle + Math.PI) * legAmp;
  bull.legBR.rotation.x = Math.sin(cycle + Math.PI + 0.4) * legAmp;

  // Oscilação do cupim e cabeça
  bull.cupim.position.y = 2.7 + Math.sin(cycle * 2) * 0.12;
  bull.head.position.y = 2.0 + Math.sin(cycle * 2) * 0.08;

  // Balanço da cauda
  bull.tail.rotation.z = Math.sin(time * 6) * 0.35;

  // Inclinação do corpo nas curvas
  bull.group.rotation.z = -steerX * 0.15;
  bull.group.position.y = Math.abs(Math.sin(cycle)) * 0.15;
}

export function animateHorseRiderModel(
  horse: HorseRiderModelRef,
  time: number,
  speed: number,
  steerX: number,
  isLassoSpinning: boolean
) {
  const gallopSpeed = speed * 1.15;
  const cycle = (time * gallopSpeed) % (Math.PI * 2);

  const legAmp = 0.7;
  horse.legFL.rotation.x = Math.sin(cycle + 0.3) * legAmp;
  horse.legFR.rotation.x = Math.sin(cycle) * legAmp;
  horse.legBL.rotation.x = Math.sin(cycle + Math.PI + 0.3) * legAmp;
  horse.legBR.rotation.x = Math.sin(cycle + Math.PI) * legAmp;

  // Balanço do cavalo
  horse.group.position.y = Math.abs(Math.sin(cycle)) * 0.18;
  horse.group.rotation.z = -steerX * 0.18;

  // Cauda do cavalo
  horse.tail.rotation.z = Math.sin(time * 7) * 0.3;

  // Rotação contínua do laço em 3D sobre a cabeça
  if (isLassoSpinning) {
    horse.lassoMesh.visible = true;
    horse.lassoMesh.rotation.y = time * 18;
    horse.lassoMesh.scale.set(1.0, 1.0, 1.0);
  } else {
    horse.lassoMesh.visible = false;
  }
}
