// A minimal in-memory stand-in for the subset of the supabase-js /
// PostgREST query builder that app/actions/*.ts actually uses
// (.from().select().eq().or().single()/.maybeSingle(), .update(), .insert(),
// .delete()). It really filters/mutates an in-memory table so tests can
// prove optimistic-lock / retry logic actually behaves correctly, rather
// than just asserting a mock was called with the right arguments.

export type FakeRow = Record<string, unknown>

type FakeFailure = {
  table: string
  op: "insert" | "update" | "delete" | "upsert"
  match?: (payload: FakeRow | FakeRow[] | undefined) => boolean
  remaining: number
}

export type FakeDb = Record<string, FakeRow[]> & {
  __idCounter?: number
  __failures?: FakeFailure[]
}

export function createFakeDb(seed: Record<string, FakeRow[]> = {}): FakeDb {
  const db: FakeDb = {}
  for (const [table, rows] of Object.entries(seed)) {
    db[table] = rows.map((r) => ({ ...r }))
  }
  return db
}

/**
 * Forces the next matching insert/update/delete on `table` to fail instead
 * of applying, so tests can simulate a DB write failing partway through a
 * multi-step action (e.g. the tx hash already persisted, but the later
 * status update fails).
 */
export function injectFailure(
  db: FakeDb,
  opts: {
    table: string
    op: "insert" | "update" | "delete" | "upsert"
    match?: (payload: FakeRow | FakeRow[] | undefined) => boolean
    times?: number
  }
) {
  db.__failures = db.__failures ?? []
  db.__failures.push({
    table: opts.table,
    op: opts.op,
    match: opts.match,
    remaining: opts.times ?? 1,
  })
}

function nextId(db: FakeDb): string {
  db.__idCounter = (db.__idCounter ?? 0) + 1
  return `fake-${db.__idCounter}`
}

type OrTerm = { col: string; kind: "is_null" | "eq"; value?: string }

// Only supports the two shapes actually used in this codebase:
// "col.is.null" and "col.eq.value", comma-joined as OR.
function parseOr(expr: string): OrTerm[] {
  return expr.split(",").map((term) => {
    const [col, op, value] = term.split(".")
    if (op === "is" && value === "null") return { col, kind: "is_null" as const }
    if (op === "eq") return { col, kind: "eq" as const, value }
    throw new Error(`fake-supabase: unsupported or() term "${term}"`)
  })
}

type ExecResult = { data: unknown; error: unknown; count?: number }

class FakeQueryBuilder implements PromiseLike<ExecResult> {
  private eqFilters: { col: string; value: unknown }[] = []
  private orTerms: OrTerm[] | null = null
  private operation: "select" | "insert" | "update" | "delete" | "upsert" = "select"
  private insertPayload: FakeRow | FakeRow[] | undefined
  private updatePayload: FakeRow | undefined
  private upsertOnConflict: string[] | undefined
  private selectOptions: { count?: "exact"; head?: boolean } | undefined
  private selectCalled = false
  private singleMode: "single" | "maybeSingle" | null = null

  constructor(
    private db: FakeDb,
    private table: string
  ) {}

  select(_cols?: string, options?: { count?: "exact"; head?: boolean }) {
    this.selectOptions = options
    this.selectCalled = true
    return this
  }

  eq(col: string, value: unknown) {
    this.eqFilters.push({ col, value })
    return this
  }

  or(expr: string) {
    this.orTerms = parseOr(expr)
    return this
  }

  insert(payload: FakeRow | FakeRow[]) {
    this.operation = "insert"
    this.insertPayload = payload
    return this
  }

  update(payload: FakeRow) {
    this.operation = "update"
    this.updatePayload = payload
    return this
  }

  delete() {
    this.operation = "delete"
    return this
  }

  upsert(payload: FakeRow, options?: { onConflict?: string; ignoreDuplicates?: boolean }) {
    this.operation = "upsert"
    this.insertPayload = payload
    this.upsertOnConflict = options?.onConflict?.split(",")
    return this
  }

  single() {
    this.singleMode = "single"
    return this
  }

  maybeSingle() {
    this.singleMode = "maybeSingle"
    return this
  }

  private matches(row: FakeRow): boolean {
    const eqOk = this.eqFilters.every((f) => row[f.col] === f.value)
    if (!eqOk) return false
    if (!this.orTerms) return true
    return this.orTerms.some((t) =>
      t.kind === "is_null"
        ? row[t.col] === null || row[t.col] === undefined
        : row[t.col] === t.value
    )
  }

  private takeFailure(): { message: string; code: string } | null {
    const failures = this.db.__failures
    if (!failures) return null
    const idx = failures.findIndex(
      (f) =>
        f.table === this.table &&
        f.op === this.operation &&
        (!f.match || f.match(this.insertPayload ?? this.updatePayload)) &&
        f.remaining > 0
    )
    if (idx === -1) return null
    failures[idx].remaining -= 1
    return { message: "simulated failure", code: "FAKE_FAILURE" }
  }

  then<TResult1 = ExecResult, TResult2 = never>(
    onfulfilled?: ((value: ExecResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected)
  }

  private execute(): ExecResult {
    this.db[this.table] = this.db[this.table] ?? []
    const table = this.db[this.table]

    if (this.operation === "insert") {
      const forcedError = this.takeFailure()
      if (forcedError) return { data: null, error: forcedError }
      const rowsIn = Array.isArray(this.insertPayload)
        ? this.insertPayload
        : [this.insertPayload as FakeRow]
      const inserted = rowsIn.map((r) => ({
        id: nextId(this.db),
        created_at: new Date().toISOString(),
        ...r,
      }))
      table.push(...inserted)
      if (!this.selectCalled) return { data: null, error: null }
      if (this.singleMode) return { data: inserted[0] ?? null, error: null }
      return { data: inserted, error: null }
    }

    if (this.operation === "update") {
      const matched = table.filter((r) => this.matches(r))
      const forcedError = this.takeFailure()
      if (forcedError) return { data: null, error: forcedError }
      matched.forEach((r) => Object.assign(r, this.updatePayload))
      if (!this.selectCalled) return { data: null, error: null }
      if (this.singleMode === "single") {
        if (matched.length !== 1)
          return { data: null, error: { message: "no rows", code: "PGRST116" } }
        return { data: matched[0], error: null }
      }
      if (this.singleMode === "maybeSingle") return { data: matched[0] ?? null, error: null }
      return { data: matched, error: null }
    }

    if (this.operation === "upsert") {
      const forcedError = this.takeFailure()
      if (forcedError) return { data: null, error: forcedError }
      const payload = this.insertPayload as FakeRow
      const conflictCols = this.upsertOnConflict ?? ["id"]
      const existing = table.find((r) => conflictCols.every((c) => r[c] === payload[c]))
      if (existing) {
        Object.assign(existing, payload)
      } else {
        table.push({ id: nextId(this.db), created_at: new Date().toISOString(), ...payload })
      }
      return { data: null, error: null }
    }

    if (this.operation === "delete") {
      const forcedError = this.takeFailure()
      if (forcedError) return { data: null, error: forcedError }
      this.db[this.table] = table.filter((r) => !this.matches(r))
      return { data: null, error: null }
    }

    // select
    const matched = table.filter((r) => this.matches(r))
    if (this.selectOptions?.count === "exact" && this.selectOptions.head) {
      return { data: null, error: null, count: matched.length }
    }
    if (this.singleMode === "single") {
      if (matched.length !== 1)
        return { data: null, error: { message: "no rows", code: "PGRST116" } }
      return { data: matched[0], error: null }
    }
    if (this.singleMode === "maybeSingle") return { data: matched[0] ?? null, error: null }
    return { data: matched, error: null }
  }
}

export function createFakeClient(db: FakeDb) {
  return {
    from(table: string) {
      return new FakeQueryBuilder(db, table)
    },
  }
}

export function createFakeServerClient(db: FakeDb, user: { id: string } | null) {
  return {
    ...createFakeClient(db),
    auth: {
      getUser: async () => ({ data: { user } }),
    },
  }
}
