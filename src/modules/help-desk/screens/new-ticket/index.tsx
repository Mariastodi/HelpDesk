import React, { useMemo, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  ChevronLeft,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Plus,
  Trash2,
  Square,
  X,
} from "lucide-react-native";
import { Button } from "@core/components/ui/button";
import { useToast } from "@core/components/ui/toast";
import { useAuth } from "@core/contexts/auth";
import { RootStackParamList } from "@core/routers/root-stack-type";
import { createApiClient } from "@core/services/api/client";
import { colors } from "@core/theme/colors";
import { createTicket } from "@modules/help-desk/repository/tickets-repository";
import {
  persistTicketAttachment,
  removeStoredTicketAttachment,
} from "@modules/help-desk/services/ticket-attachment-storage";
import { DataTicketAttachment } from "./new-ticket-type";
import { useDescriptionSpeechRecognition } from "./use-description-speech-recognition";

const DEFAULT_INSTITUTION = {
  label: "Matriz - Fortaleza",
  description: "Vinculada ao seu perfil",
};

const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function formatFileSize(size?: number): string {
  if (!size) return "Tamanho não informado";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getAttachmentIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon size={19} color={colors.brand.primary} />;
  }

  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet size={19} color="#178A4A" />;
  }

  return <FileText size={19} color="#D14949" />;
}

export function NewTicketScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { loggedUser } = useAuth();
  const { showToast } = useToast();
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<DataTicketAttachment[]>([]);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const selectedInstitution = useMemo(() => DEFAULT_INSTITUTION, []);

  async function handleSubmit() {
    if (!description.trim()) {
      setErrorMessage("A descrição é obrigatória");
      return;
    }

    if (!loggedUser) {
      showToast("Usuário não autenticado", "error");
      return;
    }

    setErrorMessage(undefined);
    setIsSubmitting(true);

    try {
      const apiClient = createApiClient(loggedUser.environment, loggedUser.jwtToken);
      await createTicket(apiClient, {
        description: description.trim(),
        attachmentFiles: attachments.map((attachment) => ({
          uri: attachment.uri,
          name: attachment.name,
          mimeType: attachment.mimeType,
        })),
      });
      showToast("Chamado criado com sucesso", "success");
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível criar o chamado";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSelectPhotos() {
    setIsAttachmentMenuOpen(false);
    try {
      if (Platform.OS === "ios") {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          showToast("Permita o acesso às fotos para anexar imagens", "warning");
          return;
        }
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.85,
      });
      if (pickerResult.canceled) return;

      const selectedPhotos = await Promise.all(
        pickerResult.assets.map((asset, index) =>
          persistTicketAttachment({
            uri: asset.uri,
            name: asset.fileName ?? `foto-${Date.now()}-${index + 1}.jpg`,
            mimeType: asset.mimeType ?? "image/jpeg",
            size: asset.fileSize,
          }),
        ),
      );
      setAttachments((currentAttachments) => [...currentAttachments, ...selectedPhotos]);
      showToast(
        selectedPhotos.length === 1
          ? "Foto anexada ao chamado"
          : `${selectedPhotos.length} fotos anexadas ao chamado`,
        "success",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível anexar as fotos";
      showToast(message, "error");
    }
  }

  async function handleTakePhoto() {
    setIsAttachmentMenuOpen(false);
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        showToast("Permita o acesso à câmera para tirar uma foto", "warning");
        return;
      }

      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });
      if (cameraResult.canceled) return;

      const capturedPhoto = cameraResult.assets[0];
      const storedPhoto = await persistTicketAttachment({
        uri: capturedPhoto.uri,
        name: capturedPhoto.fileName ?? `foto-${Date.now()}.jpg`,
        mimeType: capturedPhoto.mimeType ?? "image/jpeg",
        size: capturedPhoto.fileSize,
      });
      setAttachments((currentAttachments) => [...currentAttachments, storedPhoto]);
      showToast("Foto anexada ao chamado", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível anexar a foto";
      showToast(message, "error");
    }
  }

  async function handleSelectDocuments() {
    setIsAttachmentMenuOpen(false);
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_DOCUMENT_TYPES,
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (pickerResult.canceled) return;

      const selectedDocuments = await Promise.all(
        pickerResult.assets.map((asset) =>
          persistTicketAttachment({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType ?? "application/octet-stream",
            size: asset.size,
          }),
        ),
      );
      setAttachments((currentAttachments) => [...currentAttachments, ...selectedDocuments]);
      showToast(
        selectedDocuments.length === 1
          ? "Documento anexado ao chamado"
          : `${selectedDocuments.length} documentos anexados ao chamado`,
        "success",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível anexar os documentos";
      showToast(message, "error");
    }
  }

  function handleRemoveAttachment(attachmentUri: string) {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((attachment) => attachment.uri !== attachmentUri),
    );
    void removeStoredTicketAttachment(attachmentUri);
  }

  function handleDescriptionChange(value: string) {
    setDescription(value);
    if (value.trim()) setErrorMessage(undefined);
  }

  function handleOpenAttachmentMenu() {
    Keyboard.dismiss();
    setIsAttachmentMenuOpen(true);
  }

  const { isListening, toggleListening } = useDescriptionSpeechRecognition({
    description,
    onDescriptionChange: handleDescriptionChange,
  });

  const hasDescriptionError = !description.trim() && errorMessage !== undefined;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={10}>
          <ChevronLeft size={23} color={colors.text.onPrimary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Novo Chamado</Text>
          <Text style={styles.headerSubtitle}>Modelo reduzido · Parâmetro 959</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Instituição</Text>
          <View style={styles.institutionCard}>
            <Text style={styles.institutionTitle}>{selectedInstitution.label}</Text>
            <Text style={styles.institutionSubtitle}>{selectedInstitution.description}</Text>
          </View>

          <Text style={styles.sectionLabel}>Descrição *</Text>
          <View style={[styles.descriptionContainer, hasDescriptionError && styles.textAreaError]}>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={handleDescriptionChange}
              placeholder={isListening ? "Ouvindo..." : "Descreva o problema"}
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={5}
            />
          </View>
          <Pressable
            style={[styles.voiceButton, isListening && styles.voiceButtonListening]}
            onPress={toggleListening}
            accessibilityRole="button"
            accessibilityLabel={isListening ? "Parar transcrição" : "Transcrever descrição"}
            accessibilityState={{ selected: isListening }}
          >
            {isListening ? (
              <Square size={16} color={colors.text.onPrimary} fill={colors.text.onPrimary} />
            ) : (
              <Mic size={19} color={colors.brand.primary} />
            )}
            <Text style={[styles.voiceButtonText, isListening && styles.voiceButtonTextListening]}>
              {isListening ? "Parar transcrição" : "Preencher descrição por voz"}
            </Text>
          </Pressable>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Text style={styles.sectionLabel}>Anexos opcionais</Text>
          <Pressable style={styles.attachmentButton} onPress={handleOpenAttachmentMenu}>
            <Paperclip size={18} color={colors.brand.primary} />
            <View style={styles.attachmentButtonContent}>
              <Text style={styles.attachmentButtonTitle}>Adicionar anexo</Text>
              <Text style={styles.attachmentButtonSubtitle}>Foto, PDF, XLS ou XLSX</Text>
            </View>
            <Plus size={20} color={colors.brand.primary} />
          </Pressable>

          {attachments.length > 0 ? (
            <View style={styles.attachmentsList}>
              {attachments.map((attachment) => (
                <View key={attachment.uri} style={styles.attachmentItem}>
                  <View style={styles.attachmentIcon}>
                    {getAttachmentIcon(attachment.mimeType)}
                  </View>
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                    <Text style={styles.attachmentSize}>{formatFileSize(attachment.size)}</Text>
                  </View>
                  <Pressable
                    style={styles.removeAttachmentButton}
                    hitSlop={10}
                    onPress={() => handleRemoveAttachment(attachment.uri)}
                  >
                    <Trash2 size={18} color={colors.brand.primary} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <Button
          label="Abrir chamado"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        />
      </ScrollView>

      <Modal
        transparent
        visible={isAttachmentMenuOpen}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsAttachmentMenuOpen(false)}
      >
        <View style={styles.attachmentMenuOverlay}>
          <Pressable
            style={styles.attachmentMenuBackdrop}
            onPress={() => setIsAttachmentMenuOpen(false)}
          />
          <View style={styles.attachmentMenu}>
            <View style={styles.attachmentMenuHeader}>
              <Text style={styles.attachmentMenuTitle}>Adicionar anexo</Text>
              <Pressable hitSlop={10} onPress={() => setIsAttachmentMenuOpen(false)}>
                <X size={21} color={colors.text.secondary} />
              </Pressable>
            </View>
            <Pressable style={styles.attachmentMenuOption} onPress={handleTakePhoto}>
              <Camera size={22} color={colors.brand.primary} />
              <View>
                <Text style={styles.attachmentMenuOptionTitle}>Tirar foto</Text>
                <Text style={styles.attachmentMenuOptionSubtitle}>Abrir a câmera do aparelho</Text>
              </View>
            </Pressable>
            <Pressable style={styles.attachmentMenuOption} onPress={handleSelectPhotos}>
              <ImageIcon size={22} color={colors.brand.primary} />
              <View>
                <Text style={styles.attachmentMenuOptionTitle}>Escolher fotos</Text>
                <Text style={styles.attachmentMenuOptionSubtitle}>Selecionar uma imagem</Text>
              </View>
            </Pressable>
            <Pressable style={styles.attachmentMenuOption} onPress={handleSelectDocuments}>
              <FileText size={22} color={colors.brand.primary} />
              <View>
                <Text style={styles.attachmentMenuOptionTitle}>Escolher documentos</Text>
                <Text style={styles.attachmentMenuOptionSubtitle}>PDF, XLS ou XLSX</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F9FF",
  },
  header: {
    height: 104,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.brand.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.text.onPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 3,
  },
  content: {
    padding: 20,
    paddingBottom: 42,
  },
  card: {
    backgroundColor: colors.background.screen,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  sectionLabel: {
    color: "#6A5558",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 9,
  },
  institutionCard: {
    backgroundColor: colors.background.subtle,
    borderRadius: 14,
    padding: 14,
    marginBottom: 19,
  },
  institutionTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  institutionSubtitle: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  descriptionContainer: {
    minHeight: 118,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.subtle,
    marginBottom: 10,
  },
  textArea: {
    flex: 1,
    minHeight: 116,
    color: colors.text.primary,
    padding: 14,
    textAlignVertical: "top",
  },
  textAreaError: {
    borderColor: colors.text.error,
    marginBottom: 5,
  },
  voiceButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1D1D3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F8E9EA",
    marginBottom: 18,
  },
  voiceButtonListening: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  voiceButtonText: {
    color: colors.brand.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  voiceButtonTextListening: {
    color: colors.text.onPrimary,
  },
  errorText: {
    color: colors.text.error,
    fontSize: 12,
    marginBottom: 14,
  },
  attachmentButton: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E1D1D3",
    paddingHorizontal: 14,
    backgroundColor: "#FFFDFD",
  },
  attachmentButtonContent: {
    flex: 1,
  },
  attachmentButtonTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  attachmentButtonSubtitle: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 3,
  },
  attachmentsList: {
    gap: 9,
    marginTop: 13,
  },
  attachmentItem: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 13,
    backgroundColor: colors.background.subtle,
    paddingHorizontal: 12,
  },
  attachmentIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.background.screen,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  attachmentName: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  attachmentSize: {
    color: colors.text.secondary,
    fontSize: 10,
    marginTop: 3,
  },
  removeAttachmentButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentMenuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
    justifyContent: "flex-end",
  },
  attachmentMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  attachmentMenu: {
    backgroundColor: colors.background.screen,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 21,
    paddingBottom: 32,
  },
  attachmentMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  attachmentMenuTitle: {
    color: colors.text.primary,
    fontSize: 19,
    fontWeight: "700",
  },
  attachmentMenuOption: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.subtle,
  },
  attachmentMenuOptionTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  attachmentMenuOptionSubtitle: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 3,
  },
});
