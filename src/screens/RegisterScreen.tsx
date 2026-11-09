import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function RegisterScreen({ navigation }: any) {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    if (!displayName || !email || !password || !phone) {
      Alert.alert("Lỗi", "Vui lòng điền đủ thông tin");
      return;
    }
    const result = await register({ displayName, phone, email, password });
    if (result.success) {
      Alert.alert("Thành công", "Kiểm tra email để xác thực nhé!");
      navigation.navigate('Login');
    } else {
      Alert.alert("Lỗi đăng ký", result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            <View style={{ marginBottom: 24 }}>
              <Text style={styles.title}>Tạo tài khoản</Text>
              <Text style={styles.subtitle}>Bắt đầu trải nghiệm UniShare</Text>
            </View>

            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Họ và tên" value={displayName} onChangeText={setDisplayName} />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="phone" size={20} color="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Email sinh viên (.edu.vn)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Mật khẩu (>= 6 ký tự)" secureTextEntry value={password} onChangeText={setPassword} />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Đăng ký</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  card: { backgroundColor: 'white', padding: 32, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, borderWidth: 1, borderColor: '#F1F5F9' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  input: { flex: 1, marginLeft: 12, color: '#1F2937', fontSize: 16 },
  primaryBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#4B5563' },
  footerLink: { color: '#2563EB', fontWeight: 'bold' },
});