import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import WeatherCard from "../components/WeatherCard";
import SearchBox from "../components/SearchBox";
import RiwayatList from "../components/RiwayatList";

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pemantau Cuaca</Text>
      
      <View style={styles.section}>
        <SearchBox onSearch={handleCari} />
      </View>

      <View style={styles.section}>
        <WeatherCard kota={kotaAktif} suhu={29} tingkatAQI="BAIK" />
      </View>

      <View style={styles.section}>
        <RiwayatList daftarKota={riwayat} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 90, // Menghindari judul tertutup navbar Expo di atas
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    width: "100%",
  },
});