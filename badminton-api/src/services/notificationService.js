let admin = null;

// Initialize Firebase Admin lazily — only when credentials are present
function getAdmin() {
  if (admin) return admin;

  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    console.warn('Firebase credentials not set — push notifications are disabled.');
    return null;
  }

  try {
    const firebaseAdmin = require('firebase-admin');
    if (!firebaseAdmin.apps.length) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert({
          projectId:   FIREBASE_PROJECT_ID,
          privateKey:  FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    admin = firebaseAdmin;
  } catch (err) {
    console.error('Firebase init error:', err.message);
    return null;
  }

  return admin;
}

async function sendToDevice(fcmToken, { title, body, data = {} }) {
  if (!fcmToken) return;
  const firebaseAdmin = getAdmin();
  if (!firebaseAdmin) return;

  try {
    await firebaseAdmin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
  } catch (err) {
    console.error('FCM send error:', err.message);
  }
}

async function notifyMatchStart(match, players) {
  const notifications = players.map(player => {
    if (!player.coach?.fcmToken) return null;
    return sendToDevice(player.coach.fcmToken, {
      title: 'Match starting soon!',
      body: `${match.player1?.name} vs ${match.player2?.name} — Court ${match.courtNumber}`,
      data: { matchId: match.id, type: 'match_start' },
    });
  }).filter(Boolean);
  await Promise.allSettled(notifications);
}

async function notifyMatchResult(match, winner) {
  const loserId = match.winnerId === match.player1Id ? match.player2Id : match.player1Id;
  // Notify loser's coach
  const { User, Player } = require('../models');
  const loser = await Player.findByPk(loserId, { include: [{ model: User, as: 'coach' }] });
  if (loser?.coach?.fcmToken) {
    await sendToDevice(loser.coach.fcmToken, {
      title: 'Match result',
      body: `${winner.name} won the match. Scorecard is ready.`,
      data: { matchId: match.id, type: 'match_result' },
    });
  }
}

module.exports = { sendToDevice, notifyMatchStart, notifyMatchResult };
