import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, ArrowRight, Check } from 'lucide-react';

interface Hotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  productId: string;
  productName: string;
  frameName: string;
  price: number;
  thumbnail: string;
}

interface RoomScene {
  id: string;
  name: string;
  description: string;
  image: string;
  hotspots: Hotspot[];
}

const ROOM_SCENES: RoomScene[] = [
  {
    id: 'living-room',
    name: 'Nordic Light Living Room',
    description: 'A serene gallery wall combining architectural monochrome with botanical depth in natural oak frames.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=85',
    hotspots: [
      {
        id: 'spot-1',
        xPercent: 38,
        yPercent: 32,
        productId: 'prod-01',
        productName: 'Bauhaus Form & Space No. 04',
        frameName: 'Solid Natural Oak',
        price: 28,
        thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: 'spot-2',
        xPercent: 62,
        yPercent: 36,
        productId: 'prod-02',
        productName: 'Eucalyptus Herbarium Study',
        frameName: 'Solid Natural Oak',
        price: 34,
        thumbnail: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=300&q=80'
      }
    ]
  },
  {
    id: 'studio',
    name: 'Contemporary Design Studio',
    description: 'Dramatic architectural contrast and Japanese indigo serenity on smooth painted concrete.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    hotspots: [
      {
        id: 'spot-3',
        xPercent: 44,
        yPercent: 30,
        productId: 'prod-03',
        productName: 'Mount Fuji Indigo Mist',
        frameName: 'Matte Black Aluminum',
        price: 35,
        thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: 'spot-4',
        xPercent: 68,
        yPercent: 40,
        productId: 'prod-04',
        productName: 'Spiral Geometry & Shadow',
        frameName: 'Matte Black Aluminum',
        price: 38,
        thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80'
      }
    ]
  }
];

export const WallInspiration: React.FC = () => {
  const { setSelectedProductId, setCurrentView } = useStore();
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>('spot-1');

  const currentRoom = ROOM_SCENES[activeRoomIdx];

  const handleNavigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
  };

  return (
    <section className="py-16 sm:py-24 bg-[#f3eee7] border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
            Interior In-Situ
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950 font-normal mt-1 mb-3">
            Wall Art Inspiration & Gallery Sets
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Visualize how curated poster pairs look together in real homes. Click any glowing hotspot on the wall to explore and shop the print.
          </p>

          {/* Scene Selector Pills */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {ROOM_SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => {
                  setActiveRoomIdx(idx);
                  setActiveHotspotId(scene.hotspots[0]?.id || null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  activeRoomIdx === idx
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                }`}
              >
                {scene.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Wall Visualizer */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-300 bg-stone-900">
          {/* Main Room Image */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full max-h-[580px] overflow-hidden">
            <img
              src={currentRoom.image}
              alt={currentRoom.name}
              className="w-full h-full object-cover brightness-95"
              referrerPolicy="no-referrer"
            />

            {/* Scrim */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />

            {/* Hotspot Markers */}
            {currentRoom.hotspots.map((spot) => {
              const isActive = activeHotspotId === spot.id;
              return (
                <div
                  key={spot.id}
                  style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  {/* Glowing Hotspot Button */}
                  <button
                    type="button"
                    onClick={() => setActiveHotspotId(isActive ? null : spot.id)}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 scale-125 ring-4 ring-amber-400/40'
                        : 'bg-stone-950/80 text-white hover:bg-stone-950 hover:scale-110'
                    }`}
                    aria-label={`View ${spot.productName}`}
                  >
                    {isActive ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span className="absolute -inset-1 rounded-full border border-white/60 animate-ping pointer-events-none opacity-50" />
                  </button>

                  {/* Hotspot Floating Tooltip */}
                  {isActive && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-stone-200 p-3 z-40 animate-in fade-in duration-200">
                      <div className="flex gap-3 items-center">
                        <img
                          src={spot.thumbnail}
                          alt={spot.productName}
                          className="w-12 h-16 object-cover rounded shadow-sm shrink-0 border border-stone-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-xs font-semibold text-stone-950 truncate">
                            {spot.productName}
                          </h4>
                          <p className="text-[11px] text-stone-500 truncate">{spot.frameName}</p>
                          <div className="text-xs font-bold text-stone-900 mt-0.5">
                            From ${spot.price}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleNavigateToProduct(spot.productId)}
                        className="mt-2.5 w-full py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>View Print & Customize</span>
                        <ArrowRight className="w-3 h-3 text-amber-400" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Bar Details */}
          <div className="bg-stone-900 text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-stone-300">
              💡 <strong>Design tip:</strong> Hang poster centers at eye level (~57 inches / 145 cm from floor).
            </span>
            <button
              type="button"
              onClick={() => setCurrentView('shop')}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Explore all framed print pairings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
