import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Copy,
  Archive,
  Eye,
  Settings2,
  Lock,
  Star,
  Filter,
  Inbox,
} from 'lucide-react';
import { api, getApiErrorDetail } from '@/lib/api';
import { TENANT_ID } from '@/lib/config';
import { useNavigate } from '@/lib/router';
import { useToast } from '@/components/Toast';
import type { BehaviorConfigResponse, InterviewType } from '@/types/behaviorConfig';
import { INTERVIEW_TYPE_OPTIONS, getTypeBadge } from '@/types/behaviorConfig';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import { PageLoader, EmptyState } from '@/components/ui/Feedback';
import { ConfigPreview } from '@/components/ConfigPreview';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';

export const ListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [systemDefaults, setSystemDefaults] = useState<BehaviorConfigResponse[] | null>(null);
  const [tenantConfigs, setTenantConfigs] = useState<BehaviorConfigResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<InterviewType | 'all'>('all');
  const [preview, setPreview] = useState<BehaviorConfigResponse | null>(null);
  const [cloneTarget, setCloneTarget] = useState<BehaviorConfigResponse | null>(null);
  const [cloneName, setCloneName] = useState('');
  const [cloning, setCloning] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<BehaviorConfigResponse | null>(null);
  const [archiving, setArchiving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sys, tenant] = await Promise.all([
        api.getSystemDefaults(),
        api.listConfigs(TENANT_ID, { include_system_defaults: false }),
      ]);
      setSystemDefaults(sys);
      setTenantConfigs(tenant);
    } catch (e) {
      setError(getApiErrorDetail(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTenant = (tenantConfigs ?? []).filter((c) => {
    if (typeFilter !== 'all' && c.interview_type !== typeFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openClone = (c: BehaviorConfigResponse) => {
    setCloneTarget(c);
    setCloneName(`${c.name} (Copy)`);
  };

  const doClone = async () => {
    if (!cloneTarget) return;
    setCloning(true);
    try {
      const cloned = await api.cloneConfig(cloneTarget.id, TENANT_ID, cloneName);
      toast.show(`Cloned as "${cloned.name}"`, 'success');
      setCloneTarget(null);
      navigate('/configs/edit', { id: cloned.id });
    } catch (e) {
      toast.show(getApiErrorDetail(e), 'error');
    } finally {
      setCloning(false);
    }
  };

  const doArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await api.archiveConfig(archiveTarget.id, TENANT_ID);
      toast.show(`"${archiveTarget.name}" archived`, 'success');
      setArchiveTarget(null);
      load();
    } catch (e) {
      toast.show(getApiErrorDetail(e), 'error');
    } finally {
      setArchiving(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-rose-600 mb-4">{error}</p>
        <Button onClick={load} variant="secondary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* System defaults */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">System presets</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Ready-made configurations. Clone one to customize it for your team.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            Read-only
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(systemDefaults ?? []).map((c) => {
            const badge = getTypeBadge(c.interview_type);
            return (
              <article
                key={c.id}
                className="card p-5 flex flex-col gap-3 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge bg={badge.bg} color={badge.text}>
                      {badge.label}
                    </Badge>
                  </div>
                  <Lock className="h-4 w-4 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {c.description}
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Eye className="h-3.5 w-3.5" />}
                    onClick={() => setPreview(c)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Copy className="h-3.5 w-3.5" />}
                    onClick={() => openClone(c)}
                  >
                    Clone
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Tenant configs */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Your configurations</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Custom bot configs for your organization.
            </p>
          </div>
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/configs/new')}
          >
            New configuration
          </Button>
        </div>

        {/* Filters */}
        <div className="card p-3 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/40"
            />
          </div>
          <div className="relative sm:w-52">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as InterviewType | 'all')}
              className="pl-9"
            >
              <option value="all">All interview types</option>
              {INTERVIEW_TYPE_OPTIONS.filter((o) => o.value !== null).map((o) => (
                <option key={o.value} value={o.value!}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {filteredTenant.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title={
                (tenantConfigs ?? []).length === 0
                  ? 'No custom configurations yet'
                  : 'No matches for your filters'
              }
              description={
                (tenantConfigs ?? []).length === 0
                  ? 'Create a new configuration or clone a system preset to get started.'
                  : 'Try adjusting your search or filter.'
              }
              action={
                (tenantConfigs ?? []).length === 0 ? (
                  <Button
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => navigate('/configs/new')}
                  >
                    New configuration
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium hidden md:table-cell">Updated</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenant.map((c) => {
                    const badge = getTypeBadge(c.interview_type);
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/70 transition-colors animate-row-in"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {c.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate max-w-xs">
                                {c.description}
                              </p>
                            </div>
                            {c.is_tenant_default && (
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge bg={badge.bg} color={badge.text}>
                            {badge.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          {c.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              Archived
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell text-slate-500">
                          {new Date(c.updated_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPreview(c)}
                              title="View"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {c.status === 'active' && (
                              <button
                                onClick={() =>
                                  navigate('/configs/edit', { id: c.id })
                                }
                                title="Edit"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                              >
                                <Settings2 className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openClone(c)}
                              title="Clone"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            {c.status === 'active' && (
                              <button
                                onClick={() => setArchiveTarget(c)}
                                title="Archive"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Preview drawer */}
      <Drawer
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name ?? ''}
        subtitle={preview?.id}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPreview(null)}>
              Close
            </Button>
            {preview && !preview.is_system_default && preview.status === 'active' && (
              <Button
                icon={<Settings2 className="h-4 w-4" />}
                onClick={() => {
                  const id = preview.id;
                  setPreview(null);
                  navigate('/configs/edit', { id });
                }}
              >
                Edit
              </Button>
            )}
            {preview && (
              <Button
                variant="outline"
                icon={<Copy className="h-4 w-4" />}
                onClick={() => {
                  const c = preview;
                  setPreview(null);
                  openClone(c);
                }}
              >
                Clone
              </Button>
            )}
          </>
        }
      >
        {preview && <ConfigPreview config={preview} />}
      </Drawer>

      {/* Clone modal */}
      <Modal
        open={!!cloneTarget}
        onClose={() => setCloneTarget(null)}
        title="Clone configuration"
        description="Create a new editable copy of this configuration."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCloneTarget(null)}>
              Cancel
            </Button>
            <Button
              loading={cloning}
              icon={<Copy className="h-4 w-4" />}
              onClick={doClone}
              disabled={!cloneName.trim()}
            >
              Clone
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">New name</label>
          <input
            value={cloneName}
            onChange={(e) => setCloneName(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/40"
          />
          {cloneTarget && (
            <p className="text-xs text-slate-500 mt-1">
              Source: <span className="font-medium">{cloneTarget.name}</span>
            </p>
          )}
        </div>
      </Modal>

      {/* Archive confirm */}
      <Modal
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive configuration"
        description="Archived configs can't be used in new interviews. This can't be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setArchiveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={archiving}
              icon={<Archive className="h-4 w-4" />}
              onClick={doArchive}
            >
              Archive
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          You're about to archive{' '}
          <span className="font-semibold text-slate-900">{archiveTarget?.name}</span>.
          It will be marked inactive and removed as a tenant default.
        </p>
      </Modal>
    </div>
  );
};
