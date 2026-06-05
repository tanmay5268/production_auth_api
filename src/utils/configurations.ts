import "dotenv/config";
class configs {
    private AUTH_BASE_URL = process.env.AUTH_BASE_URL;
    private DATABASE_URL = process.env.DATABASE_URL;

    getAuthurl() {
        return this.AUTH_BASE_URL;
    }
    
    getDBurl() {
        return this.DATABASE_URL;
    }
}

export const configuration = new configs();
