import 'dotenv/config';
import { configuration } from '@/utils/configurations';
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
      const resend = configuration.getMailService();
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
}
export const EmailService = new EmailFunctions();
