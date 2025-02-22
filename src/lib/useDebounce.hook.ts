import { RefObject, useCallback, useEffect, useRef } from 'react'

const useDebounce = (callback: (...args: any) => Promise<void>, delay: number) => {
    const handlerRef: RefObject<unknown> = useRef(null)
    const debouncedCallback = useCallback((...args: unknown[]) => {
        if (handlerRef.current) {
            clearTimeout(handlerRef.current as any)
        }
        handlerRef.current = setTimeout(() => {
            callback(...args)
        }, delay)
    }, [callback, delay])
    // Cleanup
    useEffect(() => {
        return () => {
            if (handlerRef.current) {
                clearTimeout(handlerRef.current as any)
            }
        }
    }, [])
    return debouncedCallback
}
export default useDebounce