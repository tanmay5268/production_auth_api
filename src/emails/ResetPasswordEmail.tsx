import {
    Html,
    Head,
    Font,
    Preview,
    Heading,
    Row,
    Section,
    Text,
    Button,
    Body,
    Container,
    Hr,
    Link,
} from "react-email";

interface ResetPasswordEmailProps {
    username: string;
    reseturl: string;
}

export default function ResetPasswordEmail({
    username,
    reseturl,
}: ResetPasswordEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head>
                <title>Reset your password</title>
                <Font
                    fontFamily="Inter"
                    fallbackFontFamily="Arial"
                    webFont={{
                        url: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_yc8.woff2",
                        format: "woff2",
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
                <Font
                    fontFamily="Inter"
                    fallbackFontFamily="Arial"
                    webFont={{
                        url: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_yc8.woff2",
                        format: "woff2",
                    }}
                    fontWeight={600}
                    fontStyle="normal"
                />
                <Font
                    fontFamily="Inter"
                    fallbackFontFamily="Arial"
                    webFont={{
                        url: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuG2fAZ9hjp-Ek-_yc8.woff2",
                        format: "woff2",
                    }}
                    fontWeight={700}
                    fontStyle="normal"
                />
            </Head>
            <Preview>Reset your password for AuthAPI</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoContainer}>
                        <Text style={logo}>🛡️ AuthAPI</Text>
                    </Section>

                    <Section style={box}>
                        <Heading style={heading}>
                            Reset your password
                        </Heading>

                        <Text style={greeting}>Hello {username},</Text>

                        <Text style={text}>
                            We received a request to reset the password for your
                            AuthAPI account. Click the button below to set a new
                            password.
                        </Text>

                        <Section style={buttonContainer}>
                            <Button href={reseturl} style={button}>
                                Reset Password
                            </Button>
                        </Section>

                        <Text style={text}>
                            This link will expire in 1 hour. If you did not
                            request a password reset, you can safely ignore this
                            email.
                        </Text>

                        <Hr style={hr} />

                        <Section style={linkContainer}>
                            <Text style={linkLabel}>
                                Or copy and paste this link into your browser:
                            </Text>
                            <Link href={reseturl} style={linkText}>
                                {reseturl}
                            </Link>
                        </Section>

                        <Text style={footerSecurity}>
                            Need help? Feel free to contact our support team.
                        </Text>

                        <Text style={footerText}>
                            © {new Date().getFullYear()} AuthAPI. All rights
                            reserved.
                        </Text>
                        <Text style={footerText}>
                            100 Pine Street, Suite 1200, San Francisco, CA 94111
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f8fafc",
    fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "40px 0",
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 20px",
    width: "560px",
    maxWidth: "100%",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
};

const logoContainer = {
    textAlign: "center" as const,
    marginBottom: "32px",
};

const logo = {
    fontSize: "24px",
    fontWeight: "800",
    color: "#4f46e5",
    letterSpacing: "-0.5px",
    margin: "0",
};

const box = {
    padding: "0 16px",
};

const heading = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: "32px",
    margin: "0 0 24px",
    textAlign: "center" as const,
};

const greeting = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 12px",
};

const text = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#475569",
    margin: "0 0 20px",
};

const buttonContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    backgroundColor: "#4f46e5",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 32px",
};

const linkContainer = {
    backgroundColor: "#f1f5f9",
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0",
    border: "1px solid #e2e8f0",
};

const linkLabel = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    margin: "0 0 8px",
};

const linkText = {
    fontSize: "13px",
    color: "#4f46e5",
    wordBreak: "break-all" as const,
    margin: "0",
    textDecoration: "underline",
};

const hr = {
    borderColor: "#e2e8f0",
    margin: "32px 0 24px",
};

const footerSecurity = {
    fontSize: "13px",
    lineHeight: "20px",
    color: "#64748b",
    textAlign: "center" as const,
    margin: "0 0 24px",
};

const footerText = {
    fontSize: "12px",
    lineHeight: "18px",
    color: "#94a3b8",
    textAlign: "center" as const,
    margin: "0",
};
