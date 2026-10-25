// src/components/SearchBox.tsx
import { useState } from "react";
import { View, TextInput } from "react-native";

import { useTheme } from "../context/ThemeContext";

interface SearchBoxProps {
  onCari: (teks: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const { colors } = useTheme();
  const [teks, setTeks] = useState("");

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru); // kirim setiap perubahan, debounce diatur di pemanggilnya
  }

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={colors.subtext}
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          borderWidth: 1,
          padding: 8,
          borderRadius: 8,
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text,
        }}
      />
    </View>
  );
}