// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const lightColors = {
  background: "#F5F7FA",
  card: "#FFFFFF",
  text: "#1A1A1A",
  subtext: "#6B7280",
  border: "#E5E7EB",
  primary: "#2196F3",
  danger: "#DC2626",
  disabled: "#CCCCCC",
  successBg: "#E8F5E9",
  successText: "#2E7D32",
  warnBg: "#FFF3E0",
  warnText: "#E65100",
};

const darkColors = {
  background: "#0F172A",
  card: "#1E293B",
  text: "#F1F5F9",
  subtext: "#94A3B8",
  border: "#334155",
  primary: "#2196F3",
  danger: "#F87171",
  disabled: "#475569",
  successBg: "#14532D",
  successText: "#86EFAC",
  warnBg: "#7C2D12",
  warnText: "#FDBA74",
};

export type OpsiTema = "light" | "dark" | "system";
export type ThemeMode = OpsiTema;

interface ThemeContextType {
  modeTema: OpsiTema;
  isDark: boolean;
  setModeTema: (mode: OpsiTema) => void;
  colors: typeof lightColors;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useSystemColorScheme();
  const [modeTema, setModeTemaState] = useState<OpsiTema>("system");

  useEffect(() => {
    AsyncStorage.getItem("@mode_tema").then((val) => {
      if (val) setModeTemaState(val as OpsiTema);
    });
  }, []);

  const setModeTema = (mode: OpsiTema) => {
    setModeTemaState(mode);
    AsyncStorage.setItem("@mode_tema", mode);
  };

  const isDark = modeTema === "system" ? systemScheme === "dark" : modeTema === "dark";
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ modeTema, isDark, setModeTema, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);