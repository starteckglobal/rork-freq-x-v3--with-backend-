import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const firestore = {
  // Add a document to a collection
  add: async (collectionName: string, data: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  // Get a single document
  get: async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
      } else {
        return { data: null, error: 'Document not found' };
      }
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Get all documents from a collection
  getAll: async (collectionName: string, constraints: QueryConstraint[] = []) => {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { data: docs, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  // Update a document
  update: async (collectionName: string, docId: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Delete a document
  delete: async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Listen to real-time updates
  listen: (
    collectionName: string, 
    callback: (data: DocumentData[]) => void,
    constraints: QueryConstraint[] = []
  ) => {
    const q = query(collection(db, collectionName), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(docs);
    });
  },

  // Query helpers
  where: (field: string, operator: any, value: any) => where(field, operator, value),
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction),
  limit: (limitCount: number) => limit(limitCount),
};