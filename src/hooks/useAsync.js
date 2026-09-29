import { useCallback, useEffect, useRef, useState } from "react";

// Ejecuta una función asíncrona al montar (y cuando cambian las dependencias) y expone
// { data, loading, error, reload }. Ignora respuestas de efectos ya desmontados y
// conserva los datos anteriores mientras recarga, para que la pantalla no parpadee.
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [version, setVersion] = useState(0);
  const fnRef = useRef(asyncFn);

  useEffect(() => {
    fnRef.current = asyncFn;
  });

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fnRef
      .current()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState((prev) => ({ ...prev, loading: false, error }));
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...deps]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}
