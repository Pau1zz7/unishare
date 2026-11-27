import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/**
 * Mở thư viện ảnh hoặc camera trên thiết bị để chọn 1 ảnh.
 * Trả về URI ảnh nội bộ hoặc null nếu người dùng hủy / chưa cấp quyền.
 */
export const pickImageFromSource = async (
  source: 'library' | 'camera'
): Promise<string | null> => {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Thiếu quyền truy cập',
        'Vui lòng cấp quyền sử dụng Camera trong phần cài đặt để chụp ảnh.'
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Thiếu quyền truy cập',
      'Vui lòng cấp quyền truy cập Thư viện ảnh để chọn ảnh tải lên.'
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }
  return null;
};

/**
 * Hiển thị lựa chọn Thư viện ảnh / Camera (trên Web mở thẳng Thư viện ảnh).
 */
export const chooseImageWithPrompt = (
  title: string,
  message: string,
  onPicked: (uri: string) => void
): void => {
  if (Platform.OS === 'web') {
    pickImageFromSource('library')
      .then((uri) => {
        if (uri) onPicked(uri);
      })
      .catch(() => {
        Alert.alert('Lỗi', 'Không thể chọn ảnh từ thiết bị.');
      });
    return;
  }

  Alert.alert(title, message, [
    {
      text: 'Chọn từ thư viện',
      onPress: async () => {
        const uri = await pickImageFromSource('library');
        if (uri) onPicked(uri);
      },
    },
    {
      text: 'Chụp ảnh mới',
      onPress: async () => {
        const uri = await pickImageFromSource('camera');
        if (uri) onPicked(uri);
      },
    },
    { text: 'Hủy', style: 'cancel' },
  ]);
};
