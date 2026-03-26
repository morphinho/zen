/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="hr" dir="ltr">
    <Head />
    <Preview>Vaš verifikacijski kôd za ZenLife</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://tblnbfebinpzxqycsfry.supabase.co/storage/v1/object/public/email-assets/zenlife-logo.svg"
          alt="ZenLife"
          width="120"
          height="auto"
          style={logo}
        />
        <Heading style={h1}>Verifikacijski kôd</Heading>
        <Text style={text}>Koristite sljedeći kôd za potvrdu svog identiteta:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Ovaj kôd uskoro istječe. Ako ga niste zatražili, možete zanemariti ovu poruku.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: "'Plus Jakarta Sans', Courier, monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#3B9B6E',
  margin: '0 0 24px',
  letterSpacing: '4px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
