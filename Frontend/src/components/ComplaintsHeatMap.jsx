import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useEffect } from "react";
import L from "leaflet";

const complaintPoints = [
  [17.6599, 75.9064, 4],
  [17.6599, 75.9064, 3],

  [17.6648, 75.9210, 3],
  [17.6648, 75.9210, 2],

  [17.6656, 75.9135, 2],
  [17.6400, 75.9200, 2],

  [17.6750, 75.8900, 1],
  [17.6500, 75.8800, 1]
];

function HeatLayer() {
  const map = useMap();

  useEffect(() => {
    const heatLayer = L.heatLayer(complaintPoints, {
      radius: 35,
      blur: 25,
      maxZoom: 13
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map]);

  return null;
}

function ComplaintsHeatMap() {
  return (
    <div style={{ height: "400px", width: "100%" }}>
      <MapContainer
        center={[17.6599, 75.9064]}   // Solapur center
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <HeatLayer />
      </MapContainer>
    </div>
  );
}

export default ComplaintsHeatMap;
