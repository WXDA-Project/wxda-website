/// <reference types="leaflet.markercluster" />
/// <reference types="leaflet.heat" />

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Map as LeafletMap, Layer } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { MapPin } from '@/lib/queries'

// ── Sidebar ───────────────────────────────────────────────────────────────────

function SidebarContent({ pin, onClose }: { pin: MapPin; onClose: () => void }) {
  const sorted = [...pin.documents].sort(
    (a, b) => (a.date ?? '').localeCompare(b.date ?? ''),
  )

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-border shrink-0">
        <div className="min-w-0">
          <h2 className="font-serif font-bold text-ink text-base leading-snug">
            {pin.location}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {pin.documents.length} record{pin.documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="shrink-0 text-xl leading-none text-muted hover:text-ink transition-colors cursor-pointer mt-0.5"
        >
          ×
        </button>
      </div>

      {/* Scrollable record list */}
      <ul className="overflow-y-auto flex-1 divide-y divide-border">
        {sorted.map((doc) => (
          <li key={doc.id} className="px-4 py-3">
            <p className="text-[11px] text-muted mb-1 tabular-nums">
              {doc.date ? doc.date.slice(0, 4) : '—'}
            </p>
            <p className="text-sm font-medium text-ink leading-snug mb-1 line-clamp-2">
              {doc.title ?? `Record #${doc.id}`}
            </p>
            {doc.summary && (
              <p className="text-xs text-muted leading-snug mb-2 line-clamp-3">
                {doc.summary}
              </p>
            )}
            <Link href={`/record/${doc.id}`} className="text-xs font-semibold">
              View record →
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

// ── Map ───────────────────────────────────────────────────────────────────────

export default function DocumentMap({ pins }: { pins: MapPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const clusterRef = useRef<Layer | null>(null)
  const heatRef = useRef<Layer | null>(null)
  const [mode, setMode] = useState<'pins' | 'heatmap'>('pins')
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null)

  // Read by the async init callback so it always sees the latest value.
  const modeRef = useRef<'pins' | 'heatmap'>('pins')
  useEffect(() => {
    modeRef.current = mode
  })

  // ── Map initialisation ────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    ;(async () => {
      const { default: L } = await import('leaflet')
      // Plugins extend L in place — must follow the leaflet import.
      await import('leaflet.markercluster')
      await import('leaflet.heat')
      if (cancelled || !containerRef.current) return

      const map = L.map(containerRef.current, { center: [51.5, -0.1], zoom: 6 })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      // Clicking the map background closes the sidebar.
      map.on('click', () => setSelectedPin(null))

      // ── Cluster layer ─────────────────────────────────────────────────────

      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction(cluster) {
          const count = cluster.getChildCount()
          let outer: number, inner: number, fontSize: number
          if (count < 10) {
            outer = 32; inner = 22; fontSize = 11
          } else if (count <= 50) {
            outer = 50; inner = 36; fontSize = 13
          } else {
            outer = 70; inner = 52; fontSize = 15
          }
          return L.divIcon({
            className: '',
            iconSize: [outer, outer],
            iconAnchor: [outer / 2, outer / 2],
            html: `<div aria-label="${count} records" style="width:${outer}px;height:${outer}px;background:color-mix(in srgb,var(--color-crimson) 18%,transparent);border-radius:50%;display:flex;align-items:center;justify-content:center;"><div style="width:${inner}px;height:${inner}px;background:var(--color-crimson);border-radius:50%;border:2px solid var(--color-on-accent);box-shadow:0 1px 5px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:var(--color-on-accent);font-weight:700;font-size:${fontSize}px;font-family:Georgia,'Times New Roman',serif;">${count}</div></div>`,
          })
        },
      })

      // Clicking a cluster zooms in (default) and closes any open sidebar.
      clusterGroup.on('clusterclick', () => setSelectedPin(null))

      const markerIcon = L.divIcon({
        className: '',
        html: '<div style="width:11px;height:11px;background:var(--color-crimson);border-radius:50%;border:2px solid var(--color-on-accent);box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>',
        iconSize: [11, 11],
        iconAnchor: [5, 5],
      })

      for (const pin of pins) {
        const count = pin.documents.length
        L.marker([pin.lat, pin.lng], {
          icon: markerIcon,
          title: `${pin.location} – ${count} record${count !== 1 ? 's' : ''}`,
        })
          .on('click', () => setSelectedPin(pin))
          .addTo(clusterGroup)
      }

      // ── Heat layer ────────────────────────────────────────────────────────

      const maxDocs = Math.max(1, ...pins.map((p) => p.documents.length))
      const heatData: [number, number, number][] = pins.map((p) => [
        p.lat,
        p.lng,
        Math.sqrt(p.documents.length / maxDocs),
      ])
      const crimson = getComputedStyle(document.documentElement).getPropertyValue('--color-crimson').trim() || '#7a1f1f'
      const heatLayer = L.heatLayer(heatData, {
        radius: 50,
        blur: 30,
        minOpacity: 0.45,
        // Gradient stops are crimson tints — high end tracks the --color-crimson token
        gradient: { 0.1: '#f5c5c5', 0.5: '#c45a5a', 1.0: crimson },
      }) as Layer

      if (modeRef.current === 'heatmap') {
        map.addLayer(heatLayer)
      } else {
        map.addLayer(clusterGroup)
      }

      mapRef.current = map
      clusterRef.current = clusterGroup
      heatRef.current = heatLayer
    })()

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      clusterRef.current = null
      heatRef.current = null
    }
  }, [pins])

  // ── Mode toggle ───────────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current
    const cluster = clusterRef.current
    const heat = heatRef.current
    if (!map || !cluster || !heat) return

    if (mode === 'pins') {
      if (map.hasLayer(heat)) map.removeLayer(heat)
      if (!map.hasLayer(cluster)) map.addLayer(cluster)
    } else {
      if (map.hasLayer(cluster)) map.removeLayer(cluster)
      if (!map.hasLayer(heat)) map.addLayer(heat)
    }
  }, [mode])

  // ── Map resize on sidebar open / close ────────────────────────────────────

  useEffect(() => {
    // Desktop sidebar width-transition is 200 ms; invalidate after it settles.
    const id = window.setTimeout(() => mapRef.current?.invalidateSize(), 220)
    return () => clearTimeout(id)
  }, [selectedPin])

  // ── Render ────────────────────────────────────────────────────────────────

  const tabBtnClass = (active: boolean) =>
    [
      'px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors',
      active ? 'bg-ink text-paper' : 'bg-paper text-muted hover:bg-tag-bg',
    ].join(' ')

  return (
    <div className="flex h-full">

      {/* ── Map column ─────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-w-0">
        <div ref={containerRef} className="w-full h-full" />

        {/* View toggle */}
        <div className="absolute top-2 right-2 z-[1000] flex rounded border border-border overflow-hidden shadow-sm">
          <button type="button" onClick={() => setMode('pins')} className={tabBtnClass(mode === 'pins')}>
            Pins
          </button>
          <button type="button" onClick={() => setMode('heatmap')} className={tabBtnClass(mode === 'heatmap')}>
            Heatmap
          </button>
        </div>

        {/* Mobile: translucent backdrop — clicking it closes the sidebar */}
        {selectedPin && (
          <div
            className="lg:hidden absolute inset-0 z-[1999] bg-overlay-dim"
            onClick={() => setSelectedPin(null)}
            aria-hidden="true"
          />
        )}

        {/* Mobile sidebar — slides over the map */}
        <aside
          aria-label="Location details"
          aria-hidden={!selectedPin}
          className={[
            'lg:hidden absolute inset-y-0 right-0 z-[2000]',
            'w-72 sm:w-80 flex flex-col',
            'bg-paper border-l border-border',
            'shadow-[-4px_0_16px_rgba(0,0,0,0.12)]',
            'transition-transform duration-200 ease-out',
            selectedPin ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          {selectedPin && (
            <SidebarContent pin={selectedPin} onClose={() => setSelectedPin(null)} />
          )}
        </aside>
      </div>

      {/* ── Desktop sidebar — flex sibling that shrinks the map ────────────── */}
      <aside
        aria-label="Location details"
        aria-hidden={!selectedPin}
        className={[
          'hidden lg:flex flex-col shrink-0',
          'bg-paper border-l border-border',
          'overflow-hidden',
          'transition-[width] duration-200 ease-out',
          selectedPin ? 'w-80' : 'w-0',
        ].join(' ')}
      >
        {/*
          Inner wrapper stays at full width so content doesn't reflow
          while the outer aside is mid-transition.
        */}
        <div className="w-80 h-full flex flex-col">
          {selectedPin && (
            <SidebarContent pin={selectedPin} onClose={() => setSelectedPin(null)} />
          )}
        </div>
      </aside>

    </div>
  )
}
