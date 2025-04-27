export interface FKDef {
	id: number;
	seq: number;
	table: string;  // parent table name
	from: string;   // child column name
	to: string;     // parent column name
	on_update: string;
	on_delete: string;
	match: string;
}

interface FKViolation {
	tableName: string;
	childColumn: string;
	parentTable: string;
	parentColumn: string;
	childValue: any;
}

export class FKViolationError extends Error {
	public violation: FKViolation;

	constructor(v: FKViolation) {
		super(
			`FK violation on "${v.tableName}.${v.childColumn}" → ` +
			`"${v.parentTable}.${v.parentColumn}": no parent row where ` +
			`${v.parentColumn} = ${JSON.stringify(v.childValue)}`
		);
		this.name = 'FKViolationError';
		this.violation = v;
		// restore prototype chain (needed when targeting ES5)
		Object.setPrototypeOf(this, FKViolationError.prototype);
	}
}