'use client';
// components/gift/GiftObjectScene.tsx
// Dispatcher: render objek hadiah yang benar berdasarkan giftObjectId.

import React from 'react';
import type { GiftObjectId } from '@/types/giftConfig';
import EnvelopeObject from './objects/EnvelopeObject';
import GiftBoxObject from './objects/GiftBoxObject';
import MusicBoxObject from './objects/MusicBoxObject';
import BalloonObject from './objects/BalloonObject';
import JarObject from './objects/JarObject';
import BookObject from './objects/BookObject';

interface Props {
  objectId?: GiftObjectId;
  giftObjectId?: GiftObjectId;
  isOpening?: boolean;
  onClick?: () => void;
}

const OBJECT_MAP: Record<GiftObjectId, React.ComponentType<{ isOpening?: boolean; onClick?: () => void }>> = {
  'envelope': EnvelopeObject,
  'gift-box': GiftBoxObject,
  'music-box': MusicBoxObject,
  'balloon': BalloonObject,
  'jar': JarObject,
  'book': BookObject,
};

export default function GiftObjectScene({ objectId, giftObjectId, isOpening, onClick }: Props) {
  const targetId = giftObjectId || objectId || 'envelope';
  const Component = OBJECT_MAP[targetId] ?? OBJECT_MAP['envelope'];
  return <Component isOpening={isOpening} onClick={onClick} />;
}
