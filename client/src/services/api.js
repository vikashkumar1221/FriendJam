const getAuthHeaders = () => {
  const token = localStorage.getItem('musiccollab_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Repositories
  async getRepos() {
    const res = await fetch('/api/repos', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch repositories');
    return res.json();
  },

  async getGlobalActivities() {
    const res = await fetch('/api/repos/global/activities', { headers: getAuthHeaders() });
    if (!res.ok) return { activities: [] };
    return res.json();
  },

  async createRepo(data) {
    const res = await fetch('/api/repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create repository');
    return res.json();
  },

  async getRepoBySlug(username, slug) {
    const res = await fetch(`/api/repos/by-slug/${username}/${slug}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to load repository');
    return res.json();
  },

  async updateRepo(repoId, data) {
    const res = await fetch(`/api/repos/${repoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update repository settings');
    return res.json();
  },

  async inviteMember(repoId, data) {
    const res = await fetch(`/api/repos/${repoId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to invite member');
    return res.json();
  },

  async removeMember(repoId, userId) {
    const res = await fetch(`/api/repos/${repoId}/members/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to remove member');
    return res.json();
  },

  async getAuditLog(repoId) {
    const res = await fetch(`/api/repos/${repoId}/audit-log`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to load audit logs');
    return res.json();
  },

  async getTrash(repoId) {
    const res = await fetch(`/api/repos/${repoId}/trash`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to load trash');
    return res.json();
  },

  async restoreTrashAsset(repoId, assetId) {
    const res = await fetch(`/api/repos/${repoId}/trash/${assetId}/restore`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to restore asset');
    return res.json();
  },

  // Branches
  async getBranches(repoId) {
    const res = await fetch(`/api/repos/${repoId}/branches`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch branches');
    return res.json();
  },

  async createBranch(repoId, name, fromBranch) {
    const res = await fetch(`/api/repos/${repoId}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ name, fromBranch })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create branch');
    return res.json();
  },

  async compareBranches(repoId, base, head) {
    const res = await fetch(`/api/repos/${repoId}/branches/compare?base=${encodeURIComponent(base)}&head=${encodeURIComponent(head)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to compare branches');
    return res.json();
  },

  async deleteBranch(repoId, branchName) {
    const res = await fetch(`/api/repos/${repoId}/branches/${encodeURIComponent(branchName)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete branch');
    return res.json();
  },

  // Commits
  async getCommits(repoId, branch) {
    const res = await fetch(`/api/repos/${repoId}/commits?branch=${encodeURIComponent(branch)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch commits');
    return res.json();
  },

  async getCommit(repoId, commitHash) {
    const res = await fetch(`/api/repos/${repoId}/commits/${commitHash}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch commit details');
    return res.json();
  },

  async revertCommit(repoId, commitHash) {
    const res = await fetch(`/api/repos/${repoId}/commits/${commitHash}/revert`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to revert commit');
    return res.json();
  },

  async restoreCommit(repoId, commitHash, branch) {
    const res = await fetch(`/api/repos/${repoId}/commits/${commitHash}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ branch })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to restore commit');
    return res.json();
  },

  // Audio Tracks & Takes
  async getTracks(repoId, branch) {
    const res = await fetch(`/api/repos/${repoId}/tracks?branch=${encodeURIComponent(branch)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch tracks');
    return res.json();
  },

  async createTrack(repoId, trackName, category, branch) {
    const res = await fetch(`/api/repos/${repoId}/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ trackName, category, branch })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create track');
    return res.json();
  },

  async uploadTake(repoId, trackId, formData) {
    const res = await fetch(`/api/repos/${repoId}/tracks/${trackId}/takes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to upload take');
    return res.json();
  },

  async switchActiveTake(repoId, trackId, takeId) {
    const res = await fetch(`/api/repos/${repoId}/tracks/${trackId}/active-take`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ takeId })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to switch take');
    return res.json();
  },

  async updateTrackMix(repoId, trackId, mixData) {
    const res = await fetch(`/api/repos/${repoId}/tracks/${trackId}/mix`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(mixData)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update mix');
    return res.json();
  },

  async deleteTrack(repoId, trackId) {
    const res = await fetch(`/api/repos/${repoId}/tracks/${trackId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete track');
    return res.json();
  },

  // Lyrics
  async getLyrics(repoId, branch) {
    const res = await fetch(`/api/repos/${repoId}/lyrics?branch=${encodeURIComponent(branch)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch lyrics');
    return res.json();
  },

  async autosaveDraft(repoId, branch, rawText, expectedVersion) {
    const res = await fetch(`/api/repos/${repoId}/lyrics/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ branch, rawText, expectedVersion })
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 409) return { isConflict: true, data };
      throw new Error(data.error || 'Autosave failed');
    }
    return { isConflict: false, data };
  },

  async commitLyrics(repoId, branch, commitMessage, rawText) {
    const res = await fetch(`/api/repos/${repoId}/lyrics/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ branch, commitMessage, rawText })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to commit lyrics');
    return res.json();
  },

  async resolveLyricsConflict(repoId, branch, resolvedText, commitMessage) {
    const res = await fetch(`/api/repos/${repoId}/lyrics/resolve-conflict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ branch, resolvedText, commitMessage })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to resolve conflict');
    return res.json();
  },

  // Pull Requests
  async getPullRequests(repoId, status = 'all') {
    const res = await fetch(`/api/repos/${repoId}/pulls?status=${status}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch pull requests');
    return res.json();
  },

  async createPullRequest(repoId, data) {
    const res = await fetch(`/api/repos/${repoId}/pulls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create pull request');
    return res.json();
  },

  async getPullRequest(repoId, prNumber) {
    const res = await fetch(`/api/repos/${repoId}/pulls/${prNumber}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to load pull request');
    return res.json();
  },

  async submitReview(repoId, prNumber, status, note) {
    const res = await fetch(`/api/repos/${repoId}/pulls/${prNumber}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status, note })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to record review');
    return res.json();
  },

  async mergePullRequest(repoId, prNumber) {
    const res = await fetch(`/api/repos/${repoId}/pulls/${prNumber}/merge`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to merge pull request');
    return res.json();
  },

  async closePullRequest(repoId, prNumber) {
    const res = await fetch(`/api/repos/${repoId}/pulls/${prNumber}/close`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to close pull request');
    return res.json();
  },

  // Comments
  async getComments(repoId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/repos/${repoId}/comments?${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch comments');
    return res.json();
  },

  async postComment(repoId, data) {
    const res = await fetch(`/api/repos/${repoId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to post comment');
    return res.json();
  },

  async toggleResolveComment(repoId, commentId) {
    const res = await fetch(`/api/repos/${repoId}/comments/${commentId}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to resolve comment');
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch('/api/notifications', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load notifications');
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch('/api/notifications/mark-all-read', {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
