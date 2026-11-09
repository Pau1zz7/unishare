import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase/config";
import { User, RegisterInput } from "../../../types";
// Hàm dịch mã lỗi Firebase sang Tiếng Việt
export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.';
    case 'auth/invalid-email':
      return 'Địa chỉ email không hợp lệ.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu, vui lòng nhập từ 6 ký tự trở lên.';
    case 'auth/user-not-found':
      return 'Tài khoản không tồn tại trên hệ thống.';
    case 'auth/wrong-password':
      return 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.';
    case 'auth/too-many-requests':
      return 'Tài khoản tạm thời bị khóa do nhập sai quá nhiều lần. Vui lòng thử lại sau.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra Internet.';
    default:
      return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
  }
};

export const register = async (input: RegisterInput): Promise<User> => {
  if (!input.email.endsWith('.edu.vn')) {
    throw new Error("Vui lòng sử dụng email sinh viên (.edu.vn)");
  }

  const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
  const uid = userCredential.user.uid;

  await sendEmailVerification(userCredential.user);

  const newUser: User = {
    uid,
    email: input.email,
    displayName: input.displayName,
    phone: input.phone,
    avatarUrl: null,
    bio: "",
    role: "user",
    status: "active",
    trustScore: 0,
    totalReviews: 0,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, "users", uid), newUser);
  
  await signOut(auth); 
  
  return newUser;
};

export const login = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  if (!userCredential.user.emailVerified) {
    await signOut(auth); 
    throw new Error("Vui lòng kiểm tra hộp thư email để kích hoạt tài khoản!");
  }

  const uid = userCredential.user.uid;
  const userDoc = await getDoc(doc(db, "users", uid));
  
  if (!userDoc.exists()) {
    throw new Error("Không tìm thấy dữ liệu người dùng trên hệ thống!");
  }

  const userData = userDoc.data() as User;

  if (userData.status === "banned") {
    await signOut(auth); 
    throw new Error("Tài khoản của bạn đã bị khóa do vi phạm.");
  }

  return userData;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};