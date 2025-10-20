import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";

type DeliveryTime = "now" | "scheduled";

interface DeliveryTimePickerProps {
  deliveryTime: DeliveryTime;
  scheduledTime: string;
  showTimePicker: boolean;
  selectedHour: number;
  selectedMinute: number;
  onDeliveryTimeChange: (time: DeliveryTime) => void;
  onShowTimePicker: () => void;
  onHideTimePicker: () => void;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onTimeConfirm: () => void;
}

export default function DeliveryTimePicker({
  deliveryTime,
  scheduledTime,
  showTimePicker,
  selectedHour,
  selectedMinute,
  onDeliveryTimeChange,
  onShowTimePicker,
  onHideTimePicker,
  onHourChange,
  onMinuteChange,
  onTimeConfirm,
}: DeliveryTimePickerProps) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const availableHours = Array.from({ length: 24 }, (_, i) => i).filter(h => h >= currentHour);
  const availableMinutes = selectedHour === currentHour 
    ? Array.from({ length: 60 }, (_, i) => i).filter(m => m > currentMinute)
    : Array.from({ length: 60 }, (_, i) => i);

  return (
    <>
      <View style={sharedStyles.section}>
        <Text style={sharedStyles.sectionTitle}>Thời gian giao hàng</Text>
        <View style={styles.timeOptions}>
          <TouchableOpacity
            style={[styles.timeOption, deliveryTime === "now" && styles.timeOptionActive]}
            onPress={() => onDeliveryTimeChange("now")}
          >
            <Text style={[styles.timeOptionText, deliveryTime === "now" && styles.timeOptionTextActive]}>
              Giao ngay
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeOption, deliveryTime === "scheduled" && styles.timeOptionActive]}
            onPress={onShowTimePicker}
          >
            <Text style={[styles.timeOptionText, deliveryTime === "scheduled" && styles.timeOptionTextActive]}>
              Chọn thời gian
            </Text>
          </TouchableOpacity>
        </View>
        {deliveryTime === "scheduled" && scheduledTime && (
          <View style={styles.selectedTime}>
            <Text style={styles.selectedTimeText}>Thời gian: {scheduledTime}</Text>
            <TouchableOpacity onPress={onShowTimePicker}>
              <Text style={styles.editBtn}>Đổi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={onHideTimePicker}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn thời gian giao hàng</Text>
            
            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Giờ</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {availableHours.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.pickerItem, selectedHour === h && styles.pickerItemActive]}
                      onPress={() => onHourChange(h)}
                    >
                      <Text style={[styles.pickerItemText, selectedHour === h && styles.pickerItemTextActive]}>
                        {h.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <Text style={styles.timeSeparator}>:</Text>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Phút</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {availableMinutes.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.pickerItem, selectedMinute === m && styles.pickerItemActive]}
                      onPress={() => onMinuteChange(m)}
                    >
                      <Text style={[styles.pickerItemText, selectedMinute === m && styles.pickerItemTextActive]}>
                        {m.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={onHideTimePicker}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={onTimeConfirm}>
                <Text style={styles.modalConfirmText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  timeOptions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  timeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  timeOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "15",
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  timeOptionTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  selectedTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary + "10",
    borderRadius: 8,
  },
  selectedTimeText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  editBtn: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.secondary,
    marginBottom: 10,
  },
  pickerScroll: {
    height: 200,
    width: 80,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  pickerItemActive: {
    backgroundColor: COLORS.primary,
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  pickerItemTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginTop: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
