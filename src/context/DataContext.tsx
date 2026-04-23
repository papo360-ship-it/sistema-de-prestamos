import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  createClient,
  createLoan,
  createProfile,
  deleteClient,
  loadData,
  registerPayment,
  resetData,
  saveData,
  updateClient,
  updateLoan,
  updateSettings
} from "@/services/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  createClientRemote,
  createLoanRemote,
  createProfileRemote,
  deleteClientRemote,
  fetchAppData,
  registerPaymentRemote,
  updateClientRemote,
  updateLoanRemote,
  updateSettingsRemote
} from "@/services/supabaseStore";
import type { AppData, Client, LoanInput, Payment, Profile, Settings } from "@/types";

interface DataContextValue {
  data: AppData;
  setData: Dispatch<SetStateAction<AppData>>;
  loading: boolean;
  error: string;
  usingSupabase: boolean;
  reload: () => Promise<void>;
  addClient: (input: Omit<Client, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  editClient: (id: string, input: Partial<Client>) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  addLoan: (input: LoanInput, userId: string) => Promise<void>;
  editLoan: (id: string, input: LoanInput, userId: string) => Promise<void>;
  addPayment: (
    input: Omit<Payment, "id" | "registeredBy" | "createdAt">,
    userId: string
  ) => Promise<void>;
  saveSettings: (settings: Settings, userId: string) => Promise<void>;
  addProfile: (input: Omit<Profile, "id" | "createdAt">) => Promise<void>;
  restoreSeed: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) saveData(data);
  }, [data]);

  const reload = async () => {
    if (!isSupabaseConfigured) {
      setData(loadData());
      return;
    }

    setLoading(true);
    setError("");
    try {
      setData(await fetchAppData());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar informacion desde Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const runRemote = async (operation: () => Promise<void>, fallback: () => void) => {
    setError("");
    if (!isSupabaseConfigured) {
      fallback();
      return;
    }

    try {
      await operation();
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operacion fallida.";
      setError(message);
      throw err;
    }
  };

  const value = useMemo<DataContextValue>(
    () => ({
      data,
      setData,
      loading,
      error,
      usingSupabase: isSupabaseConfigured,
      reload,
      addClient: (input) => runRemote(
        () => createClientRemote(input),
        () => setData((current) => createClient(current, input))
      ),
      editClient: (id, input) => runRemote(
        () => updateClientRemote(id, input),
        () => setData((current) => updateClient(current, id, input))
      ),
      removeClient: (id) => runRemote(
        () => deleteClientRemote(id),
        () => setData((current) => deleteClient(current, id))
      ),
      addLoan: (input, userId) => runRemote(
        () => createLoanRemote(input, userId),
        () => setData((current) => createLoan(current, input, userId))
      ),
      editLoan: (id, input, userId) => runRemote(
        () => updateLoanRemote(id, input, userId),
        () => setData((current) => updateLoan(current, id, input, userId))
      ),
      addPayment: (input, userId) => runRemote(
        () => registerPaymentRemote(data, input, userId),
        () => setData((current) => registerPayment(current, input, userId))
      ),
      saveSettings: (settings, userId) => runRemote(
        () => updateSettingsRemote(settings, userId),
        () => setData((current) => updateSettings(current, settings, userId))
      ),
      addProfile: (input) => runRemote(
        () => createProfileRemote(input),
        () => setData((current) => createProfile(current, input))
      ),
      restoreSeed: () => setData(resetData())
    }),
    [data, error, loading]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData debe usarse dentro de DataProvider");
  return context;
}
