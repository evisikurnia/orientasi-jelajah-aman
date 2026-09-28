// src/app/(tabs)/index.tsx
import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasil, setHasil] = useState<HasilGeocoding[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  
  // 2. Ubah delay debounce dari 500ms menjadi 800ms
  const teksTertunda = useDebounce(teksCari, 800);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasil([]);
      setPesanError(null);
      return;
    }
    ambilData(teksTertunda);
  }, [teksTertunda]);

  async function ambilData(nama: string) {
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await cariKota(nama);
      setHasil(data);
    } catch (err) {
      setPesanError("Gagal mengambil data. Periksa koneksi internet Anda.");
    } finally {
      setSedangMemuat(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <SearchBox onCari={setTeksCari} />
      
      {/* Kondisi 1: Memuat Data */}
      {sedangMemuat && <ActivityIndicator size="large" />}
      
      {/* Kondisi 2: Pesan Error dengan accessibilityLabel */}
      {pesanError && (
        <View style={{ alignItems: "center", gap: 8 }}>
          <Text 
            accessibilityLabel={`Pesan Kesalahan: ${pesanError}`}
            style={{ color: "red", textAlign: "center" }}
          >
            {pesanError}
          </Text>
          <Button title="Coba Lagi" onPress={() => ambilData(teksTertunda)} />
        </View>
      )}

      {/* Kondisi 3: Pesan Kosong dengan accessibilityLabel */}
      {!sedangMemuat && !pesanError && teksTertunda.length > 0 && hasil.length === 0 && (
        <Text 
          accessibilityLabel={`Pesan Kosong: Kota ${teksTertunda} tidak ditemukan`}
          style={{ textAlign: "center", color: "#666666" }}
        >
          Kota "{teksTertunda}" tidak ditemukan
        </Text>
      )}

      {/* Kondisi 4: Hasil Ditemukan */}
      {!sedangMemuat && !pesanError && hasil.length > 0 && (
        <View style={{ gap: 8 }}>
          {/* 1. Indikator jumlah hasil */}
          <Text style={{ fontWeight: "bold", color: "#666666" }}>
            Ditemukan {hasil.length} kota
          </Text>

          {hasil.map((kota) => (
            <WeatherCard key={kota.id} kota={kota.name} suhu={29} tingkatAQI="BAIK" />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}