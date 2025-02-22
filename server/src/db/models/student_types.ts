import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const studentTypes: any = sqliteTable("student_types", {
	code: text().primaryKey(),
	description: text().notNull(),
	next_student_type: text().notNull().references(() => studentTypes.code),
});

// Define relationships for DBML generation
export const studentTypesOne = relations(studentTypes, ({ one }) => ({
	nextStudentType: one(studentTypes, {
		fields: [studentTypes.next_student_type],
		references: [studentTypes.code],
	}),
}))