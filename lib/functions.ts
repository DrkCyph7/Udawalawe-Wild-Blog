// Client-side implementation of all complex operations (Free Plan compatible)
// Uses Firestore transactions to ensure atomic updates for counters and rate limits.

import { db, auth } from '@/lib/firebase'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  runTransaction,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  collection
} from 'firebase/firestore'
import type { BlogPost } from './types'

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

async function isAdmin(uid: string) {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export const callToggleLike = async (postId: string) => {
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in to like.");
  
  const postRef = doc(db, 'posts', postId);
  
  return await runTransaction(db, async (tx) => {
    const snap = await tx.get(postRef);
    if (!snap.exists()) throw new Error("Post not found.");
    const data = snap.data();
    if (data.status === 'deleted') throw new Error("Post not found.");
    
    const likedBy = data.likedBy || [];
    const alreadyLiked = likedBy.includes(uid);
    
    if (alreadyLiked) {
      tx.update(postRef, {
        likedBy: arrayRemove(uid),
        likes: increment(-1)
      });
      return { data: { liked: false } };
    } else {
      tx.update(postRef, {
        likedBy: arrayUnion(uid),
        likes: increment(1)
      });
      return { data: { liked: true } };
    }
  });
}

export const callReportPost = async (postId: string, reason?: string) => {
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in to report.");
  
  const postRef = doc(db, 'posts', postId);
  
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(postRef);
    if (!snap.exists()) throw new Error("Post not found.");
    const data = snap.data();
    
    if (data.authorId === uid) throw new Error("Cannot report your own post.");
    if ((data.reportedBy || []).includes(uid)) {
      throw new Error("You have already reported this post.");
    }
    
    tx.update(postRef, {
      reportedBy: arrayUnion(uid),
      reportCount: increment(1),
      lastReportReason: reason || null
    });
  });
  
  return { data: { success: true } };
}

export const callSubmitPost = async (postData: {
  title: string;
  body: string;
  images: string[];
  type: 'Blog Post' | 'Review';
  rating?: number;
  isAnonymous: boolean;
  visibility: 'public' | 'private';
}) => {
  const user = auth?.currentUser;
  if (!user) throw new Error("Must be signed in to submit.");
  const uid = user.uid;

  if (!postData.title?.trim() || !postData.body?.trim()) {
    throw new Error("Title and body are required.");
  }
  if (postData.type === 'Review' && (postData.rating === undefined || postData.rating < 1 || postData.rating > 5)) {
    throw new Error("Rating 1-5 required for reviews.");
  }
  
  const callerIsAdmin = await isAdmin(uid);
  const today = todayString();
  const userRef = doc(db, 'users', uid);
  const newPostRef = doc(collection(db, 'posts')); // generate new ID
  const statsRef = doc(db, 'meta', 'stats');

  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    const userData = userSnap.data() || {};
    
    if (!callerIsAdmin) {
      const postsToday = userData.lastPostDate === today ? (userData.postsToday ?? 0) : 0;
      if (postsToday >= 2) {
        throw new Error("You can only submit 2 posts per day. Try again tomorrow.");
      }
      tx.set(userRef, {
        postsToday: postsToday + 1,
        lastPostDate: today,
        displayName: user.displayName || userData.displayName || "Anonymous",
        email: user.email || userData.email || null,
      }, { merge: true });
    }

    const authorName = user.displayName || user.email?.split('@')[0] || "Anonymous";
    
    tx.set(newPostRef, {
      authorId: uid,
      authorName,
      isAnonymous: postData.isAnonymous ?? false,
      visibility: postData.visibility ?? 'public',
      title: postData.title.trim(),
      body: postData.body,
      images: postData.images || [],
      type: postData.type,
      ...(postData.type === 'Review' && { rating: postData.rating }),
      status: 'pending',
      likes: 0,
      likedBy: [],
      reportCount: 0,
      reportedBy: [],
      pendingEdit: null,
      deletedAt: null,
      deletedBy: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Increment admin badge count
    tx.set(statsRef, { pendingCount: increment(1) }, { merge: true });
  });

  return { data: { success: true, postId: newPostRef.id } };
}

export const callAdminDeletePost = async (postId: string) => {
  const uid = auth?.currentUser?.uid;
  if (!uid || !(await isAdmin(uid))) throw new Error("Admins only.");
  
  await updateDoc(doc(db, 'posts', postId), {
    status: 'deleted',
    deletedAt: serverTimestamp(),
    deletedBy: uid,
    updatedAt: serverTimestamp()
  });
  
  return { data: { success: true } };
}

export const callAdminModeratePost = async (
  postId: string,
  action: 'approve' | 'reject' | 'approve_edit' | 'reject_edit' | 'dismiss_report',
  reason?: string
) => {
  const uid = auth?.currentUser?.uid;
  if (!uid || !(await isAdmin(uid))) throw new Error("Admins only.");

  const postRef = doc(db, 'posts', postId);
  
  if (action === 'approve') {
    await runTransaction(db, async (tx) => {
      const postSnap = await tx.get(postRef);
      if (!postSnap.exists()) throw new Error("Post not found.");
      
      tx.update(postRef, { status: 'approved', updatedAt: serverTimestamp() });
      
      const authorId = postSnap.data().authorId;
      if (authorId) {
        tx.set(doc(db, 'users', authorId), { postCount: increment(1) }, { merge: true });
      }
      tx.set(doc(db, 'meta', 'stats'), { pendingCount: increment(-1) }, { merge: true });
    });
  } else if (action === 'reject') {
    await runTransaction(db, async (tx) => {
      tx.update(postRef, {
        status: 'rejected',
        rejectionReason: reason || null,
        updatedAt: serverTimestamp()
      });
      tx.set(doc(db, 'meta', 'stats'), { pendingCount: increment(-1) }, { merge: true });
    });
  } else if (action === 'approve_edit') {
    await runTransaction(db, async (tx) => {
      const postSnap = await tx.get(postRef);
      const pendingEdit = postSnap.data()?.pendingEdit;
      if (!pendingEdit) throw new Error("No pending edit.");
      
      tx.update(postRef, {
        title: pendingEdit.title,
        body: pendingEdit.body,
        images: pendingEdit.images,
        pendingEdit: null,
        updatedAt: serverTimestamp()
      });
    });
  } else if (action === 'reject_edit') {
    await updateDoc(postRef, { pendingEdit: null, updatedAt: serverTimestamp() });
  } else if (action === 'dismiss_report') {
    await runTransaction(db, async (tx) => {
      tx.update(postRef, {
        reportedBy: [],
        reportCount: 0,
        lastReportReason: null,
        updatedAt: serverTimestamp()
      });
    });
  }
  
  return { data: { success: true } };
}

export const callSubmitEdit = async (
  postId: string,
  title: string,
  body: string,
  images: string[]
) => {
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in.");
  
  const postRef = doc(db, 'posts', postId);
  
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(postRef);
    if (!snap.exists()) throw new Error("Post not found.");
    const data = snap.data();
    
    if (data.authorId !== uid) throw new Error("Not your post.");
    if (data.status !== 'approved') throw new Error("Can only edit approved posts.");
    
    tx.update(postRef, {
      pendingEdit: {
        title: title.trim(),
        body,
        images: images || [],
        submittedAt: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });
  });
  
  return { data: { success: true } };
}
