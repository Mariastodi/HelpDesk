import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { colors } from "@core/theme/colors";

interface IInputLabelProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
  errorMessage?: string;
}

export function InputLabel({ label, isPassword, errorMessage, style, ...rest }: IInputLabelProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, errorMessage ? styles.inputRowError : undefined]}>
        <TextInput
          style={[styles.input, style]}
          secureTextEntry={isPassword && !isPasswordVisible}
          placeholderTextColor={colors.text.secondary}
          autoCapitalize="none"
          {...rest}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setIsPasswordVisible((previousValue) => !previousValue)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.text.secondary} />
            ) : (
              <Eye size={20} color={colors.text.secondary} />
            )}
          </Pressable>
        ) : null}
      </View>
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background.subtle,
  },
  inputRowError: {
    borderColor: colors.text.error,
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.text.primary,
    fontSize: 16,
  },
  errorMessage: {
    color: colors.text.error,
    fontSize: 12,
    marginTop: 4,
  },
});
