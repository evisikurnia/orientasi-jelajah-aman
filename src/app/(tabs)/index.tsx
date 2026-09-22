// app/(tabs)/index.tsx
import React, { useState, useEffect } from "react";
import { ScrollView, useWindowDimensions, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import WeatherCard from "../../components/WeatherCard";
import SearchBox from "../../components/SearchBox";
import RiwayatList from "../../components/RiwayatList";
import IndikatorAQI from "../../components/IndikatorAQI";

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);
  
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  useEffect(() => {
    console.log("Kota aktif berubah menjadi:", kotaAktif);
  }, [kotaAktif]);

  function handleCari(kota: string) {
    if (!kota) return;
    setKotaAktif(kota);
    if (!riwayat.includes(kota)) {
      setRiwayat([...riwayat, kota]);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { padding: isTablet ? 32 : 16 },
        ]}
      >
        <SearchBox onCari={handleCari} />
        <WeatherCard kota={kotaAktif} suhu={29} tingkatAQI="BAIK" />
        <IndikatorAQI
          kota={kotaAktif}
          indeksAQI={42}
          tingkat="BAIK"
          diperbaruiPada="10:00 WIB"
        />
        <RiwayatList daftarKota={riwayat} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    gap: 16,
  },
});