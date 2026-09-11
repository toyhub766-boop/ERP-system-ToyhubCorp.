import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";

import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiEdit3,
  FiFilter,
  FiMessageSquare,
  FiPlus,
  FiSearch,
  FiTarget,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import api from "../../../services/api/axios";

import {
  getSalesPipeline,
  updateCustomerPipeline,
} from "../services/pipeline.service";

import {
  addCustomerNote,
  updateCustomerNote,
  deleteCustomerNote,
} from "../services/customerNote.service";

import {
  addPartyNote,
  updatePartyNote,
  deletePartyNote,
  updatePartySalespeople,
  updatePartyPipeline,
} from "../../accounts/services/accountParty.service";

/* =========================================================
   TYPES
========================================================= */

type Stage = {
  id: string;
  label: string;
};

type CRMUser = {
  _id: string;
  name: string;
  role: string;
  status?: string;
};

type PipelineRecord = any;

type DateFilter =
  | "ALL"
  | "TODAY"
  | "TOMORROW"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "OVERDUE"
  | "OLDER"
  | "NO_DATE";

type PipelineForm = {
  stage: string;
  assignedSalespeople: string[];
  lastContactDate: string;
  nextFollowUpDate: string;
  nextAction: string;
  negotiationNotes: string;
  stageNote: string;
  crmAssociation: string;
};

type ConversationForm = {
  note: string;
  type:
  | "GENERAL"
  | "PAYMENT"
  | "MEETING"
  | "FOLLOW_UP"
  | "COMPLAINT"
  | "PRODUCT";
  priority:
  | "LOW"
  | "MEDIUM"
  | "HIGH";
  nextFollowUpDate: string;
  nextAction: string;
};

type ConversationNote = {
  _id?: string;
  title?: string;
  note: string;
  type?:
  | "GENERAL"
  | "PAYMENT"
  | "MEETING"
  | "FOLLOW_UP"
  | "COMPLAINT"
  | "PRODUCT";
  priority?:
  | "LOW"
  | "MEDIUM"
  | "HIGH";
  reminderDate?: string;
  completed?: boolean;
  addedBy?: {
    _id?: string;
    name?: string;
    employeeId?: string;
    role?: string;
  } | string;
  createdAt?: string;
};

/* =========================================================
   CRM STAGES
   SUPPLIERS ARE INTENTIONALLY NOT INCLUDED
========================================================= */

const STAGES: Stage[] = [
  {
    id: "LEAD",
    label: "Lead",
  },
  {
    id: "RINGING",
    label: "Ringing",
  },
  {
    id: "NEGOTIATION",
    label: "Negotiation",
  },
  {
    id: "CATALOG_SHARED",
    label: "Catalog Shared",
  },
  {
    id: "VERIFICATION",
    label: "Verification",
  },
  {
    id: "ACTIVE_DEALER",
    label: "Active Dealer",
  },
  {
    id: "DELAYED_PAYMENT",
    label: "Delayed Payment",
  },
  {
    id: "CLOSED",
    label: "Closed",
  },
  {
    id: "NO_DEAL",
    label: "No Deal",
  },
];

const EMPTY_FORM: PipelineForm = {
  stage: "LEAD",
  assignedSalespeople: [],
  lastContactDate: "",
  nextFollowUpDate: "",
  nextAction: "",
  negotiationNotes: "",
  stageNote: "",
  crmAssociation: "LEAD",
};

const EMPTY_CONVERSATION: ConversationForm = {
  note: "",
  type: "GENERAL",
  priority: "MEDIUM",
  nextFollowUpDate: "",
  nextAction: "",
};

/* =========================================================
   HELPERS
========================================================= */

const getType = (
  record: PipelineRecord
): "LEAD" | "CUSTOMER" | "PARTY" | "SUPPLIER" => {
  if (
    record.source === "ACCOUNTS" ||
    record.crmType === "PARTY"
  ) {
    if (
      record.partyType ===
      "SUPPLIER"
    ) {
      return "SUPPLIER";
    }

    return "PARTY";
  }

  if (
    record.stage === "LEAD" &&
    !record.crmAssociation
  ) {
    return "LEAD";
  }

  return "CUSTOMER";
};

const getStage = (
  record: PipelineRecord
): string => {
  const type = getType(record);

  if (type === "SUPPLIER") {
    return "SUPPLIER";
  }

  if (type === "PARTY") {
    return (
      record.crmStage ||
      "ACTIVE_DEALER"
    );
  }

  return record.stage || "LEAD";
};

const getSalespersonIds = (
  record: PipelineRecord
): string[] => {
  if (
    Array.isArray(
      record.assignedSalespeople
    )
  ) {
    return record.assignedSalespeople
      .map((person: any) =>
        typeof person === "string"
          ? person
          : person?._id
      )
      .filter(Boolean);
  }

  return [];
};

const getSalespersonNames = (
  record: PipelineRecord
): string[] => {
  if (
    Array.isArray(
      record.assignedSalespeople
    )
  ) {
    return record.assignedSalespeople
      .map((person: any) =>
        typeof person === "string"
          ? person
          : person?.name
      )
      .filter(Boolean);
  }

  return record.assignedSalesperson
    ? [record.assignedSalesperson]
    : [];
};

const getConversationNotes = (
  record: PipelineRecord
): ConversationNote[] => {
  if (
    !Array.isArray(
      record.specialNotes
    )
  ) {
    return [];
  }

  return record.specialNotes;
};

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not set";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatDateTime = (
  value?: string | null
) => {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown time";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const formatDateInput = (
  value?: string | null
) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
};

const startOfDay = (
  value: Date
) => {
  const date = new Date(value);

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;
};

const isToday = (
  value?: string | null
) => {
  if (!value) {
    return false;
  }

  return (
    startOfDay(
      new Date(value)
    ).getTime() ===
    startOfDay(
      new Date()
    ).getTime()
  );
};

const isTomorrow = (
  value?: string | null
) => {
  if (!value) {
    return false;
  }

  const tomorrow = new Date();

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  return (
    startOfDay(
      new Date(value)
    ).getTime() ===
    startOfDay(
      tomorrow
    ).getTime()
  );
};

const isYesterday = (
  value?: string | null
) => {
  if (!value) {
    return false;
  }

  const yesterday = new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  return (
    startOfDay(
      new Date(value)
    ).getTime() ===
    startOfDay(
      yesterday
    ).getTime()
  );
};

const isOverdue = (
  value?: string | null
) => {
  if (!value) {
    return false;
  }

  return (
    startOfDay(
      new Date(value)
    ).getTime() <
    startOfDay(
      new Date()
    ).getTime()
  );
};

const isThisWeek = (
  value?: string | null
) => {
  if (!value) {
    return false;
  }

  const date = startOfDay(
    new Date(value)
  );

  const today = startOfDay(
    new Date()
  );

  const day =
    today.getDay() || 7;

  const monday =
    new Date(today);

  monday.setDate(
    today.getDate() -
    day +
    1
  );

  const sunday =
    new Date(monday);

  sunday.setDate(
    monday.getDate() + 6
  );

  sunday.setHours(
    23,
    59,
    59,
    999
  );

  return (
    date >= monday &&
    date <= sunday
  );
};

const matchesDateFilter = (
  value:
    | string
    | null
    | undefined,
  filter: DateFilter,
  mode: "NEXT" | "LAST"
) => {
  switch (filter) {
    case "ALL":
      return true;

    case "NO_DATE":
      return !value;

    case "TODAY":
      return isToday(value);

    case "TOMORROW":
      return isTomorrow(value);

    case "YESTERDAY":
      return isYesterday(value);

    case "THIS_WEEK":
      return isThisWeek(value);

    case "OVERDUE":
      return (
        mode === "NEXT" &&
        isOverdue(value)
      );

    case "OLDER":
      return (
        mode === "LAST" &&
        !!value &&
        !isThisWeek(value) &&
        !isToday(value)
      );

    default:
      return true;
  }
};

const getStageLabel = (
  stage: string
) =>
  STAGES.find(
    item =>
      item.id === stage
  )?.label || stage;

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SalesPipeline = () => {
  const [
    records,
    setRecords,
  ] = useState<PipelineRecord[]>(
    []
  );

  const [
    salespeople,
    setSalespeople,
  ] = useState<CRMUser[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    recordView,
    setRecordView,
  ] = useState<
    "ALL" |
    "LEADS" |
    "CUSTOMERS" |
    "PARTIES"
  >("ALL");

  const [
    activeSalesperson,
    setActiveSalesperson,
  ] = useState("ALL");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showFilters,
    setShowFilters,
  ] = useState(false);

  const [
    stageFilter,
    setStageFilter,
  ] = useState("ALL");

  const [
    salespersonFilter,
    setSalespersonFilter,
  ] = useState("ALL");

  const [
    nextFollowUpFilter,
    setNextFollowUpFilter,
  ] = useState<DateFilter>("ALL");

  const [
    lastContactFilter,
    setLastContactFilter,
  ] = useState<DateFilter>("ALL");

  const [
    selectedRecord,
    setSelectedRecord,
  ] = useState<PipelineRecord | null>(
    null
  );

  const [
    openConversationFor,
    setOpenConversationFor,
  ] = useState<string | null>(
    null
  );

  const [
    editingRecord,
    setEditingRecord,
  ] = useState<PipelineRecord | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<PipelineForm>(
    EMPTY_FORM
  );

  const [
    showEdit,
    setShowEdit,
  ] = useState(false);

  const [
    showSalespersonDropdown,
    setShowSalespersonDropdown,
  ] = useState(false);

  const [
    draggingRecord,
    setDraggingRecord,
  ] = useState<PipelineRecord | null>(
    null
  );

  const [
    dragOverStage,
    setDragOverStage,
  ] = useState<string | null>(
    null
  );

  /* =======================================================
     LOAD
  ======================================================= */

  const loadPipeline = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const data =
        await getSalesPipeline();

      const safeData =
        Array.isArray(data)
          ? data
          : [];

      setRecords(safeData);

      return safeData;
    } catch (error) {
      console.error(
        "Failed to load pipeline:",
        error
      );

      if (showLoader) {
        setRecords([]);
      }

      return [];
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const loadSalespeople = async () => {
    try {
      const response =
        await api.get("/users");

      const users =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      setSalespeople(
        users.filter(
          (user: CRMUser) =>
            user.role === "CRM" &&
            user.status !==
            "INACTIVE"
        )
      );
    } catch (error) {
      console.error(
        "Failed to load salespeople:",
        error
      );
    }
  };

  useEffect(() => {
    loadPipeline();
    loadSalespeople();
  }, []);

  /* =======================================================
     RECORD UPDATE HELPER
  ======================================================= */

  const replaceRecord = (
    updatedRecord: PipelineRecord
  ) => {
    if (
      !updatedRecord?._id
    ) {
      return;
    }

    setRecords(
      (previous: PipelineRecord[]) =>
        previous.map(record => {
          if (
            record._id !==
            updatedRecord._id ||
            record.source !==
            updatedRecord.source
          ) {
            return record;
          }

          return {
            ...record,
            ...updatedRecord,
          };
        })
    );

    setSelectedRecord(
      (previous: PipelineRecord | null) => {
        if (
          !previous ||
          previous._id !==
          updatedRecord._id ||
          previous.source !==
          updatedRecord.source
        ) {
          return previous;
        }

        return {
          ...previous,
          ...updatedRecord,
        };
      }
    );
  };

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    const valid =
      records.filter(
        record =>
          getType(record) !==
          "SUPPLIER"
      );

    return {
      all: valid.length,

      leads: valid.filter(
        record =>
          getType(record) ===
          "LEAD"
      ).length,

      customers: valid.filter(
        record =>
          getType(record) ===
          "CUSTOMER"
      ).length,

      parties: valid.filter(
        record =>
          getType(record) ===
          "PARTY"
      ).length,
    };
  }, [records]);

  /* =======================================================
     FILTERS
  ======================================================= */

  const filteredRecords =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return records.filter(
        record => {
          if (
            getType(record) ===
            "SUPPLIER"
          ) {
            return false;
          }

          const type =
            getType(record);

          if (
            recordView ===
            "LEADS" &&
            type !== "LEAD"
          ) {
            return false;
          }

          if (
            recordView ===
            "CUSTOMERS" &&
            type !== "CUSTOMER"
          ) {
            return false;
          }

          if (
            recordView ===
            "PARTIES" &&
            type !== "PARTY"
          ) {
            return false;
          }

          const searchable = [
            record.companyName,
            record.firmName,
            record.contactPerson,
            record.phone,
            record.email,
            record.partyCode,
            record.customerCode,
            ...getSalespersonNames(
              record
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (
            query &&
            !searchable.includes(
              query
            )
          ) {
            return false;
          }

          if (
            stageFilter !==
            "ALL" &&
            getStage(record) !==
            stageFilter
          ) {
            return false;
          }

          const salespersonIds =
            getSalespersonIds(
              record
            );

          if (
            salespersonFilter !==
            "ALL" &&
            !salespersonIds.includes(
              salespersonFilter
            )
          ) {
            return false;
          }

          if (
            activeSalesperson !==
            "ALL" &&
            !salespersonIds.includes(
              activeSalesperson
            )
          ) {
            return false;
          }

          if (
            !matchesDateFilter(
              record.nextFollowUpDate,
              nextFollowUpFilter,
              "NEXT"
            )
          ) {
            return false;
          }

          if (
            !matchesDateFilter(
              record.lastContactDate,
              lastContactFilter,
              "LAST"
            )
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      records,
      recordView,
      search,
      stageFilter,
      salespersonFilter,
      activeSalesperson,
      nextFollowUpFilter,
      lastContactFilter,
    ]);

  /* =======================================================
     DRAG / DROP
  ======================================================= */

  const handleDragStart = (
    record: PipelineRecord
  ) => {
    setDraggingRecord(record);
  };

  const handleDragEnd = () => {
    setDraggingRecord(null);
    setDragOverStage(null);
  };

  const handleDrop = async (
    stageId: string
  ) => {
    if (
      !draggingRecord?._id
    ) {
      return;
    }

    const record =
      draggingRecord;

    const previousStage =
      getStage(record);

    setDraggingRecord(null);
    setDragOverStage(null);

    if (
      previousStage === stageId
    ) {
      return;
    }

    setRecords((previous: PipelineRecord[]) =>
      previous.map(item => {
        if (
          item._id !==
          record._id ||
          item.source !==
          record.source
        ) {
          return item;
        }

        if (
          getType(item) ===
          "PARTY"
        ) {
          return {
            ...item,
            crmStage:
              stageId,
          };
        }

        return {
          ...item,
          stage: stageId,
        };
      })
    );

    try {
      setSaving(true);

      if (
        getType(record) ===
        "PARTY"
      ) {
        const updated =
          await updatePartyPipeline(
            record._id,
            {
              crmPipeline:
                record.crmPipeline ||
                "Sales Pipeline",
              crmStage:
                stageId,
              crmAssociation:
                record.crmAssociation ||
                "PARTY",
            }
          );

        replaceRecord({
          ...updated,
          source:
            "ACCOUNTS",
          crmType:
            "PARTY",
        });
      } else {
        const updated =
          await updateCustomerPipeline(
            record._id,
            {
              stage:
                stageId,
            }
          );

        replaceRecord({
          ...updated,
          source: "CRM",
          crmType:
            getType(record),
        });
      }
    } catch (error) {
      console.error(
        "Failed to move card:",
        error
      );

      setRecords((previous: PipelineRecord[]) =>
        previous.map(item => {
          if (
            item._id !==
            record._id ||
            item.source !==
            record.source
          ) {
            return item;
          }

          if (
            getType(item) ===
            "PARTY"
          ) {
            return {
              ...item,
              crmStage:
                previousStage,
            };
          }

          return {
            ...item,
            stage:
              previousStage,
          };
        })
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     PROFILE
  ======================================================= */

  const openProfile = (
    record: PipelineRecord
  ) => {
    setSelectedRecord(record);
    setOpenConversationFor(null);
  };

  const openConversation = (
    record: PipelineRecord
  ) => {
    setSelectedRecord(record);
    setOpenConversationFor(
      record._id
    );
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const openEdit = (
    record: PipelineRecord
  ) => {
    setEditingRecord(record);

    setForm({
      stage:
        getStage(record),

      assignedSalespeople:
        getSalespersonIds(
          record
        ),

      lastContactDate:
        formatDateInput(
          record.lastContactDate
        ),

      nextFollowUpDate:
        formatDateInput(
          record.nextFollowUpDate
        ),

      nextAction:
        record.nextAction ||
        "",

      negotiationNotes:
        record.negotiationNotes ||
        "",

      stageNote: "",

      crmAssociation:
        record.crmAssociation ||
        getType(record),
    });

    setShowEdit(true);
  };

  const saveEdit =
    async () => {
      if (
        !editingRecord?._id
      ) {
        return;
      }

      try {
        setSaving(true);

        const type =
          getType(
            editingRecord
          );

        if (
          type === "PARTY"
        ) {
          const salespersonResult =
            await updatePartySalespeople(
              editingRecord._id,
              form.assignedSalespeople
            );

          const pipelineResult =
            await updatePartyPipeline(
              editingRecord._id,
              {
                crmPipeline:
                  "Sales Pipeline",
                crmStage:
                  form.stage,
                crmAssociation:
                  form.crmAssociation,
              }
            );

          replaceRecord({
            ...pipelineResult,
            ...salespersonResult,
            source:
              "ACCOUNTS",
            crmType:
              "PARTY",
          });
        } else {
          const updated =
            await updateCustomerPipeline(
              editingRecord._id,
              {
                stage:
                  form.stage,

                assignedSalespeople:
                  form.assignedSalespeople,

                lastContactDate:
                  form.lastContactDate ||
                  undefined,

                nextFollowUpDate:
                  form.nextFollowUpDate ||
                  undefined,

                nextAction:
                  form.nextAction.trim(),

                negotiationNotes:
                  form.negotiationNotes.trim(),

                stageNote:
                  form.stageNote.trim(),
              }
            );

          replaceRecord({
            ...updated,
            source:
              "CRM",
            crmType:
              type,
          });
        }

        await loadPipeline(false);

        setShowEdit(false);
        setEditingRecord(null);
        setForm(EMPTY_FORM);
      } catch (error) {
        console.error(
          "Failed to save:",
          error
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     CONVERSATION — ADD
  ======================================================= */

  const handleAddConversation =
    async (
      record: PipelineRecord,
      conversation: ConversationForm
    ) => {
      if (
        !record?._id ||
        !conversation.note.trim()
      ) {
        return false;
      }

      try {
        const type =
          getType(record);

        let updatedRecord;

        if (
          type === "PARTY"
        ) {
          updatedRecord =
            await addPartyNote(
              record._id,
              {
                title: "",
                note:
                  conversation.note.trim(),
                type:
                  conversation.type,
                priority:
                  conversation.priority,
                reminderDate:
                  conversation.nextFollowUpDate ||
                  undefined,
                completed:
                  false,
              }
            );

          const freshRecords =
            await loadPipeline(
              false
            );

          const freshRecord =
            freshRecords.find(
              (item: PipelineRecord) =>
                item._id ===
                record._id &&
                item.source ===
                "ACCOUNTS"
            );

          if (freshRecord) {
            updatedRecord =
              freshRecord;
          }
        } else {
          updatedRecord =
            await addCustomerNote(
              record._id,
              {
                title: "",
                note:
                  conversation.note.trim(),
                type:
                  conversation.type,
                priority:
                  conversation.priority,
                reminderDate:
                  conversation.nextFollowUpDate ||
                  undefined,
                completed:
                  false,
              }
            );

          await updateCustomerPipeline(
            record._id,
            {
              lastContactDate:
                new Date().toISOString(),

              nextFollowUpDate:
                conversation.nextFollowUpDate ||
                undefined,

              nextAction:
                conversation.nextAction.trim() ||
                undefined,
            }
          );

          const freshRecords =
            await loadPipeline(
              false
            );

          const freshRecord =
            freshRecords.find(
              (item: PipelineRecord) =>
                item._id ===
                record._id &&
                item.source ===
                "CRM"
            );

          if (freshRecord) {
            updatedRecord =
              freshRecord;
          }
        }

        if (!updatedRecord) {
          return false;
        }

        replaceRecord({
          ...updatedRecord,
          source:
            type === "PARTY"
              ? "ACCOUNTS"
              : "CRM",
          crmType:
            type === "PARTY"
              ? "PARTY"
              : type,
        });

        return true;
      } catch (error) {
        console.error(
          "Failed to add conversation:",
          error
        );

        return false;
      }
    };

  /* =======================================================
     CONVERSATION — EDIT
  ======================================================= */

  const handleUpdateConversation =
    async (
      record: PipelineRecord,
      noteId: string,
      data: Partial<ConversationNote>
    ) => {
      try {
        const type =
          getType(record);

        let updated;

        if (
          type === "PARTY"
        ) {
          updated =
            await updatePartyNote(
              record._id,
              noteId,
              data as any
            );
        } else {
          updated =
            await updateCustomerNote(
              record._id,
              noteId,
              data as any
            );
        }

        replaceRecord({
          ...updated,
          source:
            type === "PARTY"
              ? "ACCOUNTS"
              : "CRM",
          crmType:
            type === "PARTY"
              ? "PARTY"
              : type,
        });

        return true;
      } catch (error) {
        console.error(
          "Failed to update conversation:",
          error
        );

        return false;
      }
    };

  /* =======================================================
     CONVERSATION — DELETE
  ======================================================= */

  const handleDeleteConversation =
    async (
      record: PipelineRecord,
      noteId: string
    ) => {
      try {
        const type =
          getType(record);

        if (
          type === "PARTY"
        ) {
          await deletePartyNote(
            record._id,
            noteId
          );
        } else {
          await deleteCustomerNote(
            record._id,
            noteId
          );
        }

        setRecords((previous: PipelineRecord[]) =>
          previous.map(item => {
            if (
              item._id !==
              record._id ||
              item.source !==
              record.source
            ) {
              return item;
            }

            return {
              ...item,
              specialNotes:
                getConversationNotes(
                  item
                ).filter(
                  note =>
                    note._id !==
                    noteId
                ),
            };
          })
        );

        setSelectedRecord(
          (previous: PipelineRecord | null) => {
            if (
              !previous ||
              previous._id !==
              record._id ||
              previous.source !==
              record.source
            ) {
              return previous;
            }

            return {
              ...previous,
              specialNotes:
                getConversationNotes(
                  previous
                ).filter(
                  note =>
                    note._id !==
                    noteId
                ),
            };
          }
        );

        return true;
      } catch (error) {
        console.error(
          "Failed to delete conversation:",
          error
        );

        return false;
      }
    };

  /* =======================================================
     FILTER RESET
  ======================================================= */

  const clearFilters = () => {
    setStageFilter("ALL");
    setSalespersonFilter("ALL");
    setNextFollowUpFilter(
      "ALL"
    );
    setLastContactFilter(
      "ALL"
    );
  };

  const hasFilters =
    stageFilter !== "ALL" ||
    salespersonFilter !==
    "ALL" ||
    nextFollowUpFilter !==
    "ALL" ||
    lastContactFilter !==
    "ALL";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#172B6B]/10 text-[#172B6B]">
            <FiTarget
              size={20}
              className="animate-pulse"
            />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-700">
            Loading sales pipeline...
          </p>

        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full space-y-5">

      {/* =====================================================
          COMPACT PIPELINE CONTROL BAR
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">

          <div className="flex min-w-0 items-center gap-2.5">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#172B6B]/10 text-[#172B6B]">
              <FiTarget size={15} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                Sales Pipeline
              </h1>

              <p className="hidden text-[10px] text-slate-400 sm:block">
                {filteredRecords.length} matching records
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                value => !value
              )
            }
            aria-expanded={
              showFilters
            }
            className={`
              inline-flex
              h-9
              shrink-0
              items-center
              gap-2
              rounded-lg
              border
              px-3
              text-xs
              font-bold
              transition
              ${showFilters ||
                hasFilters
                ? "border-[#172B6B] bg-[#172B6B]/5 text-[#172B6B]"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }
            `}
          >
            <FiFilter size={14} />

            <span className="hidden sm:inline">
              Filters
            </span>

            {hasFilters && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#172B6B] px-1 text-[8px] text-white">
                !
              </span>
            )}

            <FiChevronDown
              size={12}
              className={`transition-transform ${showFilters
                ? "rotate-180"
                : ""
                }`}
            />
          </button>

        </div>

        {showFilters && (
          <div className="border-t border-slate-100 px-4 py-4 sm:px-5">

            <div className="space-y-4">

              {/* RECORD TYPE */}

              <div>

                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Records
                  </span>
                </div>

                <div className="flex gap-1 overflow-x-auto">

                  <RecordTab
                    label="All"
                    count={
                      counts.all
                    }
                    active={
                      recordView ===
                      "ALL"
                    }
                    onClick={() =>
                      setRecordView(
                        "ALL"
                      )
                    }
                  />

                  <RecordTab
                    label="Leads"
                    count={
                      counts.leads
                    }
                    active={
                      recordView ===
                      "LEADS"
                    }
                    onClick={() =>
                      setRecordView(
                        "LEADS"
                      )
                    }
                  />

                  <RecordTab
                    label="Customers"
                    count={
                      counts.customers
                    }
                    active={
                      recordView ===
                      "CUSTOMERS"
                    }
                    onClick={() =>
                      setRecordView(
                        "CUSTOMERS"
                      )
                    }
                  />

                  <RecordTab
                    label="Account Parties"
                    count={
                      counts.parties
                    }
                    active={
                      recordView ===
                      "PARTIES"
                    }
                    onClick={() =>
                      setRecordView(
                        "PARTIES"
                      )
                    }
                  />

                </div>

              </div>

              {/* SALESPERSON */}

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <FiUsers
                    size={12}
                    className="text-slate-400"
                  />

                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Salesperson
                  </span>

                </div>

                <div className="flex gap-1 overflow-x-auto">

                  <SalespersonTab
                    label="All"
                    active={
                      activeSalesperson ===
                      "ALL"
                    }
                    onClick={() =>
                      setActiveSalesperson(
                        "ALL"
                      )
                    }
                  />

                  {salespeople.map(
                    person => (
                      <SalespersonTab
                        key={
                          person._id
                        }
                        label={
                          person.name
                        }
                        active={
                          activeSalesperson ===
                          person._id
                        }
                        onClick={() =>
                          setActiveSalesperson(
                            person._id
                          )
                        }
                      />
                    )
                  )}

                </div>

              </div>

              {/* SEARCH */}

              <div className="flex flex-col gap-2 lg:flex-row">

                <div className="relative flex-1">

                  <FiSearch
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={
                      search
                    }
                    onChange={e =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search company, contact, phone, party code or salesperson..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs outline-none focus:border-[#172B6B] focus:bg-white"
                  />

                </div>

              </div>

              {/* ADVANCED FILTERS */}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <FilterSelect
                  label="Stage"
                  value={
                    stageFilter
                  }
                  onChange={
                    setStageFilter
                  }
                  options={[
                    {
                      value: "ALL",
                      label:
                        "All Stages",
                    },
                    ...STAGES.map(
                      stage => ({
                        value:
                          stage.id,
                        label:
                          stage.label,
                      })
                    ),
                  ]}
                />

                <FilterSelect
                  label="Salesperson"
                  value={
                    salespersonFilter
                  }
                  onChange={
                    setSalespersonFilter
                  }
                  options={[
                    {
                      value: "ALL",
                      label:
                        "All Salespeople",
                    },
                    ...salespeople.map(
                      person => ({
                        value:
                          person._id,
                        label:
                          person.name,
                      })
                    ),
                  ]}
                />

                <FilterSelect
                  label="Next Follow-up"
                  value={
                    nextFollowUpFilter
                  }
                  onChange={value =>
                    setNextFollowUpFilter(
                      value as DateFilter
                    )
                  }
                  options={[
                    {
                      value: "ALL",
                      label:
                        "All",
                    },
                    {
                      value:
                        "TODAY",
                      label:
                        "Today",
                    },
                    {
                      value:
                        "TOMORROW",
                      label:
                        "Tomorrow",
                    },
                    {
                      value:
                        "THIS_WEEK",
                      label:
                        "This Week",
                    },
                    {
                      value:
                        "OVERDUE",
                      label:
                        "Overdue",
                    },
                    {
                      value:
                        "NO_DATE",
                      label:
                        "Not Set",
                    },
                  ]}
                />

                <FilterSelect
                  label="Last Contact"
                  value={
                    lastContactFilter
                  }
                  onChange={value =>
                    setLastContactFilter(
                      value as DateFilter
                    )
                  }
                  options={[
                    {
                      value: "ALL",
                      label:
                        "All",
                    },
                    {
                      value:
                        "TODAY",
                      label:
                        "Today",
                    },
                    {
                      value:
                        "YESTERDAY",
                      label:
                        "Yesterday",
                    },
                    {
                      value:
                        "THIS_WEEK",
                      label:
                        "This Week",
                    },
                    {
                      value:
                        "OLDER",
                      label:
                        "Older",
                    },
                    {
                      value:
                        "NO_DATE",
                      label:
                        "Not Set",
                    },
                  ]}
                />

              </div>

              <div className="flex items-center justify-between">

                <span className="text-[10px] text-slate-400">
                  {filteredRecords.length} matching records
                </span>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="text-xs font-bold text-[#172B6B]"
                  >
                    Clear all filters
                  </button>
                )}

              </div>

            </div>

          </div>
        )}

      </section>

      {/* =====================================================
          KANBAN
      ===================================================== */}

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {recordView ===
                "ALL"
                ? "All Records"
                : recordView ===
                  "LEADS"
                  ? "Leads"
                  : recordView ===
                    "CUSTOMERS"
                    ? "Customers"
                    : "Account Parties"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {
                filteredRecords.length
              }{" "}
              matching records
            </p>
          </div>

          {saving && (
            <span className="text-[10px] font-semibold text-slate-400">
              Saving...
            </span>
          )}

        </div>

        <div className="overflow-x-auto bg-slate-50 p-4">

          <div className="flex min-w-max items-start gap-4">

            {STAGES.map(
              stage => {
                const columnRecords =
                  filteredRecords.filter(
                    record =>
                      getStage(
                        record
                      ) ===
                      stage.id
                  );

                return (
                  <KanbanColumn
                    key={
                      stage.id
                    }
                    stage={
                      stage
                    }
                    records={
                      columnRecords
                    }
                    draggingId={
                      draggingRecord?._id
                    }
                    dragOver={
                      dragOverStage ===
                      stage.id
                    }
                    onDragOver={() =>
                      setDragOverStage(
                        stage.id
                      )
                    }
                    onDrop={() =>
                      handleDrop(
                        stage.id
                      )
                    }
                    onDragStart={
                      handleDragStart
                    }
                    onDragEnd={
                      handleDragEnd
                    }
                    onOpen={
                      openProfile
                    }
                    onEdit={
                      openEdit
                    }
                    onAddConversation={
                      openConversation
                    }
                  />
                );
              }
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          PROFILE
      ===================================================== */}

      {selectedRecord && (
        <ProfileDrawer
          record={
            selectedRecord
          }
          initialShowAddConversation={
            openConversationFor ===
            selectedRecord._id
          }
          onClose={() => {
            setSelectedRecord(
              null
            );

            setOpenConversationFor(
              null
            );
          }}
          onEdit={() => {
            const record =
              selectedRecord;

            setSelectedRecord(
              null
            );

            setOpenConversationFor(
              null
            );

            openEdit(record);
          }}
          onAddConversation={
            handleAddConversation
          }
          onUpdateConversation={
            handleUpdateConversation
          }
          onDeleteConversation={
            handleDeleteConversation
          }
        />
      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {showEdit &&
        editingRecord && (
          <EditModal
            record={
              editingRecord
            }
            form={form}
            setForm={
              setForm
            }
            salespeople={
              salespeople
            }
            dropdownOpen={
              showSalespersonDropdown
            }
            setDropdownOpen={
              setShowSalespersonDropdown
            }
            saving={
              saving
            }
            onClose={() => {
              if (saving) {
                return;
              }

              setShowEdit(
                false
              );

              setEditingRecord(
                null
              );

              setForm(
                EMPTY_FORM
              );
            }}
            onSave={
              saveEdit
            }
          />
        )}

    </div>
  );
};

/* =========================================================
   RECORD TAB
========================================================= */

const RecordTab = ({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-bold ${active
      ? "bg-white text-[#172B6B] shadow-sm"
      : "text-slate-500 hover:bg-white/70"
      }`}
  >
    {label}

    <span className="ml-1.5 text-[10px] opacity-60">
      {count}
    </span>
  </button>
);

/* =========================================================
   SALESPERSON TAB
========================================================= */

const SalespersonTab = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold ${active
      ? "bg-[#172B6B] text-white"
      : "bg-white text-slate-500 hover:bg-slate-50"
      }`}
  >
    {label}
  </button>
);

/* =========================================================
   KANBAN COLUMN
========================================================= */

const KanbanColumn = ({
  stage,
  records,
  draggingId,
  dragOver,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onOpen,
  onEdit,
  onAddConversation,
}: {
  stage: Stage;
  records: PipelineRecord[];
  draggingId?: string;
  dragOver: boolean;
  onDragOver: () => void;
  onDrop: () => void;
  onDragStart: (
    record: PipelineRecord
  ) => void;
  onDragEnd: () => void;
  onOpen: (
    record: PipelineRecord
  ) => void;
  onEdit: (
    record: PipelineRecord
  ) => void;
  onAddConversation: (
    record: PipelineRecord
  ) => void;
}) => (
  <div
    className={`flex w-[285px] min-w-[285px] shrink-0 flex-col overflow-hidden rounded-2xl border ${dragOver
      ? "border-[#172B6B] ring-2 ring-[#172B6B]/10"
      : "border-slate-200"
      }`}
    onDragOver={e => {
      e.preventDefault();
      onDragOver();
    }}
    onDrop={e => {
      e.preventDefault();
      onDrop();
    }}
  >

    <div className="flex min-h-[58px] items-center justify-between border-b border-slate-200 bg-white px-3.5 py-3">

      <div className="flex items-center gap-2">

        <span className="h-2 w-2 rounded-full bg-[#172B6B]" />

        <span className="text-xs font-bold text-slate-700">
          {stage.label}
        </span>

      </div>

      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
        {records.length}
      </span>

    </div>

    <div
      className={`min-h-[220px] space-y-3 bg-slate-100 p-2.5 ${dragOver
        ? "bg-[#172B6B]/5"
        : ""
        }`}
    >

      {records.map(
        record => (
          <PipelineCard
            key={`${record.source || "CRM"}-${record._id}`}
            record={
              record
            }
            dragging={
              draggingId ===
              record._id
            }
            onOpen={() =>
              onOpen(
                record
              )
            }
            onEdit={() =>
              onEdit(
                record
              )
            }
            onAddConversation={() =>
              onAddConversation(
                record
              )
            }
            onDragStart={() =>
              onDragStart(
                record
              )
            }
            onDragEnd={
              onDragEnd
            }
          />
        )
      )}

      {!records.length && (
        <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70">

          <span className="text-xs text-slate-400">
            {dragOver
              ? "Drop here"
              : "No records"}
          </span>

        </div>
      )}

    </div>

  </div>
);

/* =========================================================
   PIPELINE CARD
========================================================= */

const PipelineCard = ({
  record,
  dragging,
  onOpen,
  onEdit,
  onAddConversation,
  onDragStart,
  onDragEnd,
}: {
  record: PipelineRecord;
  dragging: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onAddConversation: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) => {
  const type =
    getType(record);

  const names =
    getSalespersonNames(
      record
    );

  const overdue =
    isOverdue(
      record.nextFollowUpDate
    );

  const today =
    isToday(
      record.nextFollowUpDate
    );

  const conversationCount =
    getConversationNotes(
      record
    ).length;

  return (
    <article
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed =
          "move";

        onDragStart();
      }}
      onDragEnd={
        onDragEnd
      }
      className={`rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm ${dragging
        ? "cursor-grabbing opacity-40"
        : "cursor-grab"
        }`}
    >

      <button
        type="button"
        onClick={
          onOpen
        }
        className="block w-full text-left"
      >

        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0 flex-1">

            <h3 className="break-words text-sm font-bold leading-5 text-slate-900">
              {record.companyName ||
                record.firmName ||
                "Unnamed Company"}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {record.contactPerson ||
                "No contact"}
            </p>

          </div>

          <span
            className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-bold uppercase ${type ===
              "LEAD"
              ? "bg-blue-50 text-blue-700"
              : type ===
                "PARTY"
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-100 text-slate-600"
              }`}
          >
            {type}
          </span>

        </div>

        <div className="mt-3">

          {names.length ? (
            <div className="flex flex-wrap gap-1.5">

              {names.map(
                name => (
                  <span
                    key={
                      name
                    }
                    className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-600"
                  >
                    <FiUser
                      size={10}
                    />

                    <span className="truncate">
                      {name}
                    </span>
                  </span>
                )
              )}

            </div>
          ) : (
            <span className="text-[10px] text-slate-400">
              Unassigned
            </span>
          )}

        </div>

        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">

          <div className="flex gap-2">

            <FiClock
              size={12}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <div>

              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Last Contact
              </p>

              <p className="mt-0.5 text-[10px] font-semibold text-slate-600">
                {record.lastContactDate
                  ? formatDate(
                    record.lastContactDate
                  )
                  : "Not contacted"}
              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <FiCalendar
              size={12}
              className={`mt-0.5 shrink-0 ${overdue
                ? "text-red-500"
                : today
                  ? "text-amber-500"
                  : "text-slate-400"
                }`}
            />

            <div className="min-w-0">

              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Next Follow-up
              </p>

              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">

                <span
                  className={`text-[10px] ${overdue
                    ? "font-bold text-red-600"
                    : today
                      ? "font-bold text-amber-600"
                      : "font-semibold text-slate-600"
                    }`}
                >
                  {record.nextFollowUpDate
                    ? formatDate(
                      record.nextFollowUpDate
                    )
                    : "Not set"}
                </span>

                {overdue && (
                  <span className="rounded bg-red-50 px-1.5 py-0.5 text-[8px] font-bold text-red-600">
                    OVERDUE
                  </span>
                )}

                {today &&
                  !overdue && (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold text-amber-600">
                      TODAY
                    </span>
                  )}

              </div>

            </div>

          </div>

        </div>

        {record.nextAction && (
          <div className="mt-3 rounded-lg bg-slate-50 px-2.5 py-2">

            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Next Action
            </p>

            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-600">
              {record.nextAction}
            </p>

          </div>
        )}

        {conversationCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">

            <FiMessageSquare
              size={11}
            />

            {conversationCount} conversation
            {conversationCount !==
              1
              ? "s"
              : ""}

          </div>
        )}

      </button>

      {/* CARD ACTIONS */}

      <div className="mt-2 flex items-center justify-end gap-1">

        {/* ADD CONVERSATION */}

        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            onAddConversation();
          }}
          className="
            inline-flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            border
            border-[#172B6B]/15
            bg-[#172B6B]/5
            text-[#172B6B]
            transition
            hover:bg-[#172B6B]
            hover:text-white
          "
          title="Add Conversation"
          aria-label="Add Conversation"
        >
          <FiPlus
            size={13}
            strokeWidth={2.5}
          />
        </button>

        {/* MANAGE */}

        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            onEdit();
          }}
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            px-2.5
            py-1.5
            text-[10px]
            font-semibold
            text-slate-400
            hover:bg-slate-50
            hover:text-[#172B6B]
          "
        >
          <FiEdit3
            size={11}
          />

          Manage
        </button>

      </div>

    </article>
  );
};

/* =========================================================
   PROFILE DRAWER
========================================================= */

const ProfileDrawer = ({
  record,
  initialShowAddConversation = false,
  onClose,
  onEdit,
  onAddConversation,
  onUpdateConversation,
  onDeleteConversation,
}: {
  record: PipelineRecord;
  initialShowAddConversation?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddConversation: (
    record: PipelineRecord,
    conversation: ConversationForm
  ) => Promise<boolean>;
  onUpdateConversation: (
    record: PipelineRecord,
    noteId: string,
    data: Partial<ConversationNote>
  ) => Promise<boolean>;
  onDeleteConversation: (
    record: PipelineRecord,
    noteId: string
  ) => Promise<boolean>;
}) => {
  const type =
    getType(record);

  const stage =
    getStage(record);

  const names =
    getSalespersonNames(
      record
    );

  const notes =
    getConversationNotes(
      record
    );

  const [
    showAddConversation,
    setShowAddConversation,
  ] = useState(
    initialShowAddConversation
  );

  const [
    editingNoteId,
    setEditingNoteId,
  ] = useState<string | null>(
    null
  );

  const [
    conversationForm,
    setConversationForm,
  ] = useState<ConversationForm>(
    EMPTY_CONVERSATION
  );

  const [
    conversationSaving,
    setConversationSaving,
  ] = useState(false);

  const [
    editText,
    setEditText,
  ] = useState("");

  const [
    deleteSaving,
    setDeleteSaving,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    setShowAddConversation(
      initialShowAddConversation
    );
  }, [
    initialShowAddConversation,
    record?._id,
  ]);

  const resetConversationForm =
    () => {
      setConversationForm(
        EMPTY_CONVERSATION
      );

      setShowAddConversation(
        false
      );
    };

  const saveConversation =
    async () => {
      if (
        !conversationForm.note.trim()
      ) {
        return;
      }

      try {
        setConversationSaving(
          true
        );

        const success =
          await onAddConversation(
            record,
            conversationForm
          );

        if (success) {
          resetConversationForm();
        }
      } finally {
        setConversationSaving(
          false
        );
      }
    };

  const startEditNote = (
    note: ConversationNote
  ) => {
    if (!note._id) {
      return;
    }

    setEditingNoteId(
      note._id
    );

    setEditText(
      note.note || ""
    );
  };

  const saveEditedNote =
    async () => {
      if (
        !editingNoteId ||
        !editText.trim()
      ) {
        return;
      }

      const success =
        await onUpdateConversation(
          record,
          editingNoteId,
          {
            note:
              editText.trim(),
          }
        );

      if (success) {
        setEditingNoteId(
          null
        );

        setEditText("");
      }
    };

  const removeNote = async (
    noteId: string
  ) => {
    const confirmed =
      window.confirm(
        "Delete this conversation?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteSaving(
        noteId
      );

      await onDeleteConversation(
        record,
        noteId
      );
    } finally {
      setDeleteSaving(
        null
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm">

      <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-5">

          <div className="flex items-start gap-3">

            <button
              type="button"
              onClick={
                onClose
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
            >
              <FiArrowLeft
                size={17}
              />
            </button>

            <div>

              <div className="flex items-center gap-2">

                <span className="rounded-md bg-[#172B6B]/10 px-2 py-1 text-[9px] font-bold uppercase text-[#172B6B]">
                  {type}
                </span>

                <span className="text-xs text-slate-400">
                  {getStageLabel(
                    stage
                  )}
                </span>

              </div>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {record.companyName ||
                  record.firmName ||
                  "Unnamed Company"}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {record.contactPerson ||
                  "No contact"}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <FiX />
          </button>

        </div>

        {/* ACTION */}

        <div className="flex gap-2 border-b border-slate-100 px-5 py-3">

          <button
            type="button"
            onClick={
              onEdit
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#172B6B] px-4 text-xs font-bold text-white"
          >
            <FiEdit3 size={13} />

            Manage
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAddConversation(
                true
              );

              setEditingNoteId(
                null
              );
            }}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#172B6B]/20 bg-[#172B6B]/5 px-4 text-xs font-bold text-[#172B6B]"
          >
            <FiPlus size={13} />

            Add Conversation
          </button>

        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto p-5">

          <div className="space-y-5">

            {/* SALES INFORMATION */}

            <ProfileSection
              title="Sales Information"
              icon={
                <FiTarget
                  size={14}
                />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">

                <InfoBox
                  label="Stage"
                  value={getStageLabel(stage)}
                />

                <InfoBox
                  label="Salesperson"
                  value={
                    names.length
                      ? names.join(", ")
                      : "Unassigned"
                  }
                />

                <InfoBox
                  label="Last Contact"
                  value={formatDate(
                    record.lastContactDate
                  )}
                />

                <InfoBox
                  label="Next Follow-up"
                  value={formatDate(
                    record.nextFollowUpDate
                  )}
                />

                <InfoBox
                  label="Next Action"
                  value={record.nextAction}
                />

                <InfoBox
                  label="Pipeline"
                  value={
                    record.crmPipeline ||
                    "Sales Pipeline"
                  }
                />

              </div>
            </ProfileSection>

            {/* CUSTOMER PROFILE */}

            <ProfileSection
              title="Customer Profile"
              icon={
                <FiUser
                  size={14}
                />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">

                <InfoBox
                  label="Company"
                  value={
                    record.companyName ||
                    record.firmName
                  }
                />

                <InfoBox
                  label="Contact Person"
                  value={
                    record.contactPerson
                  }
                />

                <InfoBox
                  label="Phone"
                  value={
                    record.phone
                  }
                />

                <InfoBox
                  label="Email"
                  value={
                    record.email
                  }
                />

                <InfoBox
                  label="Customer Code"
                  value={
                    record.customerCode ||
                    record.partyCode
                  }
                />

                <InfoBox
                  label="Type"
                  value={
                    type
                  }
                />

                <InfoBox
                  label="Address"
                  value={
                    record.address ||
                    record.customerDetails?.address ||
                    record.billingAddress
                  }
                />

                <InfoBox
                  label="City"
                  value={
                    record.city ||
                    record.customerDetails?.city
                  }
                />

              </div>

              {(record.remarks ||
                record.customerDetails?.remarks) && (
                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">

                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Ratelist / Commercial Notes
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                      {record.remarks ||
                        record.customerDetails?.remarks}
                    </p>

                  </div>
                )}

            </ProfileSection>

            {/* ADD CONVERSATION */}

            {showAddConversation && (

              <section className="rounded-2xl border border-[#172B6B]/15 bg-[#172B6B]/[0.025] p-4">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-sm font-bold text-slate-800">
                      New Conversation
                    </h3>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      This interaction will be saved to the permanent history.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      resetConversationForm
                    }
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white"
                  >
                    <FiX
                      size={15}
                    />
                  </button>

                </div>

                <div className="mt-4 space-y-4">

                  <div>

                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                      Conversation
                    </label>

                    <textarea
                      autoFocus
                      value={
                        conversationForm.note
                      }
                      onChange={e =>
                        setConversationForm(
                          (previous: ConversationForm) => ({
                            ...previous,
                            note:
                              e.target.value,
                          })
                        )
                      }
                      rows={5}
                      placeholder="What did the customer say? Record the discussion, requirement, objection, quotation response, etc."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 outline-none focus:border-[#172B6B]"
                    />

                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">

                    <FilterSelect
                      label="Interaction Type"
                      value={
                        conversationForm.type
                      }
                      onChange={value =>
                        setConversationForm(
                          (previous: ConversationForm) => ({
                            ...previous,
                            type:
                              value as ConversationForm["type"],
                          })
                        )
                      }
                      options={[
                        {
                          value:
                            "GENERAL",
                          label:
                            "General",
                        },
                        {
                          value:
                            "PAYMENT",
                          label:
                            "Payment",
                        },
                        {
                          value:
                            "MEETING",
                          label:
                            "Meeting",
                        },
                        {
                          value:
                            "FOLLOW_UP",
                          label:
                            "Follow-up",
                        },
                        {
                          value:
                            "COMPLAINT",
                          label:
                            "Complaint",
                        },
                        {
                          value:
                            "PRODUCT",
                          label:
                            "Product",
                        },
                      ]}
                    />

                    <FilterSelect
                      label="Priority"
                      value={
                        conversationForm.priority
                      }
                      onChange={value =>
                        setConversationForm(
                          (previous: ConversationForm) => ({
                            ...previous,
                            priority:
                              value as ConversationForm["priority"],
                          })
                        )
                      }
                      options={[
                        {
                          value:
                            "LOW",
                          label:
                            "Low",
                        },
                        {
                          value:
                            "MEDIUM",
                          label:
                            "Medium",
                        },
                        {
                          value:
                            "HIGH",
                          label:
                            "High",
                        },
                      ]}
                    />

                  </div>

                  {type !==
                    "PARTY" && (
                      <div className="grid gap-3 sm:grid-cols-2">

                        <DateField
                          label="Next Follow-up"
                          value={
                            conversationForm.nextFollowUpDate
                          }
                          onChange={value =>
                            setConversationForm(
                              (previous: ConversationForm) => ({
                                ...previous,
                                nextFollowUpDate:
                                  value,
                              })
                            )
                          }
                        />

                        <div>

                          <label className="mb-2 block text-xs font-semibold text-slate-700">
                            Next Action
                          </label>

                          <input
                            value={
                              conversationForm.nextAction
                            }
                            onChange={e =>
                              setConversationForm(
                                (previous: ConversationForm) => ({
                                  ...previous,
                                  nextAction:
                                    e.target.value,
                                })
                              )
                            }
                            placeholder="Call, send catalogue, quotation..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-[#172B6B]"
                          />

                        </div>

                      </div>
                    )}

                  <div className="flex justify-end gap-2">

                    <button
                      type="button"
                      onClick={
                        resetConversationForm
                      }
                      disabled={
                        conversationSaving
                      }
                      className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        saveConversation
                      }
                      disabled={
                        conversationSaving ||
                        !conversationForm.note.trim()
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#172B6B] px-5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      <FiCheck
                        size={13}
                      />

                      {conversationSaving
                        ? "Saving..."
                        : "Save Conversation"}
                    </button>

                  </div>

                </div>

              </section>
            )}

            {/* CONVERSATION HISTORY */}

            <ProfileSection
              title={`Conversation History${notes.length
                ? ` (${notes.length})`
                : ""
                }`}
              icon={
                <FiMessageSquare
                  size={14}
                />
              }
            >

              {notes.length ? (
                <div className="space-y-3">

                  {notes.map(
                    (
                      note,
                      index
                    ) => {
                      const author =
                        typeof note.addedBy ===
                          "object"
                          ? note.addedBy
                            ?.name
                          : undefined;

                      const isEditing =
                        editingNoteId ===
                        note._id;

                      return (
                        <div
                          key={
                            note._id ||
                            index
                          }
                          className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">

                                  <FiUser
                                    size={11}
                                    className="text-slate-400"
                                  />

                                  {author ||
                                    "Salesperson"}

                                </span>

                                {note.type && (
                                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-slate-500">
                                    {
                                      note.type
                                    }
                                  </span>
                                )}

                                {note.priority &&
                                  note.priority !==
                                  "MEDIUM" && (
                                    <span
                                      className={`rounded-md px-2 py-1 text-[8px] font-bold uppercase ${note.priority ===
                                        "HIGH"
                                        ? "bg-red-50 text-red-600"
                                        : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                      {
                                        note.priority
                                      }
                                    </span>
                                  )}

                              </div>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {formatDateTime(
                                  note.createdAt
                                )}
                              </p>

                            </div>

                            <div className="flex shrink-0 items-center gap-1">

                              <button
                                type="button"
                                onClick={() =>
                                  startEditNote(
                                    note
                                  )
                                }
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-[#172B6B]"
                                title="Edit conversation"
                              >
                                <FiEdit3
                                  size={12}
                                />
                              </button>

                              {note._id && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeNote(
                                      note._id!
                                    )
                                  }
                                  disabled={
                                    deleteSaving ===
                                    note._id
                                  }
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                  title="Delete conversation"
                                >
                                  <FiTrash2
                                    size={12}
                                  />
                                </button>
                              )}

                            </div>

                          </div>

                          {isEditing ? (
                            <div className="mt-3">

                              <textarea
                                value={
                                  editText
                                }
                                onChange={e =>
                                  setEditText(
                                    e.target.value
                                  )
                                }
                                rows={4}
                                className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none focus:border-[#172B6B]"
                              />

                              <div className="mt-2 flex justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNoteId(
                                      null
                                    );

                                    setEditText(
                                      ""
                                    );
                                  }}
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    saveEditedNote
                                  }
                                  disabled={
                                    !editText.trim()
                                  }
                                  className="rounded-lg bg-[#172B6B] px-3 py-2 text-[10px] font-bold text-white disabled:opacity-50"
                                >
                                  Save
                                </button>

                              </div>

                            </div>
                          ) : (
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                              {note.note ||
                                ""}
                            </p>
                          )}

                          {note.reminderDate && (
                            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">

                              <FiCalendar
                                size={11}
                              />

                              Follow-up:
                              {" "}
                              {formatDate(
                                note.reminderDate
                              )}

                            </div>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>
              ) : (
                <EmptyState text="No conversation history recorded yet." />
              )}

            </ProfileSection>

            {/* NEGOTIATION SUMMARY */}

            {record.negotiationNotes && (
              <ProfileSection
                title="Current Negotiation Summary"
                icon={
                  <FiMessageSquare
                    size={14}
                  />
                }
              >
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {
                      record.negotiationNotes
                    }
                  </p>

                </div>
              </ProfileSection>
            )}

            {/* STAGE HISTORY */}

            <ProfileSection
              title="Stage History"
              icon={
                <FiClock
                  size={14}
                />
              }
            >

              {Array.isArray(
                record.stageHistory
              ) &&
                record.stageHistory.length ? (
                <div className="space-y-2">

                  {[
                    ...record.stageHistory,
                  ]
                    .reverse()
                    .map(
                      (
                        item: any,
                        index: number
                      ) => (
                        <div
                          key={
                            item._id ||
                            index
                          }
                          className="rounded-xl bg-slate-50 p-3.5"
                        >

                          <div className="flex justify-between gap-3">

                            <div>

                              <p className="text-xs font-bold text-slate-700">
                                {getStageLabel(
                                  item.stage
                                )}
                              </p>

                              {item.note && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    item.note
                                  }
                                </p>
                              )}

                              {item.changedBy?.name && (
                                <p className="mt-1 text-[10px] text-slate-400">
                                  {
                                    item.changedBy.name
                                  }
                                </p>
                              )}

                            </div>

                            <span className="text-[10px] text-slate-400">
                              {formatDateTime(
                                item.changedAt
                              )}
                            </span>

                          </div>

                        </div>
                      )
                    )}

                </div>
              ) : (
                <EmptyState text="No stage history available." />
              )}

            </ProfileSection>

          </div>

        </div>

      </div>

    </div>
  );
};

/* =========================================================
   EDIT MODAL
========================================================= */

const EditModal = ({
  record,
  form,
  setForm,
  salespeople,
  dropdownOpen,
  setDropdownOpen,
  saving,
  onClose,
  onSave,
}: {
  record: PipelineRecord;
  form: PipelineForm;
  setForm: Dispatch<
    SetStateAction<PipelineForm>
  >;
  salespeople: CRMUser[];
  dropdownOpen: boolean;
  setDropdownOpen: (
    value: boolean
  ) => void;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) => {
  const names =
    form.assignedSalespeople
      .map(
        id =>
          salespeople.find(
            person =>
              person._id === id
          )?.name
      )
      .filter(Boolean);

  const update = (
    field: keyof PipelineForm,
    value: string
  ) => {
    setForm(
      (previous: PipelineForm) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  const toggleSalesperson =
    (id: string) => {
      setForm(
        (previous: PipelineForm) => {
          const exists =
            previous.assignedSalespeople.includes(
              id
            );

          return {
            ...previous,
            assignedSalespeople:
              exists
                ? previous.assignedSalespeople.filter(
                  item =>
                    item !==
                    id
                )
                : [
                  ...previous.assignedSalespeople,
                  id,
                ],
          };
        }
      );
    };

  const isParty =
    getType(record) ===
    "PARTY";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">

        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 p-5">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-wide text-[#172B6B]">
              Manage CRM Record
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-900">
              {record.companyName ||
                record.firmName ||
                "Unnamed Company"}
            </h3>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <FiX />
          </button>

        </div>

        <div className="overflow-y-auto p-5">

          <div className="space-y-5">

            {/* STAGE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Stage
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

                {STAGES.map(
                  stage => (
                    <button
                      key={
                        stage.id
                      }
                      type="button"
                      onClick={() =>
                        update(
                          "stage",
                          stage.id
                        )
                      }
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${form.stage ===
                        stage.id
                        ? "border-[#172B6B] bg-[#172B6B]/5 text-[#172B6B]"
                        : "border-slate-200 text-slate-500"
                        }`}
                    >
                      {
                        stage.label
                      }
                    </button>
                  )
                )}

              </div>

            </div>

            {/* SALESPERSON */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Assigned Salesperson(s)
              </label>

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setDropdownOpen(
                      !dropdownOpen
                    )
                  }
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-3 text-left"
                >

                  <div className="flex flex-wrap gap-1.5">

                    {names.length ? (
                      names.map(
                        name => (
                          <span
                            key={
                              name
                            }
                            className="rounded-lg bg-[#172B6B]/10 px-2.5 py-1 text-xs font-semibold text-[#172B6B]"
                          >
                            {name}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-slate-400">
                        Select salesperson
                      </span>
                    )}

                  </div>

                  <FiChevronDown
                    size={15}
                    className={`text-slate-400 ${dropdownOpen
                      ? "rotate-180"
                      : ""
                      }`}
                  />

                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">

                    {salespeople.map(
                      person => {
                        const selected =
                          form.assignedSalespeople.includes(
                            person._id
                          );

                        return (
                          <button
                            key={
                              person._id
                            }
                            type="button"
                            onClick={() =>
                              toggleSalesperson(
                                person._id
                              )
                            }
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"
                          >

                            <span className="text-sm font-semibold text-slate-700">
                              {
                                person.name
                              }
                            </span>

                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border ${selected
                                ? "border-[#172B6B] bg-[#172B6B] text-white"
                                : "border-slate-300"
                                }`}
                            >
                              {selected && (
                                <FiCheck
                                  size={12}
                                />
                              )}
                            </span>

                          </button>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

            </div>

            {/* DATES */}

            {!isParty && (
              <div className="grid gap-4 sm:grid-cols-2">

                <DateField
                  label="Last Contact"
                  value={
                    form.lastContactDate
                  }
                  onChange={value =>
                    update(
                      "lastContactDate",
                      value
                    )
                  }
                />

                <DateField
                  label="Next Follow-up"
                  value={
                    form.nextFollowUpDate
                  }
                  onChange={value =>
                    update(
                      "nextFollowUpDate",
                      value
                    )
                  }
                />

              </div>
            )}

            {/* NEXT ACTION */}

            {!isParty && (
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Next Action
                </label>

                <input
                  value={
                    form.nextAction
                  }
                  onChange={e =>
                    update(
                      "nextAction",
                      e.target.value
                    )
                  }
                  placeholder="Call, send catalogue, quotation..."
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#172B6B]"
                />

              </div>
            )}

            {/* NEGOTIATION SUMMARY */}

            {!isParty && (
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Negotiation Summary
                </label>

                <textarea
                  value={
                    form.negotiationNotes
                  }
                  onChange={e =>
                    update(
                      "negotiationNotes",
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Keep the current negotiation status/summary here..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-[#172B6B]"
                />

              </div>
            )}

            {/* STAGE NOTE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Stage Change Note
              </label>

              <textarea
                value={
                  form.stageNote
                }
                onChange={e =>
                  update(
                    "stageNote",
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Why is this record moving to this stage?"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#172B6B]"
              />

            </div>

            {isParty && (
              <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                Conversation history for Account Parties is managed from the profile drawer using <strong>Add Conversation</strong>.
              </div>
            )}

          </div>

        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-slate-50 p-4">

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onSave
            }
            disabled={
              saving
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#172B6B] px-5 text-xs font-bold text-white disabled:opacity-50"
          >
            <FiCheck
              size={13}
            />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>

    </div>
  );
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: {
    value: string;
    label: string;
  }[];
}) => (
  <div>

    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </label>

    <div className="relative">

      <select
        value={value}
        onChange={e =>
          onChange(
            e.target.value
          )
        }
        className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#172B6B]"
      >
        {options.map(
          option => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          )
        )}
      </select>

      <FiChevronDown
        size={13}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

    </div>

  </div>
);

const DateField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) => (
  <div>

    <label className="mb-2 block text-sm font-semibold text-slate-800">
      {label}
    </label>

    <div className="relative">

      <FiCalendar
        size={14}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="date"
        value={value}
        onChange={e =>
          onChange(
            e.target.value
          )
        }
        className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[#172B6B]"
      />

    </div>

  </div>
);

const ProfileSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) => (
  <section>

    <div className="mb-3 flex items-center gap-2">

      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#172B6B]/10 text-[#172B6B]">
        {icon}
      </div>

      <h3 className="text-xs font-bold text-slate-800">
        {title}
      </h3>

    </div>

    {children}

  </section>
);

const InfoBox = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">

    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 break-words text-xs font-semibold text-slate-700">
      {value || "Not available"}
    </p>

  </div>
);

const EmptyState = ({
  text,
}: {
  text: string;
}) => (
  <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">

    <p className="text-xs text-slate-400">
      {text}
    </p>

  </div>
);

export default SalesPipeline;