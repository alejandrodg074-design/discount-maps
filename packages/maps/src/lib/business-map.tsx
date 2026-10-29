/// <reference types="google.maps" />
'use client';

import { useEffect, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  Marker,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps';
import type { LatLng } from './use-geolocation';

export interface BusinessMapMarker extends LatLng {
  id: string;
  label: string;
  /** Second line of the info window (branch name, address…). */
  description?: string;
  /** When set, the info window links here ("Ver cupones"). */
  href?: string;
}

export interface BusinessMapProps {
  center: LatLng;
  markers?: readonly BusinessMapMarker[];
  /**
   * Google Maps browser key. Apps read `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in a
   * server component and pass it down; without a key the placeholder renders.
   */
  apiKey?: string | null;
  /** `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`; enables Advanced Markers (branded pins). */
  mapId?: string | null;
  /** The viewer's real position (not the fallback): drawn as a blue dot and kept in view. */
  userLocation?: LatLng | null;
  /**
   * Asks for the position again (`useGeolocation().locate`). With it the map
   * shows the "Mi ubicación" button even before the position is known.
   */
  onLocate?: () => void;
  className?: string;
}

const DEFAULT_ZOOM = 13;
const SINGLE_MARKER_ZOOM = 15;
const FIT_PADDING = 48;
/** Branches kept in view next to the viewer (the closest ones). */
export const NEAREST_IN_VIEW = 3;
const USER_DOT_COLOR = '#2563eb';

/** Squared planar distance: only used to rank nearby points. */
function distance2(a: LatLng, b: LatLng): number {
  const dLat = a.lat - b.lat;
  const dLng = (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180);
  return dLat * dLat + dLng * dLng;
}

/**
 * Points the viewport must show: every marker, or, when the viewer's position
 * is known, the viewer plus the `nearest` closest markers (a 200 km search
 * would otherwise zoom out to the whole region and lose the viewer).
 */
export function viewportPoints(
  markers: readonly LatLng[],
  userLocation?: LatLng | null,
  nearest = NEAREST_IN_VIEW,
): LatLng[] {
  const all = markers.map(({ lat, lng }) => ({ lat, lng }));
  if (!userLocation) return all;
  const closest = [...all]
    .sort((a, b) => distance2(a, userLocation) - distance2(b, userLocation))
    .slice(0, nearest);
  return [{ lat: userLocation.lat, lng: userLocation.lng }, ...closest];
}

/** Keeps the viewport on the markers and the viewer (or the center when there are none). */
function Viewport({
  center,
  markers,
  userLocation,
}: {
  center: LatLng;
  markers: readonly BusinessMapMarker[];
  userLocation: LatLng | null;
}) {
  const map = useMap();
  const key = markers.map((m) => `${m.id}:${m.lat},${m.lng}`).join('|');
  const userKey = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
  useEffect(() => {
    if (!map) return;
    const points = viewportPoints(markers, userLocation);
    const fit = () => {
      if (points.length === 0) {
        map.panTo(center);
        map.setZoom(DEFAULT_ZOOM);
        return;
      }
      if (points.length === 1) {
        map.panTo(points[0]);
        map.setZoom(SINGLE_MARKER_ZOOM);
        return;
      }
      const bounds = new google.maps.LatLngBounds();
      for (const p of points) bounds.extend(p);
      map.fitBounds(bounds, FIT_PADDING);
    };
    fit();
    // fitBounds before the first layout (hidden tab, container still sizing)
    // computes a wrong zoom: fit once more when the map settles.
    const once = google.maps.event.addListenerOnce(map, 'idle', fit);
    return () => once.remove();
    // markers / user are summarised by `key` / `userKey`; center only matters when there are none
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key, userKey, center.lat, center.lng]);
  return null;
}

/** The viewer's position: a blue dot with a soft halo. */
function UserDot({
  position,
  branded,
}: {
  position: LatLng;
  branded: boolean;
}) {
  if (branded) {
    return (
      <AdvancedMarker position={position} title="Tú estás aquí" zIndex={1000}>
        <span
          data-user-dot
          className="block size-5 rounded-full border-[3px] border-white shadow-[0_0_0_8px_rgba(37,99,235,0.2)]"
          style={{ backgroundColor: USER_DOT_COLOR }}
        />
      </AdvancedMarker>
    );
  }
  // Classic markers need a Symbol icon, built from the loaded Maps API.
  const icon =
    typeof google !== 'undefined'
      ? {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: USER_DOT_COLOR,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }
      : undefined;
  return (
    <Marker
      position={position}
      title="Tú estás aquí"
      icon={icon}
      zIndex={1000}
    />
  );
}

/** "Mi ubicación": re-centers on the viewer, or asks for the position first. */
function LocateButton({
  userLocation,
  onLocate,
}: {
  userLocation: LatLng | null;
  onLocate?: () => void;
}) {
  const map = useMap();
  return (
    <button
      type="button"
      aria-label="Centrar en mi ubicación"
      title="Mi ubicación"
      onClick={() => {
        if (userLocation && map) {
          map.panTo(userLocation);
          map.setZoom(SINGLE_MARKER_ZOOM);
        } else {
          onLocate?.();
        }
      }}
      className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-white text-ink shadow-md"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" fill={USER_DOT_COLOR} stroke="none" />
        <circle cx="12" cy="12" r="8" />
        <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
      </svg>
    </button>
  );
}

function Placeholder({
  center,
  markers,
  className,
}: Required<Pick<BusinessMapProps, 'center' | 'markers' | 'className'>>) {
  return (
    <div
      role="img"
      aria-label="Mapa no disponible"
      className={`flex aspect-[16/10] w-full flex-col items-center justify-center gap-1 rounded-card border border-dashed border-line bg-surface-muted text-center ${className}`}
    >
      <span className="text-sm font-medium text-ink-muted">
        Mapa no disponible
      </span>
      <span className="text-xs text-ink-muted">
        {markers.length === 1 ? '1 sede' : `${markers.length} sedes`} ·{' '}
        {center.lat.toFixed(3)}, {center.lng.toFixed(3)}
      </span>
    </div>
  );
}

/**
 * Map area shared by the consumer list and the business profile: one pin per
 * branch, an info window on tap, viewport fitted to the pins. Renders a static
 * placeholder when there is no API key (see docs/external-dependencies.md).
 */
export function BusinessMap({
  center,
  markers = [],
  apiKey,
  mapId,
  userLocation = null,
  onLocate,
  className = '',
}: BusinessMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (!apiKey) {
    return (
      <Placeholder center={center} markers={markers} className={className} />
    );
  }
  const selected = markers.find((m) => m.id === selectedId) ?? null;
  const branded = Boolean(mapId);

  return (
    <div
      role="region"
      aria-label="Mapa"
      data-markers={markers.length}
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-card border border-line ${className}`}
    >
      <APIProvider apiKey={apiKey} language="es" region="CO">
        <Map
          mapId={mapId ?? undefined}
          defaultCenter={center}
          defaultZoom={DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI
          clickableIcons={false}
          className="size-full"
          onClick={() => setSelectedId(null)}
        >
          {markers.map((m) =>
            branded ? (
              <AdvancedMarker
                key={m.id}
                position={{ lat: m.lat, lng: m.lng }}
                title={m.label}
                onClick={() => setSelectedId(m.id)}
              >
                <Pin
                  background="#e11d48"
                  borderColor="#9f1239"
                  glyphColor="#fff"
                  scale={selectedId === m.id ? 1.25 : 1}
                />
              </AdvancedMarker>
            ) : (
              <Marker
                key={m.id}
                position={{ lat: m.lat, lng: m.lng }}
                title={m.label}
                onClick={() => setSelectedId(m.id)}
              />
            ),
          )}
          {selected ? (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              pixelOffset={[0, branded ? -36 : -40]}
              headerDisabled
              onCloseClick={() => setSelectedId(null)}
            >
              <div className="flex max-w-56 flex-col gap-1 text-ink">
                <p className="font-semibold">{selected.label}</p>
                {selected.description ? (
                  <p className="text-xs text-ink-muted">
                    {selected.description}
                  </p>
                ) : null}
                {selected.href ? (
                  <a
                    href={selected.href}
                    className="text-sm font-semibold text-brand-600"
                  >
                    Ver cupones
                  </a>
                ) : null}
              </div>
            </InfoWindow>
          ) : null}
          {userLocation ? (
            <UserDot position={userLocation} branded={branded} />
          ) : null}
          <Viewport
            center={center}
            markers={markers}
            userLocation={userLocation}
          />
        </Map>
        {userLocation || onLocate ? (
          <LocateButton userLocation={userLocation} onLocate={onLocate} />
        ) : null}
      </APIProvider>
    </div>
  );
}
