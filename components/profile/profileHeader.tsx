import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/app";

interface ProfileHeaderProps {
  title: string;
  showMenu?: boolean;
  onMenuPress?: () => void;
}

export default function ProfileHeader({ title, showMenu = false, onMenuPress }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backButton}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {showMenu ? (
        <TouchableOpacity onPress={onMenuPress}>
          <Text style={styles.menuButton}>☰</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.accent,
  },
  backButton: {
    fontSize: 24,
    color: COLORS.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  menuButton: {
    fontSize: 24,
    color: COLORS.white,
  },
});
