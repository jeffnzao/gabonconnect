"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

export interface DemoMarker {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const DEMO_MARKERS: DemoMarker[] = [
  { name: "Libreville", country: "Gabon", latitude: 0.4162, longitude: 9.4673 },
  { name: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522 },
  { name: "Brussels", country: "Belgique", latitude: 50.8503, longitude: 4.3517 },
  { name: "Montreal", country: "Canada", latitude: 45.5019, longitude: -73.5674 },
  { name: "New York", country: "États-Unis", latitude: 40.7128, longitude: -74.006 },
  { name: "Dakar", country: "Sénégal", latitude: 14.7167, longitude: -17.4677 },
];

export default function WorldMapInner() {
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
      {DEMO_MARKERS.map((marker) => (
        <Marker
          key={marker.name}
          position={[marker.latitude, marker.longitude]}
          icon={markerIcon}
        >
          <Popup>
            <span className="font-medium">{marker.name}</span>
            <br />
            {marker.country}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}