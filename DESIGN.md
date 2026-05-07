# Design Identity: The Soft Tactile Playground

## The North Star
A monochromatic, warm environment that feels like a hand-drawn cartoon on textured paper. Everything is "squishy" and "snappy."

## Visual Strategy
- **Color**: Monochromatic "Amber Softness" (`oklch(75% 0.12 50)`). Absolutely no harsh blues or neon greens.
- **Texture**: Prominent noise grain (`opacity: 0.12`) across all surfaces to simulate tactile paper.
- **Shapes**: Wobbly, hand-drawn perimeters using complex `border-radius` and slight rotations.

## Component Scaffold
- **The Wobbly Card**: Irregular `border-radius`, thick `4px` dark outlines, and a solid `8px` shadow.
- **The Snappy Button**: Spring-loaded hover state. It "pops" with scale and rotation.
- **Playful Clusters**: Content grouped in loose, slightly rotated clusters (`-2deg` to `2deg`).

## Design Rules
1. **The Hand-Drawn Rule**: If it looks too perfect, wobble it. No rigid grids.
2. **The Softness Rule**: Use monochromatic Amber and Burnt Sienna. Avoid pure black; use `oklch(25% 0.04 45)` for depth.
3. **The Snappy Rule**: Interactions must be fast with a springy overshoot (`var(--ease-pop)`).
4. **The Typesetting Rule**: Use `Fredoka` for display and `Comic Neue` for body. Prefer large sizes (`22px+`) and balanced line heights.

## Implementation Tokens (index.css)
- `--paper-bg`: Deep Burnt Sienna.
- `--amber-soft`: Primary brand hue.
- `--radius-wobbly`: Hand-drawn shape simulation.
- `--ease-pop`: Spring-loaded motion (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- `--shadow-pop`: Solid `8px` offset.
