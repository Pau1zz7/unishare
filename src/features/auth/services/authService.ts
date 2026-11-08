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

// 1. Hàm Đăng ký
export const register = async (input: RegisterInput): Promise<User> => {
  // Chặn email không phải .edu.vn ngay từ đầu
  if (!input.email.endsWith('.edu.vn')) {
    throw new Error("Vui lòng sử dụng email sinh viên (.edu.vn)");
  }

  // Tạo tài khoản trên Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
  const uid = userCredential.user.uid;

  // Gửi email xác thực (Verify Email)
  await sendEmailVerification(userCredential.user);

  // Lưu thông tin vào Firestore
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
  return newUser;
};

// 2. Hàm Đăng nhập
export const login = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  // Lấy thông tin user từ Firestore
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) {
    throw new Error("Không tìm thấy dữ liệu người dùng trên hệ thống!");
  }

  const userData = userDoc.data() as User;

  // Kiểm tra xem tài khoản có bị Admin khóa (banned) không
  if (userData.status === "banned") {
    await signOut(auth); 
    throw new Error("Tài khoản của bạn đã bị khóa do vi phạm.");
  }

  return userData;
};

// 3. Hàm Đăng xuất
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// 4. Hàm Quên mật khẩu
export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};