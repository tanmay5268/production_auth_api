import "dotenv/config";
import { Resend } from 'resend';
class configs {
    private AUTH_BASE_URL = process.env.AUTH_BASE_URL;
    private DATABASE_URL = process.env.DATABASE_URL;
    private MAIL_SERVICE_API_KEY = process.env.MAIL_SERVICE_API_KEY
    getAuthurl() {
        return this.AUTH_BASE_URL;
    }
    
    getDBurl() {
        return this.DATABASE_URL;
    }
    getMailService() {
        const resend = new Resend(this.MAIL_SERVICE_API_KEY);
        return resend;
    }
}

export const configuration = new configs();
