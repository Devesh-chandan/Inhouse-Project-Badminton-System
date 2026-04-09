const puppeteer = require('puppeteer');
const AWS = require('aws-sdk');
const { Match, MatchSet, Point } = require('../models');

function getS3() {
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_REGION ||
    !process.env.AWS_BUCKET
  ) {
    return null;
  }
  return new AWS.S3({
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:          process.env.AWS_REGION,
  });
}

async function generateScorecard(matchId) {
  const match = await Match.findByPk(matchId, {
    include: [
      { association: 'player1' },
      { association: 'player2' },
      { association: 'winner' },
      { association: 'sets', include: [{ association: 'points' }] },
      { association: 'referee' },
    ],
  });
  if (!match) throw new Error('Match not found');

  const html = buildScorecardHtml(match);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: 'new',
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  const s3 = getS3();
  if (!s3) {
    // Return as base64 data-URL when no S3 configured (development fallback)
    const base64 = Buffer.from(pdfBuffer).toString('base64');
    return { url: `data:application/pdf;base64,${base64}`, key: null };
  }

  // Upload to S3
  const key = `scorecards/${matchId}.pdf`;
  await s3.putObject({
    Bucket:      process.env.AWS_BUCKET,
    Key:         key,
    Body:        pdfBuffer,
    ContentType: 'application/pdf',
  }).promise();

  const url = s3.getSignedUrl('getObject', {
    Bucket:  process.env.AWS_BUCKET,
    Key:     key,
    Expires: 86400 * 7, // 7 days
  });

  return { url, key };
}

function buildScorecardHtml(match) {
  const sets = match.sets || [];
  const setRows = sets.map(s => `
    <tr>
      <td>Set ${s.setNumber}</td>
      <td class="${s.winnerId === match.player1Id ? 'winner' : ''}">${s.player1Score}</td>
      <td class="${s.winnerId === match.player2Id ? 'winner' : ''}">${s.player2Score}</td>
      <td>${s.durationSecs ? Math.floor(s.durationSecs / 60) + ' min' : '-'}</td>
      <td>${s.points?.length || 0} rallies</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1a1a1a; }
  .header { text-align: center; border-bottom: 3px solid #1a56db; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { font-size: 28px; color: #1a56db; margin: 0 0 4px; }
  .header p { color: #6b7280; font-size: 14px; margin: 4px 0; }
  .players { display: flex; justify-content: space-around; margin: 20px 0; text-align: center; }
  .player-name { font-size: 22px; font-weight: 700; }
  .vs { font-size: 18px; color: #9ca3af; align-self: center; }
  .winner-badge { background: #1a56db; color: white; font-size: 11px; padding: 2px 8px; border-radius: 999px; display: inline-block; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th { background: #f3f4f6; text-align: left; padding: 10px 14px; font-size: 13px; color: #374151; border-bottom: 2px solid #e5e7eb; }
  td { padding: 10px 14px; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
  .winner { font-weight: 700; color: #1a56db; }
  .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: right; }
</style>
</head>
<body>
  <div class="header">
    <h1>Match Scorecard</h1>
    <p>${match.tournament?.name || ''} &mdash; Round ${match.round}</p>
    <p>Court ${match.courtNumber || '-'} &bull; Referee: ${match.referee?.name || '-'}</p>
  </div>
  <div class="players">
    <div>
      <div class="player-name">${match.player1?.name || 'TBD'}</div>
      ${match.winnerId === match.player1Id ? '<span class="winner-badge">Winner</span>' : ''}
    </div>
    <div class="vs">VS</div>
    <div>
      <div class="player-name">${match.player2?.name || 'TBD'}</div>
      ${match.winnerId === match.player2Id ? '<span class="winner-badge">Winner</span>' : ''}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Set</th>
        <th>${match.player1?.name || 'P1'}</th>
        <th>${match.player2?.name || 'P2'}</th>
        <th>Duration</th>
        <th>Rallies</th>
      </tr>
    </thead>
    <tbody>${setRows}</tbody>
  </table>
  <div class="footer">Generated ${new Date().toLocaleString()}</div>
</body>
</html>`;
}

module.exports = { generateScorecard };
