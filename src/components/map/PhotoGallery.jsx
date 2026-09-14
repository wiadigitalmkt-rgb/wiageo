import React, { useState } from "react";
import { X } from "lucide-react";

export default function PhotoGallery({ fotos = [], title = "Fotos" }) {
  const [lightbox, setLightbox] = useState(null);
  if (!fotos.length) return null;
  return (
    <div>
      <p className="text-[11px] font-bold uppercase text-[#9CA3AF] mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {fotos.map((url) => (
          <button
            key={url}
            onClick={() => setLightbox(url)}
            className="w-16 h-16 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-[#00C7D9] transition-all"
          >
            <img src={url} alt="foto" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox}
            alt="foto ampliada"
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}