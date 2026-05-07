/**
 * Bilingual email templates for Chào Market (VI / EN)
 * LinkedIn-inspired clean design with dark header matching sidebar theme
 * All exported functions accept a `locale` parameter ('vi' | 'en')
 */

import type { EmailLocale } from '@/lib/get-email-locale';

const LOGO_URL = 'https://cdn-account.chaomarket.com/brand/logo.png';

// ── Request metadata for "When and where" section ──
export interface RequestMeta {
    date: string;
    browser?: string;
    os?: string;
    location?: string;
}

// ── Translations ──
const t = {
    vi: {
        slogan: 'Quản Lý Tài Khoản Của Bạn',
        otpExpiry: 'Mã hết hạn sau 10 phút.',
        whenWhere: 'Thời gian và vị trí thực hiện:',
        metaDate: 'Ngày:',
        metaBrowser: 'Trình duyệt:',
        metaOS: 'Hệ điều hành:',
        metaLocation: 'Vị trí gần đúng:',
        securityNotice:
            'Nếu bạn không thực hiện hành động này, hãy cho chúng tôi biết bằng cách liên hệ support. Vì sự an toàn của bạn, chúng tôi yêu cầu bạn đặt lại mật khẩu.',
        otpVerify: {
            title: 'Xác minh tài khoản của bạn',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            body: 'Đây là mã xác minh để hoàn tất đăng ký tài khoản của bạn:',
            subject: 'Chào Market - Mã xác minh tài khoản',
        },
        emailVerify: {
            title: 'Xác minh email của bạn',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            body: 'Tài khoản của bạn chưa được xác minh. Vui lòng sử dụng mã dưới đây để xác minh email:',
            subject: 'Chào Market - Xác minh email',
        },
        resetPassword: {
            title: 'Đặt lại mật khẩu của bạn',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            body: 'Bạn đã yêu cầu đặt lại mật khẩu. Đây là mã OTP để đặt lại mật khẩu:',
            subject: 'Chào Market - Đặt lại mật khẩu',
        },
        changePassword: {
            title: 'Xác nhận đổi mật khẩu',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            body: 'Bạn đang thay đổi mật khẩu tài khoản. Dùng mã dưới đây để xác nhận thay đổi:',
            subject: 'Chào Market - Xác nhận đổi mật khẩu',
        },
        editProfile: {
            title: 'Xác nhận thay đổi thông tin cá nhân',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            body: 'Bạn đang cập nhật thông tin cá nhân. Dùng mã dưới đây để xác nhận thay đổi:',
            subject: 'Chào Market - Xác nhận thay đổi thông tin',
        },
        passwordChanged: {
            title: 'Mật khẩu đã được thay đổi',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            body: 'Mật khẩu tài khoản của bạn đã được thay đổi thành công.',
            body2: 'Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ bộ phận hỗ trợ ngay lập tức và đặt lại mật khẩu của bạn.',
            subject: 'Chào Market - Mật khẩu đã thay đổi',
        },
        changeEmailOld: {
            title: 'Xác nhận yêu cầu đổi email',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            body: 'Chúng tôi nhận được yêu cầu thay đổi địa chỉ email của tài khoản bạn. Dùng mã dưới đây để xác nhận yêu cầu:',
            subject: 'Chào Market - Xác nhận đổi email',
        },
        changeEmailNew: {
            title: 'Xác minh địa chỉ email mới',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            body: 'Địa chỉ email này được yêu cầu làm email mới cho tài khoản Chào Market. Dùng mã dưới đây để xác minh:',
            subject: 'Chào Market - Xác minh email mới',
        },
        consultationConfirmation: {
            title: 'Xác nhận đăng ký tư vấn',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            body: 'Chúng tôi đã nhận được yêu cầu tư vấn của bạn với các gói sản phẩm sau:',
            solutionsLabel: 'Gói sản phẩm đã chọn:',
            submittedAtLabel: 'Thời gian đăng ký:',
            preferredDateLabel: 'Thời gian liên hệ mong muốn:',
            notSelected: 'Chưa chọn',
            closing:
                'Đội ngũ Chào Market sẽ liên hệ với bạn trong thời gian sớm nhất. Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi!',
            subject: 'Chào Market - Xác nhận đăng ký tư vấn',
        },
        consultationStatusUpdate: {
            title: (status: string) =>
                status === 'completed'
                    ? 'Yêu cầu tư vấn đã hoàn tất'
                    : status === 'cancelled'
                      ? 'Yêu cầu tư vấn đã bị hủy'
                      : 'Cập nhật yêu cầu tư vấn',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            bodyCompleted:
                'Yêu cầu tư vấn của bạn đã được xử lý thành công. Đội ngũ chúng tôi sẽ liên hệ với bạn theo thông tin đã đăng ký.',
            bodyCancelled:
                'Yêu cầu tư vấn của bạn đã bị hủy. Nếu bạn có thắc mắc, vui lòng liên hệ đội ngũ hỗ trợ.',
            bodyRejected:
                'Rất tiếc, yêu cầu tư vấn của bạn không thể được xử lý. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.',
            solutionsLabel: 'Gói sản phẩm:',
            statusLabel: 'Trạng thái:',
            cta: 'Xem chi tiết',
            closing: 'Cảm ơn bạn đã sử dụng dịch vụ Chào Market!',
            subject: 'Chào Market - Cập nhật yêu cầu tư vấn',
        },
        paymentConfirmation: {
            title: 'Xác nhận thanh toán thành công',
            greeting: (name?: string) => (name ? `Xin chào ${name},` : 'Xin chào,'),
            body: 'Thanh toán của bạn đã được xử lý thành công. Dưới đây là chi tiết đơn hàng:',
            orderCodeLabel: 'Mã đơn hàng:',
            itemsLabel: 'Sản phẩm đã mua:',
            totalLabel: 'Tổng thanh toán:',
            licenseLabel: 'Quyền truy cập & Tải xuống',
            durationLabel: 'Thời hạn:',
            expiresLabel: 'Hết hạn:',
            downloadLabel: 'Tải xuống',
            months: 'tháng',
            accessNote:
                'Truy cập và quản lý sản phẩm của bạn tại Account → Order History trên website.',
            cta: 'Xem đơn hàng',
            closing: 'Chúc bạn thành công trên hành trình đầu tư!',
            subject: 'Chào Market - Xác nhận thanh toán',
        },
        welcome: {
            title: 'Chào mừng bạn đến với Chào Market!',
            greeting: (name?: string) =>
                name ? `Xin chào ${name},` : 'Xin chào,',
            body: 'Tài khoản của bạn đã được tạo thành công. Chào Market là nền tảng giúp bạn quản lý rủi ro tài chính một cách thông minh và hiệu quả.',
            body2: '',
            features: [
                'Tư vấn giải pháp tài chính cá nhân hóa',
                'Theo dõi thị trường và tin tức đầu tư',
                'Công cụ tính toán đầu tư thông minh',
            ],
            featuresLabel: 'Khám phá các tính năng:',
            cta: 'Khám phá ngay',
            closing:
                'Nếu bạn cần hỗ trợ, đội ngũ Chào Market luôn sẵn sàng giúp đỡ. Chúc bạn có trải nghiệm tuyệt vời!',
            subject: 'Chào Market - Chào mừng bạn!',
        },
    },
    en: {
        slogan: 'Manage Your Account',
        otpExpiry: 'This code expires in 10 minutes.',
        whenWhere: 'When and where it happened:',
        metaDate: 'Date:',
        metaBrowser: 'Browser:',
        metaOS: 'Operating System:',
        metaLocation: 'Approximate Location:',
        securityNotice:
            "If you didn't take this action, let us know by contacting support. For your security, we'll require that you reset your password.",
        otpVerify: {
            title: 'Verify your account',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'Here is your verification code to complete your account registration:',
            subject: 'Chào Market - Account Verification Code',
        },
        emailVerify: {
            title: 'Verify your email',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'Your account has not been verified. Please use the code below to verify your email:',
            subject: 'Chào Market - Email Verification',
        },
        resetPassword: {
            title: 'Reset your password',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'You requested a password reset. Here is your OTP code to reset your password:',
            subject: 'Chào Market - Password Reset',
        },
        changePassword: {
            title: 'Confirm password change',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'You are changing your account password. Use the code below to confirm this change:',
            subject: 'Chào Market - Confirm Password Change',
        },
        editProfile: {
            title: 'Confirm profile update',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'You are updating your personal information. Use the code below to confirm this change:',
            subject: 'Chào Market - Confirm Profile Update',
        },
        passwordChanged: {
            title: 'Your password has been changed',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'Your account password has been changed successfully.',
            body2: 'If you did not make this change, please contact our support team immediately and reset your password.',
            subject: 'Chào Market - Password Changed',
        },
        changeEmailOld: {
            title: 'Confirm email change request',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'We received a request to change the email address on your account. Use the code below to confirm this request:',
            subject: 'Chào Market - Confirm Email Change',
        },
        changeEmailNew: {
            title: 'Verify your new email address',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'This email address has been requested as the new email for a Chào Market account. Use the code below to verify:',
            subject: 'Chào Market - Verify New Email',
        },
        consultationConfirmation: {
            title: 'Consultation Registration Confirmed',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'We have received your consultation request with the following solutions:',
            solutionsLabel: 'Selected Solutions:',
            submittedAtLabel: 'Submitted at:',
            preferredDateLabel: 'Preferred contact time:',
            notSelected: 'Not specified',
            closing:
                'Our Chào Market team will contact you as soon as possible. Thank you for trusting our services!',
            subject: 'Chào Market - Consultation Registration Confirmed',
        },
        consultationStatusUpdate: {
            title: (status: string) =>
                status === 'completed'
                    ? 'Consultation Request Completed'
                    : status === 'cancelled'
                      ? 'Consultation Request Cancelled'
                      : 'Consultation Request Update',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            bodyCompleted:
                'Your consultation request has been processed successfully. Our team will contact you based on your registered information.',
            bodyCancelled:
                'Your consultation request has been cancelled. If you have any questions, please contact our support team.',
            bodyRejected:
                'Unfortunately, your consultation request could not be processed. Please contact support for more details.',
            solutionsLabel: 'Solutions:',
            statusLabel: 'Status:',
            cta: 'View Details',
            closing: 'Thank you for using Chào Market!',
            subject: 'Chào Market - Consultation Request Update',
        },
        paymentConfirmation: {
            title: 'Payment Confirmation',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'Your payment has been processed successfully. Here are your order details:',
            orderCodeLabel: 'Order Code:',
            itemsLabel: 'Purchased Items:',
            totalLabel: 'Total Paid:',
            licenseLabel: 'Product Access & Downloads',
            durationLabel: 'Duration:',
            expiresLabel: 'Expires:',
            downloadLabel: 'Download',
            months: 'months',
            accessNote:
                'Access and manage your products at Account → Order History on our website.',
            cta: 'View Order History',
            closing: 'Wishing you all the best on your investment journey!',
            subject: 'Chào Market - Payment Confirmation',
        },
        welcome: {
            title: 'Welcome to Chào Market!',
            greeting: (name?: string) => (name ? `Hi ${name},` : 'Hi there,'),
            body: 'Your account has been created successfully. Chào Market is a platform that helps you manage financial risks smartly and effectively.',
            body2: '',
            features: [
                'Personalized financial solution consulting',
                'Market tracking and investment news',
                'Smart investment calculators',
            ],
            featuresLabel: 'Explore our features:',
            cta: 'Explore Now',
            closing:
                'If you need any assistance, the Chào Market team is always here to help. We wish you a wonderful experience!',
            subject: 'Chào Market - Welcome!',
        },
    },
} as const;

// ── Date formatting per locale ──
export function formatEmailDate(date: Date, locale: EmailLocale): string {
    const offset = -date.getTimezoneOffset();
    const tzSign = offset >= 0 ? '+' : '-';
    const tzHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const tzMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
    const tz = `(UTC${tzSign}${tzHours}:${tzMinutes})`;

    const day = String(date.getDate()).padStart(2, '0');
    const monthNum = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dayOfWeek = date.getDay(); // 0=Sunday

    if (locale === 'vi') {
        // Vietnamese: Thứ Năm, 14:30 (UTC+07:00) 17 tháng 02, 2026
        const viDays = [
            'Chủ Nhật',
            'Thứ Hai',
            'Thứ Ba',
            'Thứ Tư',
            'Thứ Năm',
            'Thứ Sáu',
            'Thứ Bảy',
        ];
        const dayName = viDays[dayOfWeek];
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${dayName}, ${hours}:${minutes} ${tz} ${day} tháng ${monthNum}, ${year}`;
    }

    // English: Thursday, 2:30 PM (UTC+07:00) February 17, 2026
    const enDays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];
    const dayName = enDays[dayOfWeek];
    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const monthName = monthNames[date.getMonth()];
    let hours12 = date.getHours() % 12;
    if (hours12 === 0) hours12 = 12;
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dayName}, ${hours12}:${minutes} ${ampm} ${tz} ${monthName} ${day}, ${year}`;
}

// ── Layout ──
function baseLayout(
    content: string,
    locale: EmailLocale,
    noReply = true
): string {
    const year = new Date().getFullYear();
    const slogan = t[locale].slogan;
    const noReplyNotice = noReply
        ? `<div style="border-top:1px solid #d9d9d9;padding-top:12px;margin-top:20px;">
        <p style="color:#999;font-size:12px;font-weight:400;line-height:1.6;margin:0;text-align:center;">${
            locale === 'vi'
                ? 'Đây là email tự động, vui lòng không trả lời. Nếu cần hỗ trợ, liên hệ <a href="mailto:support@chaomarket.com" style="color:#666;font-weight:600;text-decoration:underline;">support@chaomarket.com</a>'
                : 'This is an automated email. Please do not reply. For assistance, contact <a href="mailto:support@chaomarket.com" style="color:#666;font-weight:600;text-decoration:underline;">support@chaomarket.com</a>'
        }</p>
      </div>`
        : '';
    return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#f3f2ef;font-family:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f2ef;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- HEADER BAR (Yellow brand theme) -->
          <tr>
            <td style="background-color:#FFE400;padding:20px 24px;border-radius:8px 8px 0 0;border:1px solid #e0ce00;border-bottom:none;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:48px;height:48px;vertical-align:middle;">
                    <img src="${LOGO_URL}" alt="C" width="48" height="48" style="display:block;border-radius:8px;border:1px solid #1a1a1a;" />
                  </td>
                  <td style="padding-left:14px;vertical-align:middle;">
                    <span style="font-size:22px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px;">Chào Market</span>
                    <br/>
                    <span style="font-size:14px;font-weight:500;color:#333333;letter-spacing:0.3px;">${slogan}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTENT CARD -->
          <tr>
            <td style="background-color:#ffffff;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;border-bottom:1px solid #e0e0e0;border-radius:0 0 8px 8px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 32px 28px;">
                    ${content}
                    ${noReplyNotice}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 0 0;">
              <p style="color:#86888a;font-size:12px;line-height:1.6;margin:0;text-align:center;">
                © ${year} Chào Market · <a href="https://account.chaomarket.com" style="color:#86888a;text-decoration:none;">chaomarket.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function otpBlock(otpCode: string, locale: EmailLocale): string {
    return `
      <div style="background-color:transparent;border:2px solid #FFE400;border-radius:16px;padding:22px 28px;text-align:center;margin:20px 0 16px;">
        <span style="font-size:34px;font-weight:700;letter-spacing:10px;color:#1a1a1a;font-family:'Courier New',monospace;">${otpCode}</span>
      </div>
      <p style="color:#666;font-size:13px;text-align:center;margin:0 0 8px;">${t[locale].otpExpiry}</p>
    `;
}

function metaBlock(locale: EmailLocale, meta?: RequestMeta): string {
    if (!meta) return '';
    const tr = t[locale];
    let html = `
      <div style="margin:20px 0 0;padding:16px 0 0;border-top:1px solid #ebebeb;">
        <p style="color:#1a1a1a;font-size:14px;font-weight:700;margin:0 0 8px;line-height:1.4;">${tr.whenWhere}</p>`;
    if (meta.date)
        html += `
        <p style="color:#333;font-size:14px;margin:0 0 2px;line-height:1.6;"><strong>${tr.metaDate}</strong> ${meta.date}</p>`;
    if (meta.browser)
        html += `
        <p style="color:#333;font-size:14px;margin:0 0 2px;line-height:1.6;"><strong>${tr.metaBrowser}</strong> ${meta.browser}</p>`;
    if (meta.os)
        html += `
        <p style="color:#333;font-size:14px;margin:0 0 2px;line-height:1.6;"><strong>${tr.metaOS}</strong> ${meta.os}</p>`;
    if (meta.location)
        html += `
        <p style="color:#333;font-size:14px;margin:0 0 2px;line-height:1.6;"><strong>${tr.metaLocation}</strong> ${meta.location}</p>`;
    html += `
      </div>`;
    return html;
}

function securityNotice(locale: EmailLocale): string {
    return `
      <p style="color:#666;font-size:14px;line-height:1.6;margin:24px 0 0;padding-top:16px;border-top:1px solid #ebebeb;">
        ${t[locale].securityNotice}
      </p>
    `;
}

// ── Exported email generators ──

export function otpVerificationEmail(
    otpCode: string,
    locale: EmailLocale = 'vi',
    userName?: string,
    meta?: RequestMeta
): string {
    const tr = t[locale].otpVerify;
    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 4px;">${tr.body}</p>
      ${otpBlock(otpCode, locale)}
      ${metaBlock(locale, meta)}
      ${securityNotice(locale)}
    `,
        locale
    );
}

export function emailVerificationOtpEmail(
    otpCode: string,
    locale: EmailLocale = 'vi',
    userName?: string,
    meta?: RequestMeta
): string {
    const tr = t[locale].emailVerify;
    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 4px;">${tr.body}</p>
      ${otpBlock(otpCode, locale)}
      ${metaBlock(locale, meta)}
      ${securityNotice(locale)}
    `,
        locale
    );
}

export function resetPasswordOtpEmail(
    otpCode: string,
    locale: EmailLocale = 'vi',
    userName?: string,
    meta?: RequestMeta
): string {
    const tr = t[locale].resetPassword;
    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 4px;">${tr.body}</p>
      ${otpBlock(otpCode, locale)}
      ${metaBlock(locale, meta)}
      ${securityNotice(locale)}
    `,
        locale
    );
}

export function changePasswordOtpEmail(
    otpCode: string,
    locale: EmailLocale = 'vi',
    userName?: string,
    meta?: RequestMeta
): string {
    const tr = t[locale].changePassword;
    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 4px;">${tr.body}</p>
      ${otpBlock(otpCode, locale)}
      ${metaBlock(locale, meta)}
      ${securityNotice(locale)}
    `,
        locale
    );
}

export function editProfileOtpEmail(
    otpCode: string,
    locale: EmailLocale = 'vi',
    userName?: string,
    meta?: RequestMeta
): string {
    const tr = t[locale].editProfile;
    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 4px;">${tr.body}</p>
      ${otpBlock(otpCode, locale)}
      ${metaBlock(locale, meta)}
      ${securityNotice(locale)}
    `,
        locale
    );
}

// ── Password changed notification ──
export function passwordChangedEmail(
    locale: EmailLocale = 'vi',
    userName?: string,
    meta?: RequestMeta
): string {
    const tr = t[locale].passwordChanged;
    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 8px;">${tr.body}</p>
      <p style="color:#c0392b;font-size:15px;line-height:1.6;margin:0 0 0;font-weight:600;">${tr.body2}</p>
      ${metaBlock(locale, meta)}
    `,
        locale
    );
}

// ── Email change OTP (sent to OLD email) ──
export function changeEmailOldOtpEmail(
    otpCode: string,
    locale: EmailLocale = 'vi',
    userName?: string,
    meta?: RequestMeta
): string {
    const tr = t[locale].changeEmailOld;
    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 4px;">${tr.body}</p>
      ${otpBlock(otpCode, locale)}
      ${metaBlock(locale, meta)}
      ${securityNotice(locale)}
    `,
        locale
    );
}

// ── Email change OTP (sent to NEW email) ──
export function changeEmailNewOtpEmail(
    otpCode: string,
    locale: EmailLocale = 'vi',
    userName?: string
): string {
    const tr = t[locale].changeEmailNew;
    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 4px;">${tr.body}</p>
      ${otpBlock(otpCode, locale)}
      ${securityNotice(locale)}
    `,
        locale
    );
}

// ── Consultation confirmation ──
export function consultationConfirmationEmail(
    solutionNames: string[],
    locale: EmailLocale = 'vi',
    userName?: string,
    submittedAt?: Date,
    preferredContactDate?: string | null
): string {
    const tr = t[locale].consultationConfirmation;
    const solutionsList = solutionNames
        .map(
            name =>
                `<li style="color:#1a1a1a;font-size:16px;font-weight:600;line-height:2;border-left:3px solid #1a1a1a;padding-left:10px;margin-bottom:4px;list-style:none;">${name}</li>`
        )
        .join('');

    const timestamp = submittedAt
        ? formatEmailDate(submittedAt, locale)
        : formatEmailDate(new Date(), locale);

    // Preferred contact date: show formatted date or "not selected" indicator
    const preferredDateDisplay = preferredContactDate
        ? formatEmailDate(new Date(preferredContactDate), locale)
        : `<span style="color:#999;font-style:italic;">${tr.notSelected}</span>`;

    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:20px;font-weight:700;margin:0 0 8px;line-height:1.4;">${tr.title}</p>
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 12px;">${tr.body}</p>
      <div style="background-color:#faf8f3;border:1px solid #999;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
        <p style="color:#1a1a1a;font-size:14px;font-weight:600;margin:0 0 10px;">${tr.solutionsLabel}</p>
        <ul style="margin:0;padding-left:0;">
          ${solutionsList}
        </ul>
      </div>
      <p style="color:#666;font-size:13px;margin:0 0 16px;">${tr.submittedAtLabel} ${timestamp}</p>
      <div style="background-color:#faf8f3;border:1px solid #999;border-left:4px solid #1a1a1a;border-radius:8px;padding:14px 20px;margin:0 0 20px;">
        <p style="color:#666;font-size:13px;font-weight:500;margin:0 0 4px;">${tr.preferredDateLabel}</p>
        <p style="color:#1a1a1a;font-size:16px;font-weight:700;margin:0;">${preferredDateDisplay}</p>
      </div>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0;">${tr.closing}</p>
    `,
        locale,
        false
    );
}

// ── Welcome email ──
export function welcomeEmail(
    locale: EmailLocale = 'vi',
    userName?: string
): string {
    const tr = t[locale].welcome;
    const featuresList = tr.features
        .map(
            f =>
                `<li style="color:#1a1a1a;font-size:15px;line-height:2;border-left:3px solid #1a1a1a;padding-left:10px;margin-bottom:4px;list-style:none;">${f}</li>`
        )
        .join('');

    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:20px;font-weight:700;margin:0 0 8px;line-height:1.4;">${tr.title}</p>
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 4px;">${tr.body}</p>
      ${tr.body2 ? `<p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px;">${tr.body2}</p>` : ''}
      <div style="background-color:#faf8f3;border:1px solid #999;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
        <p style="color:#1a1a1a;font-size:14px;font-weight:600;margin:0 0 10px;">${tr.featuresLabel}</p>
        <ul style="margin:0;padding-left:0;">
          ${featuresList}
        </ul>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://account.chaomarket.com" style="display:inline-block;background-color:#FFE400;color:#1a1a1a;font-size:14px;font-weight:700;padding:10px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.3px;border:1px solid #999;">${tr.cta}</a>
      </div>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0;">${tr.closing}</p>
    `,
        locale
    );
}

// ── Subject helpers ──
export function getEmailSubject(
    type:
        | 'otpVerify'
        | 'emailVerify'
        | 'resetPassword'
        | 'changePassword'
        | 'editProfile'
        | 'passwordChanged'
        | 'changeEmailOld'
        | 'changeEmailNew'
        | 'consultationConfirmation'
        | 'consultationStatusUpdate'
        | 'paymentConfirmation'
        | 'welcome',
    locale: EmailLocale = 'vi'
): string {
    return t[locale][type].subject;
}

// ── Payment confirmation ──
export interface PaymentItem {
    name: string;
    quantity: number;
    price: number;
}

export interface LicenseItem {
    productName: string;
    durationMonths: number;
    expiresAt: string;
    downloadLink?: string | null;
}

export function paymentConfirmationEmail(
    orderCode: string,
    items: PaymentItem[],
    totalAmount: number,
    locale: EmailLocale = 'vi',
    userName?: string,
    licenseItems?: LicenseItem[]
): string {
    const tr = t[locale].paymentConfirmation;
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'VND',
        currencyDisplay: 'code',
        maximumFractionDigits: 0,
    });

    const itemsList = items
        .map(
            item =>
                `<li style="color:#1a1a1a;font-size:15px;line-height:2;border-left:3px solid #1a1a1a;padding-left:10px;margin-bottom:4px;list-style:none;">${item.name} × ${item.quantity} — <strong>${currencyFormatter.format(item.price * item.quantity)}</strong></li>`
        )
        .join('');

    const timestamp = formatEmailDate(new Date(), locale);

    // License section (only if licenses exist)
    let licenseSection = '';
    if (licenseItems && licenseItems.length > 0) {
        const licenseRows = licenseItems
            .map(lic => {
                const expiryDate = new Date(lic.expiresAt).toLocaleDateString(
                    locale === 'vi' ? 'vi-VN' : 'en-US',
                    { day: '2-digit', month: '2-digit', year: 'numeric' }
                );
                const downloadBtn = lic.downloadLink
                    ? `<a href="${lic.downloadLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#FFE400;color:#1a1a1a;font-size:12px;font-weight:700;padding:6px 14px;border-radius:4px;text-decoration:none;margin-top:8px;border:1px solid #999;">${tr.downloadLabel}</a>`
                    : '';
                return `
        <div style="padding:12px 0;border-bottom:1px solid #eee;">
          <p style="color:#1a1a1a;font-size:14px;font-weight:700;margin:0 0 6px;">${lic.productName}</p>
          <p style="color:#666;font-size:12px;margin:0;">${tr.durationLabel} ${lic.durationMonths} ${tr.months} · ${tr.expiresLabel} ${expiryDate}</p>
          ${downloadBtn}
        </div>`;
            })
            .join('');

        licenseSection = `
      <div style="background-color:#faf8f3;border:1px solid #999;border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="color:#1a1a1a;font-size:14px;font-weight:700;margin:0 0 6px;">${tr.licenseLabel}</p>
        ${licenseRows}
      </div>`;
    }

    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:20px;font-weight:700;margin:0 0 8px;line-height:1.4;">${tr.title}</p>
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 12px;">${tr.body}</p>
      <div style="background-color:#faf8f3;border:1px solid #999;border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="color:#666;font-size:13px;font-weight:500;margin:0 0 4px;">${tr.orderCodeLabel}</p>
        <p style="color:#1a1a1a;font-size:20px;font-weight:700;margin:0;letter-spacing:1px;">${orderCode}</p>
      </div>
      <div style="background-color:#faf8f3;border:1px solid #999;border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="color:#1a1a1a;font-size:14px;font-weight:600;margin:0 0 10px;">${tr.itemsLabel}</p>
        <ul style="margin:0;padding-left:0;">
          ${itemsList}
        </ul>
        <div style="border-top:1px solid #ddd;margin-top:12px;padding-top:12px;">
          <p style="color:#1a1a1a;font-size:16px;font-weight:700;margin:0;text-align:right;">${tr.totalLabel} ${currencyFormatter.format(totalAmount)}</p>
        </div>
      </div>
      ${licenseSection}
      <p style="color:#666;font-size:13px;margin:0 0 16px;">${timestamp}</p>
      <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 16px;font-weight:600;">${tr.accessNote}</p>
      <div style="text-align:center;margin:20px 0;">
        <a href="https://account.chaomarket.com/orders" style="display:inline-block;background-color:#FFE400;color:#1a1a1a;font-size:14px;font-weight:700;padding:10px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.3px;border:1px solid #999;">${tr.cta}</a>
      </div>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0;">${tr.closing}</p>
    `,
        locale,
        false
    );
}

// ── Consultation status update (for admin panel use) ──
export function consultationStatusUpdateEmail(
    status: 'completed' | 'cancelled' | 'rejected',
    solutionNames: string[],
    locale: EmailLocale = 'vi',
    userName?: string
): string {
    const tr = t[locale].consultationStatusUpdate;
    const body =
        status === 'completed'
            ? tr.bodyCompleted
            : status === 'cancelled'
              ? tr.bodyCancelled
              : tr.bodyRejected;

    const statusDisplay =
        status === 'completed'
            ? locale === 'vi'
                ? '✅ Hoàn tất'
                : '✅ Completed'
            : status === 'cancelled'
              ? locale === 'vi'
                  ? '🚫 Đã hủy'
                  : '🚫 Cancelled'
              : locale === 'vi'
                ? '❌ Từ chối'
                : '❌ Rejected';

    const statusColor =
        status === 'completed'
            ? '#22c55e'
            : status === 'cancelled'
              ? '#9ca3af'
              : '#ef4444';

    const solutionsList = solutionNames
        .map(
            name =>
                `<li style="color:#1a1a1a;font-size:15px;line-height:2;border-left:3px solid #1a1a1a;padding-left:10px;margin-bottom:4px;list-style:none;">${name}</li>`
        )
        .join('');

    return baseLayout(
        `
      <p style="color:#1a1a1a;font-size:20px;font-weight:700;margin:0 0 8px;line-height:1.4;">${tr.title(status)}</p>
      <p style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;line-height:1.4;">${tr.greeting(userName)}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 12px;">${body}</p>
      <div style="background-color:#faf8f3;border:1px solid #999;border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="color:#666;font-size:13px;font-weight:500;margin:0 0 4px;">${tr.statusLabel}</p>
        <p style="color:${statusColor};font-size:18px;font-weight:700;margin:0;">${statusDisplay}</p>
      </div>
      <div style="background-color:#faf8f3;border:1px solid #999;border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="color:#1a1a1a;font-size:14px;font-weight:600;margin:0 0 10px;">${tr.solutionsLabel}</p>
        <ul style="margin:0;padding-left:0;">
          ${solutionsList}
        </ul>
      </div>
      <div style="text-align:center;margin:20px 0;">
        <a href="https://account.chaomarket.com/orders" style="display:inline-block;background-color:#FFE400;color:#1a1a1a;font-size:14px;font-weight:700;padding:10px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.3px;border:1px solid #999;">${tr.cta}</a>
      </div>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0;">${tr.closing}</p>
    `,
        locale,
        false
    );
}
