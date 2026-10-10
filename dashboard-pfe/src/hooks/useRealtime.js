import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================================
// Store global â€” survit aux navigations (hors composants React)
// ============================================================
const store = {}       // { key: { data, time, error, loading } }
const listeners = {}   // { key: Set<setState> }

function notify(key) {
  listeners[key]?.forEach(fn => fn({ ...store[key] }))
}

function subscribe(key, fn) {
  if (!listeners[key]) listeners[key] = new Set()
  listeners[key].add(fn)
  return () => listeners[key].delete(fn)
}

// Un seul timer par clÃ© â€” mÃªme si plusieurs composants Ã©coutent
const timers = {}

function startPolling(key, fetchFn, interval) {
  if (timers[key]) return
  const run = async () => {
    try {
      const data = await fetchFn()
      store[key] = { data: data ?? [], time: Date.now(), error: null, loading: false }
    } catch (e) {
      store[key] = { ...(store[key] ?? {}), error: e.message, loading: false }
    }
    notify(key)
  }
  run()
  timers[key] = setInterval(run, interval)
}

function stopPolling(key) {
  clearInterval(timers[key])
  delete timers[key]
}

// ============================================================
// Hook principal
// ============================================================
export function useRealtime(fetchFn, interval = 5000, cacheKey = '') {
  const fetchFnRef = useRef(fetchFn)
  useEffect(() => { fetchFnRef.current = fetchFn }, [fetchFn])

  const stableFetch = useCallback(() => fetchFnRef.current(), [])

  // Initialiser depuis le cache global si disponible
  const [state, setState] = useState(
    store[cacheKey] ?? { data: [], loading: true, error: null }
  )

  useEffect(() => {
    if (!cacheKey) return

    // S'abonner aux mises Ã  jour du store
    const unsub = subscribe(cacheKey, setState)

    // DÃ©marrer le polling (ou rÃ©utiliser si dÃ©jÃ  actif)
    startPolling(cacheKey, stableFetch, interval)

    // Si donnÃ©es dÃ©jÃ  en cache, les afficher immÃ©diatement
    if (store[cacheKey]) setState({ ...store[cacheKey] })

    return () => {
      unsub()
      // ArrÃªter le polling seulement si plus personne n'Ã©coute
      setTimeout(() => {
        if (!listeners[cacheKey]?.size) stopPolling(cacheKey)
      }, 100)
    }
  }, [cacheKey, interval, stableFetch])

  const refresh = useCallback(() => {
    if (!cacheKey) return
    stopPolling(cacheKey)
    startPolling(cacheKey, stableFetch, interval)
  }, [cacheKey, interval, stableFetch])

  return {
    data:    state.data    ?? [],
    loading: state.loading ?? false,
    error:   state.error   ?? null,
    refresh,
  }
}