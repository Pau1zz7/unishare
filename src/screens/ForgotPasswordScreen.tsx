import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const { forgotPassword, loading } = useAuth();

  const handleReset = async () => {
    const result = await forgotPassword(email);
    if (result.success) {
      Alert.alert("Thành công", "Link đặt lại mật khẩu đã được gửi.");
      navigation.navigate('Login');
    } else {
      Alert.alert("Lỗi", result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={28} color="#374151" />
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Feather name="key" size={32} color="#F59E0B" />
            </View>
            <Text style={styles.title}>Khôi phục mật khẩu</Text>
            <Text style={styles.subtitle}>Nhập email sinh viên để nhận liên kết tạo mật khẩu mới.</Text>
          </View>

          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.input}
              placeholder="Email (.edu.vn)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleReset} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Gửi yêu cầu</Text>}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  backBtn: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
  card: { backgroundColor: 'white', padding: 32, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, borderWidth: 1, borderColor: '#F1F5F9' },
  header: { alignItems: 'center', marginBottom: 24 },
  logoBox: { width: 64, height: 64, backgroundColor: '#FFFBEB', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24 },
  input: { flex: 1, marginLeft: 12, color: '#1F2937', fontSize: 16 },
  primaryBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});