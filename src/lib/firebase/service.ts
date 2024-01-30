import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

import bcrypt from "bcrypt";

import app from "./init";

// Init firestore
const firestore = getFirestore(app);

// Get data from firebase
export async function retrieveData(collectionName: string) {
  const snapshot = await getDocs(collection(firestore, collectionName));
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return data;
}

// Get data by ID from firebase
export async function retrieveDataById(collectionName: string, id: string) {
  const snapshot = await getDoc(doc(firestore, collectionName, id));
  const data = snapshot.data();

  return data;
}

// Create a new user or sign up
export async function signUp(
  userData: {
    email: string;
    name: string;
    phoneNumber: string;
    role?: string;
    password: string;
  },
  callback: Function
) {

  // Check if user already exists

  // Querying the data
  const q = query(
    collection(firestore, "users"),
    where("email", "==", userData.email)
  );

  const snapshot = await getDocs(q);
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (data.length > 0) {
    callback(false);
  } else {
    if (!userData.role) {
      userData.role = "member";
    }

    // Hash the password
    userData.password = await bcrypt.hash(userData.password, 10);

    // Add user to the collection
    await addDoc(collection(firestore, "users"), userData)
      .then(() => {
        callback(true);
      })
      .catch((err) => {
        callback(false);
        console.log(err);
      });
  }
}
