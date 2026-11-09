import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      Alert.alert("Thành công", "Đăng nhập thành công!");
    } else {
      Alert.alert("Lỗi đăng nhập", result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Feather name="share-2" size={32} color="#2563EB" />
            </View>
            <Text style={styles.title}>Chào mừng trở lại!</Text>
            <Text style={styles.subtitle}>Đăng nhập vào UniShare</Text>
          </View>

          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.input}
              placeholder="Email sinh viên (.edu.vn)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.input}
              placeholder="Mật khẩu"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Đăng nhập</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: 'white', padding: 32, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, borderWidth: 1, borderColor: '#F1F5F9' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoBox: { width: 64, height: 64, backgroundColor: '#EFF6FF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  input: { flex: 1, marginLeft: 12, color: '#1F2937', fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#2563EB', fontWeight: '500', fontSize: 14 },
  primaryBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#4B5563' },
  footerLink: { color: '#2563EB', fontWeight: 'bold' },
});