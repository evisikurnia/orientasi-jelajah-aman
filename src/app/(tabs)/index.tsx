// src/app/(tabs)/index.tsx
import { router, useFocusEffect } from "expo-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { View, Text, ActivityIndicator, Button, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuaca } from "../../services/weatherService";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);

  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  // Status Cek Duplikat Favorit
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const teksTertunda = useDebounce(teksCari, 500);
  // Pencegah race condition
  const requestIdRef = useRef(0);

  // 1. Reset pesan error & cari kota saat input berubah
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }

    // Bersihkan error lama agar tidak nyangkut di layar
    setPesanError(null);

    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  // 2. Cek apakah kota terpilih sudah ada di favorit
  useFocusEffect(
    useCallback(() => {
      async function cekStatusFavorit() {
        if (kotaTerpilih) {
          const daftarFavorit = await ambilSemuaFavorit();
          const ada = daftarFavorit.some(
            (item) => String(item.id) === String(kotaTerpilih.id)
          );
          setSudahFavorit(ada);
        } else {
          setSudahFavorit(false);
        }
      }
      cekStatusFavorit();
    }, [kotaTerpilih])
  );

  // 3. Fungsi memuat data cuaca kota
  async function pilihKota(kota: HasilGeocoding) {
    setKotaTerpilih(kota);
    setHasilPencarian([]); // Sembunyikan rekomendasi pencarian setelah dipilih

    const idSaatIni = ++requestIdRef.current;

    setSedangMemuat(true);
    setPesanError(null); // Reset pesan error sebelum fetch baru

    try {
      const [dataCuaca, dataAQI] = await Promise.all([
        ambilCuaca(kota.latitude, kota.longitude),
        ambilKualitasUdara(kota.latitude, kota.longitude),
      ]);

      if (idSaatIni !== requestIdRef.current) return;

      setCuaca(dataCuaca);
      setKualitasUdara(dataAQI);
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;

      setPesanError(
        "Gagal memuat data cuaca. Periksa koneksi internet Anda."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) {
        setSedangMemuat(false);
      }
    }
  }

  // 4. Fungsi tombol lokasi
  async function gunakanLokasiSaatIni() {
    setPesanError(null); // Reset error
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
      return;
    }

    setPesanLokasi(null);
    try {
      const koordinat = await ambilKoordinatSaatIni();
      pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch (error) {
      setPesanLokasi("Gagal mengambil posisi GPS. Coba lagi.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      {/* Input Pencarian */}
      <SearchBox onCari={setTeksCari} />

      {/* Tombol GPS */}
      <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
      {pesanLokasi && (
        <Text style={{ color: "#d9534f", textAlign: "center" }}>
          {pesanLokasi}
        </Text>
      )}

      {/* Daftar Rekomendasi Hasil Pencarian */}
      {hasilPencarian.length > 0 && (
        <View style={{ backgroundColor: "#f0f0f0", borderRadius: 8, padding: 8 }}>
          {hasilPencarian.map((kota) => (
            <TouchableOpacity
              key={kota.id}
              style={{ paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#ccc" }}
              onPress={() => pilihKota(kota)}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>{kota.name}, {kota.country}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Indikator Loading */}
      {sedangMemuat && <ActivityIndicator size="large" color="#0000ff" />}

      {/* Pesan Error Jika Fetch Gagal */}
      {pesanError && !sedangMemuat && (
        <View style={{ alignItems: "center", gap: 8, marginVertical: 12 }}>
          <Text style={{ color: "#d9534f", textAlign: "center" }}>
            {pesanError}
          </Text>
          <Button
            title="Coba Lagi"
            onPress={() => kotaTerpilih && pilihKota(kotaTerpilih)}
          />
        </View>
      )}

      {/* Tampilan Kartu Cuaca & AQI */}
      {cuaca && kualitasUdara && kotaTerpilih && !sedangMemuat && !pesanError && (
        <>
          <WeatherCard
            kota={kotaTerpilih.name}
            suhu={cuaca.saatIni.suhu}
            tingkatAQI={konversiTingkatAQI(kualitasUdara.indeksAQI)}
          />

          <Button
            title={sudahFavorit ? "Sudah di Favorit" : "Tambahkan ke Favorit"}
            disabled={sudahFavorit}
            onPress={() =>
              router.push({
                pathname: "/tambah-favorit",
                params: {
                  id: String(kotaTerpilih.id),
                  nama: kotaTerpilih.name,
                  lat: String(kotaTerpilih.latitude),
                  lon: String(kotaTerpilih.longitude),
                },
              })
            }
          />

          {/* Suhu Max/Min */}
          <Text style={{ fontSize: 13, color: "#555555" }}>
            Suhu Hari Ini: Max {cuaca.harian.suhuMaksimal[0]}°C / Min {cuaca.harian.suhuMinimal[0]}°C
          </Text>

          {/* Kondisi & Angin */}
          <Text style={{ fontSize: 12, color: "#888888" }}>
            Kondisi: {labelKodeCuaca(cuaca.saatIni.kodeCuaca)} • Angin {cuaca.saatIni.kecepatanAngin} km/j
          </Text>

          {/* Polutan PM2.5 & PM10 */}
          <Text style={{ fontSize: 12, color: "#888888" }}>
            PM2.5: {kualitasUdara.pm25} µg/m³ • PM10: {kualitasUdara.pm10} µg/m³
          </Text>
        </>
      )}

      {/* Atribusi Open-Meteo */}
      <AtribusiCuaca />
    </SafeAreaView>
  );
}