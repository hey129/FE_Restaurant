import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/app";
import { sharedStyles } from "../../constants/sharedStyles";
import { ShippingAddress, ValidationErrors } from "../../utils/validation";

interface AddressFormProps {
  isExpanded: boolean;
  address: ShippingAddress;
  errors: ValidationErrors;
  onAddressChange: (address: ShippingAddress) => void;
  onErrorChange: (errors: ValidationErrors) => void;
  onSave: () => void;
  onEdit: () => void;
}

export default function AddressForm({
  isExpanded,
  address,
  errors,
  onAddressChange,
  onErrorChange,
  onSave,
  onEdit,
}: AddressFormProps) {
  return (
    <View style={sharedStyles.section}>
      <View style={sharedStyles.sectionHeader}>
        <Text style={sharedStyles.sectionTitle}>Địa chỉ giao hàng</Text>
        {!isExpanded && (
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.editBtn}>Sửa</Text>
          </TouchableOpacity>
        )}
      </View>

      {isExpanded ? (
        <View style={styles.form}>
          <View>
            <TextInput
              style={[sharedStyles.input, errors.name && sharedStyles.inputError]}
              placeholder="Họ và tên *"
              placeholderTextColor={COLORS.text.light}
              value={address.name}
              onChangeText={(text) => {
                onAddressChange({ ...address, name: text });
                onErrorChange({ ...errors, name: "" });
              }}
            />
            {errors.name ? <Text style={sharedStyles.errorText}>{errors.name}</Text> : null}
          </View>
          
          <View>
            <TextInput
              style={[sharedStyles.input, errors.phone && sharedStyles.inputError]}
              placeholder="Số điện thoại *"
              placeholderTextColor={COLORS.text.light}
              keyboardType="phone-pad"
              value={address.phone}
              onChangeText={(text) => {
                onAddressChange({ ...address, phone: text });
                onErrorChange({ ...errors, phone: "" });
              }}
            />
            {errors.phone ? <Text style={sharedStyles.errorText}>{errors.phone}</Text> : null}
          </View>
          
          <View>
            <TextInput
              style={[sharedStyles.input, sharedStyles.textArea, errors.address && sharedStyles.inputError]}
              placeholder="Địa chỉ chi tiết *"
              placeholderTextColor={COLORS.text.light}
              multiline
              numberOfLines={3}
              value={address.address}
              onChangeText={(text) => {
                onAddressChange({ ...address, address: text });
                onErrorChange({ ...errors, address: "" });
              }}
            />
            {errors.address ? <Text style={sharedStyles.errorText}>{errors.address}</Text> : null}
          </View>
          
          <TouchableOpacity style={sharedStyles.secondaryButton} onPress={onSave}>
            <Text style={sharedStyles.secondaryButtonText}>Lưu địa chỉ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={sharedStyles.addressBox}>
          <Text style={sharedStyles.addressName}>{address.name}</Text>
          <Text style={sharedStyles.addressPhone}>{address.phone}</Text>
          <Text style={sharedStyles.addressText}>{address.address}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  editBtn: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    gap: 16,
  },
});
