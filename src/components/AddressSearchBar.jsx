import React, { useState } from "react";
import { Search, Loader2, X } from "lucide-react";

export default function AddressSearchBar({ onResult }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        onResult(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name);
      } else {
        setError("Endereço não encontrado");
      }
    } catch {
      setError("Erro na busca");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Digite o endereço para verificar viabilidade..."
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-white text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#00C7D9] focus:border-transparent"
      />
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#00C7D9]" />
      ) : query ? (
        <button
          type="button"
          onClick={() => { setQuery(""); setError(""); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A2E]"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
      {error && <p className="absolute top-full left-0 mt-1 text-xs text-red-500 z-10">{error}</p>}
    </form>
  );
}
