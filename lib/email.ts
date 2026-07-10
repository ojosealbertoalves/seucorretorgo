import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarEmailNovoLead(lead: {
  nome: string
  email: string
  whatsapp: string
  score?: number
}) {
  try {
    await resend.emails.send({
      from: 'Alberto <onboarding@resend.dev>',
      to: 'j.albertocivil@gmail.com',
      subject: `🏡 Novo lead: ${lead.nome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0F1F0F; padding: 24px; border-radius: 8px;">
            <h1 style="color: #E07B3A; margin: 0 0 8px;">
              Novo lead na Só Terrenos GO!
            </h1>
            <p style="color: #F7F2EA; margin: 0;">
              Um novo cliente solicitou contato.
            </p>
          </div>

          <div style="padding: 24px; background: #f9f9f9; border-radius: 8px; margin-top: 16px;">
            <h2 style="color: #1A2E1A; margin: 0 0 16px;">Dados do Lead</h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;">Nome:</td>
                <td style="padding: 8px 0; color: #1A2E1A; font-weight: bold;">
                  ${lead.nome}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">WhatsApp:</td>
                <td style="padding: 8px 0; color: #1A2E1A; font-weight: bold;">
                  <a href="https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}"
                     style="color: #E07B3A;">
                    ${lead.whatsapp}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email:</td>
                <td style="padding: 8px 0; color: #1A2E1A;">
                  ${lead.email}
                </td>
              </tr>
              ${lead.score ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Score:</td>
                <td style="padding: 8px 0; color: #1A2E1A; font-weight: bold;">
                  ${lead.score}/10
                </td>
              </tr>` : ''}
            </table>
          </div>

          <div style="padding: 24px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/admin/leads"
               style="background: #E07B3A; color: white; padding: 12px 24px;
                      border-radius: 6px; text-decoration: none; font-weight: bold;">
              Ver no painel →
            </a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center;">
            Só Terrenos GO · Goiânia e Região
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('[email] erro ao enviar:', error)
    // Não quebra o fluxo se o email falhar
  }
}
