import 'dotenv/config';
import { Resend } from 'resend';
import { env } from '@/utils/configurations';
import ResetPasswordEmail from "@/emails/ResetPasswordEmail";
import VerificationEmail from '@/emails/VerificationEmail';
class EmailFunctions {
  async sendMail({
    VERIFICATION_URL,
    email,
    username,
  }: {
    VERIFICATION_URL: string;
    email: string;
    username: string;
  }) {
      const resend = new Resend(env.MAIL_SERVICE_API_KEY); ;
      console.log('Attempting to send email to:', email);
      console.log('Verification URL:', VERIFICATION_URL);
      
       const response = await resend.emails.send({
        from: 'production-auth-api@resend.dev',
        to: email,
        subject: 'Verify your email address',
        react: VerificationEmail({
          username: username,
          verificationurl: VERIFICATION_URL,
        }),
      });
      return response;
  }
  async sendResetPasswordMail({
    RESET_URL,
    email,
    username,
  }: {
    RESET_URL: string;
    email: string;
    username: string;
  }) {
      const resend = new Resend(env.MAIL_SERVICE_API_KEY); ;
      console.log('Attempting to send reset password email to:', email);
      console.log('Reset URL:', RESET_URL);
      
       const response = await resend.emails.send({
        from: 'production-auth-api@resend.dev',
        to: email,
        subject: 'Reset your password',
        react: ResetPasswordEmail({
          username: username,
          reseturl: RESET_URL,
        }),
      });
      return response;
  }
}
export const EmailService = new EmailFunctions();
