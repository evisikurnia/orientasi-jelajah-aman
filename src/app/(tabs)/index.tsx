// src/app/(tabs)/index.tsx
import { router, useFocusEffect } from "expo-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
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
import { ambilSemuaFavorit, tambahFavorit } from "../../services/favoritStorage";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";
import { KotaFavorit } from "../../types/favorit";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);

  // Status Cache & Offline Data
  const [kotaTersimpan, setKotaTersimpan] = useState<KotaFavorit[]>([]);
  const [statusData, setStatusData] = useState<{
    judul: string;
    sub: string;
    tipe: "online" | "segar" | "usang";
  } | null>(null);

  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);

  // Muat daftar offline SQLite
  const muatDataOffline = useCallback(async () => {
    try {
      const daftar = await ambilSemuaFavorit();
      setKotaTersimpan(daftar);
    } catch (e) {
      setKotaTersimpan([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatDataOffline();
    }, [muatDataOffline])
  );

  // Pencarian Geocoding
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }

    setPesanError(null);
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  // Cek Status Favorit
  useFocusEffect(
    useCallback(() => {
      async function cekFavorit() {
        if (kotaTerpilih) {
          const daftar = await ambilSemuaFavorit();
          const ada = daftar.some((item) => String(item.id) === String(kotaTerpilih.id));
          setSudahFavorit(ada);
        } else {
          setSudahFavorit(false);
        }
      }
      cekFavorit();
    }, [kotaTerpilih])
  );

  // Fungsi Ambil Data Cuaca
  async function pilihKota(kota: HasilGeocoding, dariOffline = false) {
    setKotaTerpilih(kota);

    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const [dataCuaca, dataAQI] = await Promise.all([
        ambilCuaca(kota.latitude, kota.longitude),
        ambilKualitasUdara(kota.latitude, kota.longitude),
      ]);

      if (idSaatIni !== requestIdRef.current) return;

      setCuaca(dataCuaca);
      setKualitasUdara(dataAQI);

      setStatusData({
        judul: dariOffline ? "Data tersimpan (masih segar)" : "Data terbaru dari internet",
        sub: "Diperbarui baru saja",
        tipe: "online",
      });

      if (kota.id !== -1) {
        await tambahFavorit({
          id: (kota.id),
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        });
        await muatDataOffline();
      }
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;

      if (kotaTersimpan.length > 0) {
        setStatusData({
          judul: "Mode offline - data tersimpan mungkin sudah usang",
          sub: "Diperbarui beberapa menit lalu",
          tipe: "usang",
        });
      } else {
        setPesanError("Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi.");
      }
    } finally {
      if (idSaatIni === requestIdRef.current) {
        setSedangMemuat(false);
      }
    }
  }

  // Fungsi GPS Location
  async function gunakanLokasiSaatIni() {
    setPesanError(null);
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif.");
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
      setPesanLokasi("Gagal mengambil posisi GPS.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Input Box Pencarian */}
        <SearchBox onCari={setTeksCari} />

        {/* Tombol GUNAKAN LOKASI SAAT INI */}
        <TouchableOpacity style={styles.btnBlue} onPress={gunakanLokasiSaatIni}>
          <Text style={styles.btnBlueText}>GUNAKAN LOKASI SAAT INI</Text>
        </TouchableOpacity>

        {pesanLokasi && <Text style={styles.errorText}>{pesanLokasi}</Text>}

        {/* Indikator Jumlah Kota Hasil Pencarian */}
        {hasilPencarian.length > 0 && (
          <Text style={styles.foundText}>Ditemukan {hasilPencarian.length} kota</Text>
        )}

        {/* List Hasil Pencarian Kota */}
        {hasilPencarian.map((kota, idx) => (
          <TouchableOpacity
            key={`search-${kota.id}-${idx}`}
            style={styles.cityItem}
            onPress={() => pilihKota(kota)}
          >
            <Text style={styles.cityNameText}>{kota.name}</Text>
          </TouchableOpacity>
        ))}

        {/* Daftar Tersimpan di perangkat (Offline SQLite) */}
        {kotaTersimpan.length > 0 && (
          <View style={{ marginTop: 4 }}>
            <Text style={styles.sectionTitle}>Tersimpan di perangkat (bisa dibuka offline)</Text>
            {kotaTersimpan.map((item, index) => (
              <TouchableOpacity
                key={`offline-${item.id}-${index}`}
                style={styles.cityItem}
                onPress={() =>
                  pilihKota(
                    {
                      id: Number(item.id),
                      name: item.nama,
                      latitude: item.latitude,
                      longitude: item.longitude,
                      country: "",
                    },
                    true
                  )
                }
              >
                <Text style={styles.cityNameText}>{item.nama}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator style={{ marginVertical: 16 }} size="large" color="#2196F3" />}

        {/* Error State saat Offline & Kosong */}
        {pesanError && !sedangMemuat && (
          <View style={{ gap: 12, marginVertical: 8 }}>
            <Text style={styles.errorText}>{pesanError}</Text>
            <TouchableOpacity style={styles.btnBlue} onPress={() => kotaTerpilih && pilihKota(kotaTerpilih)}>
              <Text style={styles.btnBlueText}>COBA LAGI</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Banner Cache (Hijau Segar / Oranye Usang) */}
        {statusData && cuaca && !sedangMemuat && !pesanError && (
          <View
            style={[
              styles.cacheBanner,
              statusData.tipe === "usang" ? styles.bannerUsang : styles.bannerSegar,
            ]}
          >
            <Text
              style={[
                styles.cacheTitle,
                statusData.tipe === "usang" ? styles.textUsangTitle : styles.textSegarTitle,
              ]}
            >
              {statusData.judul}
            </Text>
            <Text
              style={[
                styles.cacheSub,
                statusData.tipe === "usang" ? styles.textUsangSub : styles.textSegarSub,
              ]}
            >
              {statusData.sub}
            </Text>
          </View>
        )}

        {/* Tampilan Kartu Cuaca */}
        {cuaca && kualitasUdara && kotaTerpilih && !sedangMemuat && !pesanError && (
          <View style={{ gap: 12 }}>
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(kualitasUdara.indeksAQI)}
            />

            <Text style={styles.infoText}>
              Kondisi: {labelKodeCuaca(cuaca.saatIni.kodeCuaca)} • Angin {cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            {/* Tombol Perbarui Sekarang (Skenario Offline Usang) */}
            {statusData?.tipe === "usang" && (
              <TouchableOpacity style={styles.btnBlue} onPress={() => pilihKota(kotaTerpilih)}>
                <Text style={styles.btnBlueText}>PERBARUI SEKARANG</Text>
              </TouchableOpacity>
            )}

            {/* Tombol TAMBAHKAN KE FAVORIT */}
            <TouchableOpacity
              style={[styles.btnBlue, sudahFavorit && styles.btnDisabled]}
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
            >
              <Text style={styles.btnBlueText}>
                {sudahFavorit ? "SUDAH DI FAVORIT" : "TAMBAHKAN KE FAVORIT"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.boldText}>
              Hari ini: {cuaca.harian.suhuMaksimal[0]}°C / {cuaca.harian.suhuMinimal[0]}°C
            </Text>
          </View>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
    gap: 10,
  },
  btnBlue: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  btnDisabled: {
    backgroundColor: "#cccccc",
  },
  btnBlueText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  foundText: {
    fontSize: 14,
    color: "#333333",
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000000",
    marginVertical: 6,
  },
  cityItem: {
    paddingVertical: 4,
  },
  cityNameText: {
    fontSize: 15,
    color: "#222222",
  },
  cacheBanner: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  bannerSegar: {
    backgroundColor: "#e8f5e9",
  },
  bannerUsang: {
    backgroundColor: "#fff3e0",
  },
  cacheTitle: {
    fontWeight: "bold",
    fontSize: 13,
  },
  textSegarTitle: {
    color: "#2e7d32",
  },
  textUsangTitle: {
    color: "#e65100",
  },
  cacheSub: {
    fontSize: 12,
  },
  textSegarSub: {
    color: "#4caf50",
  },
  textUsangSub: {
    color: "#f57c00",
  },
  infoText: {
    fontSize: 13,
    color: "#777777",
  },
  boldText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222222",
  },
  errorText: {
    color: "#333333",
    fontSize: 14,
    lineHeight: 20,
  },
});