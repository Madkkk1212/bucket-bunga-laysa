export interface GardenWorldDecoration {
  typeKey: string;
  x: number;
  z: number;
  rotation: number;
  scale: number;
}

export interface GardenWorldRoad {
  type: string;
  gx: number;
  gz: number;
}

export interface GardenWorldVehicle {
  type: string;
  x: number;
  z: number;
  rotation: number;
  circuit?: boolean;
}

export interface GardenWorldLayout {
  version: 1;
  season: 'cerah' | 'hujan' | 'salju' | 'kemarau';
  preset?: 'city-loop-v1';
  decorations: GardenWorldDecoration[];
  roads: GardenWorldRoad[];
  vehicles: GardenWorldVehicle[];
}

/** Starter town used only when the player has no saved world yet. */
export function createStarterCityWorldLayout(): GardenWorldLayout {
  const roads: GardenWorldRoad[] = [];
  for (let gx = -3; gx <= 3; gx += 1) {
    roads.push({ type: gx === -3 ? 'corner_se' : gx === 3 ? 'corner_sw' : 'straight_ew', gx, gz: -3 });
    roads.push({ type: gx === -3 ? 'corner_ne' : gx === 3 ? 'corner_nw' : 'straight_ew', gx, gz: 3 });
  }
  for (let gz = -2; gz <= 2; gz += 1) {
    roads.push({ type: 'straight_ns', gx: -3, gz });
    roads.push({ type: 'straight_ns', gx: 3, gz });
  }

  const decorations: GardenWorldDecoration[] = [];
  const addSide = (types: string[], positions: number[], side: 'north' | 'east' | 'south' | 'west') => {
    const sideConfig = {
      north: { x: (along: number) => along, z: -9.5, rotation: 0 },
      east: { x: 9.5, z: (along: number) => along, rotation: -Math.PI / 2 },
      south: { x: (along: number) => along, z: 9.5, rotation: Math.PI },
      west: { x: -9.5, z: (along: number) => along, rotation: Math.PI / 2 },
    }[side];
    types.forEach((typeKey, index) => {
      const along = positions[index];
      decorations.push({
        typeKey,
        x: typeof sideConfig.x === 'function' ? sideConfig.x(along) : sideConfig.x,
        z: typeof sideConfig.z === 'function' ? sideConfig.z(along) : sideConfig.z,
        rotation: sideConfig.rotation,
        scale: 1,
      });
    });
  };

  const positions = [-6, -2, 2, 6];
  addSide(['rumah_a', 'rumah_b', 'rumah_c', 'warung'], positions, 'north');
  addSide(['toko', 'rumah_c', 'rumah_b', 'apotek'], positions, 'east');
  addSide(['rumah_a', 'sekolah', 'rumah_b', 'masjid'], positions, 'south');
  addSide(['rumah_c', 'rumah_a', 'rumah_b', 'bank'], positions, 'west');

  const vehicles: GardenWorldVehicle[] = [
    { type: 'car_sedan', x: -4, z: -6, rotation: 0, circuit: true },
    { type: 'car_taxi', x: 6, z: -2, rotation: 0, circuit: true },
    { type: 'car_suv', x: 2, z: 6, rotation: 0, circuit: true },
    { type: 'car_mpv', x: -6, z: 2, rotation: 0, circuit: true },
  ];

  return { version: 1, season: 'cerah', preset: 'city-loop-v1', decorations, roads, vehicles };
}

export function addStarterCityIfWorldIsEmpty(layout: GardenWorldLayout): GardenWorldLayout {
  if (layout.preset || layout.decorations.length || layout.roads.length || layout.vehicles.length) return layout;
  return createStarterCityWorldLayout();
}

export const EMPTY_GARDEN_WORLD_LAYOUT: GardenWorldLayout = {
  version: 1,
  season: 'cerah',
  decorations: [],
  roads: [],
  vehicles: [],
};
