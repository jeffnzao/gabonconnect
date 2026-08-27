"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DiasporaMapMarker } from "@/lib/diaspora-map";

// Les images d'icônes par défaut de Leaflet ne se résolvent pas correctement
// une fois passées par le bundler Next.js : on pointe explicitement vers le
// CDN unpkg (même version que la dépendance "leaflet" installée).
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function WorldMapInner({ markers, detailsLabel }: { markers: DiasporaMapMarker[]; detailsLabel: string }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      scrollWheelZoom={false}
      className="h-[420px] w-full rounded-2xl md:h-[520px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker
          key={marker.name}
          position={[marker.latitude, marker.longitude]}
          icon={markerIcon}
        >
          <Popup>
            <span className="font-medium">{marker.name}</span>
            <br />
            {marker.city}, {marker.country}
            <br />
            <a href={marker.href} className="text-emerald-700 underline">{detailsLabel}</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}