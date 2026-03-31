import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom colored marker icons
export function createIcon(color = '#6750A4') {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

export function createHubIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #6750A4, #D0BCFF);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 3px 12px rgba(103,80,164,0.4);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 11px; font-weight: 800;
    ">HUB</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

export function createVehicleIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 30px; height: 20px;
      background: #625B71;
      border: 2px solid white;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 9px; font-weight: 700;
    ">EV</div>`,
    iconSize: [30, 20],
    iconAnchor: [15, 10],
    popupAnchor: [0, -12],
  })
}

export { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, L }
