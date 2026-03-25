export class CompositeCache {
    private root: Map<any, any>

    constructor() {
        this.root = new Map()
    }

    private _getMap(
        levels: unknown[],
        createIfMissing = false,
    ): Map<any, any> | undefined {
        let current: Map<any, any> = this.root
        for (const key of levels) {
            if (!current.has(key)) {
                if (!createIfMissing) return undefined
                current.set(key, new Map())
            }
            current = current.get(key)
        }
        return current
    }

    add(...keys: (string | number)[]): void {
        if (keys.length === 0) return
        const lastKey = keys.pop()!
        const parentMap = this._getMap(keys, true)!
        parentMap.set(lastKey, true)
    }

    has(...keys: (string | number)[]): boolean {
        if (keys.length === 0) return false
        const lastKey = keys.pop()!
        const parentMap = this._getMap(keys)
        return !!parentMap?.has(lastKey)
    }
}
