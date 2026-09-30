const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notifyNewPendingPost = onDocumentCreated("posts/{postId}", async (event) => {
  const data = event.data.data();
  if (!data || data.status !== 'pending') return;

  const title = data.title || "Untitled Post";
  const authorName = data.authorName || data.author || "Unknown Author";

  const payload = {
    notification: {
      title: "New post pending review",
      body: `${title} by ${authorName}`
    },
    data: {
      postId: event.params.postId,
      type: "blog_post_pending"
    },
    topic: "blog_admin_alerts"
  };

  try {
    await admin.messaging().send(payload);
    console.log("Sent pending post notification:", event.params.postId);
  } catch (error) {
    console.error("Error sending pending post notification:", error);
  }
});

exports.notifyPostReported = onDocumentUpdated("posts/{postId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (!before || !after) return;

  const beforeCount = before.reportCount || 0;
  const afterCount = after.reportCount || 0;

  if (afterCount > beforeCount) {
    const title = after.title || "Untitled Post";
    
    const payload = {
      notification: {
        title: "Post reported",
        body: title
      },
      data: {
        postId: event.params.postId,
        type: "blog_post_reported"
      },
      topic: "blog_admin_alerts"
    };

    try {
      await admin.messaging().send(payload);
      console.log("Sent reported post notification:", event.params.postId);
    } catch (error) {
      console.error("Error sending reported post notification:", error);
    }
  }
});
