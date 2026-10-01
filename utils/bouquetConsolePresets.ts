// utils/bouquetConsolePresets.ts
// Intelligent preset formations and aesthetic radar analysis for Desktop Bouquet Console

import { PlacedFlower } from '@/types/design';
import { FLOWERS } from '@/data/flowers';

export interface AestheticMetrics {
  harmonyScore: number;   // 0 - 100 (Color harmony & palette cohesion)
  fullnessScore: number;  // 0 - 100 (Percentage of target count placed)
  balanceScore: number;   // 0 - 100 (Left-right visual weight symmetry)
  diversityScore: number; // 0 - 100 (Flower variety & filler distribution)
  totalScore: number;     // 0 - 100 (Weighted aesthetic evaluation)
  ratingLabel: string;
  ratingLabelEn: string;
  flowerCount: number;
  uniqueSpeciesCount: number;
}

/**
 * Calculates real-time aesthetic metrics for the radar chart & analyzer card
 */
export function computeAestheticMetrics(
  flowers: PlacedFlower[],
  targetCount: number = 25
): AestheticMetrics {
  const count = flowers.length;
  if (count === 0) {
    return {
      harmonyScore: 0,
      fullnessScore: 0,
      balanceScore: 0,
      diversityScore: 0,
      totalScore: 0,
      ratingLabel: 'Buket Belum Berisi',
      ratingLabelEn: 'Empty Bouquet',
      flowerCount: 0,
      uniqueSpeciesCount: 0,
    };
  }

  // 1. Fullness (0 - 100)
  const target = Math.max(1, targetCount);
  const fullnessRatio = count / target;
  const fullnessScore = Math.min(100, Math.round(fullnessRatio * 100));

  // 2. Diversity Score (0 - 100)
  const speciesSet = new Set(flowers.map((f) => f.flowerId));
  const uniqueCount = speciesSet.size;
  // Ideal ratio is 3 to 6 unique species
  let diversityScore = 30;
  if (uniqueCount === 1) diversityScore = 45;
  else if (uniqueCount === 2) diversityScore = 65;
  else if (uniqueCount === 3) diversityScore = 85;
  else if (uniqueCount >= 4 && uniqueCount <= 7) diversityScore = 95;
  else diversityScore = 80;

  // 3. Balance Score (Visual symmetry around X=300)
  const centerX = 300;
  let leftWeight = 0;
  let rightWeight = 0;
  flowers.forEach((f) => {
    const fx = f.x ?? 300;
    const diff = fx - centerX;
    if (diff < -15) leftWeight += Math.abs(diff);
    else if (diff > 15) rightWeight += Math.abs(diff);
    else {
      leftWeight += 10;
      rightWeight += 10;
    }
  });

  const totalWeight = leftWeight + rightWeight;
  let balanceScore = 88;
  if (totalWeight > 0) {
    const asymmetry = Math.abs(leftWeight - rightWeight) / totalWeight;
    balanceScore = Math.max(35, Math.min(100, Math.round((1 - asymmetry * 0.9) * 100)));
  }

  // 4. Color Harmony Score (0 - 100)
  // Mapping color presence
  const colorMap: Record<string, number> = {};
  flowers.forEach((f) => {
    const def = FLOWERS.find((item) => item.id === f.flowerId);
    const color = def?.colorName || 'Neutral';
    colorMap[color] = (colorMap[color] || 0) + 1;
  });

  const colorCount = Object.keys(colorMap).length;
  let harmonyScore = 75;
  if (colorCount === 1) harmonyScore = 88; // Monochromatic perfection
  else if (colorCount === 2 || colorCount === 3) harmonyScore = 95; // Harmonious triad/duo
  else if (colorCount === 4) harmonyScore = 82;
  else harmonyScore = 70;

  // Weighted overall
  const totalScore = Math.round(
    harmonyScore * 0.28 + fullnessScore * 0.32 + balanceScore * 0.22 + diversityScore * 0.18
  );

  let ratingLabel = 'Sedang Dirangkai';
  let ratingLabelEn = 'In Progress';
  if (totalScore >= 90) {
    ratingLabel = 'Masterpiece Sangat Harmonis';
    ratingLabelEn = 'Harmonious Masterpiece';
  } else if (totalScore >= 80) {
    ratingLabel = 'Rangkaian Cantik & Elegan';
    ratingLabelEn = 'Charming & Elegant';
  } else if (totalScore >= 65) {
    ratingLabel = 'Komposisi Menarik';
    ratingLabelEn = 'Delightful Composition';
  } else if (totalScore >= 40) {
    ratingLabel = 'Perlu Penyesuaian Bunga';
    ratingLabelEn = 'Needs Flower Tweaks';
  } else {
    ratingLabel = 'Awal Rangkaian';
    ratingLabelEn = 'Early Arrangement';
  }

  return {
    harmonyScore,
    fullnessScore,
    balanceScore,
    diversityScore,
    totalScore,
    ratingLabel,
    ratingLabelEn,
    flowerCount: count,
    uniqueSpeciesCount: uniqueCount,
  };
}

export type PresetFormationType = 'dome' | 'fan' | 'heart' | 'minimalist';

/**
 * Arranges existing flowers into a geometric preset silhouette
 */
export function generatePresetLayout(
  type: PresetFormationType,
  currentFlowers: PlacedFlower[],
  targetCount: number = 25,
  isPremiumUnlocked: boolean = false
): PlacedFlower[] {
  let flowersToArrange = [...currentFlowers];

  // If no flowers or very few, replenish to target count using available flowers
  if (flowersToArrange.length < 5) {
    const available = FLOWERS.filter((f) => !f.isPremium || isPremiumUnlocked);
    const chosenPool = [...available].sort(() => Math.random() - 0.5).slice(0, 5);
    const needed = Math.max(targetCount, 15);
    flowersToArrange = [];
    for (let i = 0; i < needed; i++) {
      const species = chosenPool[i % chosenPool.length];
      flowersToArrange.push({
        uid: `${species.id}_preset_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        flowerId: species.id,
        imageUrl: species.imageUrl,
        category: species.category,
        order: i + 1,
        zIndex: (i + 1) * 2,
        angle: 0,
        radius: 60,
        rotation: 0,
        stemVariation: 0,
        isManual: true,
      });
    }
  }

  const n = flowersToArrange.length;
  const centerX = 300;
  const centerY = 270;

  switch (type) {
    case 'dome': {
      // Classic Dome / Half-Circle layered radial tiers
      const tiers = [
        { count: Math.ceil(n * 0.2), radius: 28, yOffset: 15 },
        { count: Math.ceil(n * 0.35), radius: 68, yOffset: -5 },
        { count: Math.ceil(n * 0.45), radius: 108, yOffset: -18 },
      ];

      return flowersToArrange.map((f, i) => {
        let tierIndex = 0;
        let runningCount = 0;
        for (let t = 0; t < tiers.length; t++) {
          runningCount += tiers[t].count;
          if (i < runningCount) {
            tierIndex = t;
            break;
          }
        }

        const tier = tiers[tierIndex];
        const tierSize = tier.count;
        const localIndex = i - (runningCount - tierSize);

        // Spread angle over arch (-80 deg to +80 deg)
        const angleFraction = tierSize > 1 ? localIndex / (tierSize - 1) : 0.5;
        const angleRad = (angleFraction * 160 - 80) * (Math.PI / 180);

        const x = Math.round(centerX + Math.sin(angleRad) * tier.radius);
        const y = Math.round(centerY - Math.cos(angleRad) * (tier.radius * 0.75) + tier.yOffset);
        const rotRad = (angleFraction * 0.6 - 0.3);

        return {
          ...f,
          x,
          y,
          rotation: rotRad,
          customRotation: Math.round(rotRad * (180 / Math.PI)),
          radius: tier.radius,
          scale: 1,
          zIndex: (tierIndex + 1) * 10 + i,
          isManual: true,
        };
      });
    }

    case 'fan': {
      // Fan Shape (Wide cascading arc)
      return flowersToArrange.map((f, i) => {
        const t = n > 1 ? i / (n - 1) : 0.5;
        // X spreads from 155 to 445
        const x = Math.round(155 + t * 290);
        // Arch formula
        const normalized = (t - 0.5) * 2; // -1 to 1
        const arch = Math.cos(normalized * (Math.PI / 2.3));
        const y = Math.round(centerY - arch * 95 + (i % 3) * 16);
        const rotRad = normalized * 0.45;

        return {
          ...f,
          x,
          y,
          rotation: rotRad,
          customRotation: Math.round(rotRad * (180 / Math.PI)),
          radius: 80,
          scale: 1,
          zIndex: i + 5,
          isManual: true,
        };
      });
    }

    case 'heart': {
      // Parametric Heart Silhouette
      return flowersToArrange.map((f, i) => {
        // Parametric parameter t from 0 to 2*PI
        const t = (i / n) * Math.PI * 2;
        // Standard cardioid heart formula
        const heartX = 16 * Math.pow(Math.sin(t), 3);
        const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        // Scale to fit canvas nicely (e.g. 5.5 multiplier)
        const scaleFactor = n > 20 ? 5.2 : 4.4;
        const x = Math.round(centerX + heartX * scaleFactor);
        const y = Math.round(centerY - 10 + heartY * scaleFactor);
        const rotRad = Math.sin(t) * 0.25;

        return {
          ...f,
          x,
          y,
          rotation: rotRad,
          customRotation: Math.round(rotRad * (180 / Math.PI)),
          scale: 1,
          zIndex: i + 5,
          isManual: true,
        };
      });
    }

    case 'minimalist': {
      // Tight cohesive center cluster with subtle organic breathing space
      return flowersToArrange.map((f, i) => {
        const phi = i * 2.39996; // Golden angle
        const r = Math.sqrt(i) * (n > 20 ? 16 : 22);
        const x = Math.round(centerX + Math.cos(phi) * r);
        const y = Math.round(centerY + Math.sin(phi) * (r * 0.72));
        const rotRad = (Math.random() - 0.5) * 0.25;

        return {
          ...f,
          x,
          y,
          rotation: rotRad,
          customRotation: Math.round(rotRad * (180 / Math.PI)),
          scale: 1,
          zIndex: i + 5,
          isManual: true,
        };
      });
    }
  }
}
