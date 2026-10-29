import { describe, expect, it } from "vite-plus/test";
import { getDb as getTestDb } from "./helpers/db";
import { instructorAccessCheck } from "@/utils/access-checks/instructor-access";

describe("instructorAccessCheck", () => {
  const db = getTestDb();

  it("should return correct accessible students and term access for instructor", async () => {
    const userMnumber = "M100000002";

    const { accessibleStudents, termAccessMap } = await instructorAccessCheck(db, userMnumber);

    // Check that we have the expected students in the accessible set
    expect(accessibleStudents).toBeInstanceOf(Set);
    expect(accessibleStudents.size).toEqual(37);

    // Check that termAccessMap has entries and they have the correct structure
    expect(termAccessMap).toBeInstanceOf(Map);
    expect(termAccessMap.size).toEqual(143);

    // Test the entries
    for (const [_, entry] of termAccessMap.entries()) {
      expect(entry.accessLevel).toEqual("course_scoped");
      expect(entry.reason).toEqual("instructor");
      expect(entry.role).toEqual("instructor");
    }
  });

  it("should return empty sets for an instructor with no courses", async () => {
    const userMnumber = "M100000010";

    const { accessibleStudents, termAccessMap } = await instructorAccessCheck(db, userMnumber);

    expect(accessibleStudents).toBeInstanceOf(Set);
    expect(accessibleStudents.size).toEqual(0);

    expect(termAccessMap).toBeInstanceOf(Map);
    expect(termAccessMap.size).toEqual(0);
  });
});
