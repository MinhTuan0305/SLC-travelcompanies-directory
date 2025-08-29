"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface CompanyMapProps {
  address: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const formatAddress = (address: string) => {
  // Tối ưu format cho UK address
  return address
    .replace(/\s+/g, ' ')
    .replace(/,,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/,$/, '')
    .trim();
};

const getPostcodeCoordinates = async (postcode: string) => {
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`);
    const data = await res.json();
    if (data.status === 200 && data.result) {
      return {
        lat: data.result.latitude,
        lng: data.result.longitude
      };
    }
  } catch (error) {
    console.error("Postcode API error:", error);
  }
  return null;
};

// (removed unused getGoogleMapsUrl)

export default function CompanyMap({ address }: CompanyMapProps) {

  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoords() {
      if (!address) {
        setError("No address provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 1. Thử tìm postcode trong địa chỉ
        const postcodeMatch = address.match(/[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}/i);
        if (postcodeMatch) {
          const postcodeCords = await getPostcodeCoordinates(postcodeMatch[0]);
          if (postcodeCords) {
            setCoords(postcodeCords);
            setIsLoading(false);
            return;
          }
        }

        // 2. Nếu không có postcode hoặc không tìm được, thử với Nominatim
        const formattedAddr = formatAddress(address);
        const variations = [
          `${formattedAddr}, United Kingdom`,
          `${formattedAddr}, England, UK`,
          formattedAddr
        ];

        for (const addressVar of variations) {
          // Thêm delay để tránh rate limit
          await new Promise(resolve => setTimeout(resolve, 1000));

          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressVar)}&countrycodes=gb&limit=1`,
            {
              headers: {
                "User-Agent": "UK-Agency-Directory/1.0",
                "Accept-Language": "en-GB"
              }
            }
          );

          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setCoords({
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
              });
              setIsLoading(false);
              return;
            }
          }
        }

        // Nếu không tìm được, set error
        setError("Location not found");
      } catch (err) {
        console.error("Geocoding error:", err);
        setError("Failed to load location");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCoords();
  }, [address]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Unable to load map location</p>
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
        <p className="text-gray-500">Unable to load map for this address</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border">
      <MapContainer
        center={[coords?.lat || 51.5074, coords?.lng || -0.1278]}
        zoom={coords ? 15 : 5}
        style={{ height: "400px", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {coords && (
          <Marker position={[coords.lat, coords.lng]} icon={customIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Location:</strong><br />
                {address}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}