import type { ReactNode } from 'react'

// Shapes for the "Costruisci con le forme" game (level 1–2): the child hears a shape name and
// taps the matching shape to build a picture piece by piece. Pictures are drawn in a 200×200 box.

export type ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'heart' | 'oval' | 'diamond'

export const SHAPES: Record<ShapeId, { it: string; color: string }> = {
  circle: { it: 'cerchio', color: '#ff6b6b' },
  square: { it: 'quadrato', color: '#54a0ff' },
  triangle: { it: 'triangolo', color: '#1dd1a1' },
  rectangle: { it: 'rettangolo', color: '#ff9f43' },
  star: { it: 'stella', color: '#feca57' },
  heart: { it: 'cuore', color: '#ff6b9d' },
  oval: { it: 'ovale', color: '#a55eea' },
  diamond: { it: 'rombo', color: '#00d2d3' },
}

export const SHAPE_IDS = Object.keys(SHAPES) as ShapeId[]

// One piece of a picture: its shape, centre, size and (optionally) rotation in degrees.
export type Piece = { shape: ShapeId; x: number; y: number; w: number; h?: number; rot?: number; color: string }

// What the finished picture does: flies away, drives off, swims, rocks or jumps for joy.
export type Finish = 'fly' | 'drive' | 'swim' | 'rock' | 'jump'

export type Picture = { id: string; en: string; it: string; finish: Finish; deco?: ReactNode; pieces: Piece[] }

const ground = <rect x="0" y="178" width="200" height="22" fill="#b8f0b0" />
const sea = <path d="M0 160 Q25 150 50 160 T100 160 T150 160 T200 160 V200 H0 Z" fill="#7fd3f7" />

export const PICTURES: Picture[] = [
  {
    id: 'house', en: 'a house', it: 'una casa', finish: 'jump', deco: ground,
    pieces: [
      { shape: 'square', x: 100, y: 132, w: 92, color: '#ff9f43' },
      { shape: 'triangle', x: 100, y: 61, w: 120, h: 52, color: '#ee5253' },
      { shape: 'rectangle', x: 82, y: 155, w: 26, h: 46, color: '#8e5b3c' },
      { shape: 'circle', x: 124, y: 118, w: 24, color: '#74b9ff' },
    ],
  },
  {
    id: 'rocket', en: 'a rocket', it: 'un razzo', finish: 'fly',
    pieces: [
      { shape: 'rectangle', x: 100, y: 115, w: 50, h: 90, color: '#dfe6e9' },
      { shape: 'triangle', x: 100, y: 50, w: 50, h: 40, color: '#ee5253' },
      { shape: 'circle', x: 100, y: 100, w: 26, color: '#74b9ff' },
      { shape: 'star', x: 158, y: 40, w: 36, color: '#feca57' },
    ],
  },
  {
    id: 'car', en: 'a car', it: 'una macchina', finish: 'drive', deco: ground,
    pieces: [
      { shape: 'square', x: 92, y: 92, w: 48, color: '#74b9ff' },
      { shape: 'rectangle', x: 100, y: 132, w: 150, h: 42, color: '#ee5253' },
      { shape: 'circle', x: 58, y: 156, w: 36, color: '#2d3436' },
      { shape: 'circle', x: 142, y: 156, w: 36, color: '#2d3436' },
    ],
  },
  {
    id: 'snowman', en: 'a snowman', it: 'un pupazzo di neve', finish: 'jump', deco: ground,
    pieces: [
      { shape: 'circle', x: 100, y: 140, w: 80, color: '#f5f6fa' },
      { shape: 'circle', x: 100, y: 78, w: 56, color: '#f5f6fa' },
      { shape: 'triangle', x: 112, y: 82, w: 12, h: 26, rot: 90, color: '#ff9f43' },
      { shape: 'rectangle', x: 100, y: 42, w: 40, h: 26, color: '#2d3436' },
    ],
  },
  {
    id: 'fish', en: 'a fish', it: 'un pesce', finish: 'swim', deco: sea,
    pieces: [
      { shape: 'triangle', x: 158, y: 95, w: 56, h: 44, rot: -90, color: '#ff9f43' },
      { shape: 'oval', x: 88, y: 95, w: 120, h: 76, color: '#feca57' },
      { shape: 'circle', x: 58, y: 84, w: 16, color: '#2d3436' },
    ],
  },
  {
    id: 'icecream', en: 'an ice cream', it: 'un gelato', finish: 'jump',
    pieces: [
      { shape: 'triangle', x: 100, y: 140, w: 70, h: 90, rot: 180, color: '#e1b382' },
      { shape: 'circle', x: 100, y: 84, w: 78, color: '#ff9ff3' },
      { shape: 'heart', x: 100, y: 32, w: 30, h: 28, color: '#ee5253' },
    ],
  },
  {
    id: 'kite', en: 'a kite', it: 'un aquilone', finish: 'fly',
    deco: <path d="M100 135 Q80 160 105 175 T95 200" fill="none" stroke="#636e72" strokeWidth="2" />,
    pieces: [
      { shape: 'diamond', x: 100, y: 75, w: 90, h: 120, color: '#a55eea' },
      { shape: 'heart', x: 88, y: 158, w: 22, h: 20, color: '#ff6b9d' },
      { shape: 'star', x: 106, y: 184, w: 24, color: '#feca57' },
    ],
  },
  {
    id: 'robot', en: 'a robot', it: 'un robot', finish: 'jump', deco: ground,
    pieces: [
      { shape: 'rectangle', x: 100, y: 130, w: 104, h: 60, color: '#a4b0be' },
      { shape: 'square', x: 100, y: 62, w: 62, color: '#ced6e0' },
      { shape: 'circle', x: 100, y: 62, w: 26, color: '#1dd1a1' },
      { shape: 'heart', x: 100, y: 130, w: 28, h: 26, color: '#ee5253' },
      { shape: 'diamond', x: 100, y: 20, w: 16, h: 22, color: '#feca57' },
    ],
  },
  {
    id: 'tree', en: 'a Christmas tree', it: "un albero di Natale", finish: 'rock', deco: ground,
    pieces: [
      { shape: 'rectangle', x: 100, y: 164, w: 26, h: 30, color: '#8e5b3c' },
      { shape: 'triangle', x: 100, y: 95, w: 124, h: 118, color: '#10ac84' },
      { shape: 'star', x: 100, y: 30, w: 38, color: '#feca57' },
      { shape: 'circle', x: 84, y: 118, w: 16, color: '#ee5253' },
      { shape: 'heart', x: 116, y: 92, w: 18, h: 16, color: '#ff9ff3' },
    ],
  },
  {
    id: 'boat', en: 'a boat', it: 'una barca', finish: 'rock', deco: <>{sea}<rect x="98" y="50" width="4" height="90" fill="#8e5b3c" /></>,
    pieces: [
      { shape: 'triangle', x: 126, y: 98, w: 48, h: 76, rot: 0, color: '#f5f6fa' },
      { shape: 'rectangle', x: 100, y: 148, w: 136, h: 32, color: '#ee5253' },
      { shape: 'circle', x: 66, y: 148, w: 16, color: '#74b9ff' },
      { shape: 'diamond', x: 112, y: 48, w: 20, h: 26, color: '#feca57' },
    ],
  },
]
