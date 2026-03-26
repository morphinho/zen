/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="hr" dir="ltr">
    <Head />
    <Preview>Vaša poveznica za pristup ZenLife</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://tblnbfebinpzxqycsfry.supabase.co/storage/v1/object/public/email-assets/zenlife-logo.svg"
          alt="ZenLife"
          width="120"
          height="auto"
          style={logo}
        />
        <Heading style={h1}>Vaša poveznica za pristup</Heading>
        <Text style={text}>
          Kliknite na gumb za pristup vašem ZenLife računu. Ova poveznica uskoro istječe.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Pristupiti ZenLife
        </Button>
        <Text style={footer}>
          Ako niste zatražili ovu poveznicu, možete zanemariti ovu poruku.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '480px', margin: '0 auto' }
const logo = { margin: '0 0 24px 0' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#2E3830',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#798079',
  lineHeight: '1.5',
  margin: '0 0 20px',
}
const button = {
  backgroundColor: '#3B9B6E',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '16px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block' as const,
  margin: '0 0 24px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
