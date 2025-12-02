"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PkpButton } from "@/components/ui/pkp-button";
import { FormMessage } from "@/components/ui/form-message";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpSelect } from "@/components/ui/pkp-select";
import {
  PkpTable,
  PkpTableHeader,
  PkpTableRow,
  PkpTableHead,
  PkpTableCell,
} from "@/components/ui/pkp-table";
import { AddEditorModal } from "./participant-assignment/add-editor-modal";
import { AddCopyeditorModal } from "./participant-assignment/add-copyeditor-modal";
import { AddLayoutEditorModal } from "./participant-assignment/add-layout-editor-modal";
import { AddProofreaderModal } from "./participant-assignment/add-proofreader-modal";
import { assignParticipant, removeParticipant } from "../actions/participant-assignment";
import { JOURNAL_ROLE_OPTIONS } from "@/features/journals/types";
import { SUBMISSION_STAGES, type SubmissionStage } from "../types";

type Props = {
  submissionId: string;
  journalId: string;
  currentStage?: SubmissionStage;
};

type JournalUser = {
  id: string;
  name: string;
  email: string;
};

type Participant = {
  userId: string;
  name: string;
  email: string;
  role: string;
  stage: SubmissionStage;
  assignedAt: string;
};

export function SubmissionParticipantsPanel({ submissionId, journalId, currentStage }: Props) {
  const router = useRouter();
  const [journalUsers, setJournalUsers] = useState<JournalUser[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<SubmissionStage | "all">("all");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<string>(JOURNAL_ROLE_OPTIONS[0].value);
  const [stage, setStage] = useState<SubmissionStage>(currentStage || SUBMISSION_STAGES[0]);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isAssigning, startAssign] = useTransition();
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [openEditorModal, setOpenEditorModal] = useState(false);
  const [openCopyeditorModal, setOpenCopyeditorModal] = useState(false);
  const [openLayoutEditorModal, setOpenLayoutEditorModal] = useState(false);
  const [openProofreaderModal, setOpenProofreaderModal] = useState(false);
  const [modalStage, setModalStage] = useState<SubmissionStage>(currentStage || SUBMISSION_STAGES[0]);

  const formatDate = (value: string) => {
    try {
      return new Intl.DateTimeFormat("id", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, participantsRes] = await Promise.all([
        fetch(`/api/admin/journals/${journalId}/users`),
        fetch(`/api/editor/submissions/${submissionId}/participants`),
      ]);
      const usersJson = await usersRes.json();
      const participantsJson = await participantsRes.json();
      if (usersJson.ok) {
        setJournalUsers(
          (usersJson.users ?? []).map((user: { id: string; name: string; email: string }) => ({
            id: user.id,
            name: user.name ?? user.email ?? user.id,
            email: user.email ?? "",
          })),
        );
      }
      if (participantsJson.ok) {
        setParticipants(participantsJson.participants ?? []);
      }
    } catch {
      setFeedback({ tone: "error", message: "Gagal memuat peserta workflow." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId, submissionId]);

  const roleOptions = useMemo(
    () =>
      Array.from(
        new Set(
          participants.map((participant) => participant.role),
        ),
      ),
    [participants],
  );

  const filteredParticipants = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return participants.filter((participant) => {
      const matchesKeyword =
        !keyword ||
        participant.name.toLowerCase().includes(keyword) ||
        participant.email.toLowerCase().includes(keyword) ||
        participant.role.toLowerCase().includes(keyword) ||
        participant.stage.toLowerCase().includes(keyword);
      const matchesRole = roleFilter === "all" || participant.role === roleFilter;
      const matchesStage = stageFilter === "all" || participant.stage === stageFilter;
      return matchesKeyword && matchesRole && matchesStage;
    });
  }, [participants, search, roleFilter, stageFilter]);

  const handleAssign = (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) {
      setFeedback({ tone: "error", message: "Pilih pengguna untuk ditugaskan." });
      return;
    }
    startAssign(async () => {
      setFeedback(null);
      try {
        const result = await assignParticipant({
          submissionId,
          stage,
          userId,
          role,
        });
        if (!result.ok) {
          setFeedback({ tone: "error", message: result.error ?? "Tidak dapat menambahkan peserta." });
          return;
        }
        setFeedback({ tone: "success", message: result.message ?? "Peserta berhasil ditambahkan." });
        setUserId("");
        router.refresh();
        loadData();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menambahkan peserta." });
      }
    });
  };

  const handleAssignEditor = async (data: {
    submissionId: string;
    stage: SubmissionStage;
    userId: string;
    recommendOnly?: boolean;
    canChangeMetadata?: boolean;
  }) => {
    setFeedback(null);
    try {
      const result = await assignParticipant({
        submissionId: data.submissionId,
        stage: data.stage,
        userId: data.userId,
        role: "editor",
        recommendOnly: data.recommendOnly,
        canChangeMetadata: data.canChangeMetadata,
      });
      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to assign editor" });
        return;
      }
      setFeedback({ tone: "success", message: result.message ?? "Editor assigned successfully" });
      setOpenEditorModal(false);
      router.refresh();
      loadData();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to assign editor",
      });
      throw error;
    }
  };

  const handleAssignCopyeditor = async (data: {
    submissionId: string;
    stage: SubmissionStage;
    userId: string;
  }) => {
    setFeedback(null);
    try {
      const result = await assignParticipant({
        submissionId: data.submissionId,
        stage: data.stage,
        userId: data.userId,
        role: "copyeditor",
      });
      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to assign copyeditor" });
        return;
      }
      setFeedback({ tone: "success", message: result.message ?? "Copyeditor assigned successfully" });
      setOpenCopyeditorModal(false);
      router.refresh();
      loadData();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to assign copyeditor",
      });
      throw error;
    }
  };

  const handleAssignLayoutEditor = async (data: {
    submissionId: string;
    stage: SubmissionStage;
    userId: string;
  }) => {
    setFeedback(null);
    try {
      const result = await assignParticipant({
        submissionId: data.submissionId,
        stage: data.stage,
        userId: data.userId,
        role: "layout_editor",
      });
      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to assign layout editor" });
        return;
      }
      setFeedback({ tone: "success", message: result.message ?? "Layout editor assigned successfully" });
      setOpenLayoutEditorModal(false);
      router.refresh();
      loadData();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to assign layout editor",
      });
      throw error;
    }
  };

  const handleAssignProofreader = async (data: {
    submissionId: string;
    stage: SubmissionStage;
    userId: string;
  }) => {
    setFeedback(null);
    try {
      const result = await assignParticipant({
        submissionId: data.submissionId,
        stage: data.stage,
        userId: data.userId,
        role: "proofreader",
      });
      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to assign proofreader" });
        return;
      }
      setFeedback({ tone: "success", message: result.message ?? "Proofreader assigned successfully" });
      setOpenProofreaderModal(false);
      router.refresh();
      loadData();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to assign proofreader",
      });
      throw error;
    }
  };

  const handleRemove = async (participant: Participant) => {
    const key = `${participant.userId}-${participant.role}-${participant.stage}`;
    setRemovingKey(key);
    try {
      const result = await removeParticipant(
        submissionId,
        participant.stage,
        participant.userId,
        participant.role
      );
      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Tidak dapat menghapus peserta." });
        return;
      }
      setFeedback({ tone: "success", message: result.message ?? "Peserta dihapus." });
      router.refresh();
      loadData();
    } catch {
      setFeedback({ tone: "error", message: "Kesalahan jaringan saat menghapus peserta." });
    } finally {
      setRemovingKey(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {/* Add Participants - OJS 3.3 Style */}
      <div
        style={{
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "1rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#002C40",
            marginBottom: "0.75rem",
          }}
        >
          Tambah Peserta Workflow
        </h3>
        
        {/* Quick Add Buttons - OJS 3.3 Style */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <PkpButton
            variant="onclick"
            size="sm"
            onClick={() => {
              setModalStage(stage);
              setOpenEditorModal(true);
            }}
          >
            Add Editor
          </PkpButton>
          {(stage === "copyediting" || !currentStage) && (
            <PkpButton
              variant="onclick"
              size="sm"
              onClick={() => {
                setModalStage("copyediting");
                setOpenCopyeditorModal(true);
              }}
            >
              Add Copyeditor
            </PkpButton>
          )}
          {(stage === "production" || !currentStage) && (
            <>
              <PkpButton
                variant="onclick"
                size="sm"
                onClick={() => {
                  setModalStage("production");
                  setOpenLayoutEditorModal(true);
                }}
              >
                Add Layout Editor
              </PkpButton>
              <PkpButton
                variant="onclick"
                size="sm"
                onClick={() => {
                  setModalStage("production");
                  setOpenProofreaderModal(true);
                }}
              >
                Add Proofreader
              </PkpButton>
            </>
          )}
        </div>

        {/* Generic Add Form - OJS 3.3 Style */}
        <form
          onSubmit={handleAssign}
          style={{
            marginTop: "0.75rem",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr auto",
            gap: "0.75rem",
            alignItems: "end",
          }}
        >
          <PkpSelect
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            title="Pilih pengguna untuk ditambahkan sebagai peserta"
            required
          >
            <option value="">Pilih pengguna…</option>
            {journalUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </PkpSelect>
          <PkpSelect
            value={role}
            onChange={(event) => setRole(event.target.value)}
            title="Pilih peran untuk peserta"
            required
          >
            {JOURNAL_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </PkpSelect>
          <PkpSelect
            value={stage}
            onChange={(event) => setStage(event.target.value as SubmissionStage)}
            title="Pilih tahap workflow untuk peserta"
            required
          >
            {SUBMISSION_STAGES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </PkpSelect>
          <PkpButton
            type="submit"
            variant="primary"
            disabled={isAssigning}
            loading={isAssigning}
          >
            Tambah
          </PkpButton>
        </form>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            color: "rgba(0, 0, 0, 0.54)",
          }}
        >
          Peserta harus sudah terdaftar sebagai pengguna jurnal.
        </p>
        {feedback && (
          <div style={{ marginTop: "0.75rem" }}>
            <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
          </div>
        )}
      </div>

      {/* Participants List - OJS 3.3 Style */}
      <div
        style={{
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "1rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <PkpInput
            type="text"
            placeholder="Cari nama, email, role, atau tahap"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              flex: "1 1 14rem",
              minWidth: "12rem",
            }}
          />
          <PkpSelect
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            style={{ minWidth: "12rem" }}
            title="Filter berdasarkan role"
          >
            <option value="all">Semua role</option>
            {roleOptions.map((roleOption) => {
              const label = JOURNAL_ROLE_OPTIONS.find((option) => option.value === roleOption)?.label ?? roleOption;
              return (
                <option key={roleOption} value={roleOption}>
                  {label}
                </option>
              );
            })}
          </PkpSelect>
          <PkpSelect
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value as SubmissionStage | "all")}
            style={{ minWidth: "12rem" }}
            title="Filter berdasarkan tahap workflow"
          >
            <option value="all">Semua tahap</option>
            {SUBMISSION_STAGES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </PkpSelect>
          <span
            style={{
              fontSize: "0.75rem",
              color: "rgba(0, 0, 0, 0.54)",
              marginLeft: "auto",
            }}
          >
            Menampilkan {filteredParticipants.length}/{participants.length} peserta
          </span>
        </div>

        <div
          style={{
            marginTop: "1rem",
            overflow: "hidden",
            borderRadius: "0.25rem",
            border: "1px solid #e5e5e5",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "1.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Memuat peserta…
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div
              style={{
                padding: "1.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Belum ada peserta pada workflow.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <PkpTable>
                <PkpTableHeader>
                  <PkpTableRow isHeader>
                    <PkpTableHead>Nama & Email</PkpTableHead>
                    <PkpTableHead>Peran</PkpTableHead>
                    <PkpTableHead>Tahap</PkpTableHead>
                    <PkpTableHead>Ditugaskan</PkpTableHead>
                    <PkpTableHead style={{ textAlign: "right" }}>Aksi</PkpTableHead>
                  </PkpTableRow>
                </PkpTableHeader>
                <tbody>
                  {filteredParticipants.map((participant) => {
                    const key = `${participant.userId}-${participant.role}-${participant.stage}`;
                    const roleLabel =
                      JOURNAL_ROLE_OPTIONS.find((option) => option.value === participant.role)?.label ??
                      participant.role;
                    return (
                      <PkpTableRow key={key}>
                        <PkpTableCell>
                          <div style={{ fontWeight: 600, color: "#002C40" }}>{participant.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.54)" }}>{participant.email}</div>
                        </PkpTableCell>
                        <PkpTableCell>{roleLabel}</PkpTableCell>
                        <PkpTableCell>{participant.stage}</PkpTableCell>
                        <PkpTableCell>
                          <span style={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.54)" }}>
                            {formatDate(participant.assignedAt)}
                          </span>
                        </PkpTableCell>
                        <PkpTableCell style={{ textAlign: "right" }}>
                          <PkpButton
                            variant="onclick"
                            size="sm"
                            onClick={() => handleRemove(participant)}
                            disabled={removingKey === key}
                            loading={removingKey === key}
                          >
                            Hapus
                          </PkpButton>
                        </PkpTableCell>
                      </PkpTableRow>
                    );
                  })}
                </tbody>
              </PkpTable>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modals */}
      <>
        {openEditorModal && (
          <AddEditorModal
            open={openEditorModal}
            onClose={() => setOpenEditorModal(false)}
            submissionId={submissionId}
            stage={modalStage}
            journalId={journalId}
            onSubmit={handleAssignEditor}
          />
        )}

        {openCopyeditorModal && (
          <AddCopyeditorModal
            open={openCopyeditorModal}
            onClose={() => setOpenCopyeditorModal(false)}
            submissionId={submissionId}
            stage={modalStage}
            journalId={journalId}
            onSubmit={handleAssignCopyeditor}
          />
        )}

        {openLayoutEditorModal && (
          <AddLayoutEditorModal
            open={openLayoutEditorModal}
            onClose={() => setOpenLayoutEditorModal(false)}
            submissionId={submissionId}
            stage={modalStage}
            journalId={journalId}
            onSubmit={handleAssignLayoutEditor}
          />
        )}

        {openProofreaderModal && (
          <AddProofreaderModal
            open={openProofreaderModal}
            onClose={() => setOpenProofreaderModal(false)}
            submissionId={submissionId}
            stage={modalStage}
            journalId={journalId}
            onSubmit={handleAssignProofreader}
          />
        )}
      </>
    </div>
  );
}

