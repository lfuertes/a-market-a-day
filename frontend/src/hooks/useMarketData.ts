import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

export interface MarketData {
  location: string;
  continent: string;
  heroImage: string;
  ingredients: Array<{
    title: string;
    imageSrc: string;
    description: string;
  }>;
  funFact: string;
}

export const useMarketData = (initialData?: MarketData | null) => {
  const [marketData, setMarketData] = useState<MarketData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) return;
    
    const fetchMarket = async () => {
      try {
        setLoading(true);

        // Asegurar que el usuario esté autenticado de forma anónima
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }

        const dateId = dayjs().format("YYYY-MM-DD");
        const docRef = doc(db, "dailyMarkets", dateId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMarketData(docSnap.data() as MarketData);
        } else {
          setError("No market found for selected date.");
        }
      } catch (err) {
        console.error("Error fetching market:", err);
        setError("Error fetching market data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, []);

  return { marketData, loading, error };
};
