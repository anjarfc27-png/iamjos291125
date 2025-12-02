import { GET } from "@/app/api/journals/[journalId]/issues/route";

// Mock permissions and supabase admin client to avoid real I/O
jest.mock("@/lib/permissions", () => ({
  requireJournalRole: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/supabase/admin", () => {
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  };
  return {
    getSupabaseAdminClient: jest.fn(() => mockChain),
  };
});

describe("GET /api/journals/[journalId]/issues", () => {
  it("returns 400 when journalId is missing", async () => {
    const req = new Request("http://localhost/api/journals//issues");
    const res = await GET(req as any, { params: Promise.resolve({ journalId: "" }) } as any);
    expect(res.status).toBe(400);
  });
});



