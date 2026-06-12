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
} from 'react-email';

interface VerificationEmailProps {
  username: string;
  verificationurl: string;
}

export default function VerificationEmail({
  username,
  verificationurl,
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Email</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Verify your email address</Preview>
      <Section>
        <Row>
          <Heading as="h2">Hello {username},</Heading>
        </Row>
        <Row>
          <Text>
            Thank you for registering. Please click the button below to verify
            your email address:
          </Text>
        </Row>
        <Row>
          <Button
            href={verificationurl}
            style={{ color: '#61dafb' }}
          >
            Verify here
          </Button>
        </Row>
        <Row>
          <Text>
            If you did not request this, please ignore this email.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
  