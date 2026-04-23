import { useEffect, useState } from "react";

export function useApi(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();
    let isActive = true;

    async function run() {
      setIsLoading(true);

      try {
        const result = await loader(abortController.signal);

        if (!isActive) {
          return;
        }

        setData(result);
        setError("");
      } catch (loadError) {
        if (!isActive || loadError.name === "AbortError") {
          return;
        }

        setError(loadError.message || "Erro inesperado.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    run();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [...dependencies, reloadToken]);

  function refresh() {
    setReloadToken((value) => value + 1);
  }

  return { data, isLoading, error, setData, refresh };
}
