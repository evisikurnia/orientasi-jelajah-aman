// src/services/favoritStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KotaFavorit } from "../types/favorit";

const KUNCI_PENYIMPANAN = "@jelajah_aman:favorit";

export async function ambilSemuaFavorit(): Promise<KotaFavorit[]> {
    const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);
    const daftar: KotaFavorit[] = json ? JSON.parse(json) : [];

    // Bersihkan duplikat lama (id dibandingkan sebagai string)
    const sudahDilihat = new Set<string>();
    return daftar.filter((k) => {
        const kunci = String(k.id);
        if (sudahDilihat.has(kunci)) return false;
        sudahDilihat.add(kunci);
        return true;
    });
}

export async function tambahFavorit(kota: KotaFavorit): Promise<void> {
    const daftar = await ambilSemuaFavorit();
    const sudahAda = daftar.some((k) => String(k.id) === String(kota.id));
    if (sudahAda) return;

    const daftarBaru = [...daftar, { ...kota, id: Number(kota.id) }];
    await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru));
}

export async function hapusFavorit(id: number | string): Promise<void> {
    const daftar = await ambilSemuaFavorit();
    const daftarBaru = daftar.filter((k) => String(k.id) !== String(id));
    await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru));
} 