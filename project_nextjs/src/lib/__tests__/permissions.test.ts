import { getCurrentUserId, requireSiteAdmin, hasUserSiteRole, hasUserJournalRole, requireJournalRole } from '../permissions';
import { createSupabaseServerClient } from '../supabase/server';
import { getSupabaseAdminClient } from '../supabase/admin';

// Mock the supabase clients
jest.mock('../supabase/server');
jest.mock('../supabase/admin');

describe('Permission Helpers', () => {
  const mockSupabaseServer = {
    auth: {
      getSession: jest.fn(),
    },
  };

  const mockSupabaseAdmin = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  // Setup proper chaining for journal roles query (double eq)
  const setupJournalRoleMock = (data: any[]) => {
    mockSupabaseAdmin.eq.mockImplementationOnce(() => ({
      eq: jest.fn().mockResolvedValueOnce({ data, error: null })
    }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseServer);
    (getSupabaseAdminClient as jest.Mock).mockReturnValue(mockSupabaseAdmin);
  });

  describe('getCurrentUserId', () => {
    it('should return user ID when session exists', async () => {
      const mockUserId = 'user-123';
      mockSupabaseServer.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockUserId } } },
        error: null,
      });

      const result = await getCurrentUserId();
      expect(result).toBe(mockUserId);
    });

    it('should return null when no session exists', async () => {
      mockSupabaseServer.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getCurrentUserId();
      expect(result).toBeNull();
    });

    it('should return null when session has no user', async () => {
      mockSupabaseServer.auth.getSession.mockResolvedValue({
        data: { session: { user: null } },
        error: null,
      });

      const result = await getCurrentUserId();
      expect(result).toBeNull();
    });
  });

  describe('hasUserSiteRole', () => {
    it('should return true when user has the specified site role', async () => {
      const userId = 'user-123';
      const rolePath = 'admin';
      
      mockSupabaseAdmin.eq.mockResolvedValueOnce({
        data: [
          { role_name: 'Site Administrator', role_path: 'admin', context_id: null },
          { role_name: 'Manager', role_path: 'manager', context_id: null },
        ],
        error: null,
      });

      const result = await hasUserSiteRole(userId, rolePath);
      expect(result).toBe(true);
    });

    it('should return false when user does not have the specified site role', async () => {
      const userId = 'user-123';
      const rolePath = 'admin';
      
      mockSupabaseAdmin.eq.mockResolvedValueOnce({
        data: [
          { role_name: 'Manager', role_path: 'manager', context_id: null },
          { role_name: 'Editor', role_path: 'editor', context_id: 'journal-1' },
        ],
        error: null,
      });

      const result = await hasUserSiteRole(userId, rolePath);
      expect(result).toBe(false);
    });

    it('should return false when user has no roles', async () => {
      const userId = 'user-123';
      const rolePath = 'admin';
      
      mockSupabaseAdmin.eq.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await hasUserSiteRole(userId, rolePath);
      expect(result).toBe(false);
    });

    it('should return false when role is journal-specific (has context_id)', async () => {
      const userId = 'user-123';
      const rolePath = 'admin';
      
      mockSupabaseAdmin.eq.mockResolvedValueOnce({
        data: [
          { role_name: 'Journal Admin', role_path: 'admin', context_id: 'journal-1' },
        ],
        error: null,
      });

      const result = await hasUserSiteRole(userId, rolePath);
      expect(result).toBe(false);
    });
  });

  describe('hasUserJournalRole', () => {
    it('should return true when user has one of the specified journal roles', async () => {
      const userId = 'user-123';
      const journalId = 'journal-1';
      const rolePaths = ['editor', 'manager'];
      
      setupJournalRoleMock([
        { user_id: userId, journal_id: journalId, role: 'editor' },
        { user_id: userId, journal_id: journalId, role: 'author' },
      ]);

      const result = await hasUserJournalRole(userId, journalId, rolePaths);
      expect(result).toBe(true);
    });

    it('should return false when user does not have any of the specified journal roles', async () => {
      const userId = 'user-123';
      const journalId = 'journal-1';
      const rolePaths = ['editor', 'manager'];
      
      setupJournalRoleMock([
        { user_id: userId, journal_id: journalId, role: 'author' },
        { user_id: userId, journal_id: journalId, role: 'reviewer' },
      ]);

      const result = await hasUserJournalRole(userId, journalId, rolePaths);
      expect(result).toBe(false);
    });

    it('should return false when user has no journal roles', async () => {
      const userId = 'user-123';
      const journalId = 'journal-1';
      const rolePaths = ['editor', 'manager'];
      
      setupJournalRoleMock([]);

      const result = await hasUserJournalRole(userId, journalId, rolePaths);
      expect(result).toBe(false);
    });
  });

  describe('requireSiteAdmin', () => {
    it('should not throw when user is admin', async () => {
      const userId = 'user-123';
      
      mockSupabaseServer.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: userId } } },
        error: null,
      });
      
      mockSupabaseAdmin.eq.mockResolvedValueOnce({
        data: [
          { role_name: 'Site Administrator', role_path: 'admin', context_id: null },
        ],
        error: null,
      });

      await expect(requireSiteAdmin()).resolves.not.toThrow();
    });

    it('should throw "Unauthorized" when no user is logged in', async () => {
      mockSupabaseServer.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await expect(requireSiteAdmin()).rejects.toThrow('Unauthorized');
    });

    it('should throw "Forbidden" when user is not admin', async () => {
      const userId = 'user-123';
      
      mockSupabaseServer.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: userId } } },
        error: null,
      });
      
      mockSupabaseAdmin.eq.mockResolvedValueOnce({
        data: [
          { role_name: 'Manager', role_path: 'manager', context_id: null },
        ],
        error: null,
      });

      await expect(requireSiteAdmin()).rejects.toThrow('Forbidden');
    });
  });

  describe('requireJournalRole', () => {
    it('should not throw when user has the required journal role', async () => {
      const userId = 'user-123';
      const journalId = 'journal-1';
      const rolePaths = ['editor', 'manager'];
      
      mockSupabaseServer.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: userId } } },
        error: null,
      });
      
      setupJournalRoleMock([
        { user_id: userId, journal_id: journalId, role: 'editor' },
      ]);

      await expect(requireJournalRole(journalId, rolePaths)).resolves.not.toThrow();
    });

    it('should not throw when user is site admin', async () => {
      const userId = 'user-123';
      const journalId = 'journal-1';
      const rolePaths = ['editor', 'manager'];
      
      mockSupabaseServer.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: userId } } },
        error: null,
      });
      
      // User has no journal roles
      setupJournalRoleMock([]);
      
      // But user is site admin
      mockSupabaseAdmin.eq.mockResolvedValueOnce({
        data: [
          { role_name: 'Site Administrator', role_path: 'admin', context_id: null },
        ],
        error: null,
      });

      await expect(requireJournalRole(journalId, rolePaths)).resolves.not.toThrow();
    });

    it('should throw "Unauthorized" when no user is logged in', async () => {
      const journalId = 'journal-1';
      const rolePaths = ['editor', 'manager'];
      
      mockSupabaseServer.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await expect(requireJournalRole(journalId, rolePaths)).rejects.toThrow('Unauthorized');
    });

    it('should throw "Forbidden" when user does not have required journal role and is not site admin', async () => {
      const userId = 'user-123';
      const journalId = 'journal-1';
      const rolePaths = ['editor', 'manager'];
      
      mockSupabaseServer.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: userId } } },
        error: null,
      });
      
      // User has no journal roles
      setupJournalRoleMock([]);
      
      // User is not site admin
      mockSupabaseAdmin.eq.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      await expect(requireJournalRole(journalId, rolePaths)).rejects.toThrow('Forbidden');
    });
  });
});