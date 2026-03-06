export const sponsorEmail = (userName: string, count: number, level: number) => ({
    subject: `🏆 Livello ${level} Sponsor! Stai andando benissimo!`,
    html: `
    <div style="font-family: Georgia, serif; background: #F5F1E8; padding: 40px; text-align: center;">
      <h1 style="color: #8B1538; font-size: 32px;">Congratulazioni ${userName}! 🍷</h1>
      <p style="font-size: 24px; color: #C9A961;">Hai raggiunto <strong>${count} malus</strong> totali!</p>
      <div style="background: white; padding: 30px; border-radius: 16px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 18px; color: #2D2424;">Sei ufficialmente promosso a:</p>
        <h2 style="color: #8B1538; font-size: 36px; margin: 10px 0;">SPONSOR UFFICIALE</h2>
        <p style="font-size: 48px;">☕💰</p>
        <p style="font-style: italic; color: #666; margin-top: 20px;">
          "Stai andando bene... forse troppo bene!"
        </p>
      </div>
      <p style="color: #8B1538; font-size: 14px;">
        Se continui così, pagherai il caffè a tutti noi! ☕
      </p>
    </div>
  `
});

export const judgmentEmail = (proposer: string, target: string, reason: string, link: string) => ({
    subject: `⚖️ Serve un giudice: ${proposer} vs ${target}`,
    html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8B1538;">C'è bisogno del tuo giudizio! 👨⚖️</h2>
      <p><strong>${proposer}</strong> accusa <strong>${target}</strong> di:</p>
      <blockquote style="background: #f0f0f0; padding: 15px; border-left: 4px solid #8B1538; font-style: italic;">
        "${reason}"
      </blockquote>
      <p>Tu (o qualsiasi altro collega) dovete decidere se è vero o no!</p>
      <a href="${link}" style="display: inline-block; background: #8B1538; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">
        Vota ora!
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Il primo che vota decide! Non fartelo scappare! 🏃‍♂️
      </p>
    </div>
  `
});
