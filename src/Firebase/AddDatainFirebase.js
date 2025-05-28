import { collection, query, where, getDocs,doc,setDoc  } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

export const checkMonthlyDataExists = async () => {
const todayStr = new Date().toISOString().split("T")[0]; // "2025-05-27"
  const currentMonth = todayStr.slice(0, 7); // "2025-05"

  const startOfMonth = `${currentMonth}-01`;
  const endOfMonth = `${currentMonth}-31`; // 

  const q = query(
    collection(db, "readings"),
    where("__name__", ">=", startOfMonth),
    where("__name__", "<=", endOfMonth)
  );

  try {
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      console.log(` Found existing data for ${currentMonth}:`, doc.data());
      const newData=  doc.data();
      return newData.data;// or return doc if you want doc ID too
    } else {
      console.log(`📭 No data found for month: ${currentMonth}`);
      return false;
    }
  } catch (error) {
    console.error(" Error checking monthly data:", error);
    throw error;
  }
};


export const pushDataForDate = async ( data) => {
     const todayStr = new Date().toISOString().split("T")[0];
  const docRef = doc(db, "readings", todayStr);

  try {
    await setDoc(docRef, {data});
    console.log(" Data added for date:", todayStr, data);
    return data;
  } catch (error) {
    console.error(" Error adding data:", error);
    throw error;
  }
};