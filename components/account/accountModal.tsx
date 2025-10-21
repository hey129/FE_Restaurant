import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { COLORS } from "../../constants/app";
import { supabase } from "../../services/supabaseClient";

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
}

function useSlideInModal(width: number, duration = 300) {
  const translateX = useRef(new Animated.Value(width)).current;

  const open = () => Animated.timing(translateX, { toValue: 0, duration, useNativeDriver: true }).start();
  const close = (callback?: () => void) =>
    Animated.timing(translateX, { toValue: width, duration: duration * 0.8, useNativeDriver: true }).start(() => {
      callback?.();
    });

  return { translateX, open, close };
}

export default function AccountModal({ visible, onClose }: AccountModalProps) {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const { translateX, open, close } = useSlideInModal(width);

  useEffect(() => {
    if (visible) open();
  }, [visible, open]);

  const handleLogout = async () => {
    close(() => {
      onClose();
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
          router.replace("/auth/_welcome");
        } catch (error) {
          console.error("Logout error:", error);
        }
      }, 100);
    });
  };

  const navigateTo = (path: string) => {
    close(() => {
      onClose();
      setTimeout(() => {
        router.push(path as any);
      }, 100);
    });
  };

  const menuItems = [
    {
      label: "Hồ sơ của tôi",
      onPress: () => navigateTo("/(tabs)/profile"),
    },
    {
      label: "Sửa hồ sơ",
      onPress: () => navigateTo("/screen/editProfile"),
    },
    {
      label: "Đơn hàng của tôi",
      onPress: () => navigateTo("/(tabs)/orders"),
    },
    {
      label: "Đổi mật khẩu",
      onPress: () => navigateTo("/screen/changePassword"),
    },
    {
      label: "Đăng xuất",
      onPress: handleLogout,
      isDanger: true,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => close(onClose)}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={() => close(onClose)}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.container, { width: width * 0.75, transform: [{ translateX }] }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Tài khoản</Text>
            <TouchableOpacity onPress={() => close(onClose)} style={styles.closeBtn}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                  index === menuItems.length - 2 && styles.menuItemBeforeLast,
                ]}
                onPress={item.onPress}
              >
                <Text
                  style={[
                    styles.menuLabel,
                    item.isDanger && styles.menuLabelDanger,
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backdropTouchable: {
    flex: 1,
  },
  container: {
    height: "100%",
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 28,
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
    justifyContent: "flex-start",
    borderWidth: 2,
    borderColor: "#D84315",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
    paddingBottom: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  closeBtn: {
    position: "absolute",
    left: 0,
    top: -10,
    padding: 12,
  },
  close: {
    color: COLORS.white,
    fontSize: 24,
  },
  menuList: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
  },
  menuItemBeforeLast: {
    borderBottomWidth: 0,
  },
  menuItemLast: {
    marginTop: 8,
    borderBottomWidth: 0,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
  },
  menuLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.white,
  },
  menuLabelDanger: {
    color: "#FFCDD2",
  },
  menuArrow: {
    fontSize: 28,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "300",
  },
});
