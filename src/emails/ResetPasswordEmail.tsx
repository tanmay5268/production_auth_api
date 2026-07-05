import {
    Html,
    Head,
    Font,
    Preview,
    Heading,
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
                    fontFamily="Space Grotesk"
                    fallbackFontFamily="Arial"
                    webFont={{
                        url: "https://fonts.gstatic.com/s/spacegrotesk/v15/V8zPrYDjM25JgCnBHqH5YsA-W-tuMR1.woff2",
                        format: "woff2",
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
                <Font
                    fontFamily="Cormorant Garamond"
                    fallbackFontFamily="Georgia"
                    webFont={{
                        url: "https://fonts.gstatic.com/s/cormorantgaramond/v17/H4cjHJWgjSQWXrAMqHtCfw.woff2",
                        format: "woff2",
                    }}
                    fontWeight={600}
                    fontStyle="normal"
                />
            </Head>
            <Preview>Reset your AuthAPI password</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Left rail with embedded monogram */}
                    <Section style={leftRail}>
                        <Text style={monogram}>🛡</Text>
                    </Section>

                    {/* Right content area */}
                    <Section style={contentArea}>
                        <Text style={brandName}>AuthAPI</Text>

                        <Heading style={heading}>Reset your password</Heading>

                        <Text style={greeting}>Hello {username},</Text>

                        <Text style={bodyText}>
                            We received a request to reset the password for your account.
                            Click below to set a new password.
                        </Text>

                        <Section style={buttonWrapper}>
                            <Button href={reseturl} style={button}>
                                Reset Password
                            </Button>
                        </Section>

                        <Text style={noteText}>
                            This link expires in 1 hour. Did not request this reset?
                            Simply ignore this email.
                        </Text>

                        <Hr style={hr} />

                        <Section style={fallbackSection}>
                            <Text style={fallbackLabel}>Alternate link</Text>
                            <Link href={reseturl} style={fallbackLink}>
                                {reseturl}
                            </Link>
                        </Section>

                        <Text style={footerText}>
                            © {new Date().getFullYear()} AuthAPI. All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

// Premium Security Stationery palette (shared with VerificationEmail)
const main = {
    backgroundColor: "#faf9f6", // Paper
    fontFamily: "Space Grotesk, -apple-system, Arial, sans-serif",
    padding: "48px 0",
    backgroundImage:
        "radial-gradient(circle at top left, rgba(184, 134, 11, 0.02) 0%, transparent 50%)",
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "0",
    width: "580px",
    maxWidth: "100%",
    borderRadius: "0",
    borderLeft: "1px solid #e8e2d9",
    borderRight: "1px solid #e8e2d9",
    borderTop: "1px solid #e8e2d9",
    borderBottom: "2px solid #b8860b", // Brass accent bottom border
    boxShadow: "0 8px 24px -4px rgba(10, 10, 10, 0.04)",
};

const leftRail = {
    position: "absolute" as const,
    left: "40px",
    top: "60px",
};

const monogram = {
    fontSize: "48px",
    lineHeight: "1",
    opacity: "0.04",
    margin: "0",
    transform: "rotate(-15deg)",
};

const contentArea = {
    padding: "48px 40px 48px 100px", // left padding for monogram space
    position: "relative" as const,
};

const brandName = {
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "1.5px",
    color: "#b8860b", // Brass
    margin: "0 0 32px",
};

const heading = {
    fontFamily: "Cormorant Garamond, Georgia, serif",
    fontSize: "32px",
    fontWeight: "600",
    color: "#0a0a0a", // Charcoal
    lineHeight: "40px",
    margin: "0 0 28px",
};

const greeting = {
    fontSize: "16px",
    fontWeight: "500",
    color: "#0a0a0a",
    margin: "0 0 12px",
};

const bodyText = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#475569",
    margin: "0 0 32px",
};

const buttonWrapper = {
    textAlign: "left" as const,
    margin: "0 0 32px",
};

const button = {
    backgroundColor: "#b8860b", // Brass - premium accent
    borderRadius: "0",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 32px",
    border: "none",
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
};

const noteText = {
    fontSize: "13px",
    lineHeight: "20px",
    color: "#8a9a8a", // Sage
    margin: "0 0 28px",
};

const hr = {
    border: "none",
    height: "1px",
    backgroundColor: "#e8e2d9", // Sand
    margin: "28px 0",
};

const fallbackSection = {
    backgroundColor: "#faf9f6", // Paper, light
    borderRadius: "0",
    padding: "16px",
    margin: "0 0 32px",
    borderLeft: "2px solid #b8860b",
};

const fallbackLabel = {
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    margin: "0 0 6px",
};

const fallbackLink = {
    fontSize: "13px",
    color: "#0a0a0a",
    wordBreak: "break-all" as const,
    margin: "0",
    textDecoration: "underline",
};

const footerText = {
    fontSize: "12px",
    lineHeight: "18px",
    color: "#94a3b8",
    margin: "0",
};