export const MAP_WIDTH = 720;
export const MAP_HEIGHT = 380;
export const INITIAL_VIEWPORT = { zoom: 1, x: 360, y: 190 };
export type MapViewport = typeof INITIAL_VIEWPORT;

export function clampViewport(viewport: MapViewport): MapViewport {
  const zoom = Math.max(1, Math.min(4, viewport.zoom));
  const halfWidth = MAP_WIDTH / zoom / 2;
  const halfHeight = MAP_HEIGHT / zoom / 2;
  return {
    zoom,
    x: Math.max(halfWidth, Math.min(MAP_WIDTH - halfWidth, viewport.x)),
    y: Math.max(halfHeight, Math.min(MAP_HEIGHT - halfHeight, viewport.y)),
  };
}

export function zoomViewport(viewport: MapViewport, zoom: number): MapViewport {
  return clampViewport({ ...viewport, zoom });
}

export function toViewBox(viewport: MapViewport): string {
  const width = MAP_WIDTH / viewport.zoom;
  const height = MAP_HEIGHT / viewport.zoom;
  return `${viewport.x - width / 2} ${viewport.y - height / 2} ${width} ${height}`;
}
