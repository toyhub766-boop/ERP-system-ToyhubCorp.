import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiLogIn,
  FiLogOut,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  registerLabourAttendanceEvent,
} from "../services/attendance.service";

interface Labour {
  _id: string;
  name: string;
  department?: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE";
  attendanceShift?: {
    _id?: string;
    name?: string;
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
  } | null;
}

interface AttendanceEvent {
  _id?: string;
  type:
    | "CHECK_IN"
    | "BREAK_OUT"
    | "BREAK_IN"
    | "CHECK_OUT";
  at: string;
  photo?: string;
}

interface AttendanceRecord {
  _id: string;
  attendanceType?: "EMPLOYEE" | "LABOUR";
  labour?: {
    _id?: string;
    name?: string;
  };
  date?: string;
  events?: AttendanceEvent[];
  status?: string;
  dayStatus?: string;
}

interface Props {
  labours: Labour[];
  attendance: AttendanceRecord[];
  onSuccess?: () => Promise<void> | void;
}

type PunchAction =
  | "CHECK_IN"
  | "BREAK_OUT"
  | "BREAK_IN"
  | "CHECK_OUT";

const getTodayRecord = (
  attendance: AttendanceRecord[],
  labourId: string
) => {
  const today = new Date();

  return attendance.find((record) => {
    if (record.attendanceType !== "LABOUR") {
      return false;
    }

    if (
      String(record.labour?._id) !==
      String(labourId)
    ) {
      return false;
    }

    if (!record.date) {
      return false;
    }

    const recordDate = new Date(record.date);

    return (
      recordDate.getFullYear() ===
        today.getFullYear() &&
      recordDate.getMonth() ===
        today.getMonth() &&
      recordDate.getDate() ===
        today.getDate()
    );
  });
};

const getNextAction = (
  record?: AttendanceRecord
): PunchAction | null => {
  const events = record?.events || [];

  if (events.length === 0) {
    return "CHECK_IN";
  }

  const lastEvent =
    events[events.length - 1]?.type;

  switch (lastEvent) {
    case "CHECK_IN":
      return "BREAK_OUT";

    case "BREAK_OUT":
      return "BREAK_IN";

    case "BREAK_IN":
      // After coming back from a break,
      // the worker may either start another
      // break or finish the day.
      return "CHECK_OUT";

    case "CHECK_OUT":
      return null;

    default:
      return "CHECK_IN";
  }
};

const getActionLabel = (
  action: PunchAction | null
) => {
  switch (action) {
    case "CHECK_IN":
      return "Check In";

    case "BREAK_OUT":
      return "Break Out";

    case "BREAK_IN":
      return "Break In";

    case "CHECK_OUT":
      return "Check Out";

    default:
      return "Completed";
  }
};

const formatTime = (
  value?: string
) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
};

const LabourProxyPunch = ({
  labours,
  attendance,
  onSuccess,
}: Props) => {
  const [
    selectedLabourId,
    setSelectedLabourId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    cameraOpen,
    setCameraOpen,
  ] = useState(false);

  const [
    cameraError,
    setCameraError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    pendingAction,
    setPendingAction,
  ] = useState<PunchAction | null>(
    null
  );

  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  const streamRef =
    useRef<MediaStream | null>(null);

  const selectedLabour =
    useMemo(() => {
      return labours.find(
        (labour) =>
          String(labour._id) ===
          String(selectedLabourId)
      );
    }, [
      labours,
      selectedLabourId,
    ]);

  const todayRecord = useMemo(() => {
    if (!selectedLabourId) {
      return undefined;
    }

    return getTodayRecord(
      attendance,
      selectedLabourId
    );
  }, [
    attendance,
    selectedLabourId,
  ]);

  const nextAction = useMemo(() => {
    return getNextAction(
      todayRecord
    );
  }, [todayRecord]);

  const events =
    todayRecord?.events || [];

  const lastEvent =
    events.length > 0
      ? events[events.length - 1]
      : undefined;

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setCameraOpen(false);
  };

  const startCamera = async (
    action: PunchAction
  ) => {
    setCameraError("");
    setError("");
    setMessage("");
    setPendingAction(action);

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          "Camera access is not supported on this device."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: "user",
            },
            audio: false,
          }
        );

      streamRef.current = stream;

      setCameraOpen(true);

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;

          videoRef.current
            .play()
            .catch(() => {});
        }
      });
    } catch (cameraErr) {
      console.error(
        "LABOUR CAMERA ERROR:",
        cameraErr
      );

      setPendingAction(null);

      setCameraError(
        "Camera permission is required to continue."
      );
    }
  };

  const capturePhoto =
    async (): Promise<File | null> => {
      const video =
        videoRef.current;

      if (!video) {
        return null;
      }

      if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        setCameraError(
          "Camera is not ready yet. Please try again."
        );

        return null;
      }

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      const context =
        canvas.getContext("2d");

      if (!context) {
        setCameraError(
          "Unable to capture camera image."
        );

        return null;
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      return new Promise(
        (resolve) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(null);
                return;
              }

              const file =
                new File(
                  [blob],
                  `labour-${selectedLabourId}-${Date.now()}.jpg`,
                  {
                    type: "image/jpeg",
                  }
                );

              resolve(file);
            },
            "image/jpeg",
            0.85
          );
        }
      );
    };

  const submitAction = async (
    action: PunchAction,
    photo?: File
  ) => {
    if (!selectedLabourId) {
      setError(
        "Select a labour worker first."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await registerLabourAttendanceEvent(
        selectedLabourId,
        action,
        photo
      );

      setMessage(
        `${selectedLabour?.name || "Labour"} — ${getActionLabel(
          action
        )} recorded successfully.`
      );

      stopCamera();
      setPendingAction(null);

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err: any) {
      console.error(
        "LABOUR PROXY PUNCH ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to register labour attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    action: PunchAction
  ) => {
    if (!selectedLabourId) {
      setError(
        "Select a labour worker first."
      );

      return;
    }

    setError("");
    setMessage("");

    const requiresPhoto =
      action === "CHECK_IN" ||
      action === "CHECK_OUT";

    if (requiresPhoto) {
      await startCamera(action);
      return;
    }

    await submitAction(action);
  };

  const handleCameraConfirm =
    async () => {
      if (!pendingAction) {
        return;
      }

      const photo =
        await capturePhoto();

      if (!photo) {
        return;
      }

      await submitAction(
        pendingAction,
        photo
      );
    };

  const getActionIcon = (
    action: PunchAction | null
  ) => {
    switch (action) {
      case "CHECK_IN":
        return <FiLogIn size={17} />;

      case "BREAK_OUT":
        return <FiPause size={17} />;

      case "BREAK_IN":
        return <FiPlay size={17} />;

      case "CHECK_OUT":
        return <FiLogOut size={17} />;

      default:
        return (
          <FiCheckCircle size={17} />
        );
    }
  };

  return (
    <section className="mb-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#172B6B]">
              <FiUsers size={18} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Labour Proxy Punch
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Record attendance on behalf of labour workers.
              </p>
            </div>

          </div>

          <span className="text-xs text-slate-400">
            Selfie required for check-in / check-out
          </span>
        </div>

        {/* Main compact controls */}
        <div className="p-5 sm:p-6">

          <div className="grid gap-4 xl:grid-cols-[minmax(260px,1.2fr)_1fr_auto] xl:items-end">

            {/* Labour */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Labour
              </label>

              <div className="relative">
                <FiUser
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={selectedLabourId}
                  onChange={(event) => {
                    setSelectedLabourId(
                      event.target.value
                    );

                    setError("");
                    setMessage("");
                    setCameraError("");
                    setPendingAction(null);

                    stopCamera();
                  }}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#172B6B] focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">
                    Select labour worker
                  </option>

                  {labours
                    .filter(
                      (labour) =>
                        labour.status !==
                        "INACTIVE"
                    )
                    .map((labour) => (
                      <option
                        key={labour._id}
                        value={labour._id}
                      >
                        {labour.name}
                        {labour.department
                          ? ` — ${labour.department}`
                          : ""}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Shift / status */}
            <div className="grid grid-cols-2 gap-3">

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Shift
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                  {selectedLabour
                    ?.attendanceShift
                    ?.name ||
                    "Not assigned"}
                </p>

                {selectedLabour
                  ?.attendanceShift
                  ?.startTime &&
                  selectedLabour
                    ?.attendanceShift
                    ?.endTime && (
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {
                        selectedLabour
                          .attendanceShift
                          .startTime
                      }{" "}
                      –{" "}
                      {
                        selectedLabour
                          .attendanceShift
                          .endTime
                      }
                    </p>
                  )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Today
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedLabour
                    ? nextAction
                      ? getActionLabel(
                          nextAction
                        )
                      : "Completed"
                    : "Select labour"}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {events.length} event
                  {events.length === 1
                    ? ""
                    : "s"}
                </p>
              </div>

            </div>

            {/* Primary action */}
            <div className="xl:flex xl:justify-end">
              {nextAction ? (
                <button
                  type="button"
                  disabled={
                    !selectedLabourId ||
                    loading ||
                    cameraOpen
                  }
                  onClick={() =>
                    handleAction(
                      nextAction
                    )
                  }
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#172B6B] px-5 text-sm font-semibold text-white transition hover:bg-[#20398F] disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
                >
                  {loading ? (
                    <FiRefreshCw
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    getActionIcon(
                      nextAction
                    )
                  )}

                  {loading
                    ? "Recording..."
                    : getActionLabel(
                        nextAction
                      )}
                </button>
              ) : (
                <div className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 xl:w-auto">
                  <FiCheckCircle
                    size={17}
                  />
                  Completed
                </div>
              )}
            </div>
          </div>

          {/* Additional action after Break In */}
          {selectedLabour &&
            lastEvent?.type ===
              "BREAK_IN" &&
            !cameraOpen && (
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Break finished
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Continue working or start another break.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    handleAction(
                      "BREAK_OUT"
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <FiPause size={16} />
                  Start Another Break
                </button>

              </div>
            )}

          {/* Last event */}
          {selectedLabour &&
            lastEvent && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs">

                <span className="font-medium text-slate-400">
                  Last event
                </span>

                <span className="font-semibold text-slate-700">
                  {lastEvent.type.replace(
                    "_",
                    " "
                  )}
                </span>

                <span className="text-slate-400">
                  {formatTime(
                    lastEvent.at
                  )}
                </span>

                <span className="text-slate-400">
                  {events.length} events today
                </span>

              </div>
            )}

          {/* Messages */}
          {message && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {cameraError && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {cameraError}
            </div>
          )}

        </div>

        {/* Today's Events */}
        {selectedLabour && (
          <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:px-6">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <FiClock
                  size={16}
                  className="text-slate-500"
                />

                <h3 className="text-sm font-semibold text-slate-800">
                  Today's Events
                </h3>
              </div>

              <span className="text-xs font-medium text-slate-400">
                {events.length} total
              </span>

            </div>

            {events.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-5 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No punches yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Start with Check In.
                </p>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">

                {events.map(
                  (
                    event,
                    index
                  ) => (
                    <div
                      key={
                        event._id ||
                        `${event.type}-${index}`
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >

                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        {event.type ===
                        "CHECK_IN" ? (
                          <FiLogIn
                            size={14}
                          />
                        ) : event.type ===
                          "CHECK_OUT" ? (
                          <FiLogOut
                            size={14}
                          />
                        ) : event.type ===
                          "BREAK_OUT" ? (
                          <FiPause
                            size={14}
                          />
                        ) : (
                          <FiPlay
                            size={14}
                          />
                        )}
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-slate-700">
                          {event.type.replace(
                            "_",
                            " "
                          )}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          {formatTime(
                            event.at
                          )}
                        </p>
                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        )}

      </div>

      {/* Camera */}
      {cameraOpen && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Attendance Photo
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Capture a live photo for{" "}
                {getActionLabel(
                  pendingAction
                ).toLowerCase()}
                .
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setPendingAction(
                  null
                );
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <FiX size={18} />
            </button>

          </div>

          <div className="p-5">

            <div className="mx-auto max-w-lg overflow-hidden rounded-2xl bg-slate-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-video w-full object-cover"
              />
            </div>

            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">

              <button
                type="button"
                disabled={loading}
                onClick={
                  handleCameraConfirm
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#172B6B] px-6 text-sm font-semibold text-white transition hover:bg-[#20398F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiCamera
                  size={17}
                />

                {loading
                  ? "Saving..."
                  : `Capture & ${getActionLabel(
                      pendingAction
                    )}`}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  stopCamera();
                  setPendingAction(
                    null
                  );
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FiX size={17} />
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}
    </section>
  );
};

export default LabourProxyPunch;