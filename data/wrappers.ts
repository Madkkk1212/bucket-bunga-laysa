import { WrapperType } from '../types/design';

export const WRAPPER_TYPES: WrapperType[] = [
  {
    id: 'matte',
    label: 'Korean Noir Matte Black',
    color: '#1E1E1E',
    texture: 'dull',
    priceModifier: 1,
  },
  {
    id: 'kraft',
    label: 'Kraft Brown Paper',
    color: '#D2B48C',
    texture: 'rough',
    priceModifier: 0,
  },
  {
    id: 'tissue_white',
    label: 'Tissue White',
    color: '#F8F8F8',
    texture: 'smooth',
    priceModifier: 0.5,
  },
  {
    id: 'tissue_pink',
    label: 'Tissue Pink',
    color: '#FFB6C1',
    texture: 'smooth',
    priceModifier: 0.5,
  },
  {
    id: 'glossy',
    label: 'Glossy Pearl',
    color: '#E8E8E8',
    texture: 'shiny',
    priceModifier: 1,
  },
  {
    id: 'crinkle',
    label: 'Crinkle Gold',
    color: '#DAA520',
    texture: 'crinkled',
    priceModifier: 1.5,
  },
];

export const getWrapper = (id: string): WrapperType =>
  WRAPPER_TYPES.find((w) => w.id === id) ?? WRAPPER_TYPES[0];
