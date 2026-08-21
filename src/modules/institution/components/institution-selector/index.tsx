import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Building2, Check, ChevronDown, X } from "lucide-react-native";
import { useInstitution } from "@core/contexts/institution";
import { colors } from "@core/theme/colors";

interface InstitutionSelectorProps {
  required?: boolean;
}

export function InstitutionSelector({ required = false }: InstitutionSelectorProps) {
  const { institutions, selectedInstitution, selectInstitution } = useInstitution();
  const [isOpen, setIsOpen] = useState(required && !selectedInstitution);
  const [pendingInstitutionId, setPendingInstitutionId] = useState<number | null>(
    selectedInstitution?.id ?? null,
  );
  const [rememberSelection, setRememberSelection] = useState(false);

  useEffect(() => {
    if (required && !selectedInstitution) setIsOpen(true);
  }, [required, selectedInstitution]);

  useEffect(() => {
    if (isOpen) setPendingInstitutionId(selectedInstitution?.id ?? null);
  }, [isOpen, selectedInstitution]);

  async function handleConfirm() {
    if (!pendingInstitutionId) return;
    await selectInstitution(pendingInstitutionId, rememberSelection);
    setIsOpen(false);
  }

  const canChange = institutions.length > 1;

  return (
    <>
      <Pressable
        style={[styles.trigger, !canChange && styles.triggerReadOnly]}
        onPress={() => canChange && setIsOpen(true)}
        disabled={!canChange}
        accessibilityRole={canChange ? "button" : "text"}
      >
        <View style={styles.iconContainer}>
          <Building2 size={20} color={colors.brand.primary} />
        </View>
        <View style={styles.triggerText}>
          <Text style={styles.name}>
            {selectedInstitution?.name ?? "Selecione uma instituição"}
          </Text>
          <Text style={styles.description}>
            {canChange ? "Toque para alterar" : "Vinculada ao seu perfil"}
          </Text>
        </View>
        {canChange ? <ChevronDown size={20} color={colors.text.secondary} /> : null}
      </Pressable>

      <Modal
        transparent
        visible={isOpen}
        animationType="fade"
        onRequestClose={() => selectedInstitution && setIsOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Selecionar instituição</Text>
                <Text style={styles.modalSubtitle}>Escolha onde deseja trabalhar</Text>
              </View>
              {selectedInstitution ? (
                <Pressable hitSlop={10} onPress={() => setIsOpen(false)}>
                  <X size={21} color={colors.text.secondary} />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.options}>
              {institutions.map((institution) => {
                const isSelected = pendingInstitutionId === institution.id;
                return (
                  <Pressable
                    key={institution.id}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => setPendingInstitutionId(institution.id)}
                  >
                    <View style={styles.optionText}>
                      <Text style={styles.optionName}>{institution.name}</Text>
                      {institution.document ? (
                        <Text style={styles.optionDocument}>{institution.document}</Text>
                      ) : null}
                    </View>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberSelection((current) => !current)}
            >
              <View style={[styles.checkbox, rememberSelection && styles.checkboxSelected]}>
                {rememberSelection ? <Check size={14} color={colors.text.onPrimary} /> : null}
              </View>
              <Text style={styles.rememberText}>Deixar salvo para os próximos acessos</Text>
            </Pressable>

            <Pressable
              style={[styles.confirmButton, !pendingInstitutionId && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={!pendingInstitutionId}
            >
              <Text style={styles.confirmButtonText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E3C5C7",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#FFF8F8",
  },
  triggerReadOnly: {
    backgroundColor: colors.background.subtle,
    borderColor: colors.border.default,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.screen,
  },
  triggerText: { flex: 1 },
  name: { color: colors.text.primary, fontSize: 14, fontWeight: "700" },
  description: { color: colors.text.secondary, fontSize: 11, marginTop: 3 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  modalCard: { borderRadius: 20, padding: 20, backgroundColor: colors.background.screen },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: { color: colors.text.primary, fontSize: 19, fontWeight: "800" },
  modalSubtitle: { color: colors.text.secondary, fontSize: 12, marginTop: 3 },
  options: { gap: 9 },
  option: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 13,
    padding: 13,
  },
  optionSelected: { borderColor: colors.brand.primary, backgroundColor: "#FFF7F7" },
  optionText: { flex: 1 },
  optionName: { color: colors.text.primary, fontSize: 14, fontWeight: "700" },
  optionDocument: { color: colors.text.secondary, fontSize: 11, marginTop: 3 },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: colors.brand.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand.primary },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18 },
  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { borderColor: colors.brand.primary, backgroundColor: colors.brand.primary },
  rememberText: { flex: 1, color: colors.text.primary, fontSize: 12 },
  confirmButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginTop: 20,
    backgroundColor: colors.brand.primary,
  },
  confirmButtonDisabled: { opacity: 0.45 },
  confirmButtonText: { color: colors.text.onPrimary, fontSize: 14, fontWeight: "800" },
});
