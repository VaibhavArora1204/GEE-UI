import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { IconMapPin, IconSearch } from '@tabler/icons-react';
import axios from 'axios';
import type { QueryData } from '../App';
import 'leaflet/dist/leaflet.css';

const hints = [
  {
    display: "Rainfall patterns",
    query: "What are the rainfall patterns in my location over the past year?"
  },
  {
    display: "Vegetation health",
    query: "What is the NDVI analysis showing about vegetation health in my area?"
  },
  {
    display: "Air quality",
    query: "What are the air quality index trends in my location?"
  },
  {
    display: "Temperature",
    query: "How have temperature patterns varied in my location over the past year?"
  },
  {
    display: "Soil moisture",
    query: "What are the current soil moisture levels in my location?"
  }
];

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationPicker = ({ onLocationSelect }: LocationPickerProps) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

interface QueryScreenProps {
  onSubmit: (data: QueryData) => void;
}

export default function QueryScreen({ onSubmit }: QueryScreenProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a fallback location
          setLocation({ lat: 51.505, lng: -0.09 });
        }
      );
    }
  }, []);

  const handleSubmit = async () => {
    if (!query.trim() || !location) return;
    
    setIsLoading(true);
    try {
      // Construct the query string with location data
      const queryWithLocation = `${query.trim()} at latitude ${location.lat} and longitude ${location.lng}`;
      
      console.log('Sending API request with query:', queryWithLocation);
      
      // Make the first API call to /initial endpoint
      const response = await axios.post('https://gee-analytics.onrender.com/initial', {
        query: queryWithLocation
      });

      console.log('Received API response:', response.data);

      // Extract the initial response data
      const initialData = response.data.initial;

      console.log('Calling onSubmit with data:', {
        query: query.trim(),
        location,
        initialResponse: initialData
      });

      // Pass the data to parent component
      onSubmit({ 
        query: query.trim(), 
        location,
        initialResponse: initialData 
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      await handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      {/* Location Display */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 mb-8 flex items-center gap-4"
      >
        <IconMapPin className="text-nature-600" />
        <span className="text-nature-800">
          {location
            ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
            : 'Fetching location...'}
        </span>
        <button
          onClick={() => setIsMapOpen(true)}
          className="btn-secondary text-sm"
        >
          Change Location
        </button>
      </motion.div>

      {/* Query Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-2xl"
      >
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your environmental query..."
            className="input-primary text-lg"
          />
          <button
            onClick={handleSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <IconSearch className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Hint Tags */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-2 justify-center mt-6"
      >
        {hints.map((hint, index) => (
          <motion.button
            key={hint.display}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            onClick={() => setQuery(hint.query)}
            className="hint-tag"
          >
            {hint.display}
          </motion.button>
        ))}
      </motion.div>

      {/* Map Modal */}
      {isMapOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="glass-card w-full max-w-3xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif text-nature-800">Select Location</h2>
              <button
                onClick={() => setIsMapOpen(false)}
                className="text-nature-600 hover:text-nature-800 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="h-[400px] rounded-xl overflow-hidden">
              <MapContainer
                center={location || [51.505, -0.09]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {location && <Marker position={[location.lat, location.lng]} />}
                <LocationPicker
                  onLocationSelect={(lat, lng) => {
                    setLocation({ lat, lng });
                    setIsMapOpen(false);
                  }}
                />
              </MapContainer>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
} 
