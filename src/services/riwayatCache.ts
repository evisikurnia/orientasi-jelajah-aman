import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataCuacaLengkap, DataKualitasUdara } from "../types/weather";

export type ItemRiwayat = {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
};

export type CacheCuaca = {
  cuaca: DataCuacaLengkap;
  kualitasUdara: DataKualitasUdara;
  disimpanPada: number;
};

const KUNCI_RIWAYAT = "riwayat_pencarian";
const MAKS_RIWAYAT = 10;
const kunciCache = (id: number | string) => `cache_cuaca:${id}`;

// ---------- RIWAYAT ----------
export async function ambilRiwayat(): Promise<ItemRiwayat[]> {
  try {
    const raw = await AsyncStorage.getItem(KUNCI_RIWAYAT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function tambahRiwayat(item: ItemRiwayat) {
  const daftar = await ambilRiwayat();
  // hapus duplikat, taruh paling atas, batasi 10
  const baru = [item, ...daftar.filter((d) => d.id !== item.id)].slice(0, MAKS_RIWAYAT);
  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(baru));
}

// ---------- CACHE CUACA ----------
export async function simpanCache(
  id: number,
  cuaca: DataCuacaLengkap,
  kualitasUdara: DataKualitasUdara
) {
  const data: CacheCuaca = { cuaca, kualitasUdara, disimpanPada: Date.now() };
  await AsyncStorage.setItem(kunciCache(id), JSON.stringify(data));
}

export async function ambilCache(id: number | string): Promise<CacheCuaca | null> {
  try {
    const raw = await AsyncStorage.getItem(kunciCache(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function hapusSemuaCacheCuaca() {
  const semuaKunci = await AsyncStorage.getAllKeys();
  const target = semuaKunci.filter((k) => k.startsWith("cache_cuaca:"));
  if (target.length > 0) await AsyncStorage.multiRemove(target);
}