/**
 * UniShare Design Tokens
 * Chuẩn hóa thiết kế cho ứng dụng UniShare (React Native + NativeWind)
 * Đồng bộ với Figma Variables & Design System
 */

export const colors = {
  // Brand / Primary Colors (Sắc xanh nhận diện UniShare - năng động, tin cậy của sinh viên)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB', // Main Primary Brand Color
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary / Accent Colors (Cam năng lượng cho hoạt động chợ và kết nối)
  secondary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main Accent
    600: '#EA580C',
    700: '#C2410C',
  },

  // Semantic Colors (Trạng thái nghiệp vụ)
  semantic: {
    // Thù lao, Việc hoàn thành, Tiền thưởng, Trạng thái tốt
    success: {
      light: '#ECFDF5',
      DEFAULT: '#10B981',
      dark: '#059669',
      text: '#065F46',
    },
    // Chờ nhận việc, Cảnh báo, Đang thương lượng
    warning: {
      light: '#FFFBEB',
      DEFAULT: '#F59E0B',
      dark: '#D97706',
      text: '#92400E',
    },
    // Hủy việc, Lỗi form, Tài khoản bị khóa (Banned)
    danger: {
      light: '#FEF2F2',
      DEFAULT: '#EF4444',
      dark: '#DC2626',
      text: '#991B1B',
    },
    // Tuyến đường bản đồ, Thông tin hỗ trợ
    info: {
      light: '#F0F9FF',
      DEFAULT: '#0EA5E9',
      dark: '#0284C7',
      text: '#075985',
    },
  },

  // Neutral / Grayscale (Màu nền, khung viền, phân cấp chữ)
  neutral: {
    white: '#FFFFFF',
    background: '#F8FAFC', // Slate-50: Nền app chính
    surface: '#FFFFFF',    // Nền card, modal, bottomsheet
    border: '#E2E8F0',     // Slate-200: Đường viền card, input
    borderFocus: '#2563EB',// Viền khi focus input
    divider: '#F1F5F9',    // Slate-100: Đường ngăn cách
    textPrimary: '#0F172A',// Slate-900: Tiêu đề, chữ chính
    textSecondary: '#475569', // Slate-600: Phụ đề, mô tả
    textMuted: '#94A3B8',  // Slate-400: Placeholder, icon mờ
    disabled: '#CBD5E1',   // Slate-300: Nút vô hiệu hóa
  },

  // Category Colors (Phân loại tính năng trên Bảng tin & Chợ)
  categories: {
    taskDelivery: '#2563EB', // Việc vặt - Giao nhận/Ship
    taskFood: '#F97316',     // Việc vặt - Mua đồ ăn
    taskPrint: '#8B5CF6',    // Việc vặt - In ấn/Photo tài liệu
    marketBook: '#059669',   // Chợ đồ cũ - Giáo trình/Sách
    marketTech: '#0284C7',   // Chợ đồ cũ - Đồ điện tử
    tutorStudy: '#7C3AED',   // Gia sư - Học tập
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'System', // Mặc định San Francisco (iOS) và Roboto (Android)
  },
  fontSize: {
    xs: 12,      // Caption nhỏ, badge trạng thái
    sm: 14,      // Phụ đề, ghi chú, placeholder
    base: 16,    // Nội dung chính (Body text, input text)
    lg: 18,      // Tiêu đề card, subhead
    xl: 20,      // Tiêu đề phụ màn hình
    '2xl': 24,   // Tiêu đề chính màn hình (Header)
    '3xl': 30,   // Tiêu đề Hero, chào mừng
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  // Hệ thống 4pt/8pt Grid tiêu chuẩn của Mobile UI
  none: 0,
  1: 4,    // 4px - Padding siêu nhỏ, khoảng cách icon với chữ ngắn
  2: 8,    // 8px - Khoảng cách thành phần nhỏ trong thẻ
  3: 12,   // 12px - Padding trong thẻ nhỏ, khoảng cách input
  4: 16,   // 16px - Padding tiêu chuẩn lề ứng dụng, khoảng cách giữa các card
  5: 20,   // 20px - Khoảng cách vừa
  6: 24,   // 24px - Padding màn hình chính, khoảng cách các section
  8: 32,   // 32px - Khoảng cách lớn giữa các khối form
  10: 40,  // 40px - Margin lớn
  12: 48,  // 48px - Khoảng cách Header/Hero
  16: 64,  // 64px - Đáy màn hình / Bottom Bar offset
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,     // Tag/Badge nhỏ
  md: 8,     // Ô input nhỏ, nút phụ
  lg: 12,    // Input form, Nút bấm chính (Primary Button)
  xl: 16,    // Card bài đăng, ảnh bo tròn
  '2xl': 24, // Card lớn, BottomSheet header, Modal
  full: 9999,// Avatar tròn, Chip filter tròn
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  bottomSheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const layout = {
  // Kích thước chuẩn thiết kế Mobile Frame (Figma)
  designFrame: {
    width: 390,  // iPhone 14/15 base frame chuẩn
    height: 844,
  },
  androidFrame: {
    width: 360,  // Android Large frame chuẩn
    height: 800,
  },
  tabBarHeight: 64,
  headerHeight: 56,
  minTouchTarget: 44, // Kích thước chạm tối thiểu chuẩn WCAG
} as const;

export const zIndex = {
  base: 0,
  card: 1,
  stickyHeader: 10,
  dropdown: 20,
  bottomSheet: 30,
  modal: 40,
  toast: 50,
} as const;

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  zIndex,
};
