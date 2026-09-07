import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiCamera,
  FiCheck,
  FiClock,
  FiLogIn,
  FiLogOut,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiUser,
  FiX,
} from "react-icons/fi";

import {
  breakIn,
  breakOut,
  getMyTodayAttendance,
  punchIn,
  punchOut,
} from "../services/attendance.service";

type EventType =
  | "CHECK_IN"
  | "BREAK_OUT"
  | "BREAK_IN"
  | "CHECK_OUT";

type AttendanceStatus =
  | EventType
  | "NOT_STARTED";

interface AttendanceEvent {
  _id?: string;
  type: EventType;
  at: string;
  photo?: string;
  note?: string;
}

interface AttendanceShift {
  name?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  graceMinutes?: number;
}

interface AttendanceRecord {
  _id: string;
  events: AttendanceEvent[];
  status?: string;
  dayStatus?: string;
  stage?: string;
  score?: number;

  totalElapsedMinutes?: number;
  breakMinutes?: number;
  actualWorkingMinutes?: number;
  requiredWorkingMinutes?: number;
  differenceMinutes?: number;

  lateMinutes?: number;
  earlyLeaveMinutes?: number;

  shift?: AttendanceShift;
}

interface CalculationData {
  totalElapsed?: string;
  break?: string;
  actualWorking?: string;
  requiredWorking?: string;
  difference?: string;

  totalElapsedMinutes?: number;
  breakMinutes?: number;
  actualWorkingMinutes?: number;
  requiredWorkingMinutes?: number;
  differenceMinutes?: number;
}

interface TodayResponse {
  attendance: AttendanceRecord | null;
  calculations?: CalculationData;
  status?: string;
}

const EVENT_LABELS: Record<EventType, string> = {
  CHECK_IN: "Check In",
  BREAK_OUT: "Break Out",
  BREAK_IN: "Break In",
  CHECK_OUT: "Check Out",
};

const isAttendanceStatus = (
  value?: string
): value is AttendanceStatus => {
  return (
    value === "CHECK_IN" ||
    value === "BREAK_OUT" ||
    value === "BREAK_IN" ||
    value === "CHECK_OUT" ||
    value === "NOT_STARTED"
  );
};

const formatTime = (value: string) => {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const formatMinutes = (minutes?: number) => {
  if (
    minutes === undefined ||
    minutes === null
  ) {
    return "—";
  }

  const safeMinutes = Math.max(
    0,
    Math.round(minutes)
  );

  const hours = Math.floor(
    safeMinutes / 60
  );

  const mins = safeMinutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  return `${hours}h ${mins}m`;
};

const getEventIcon = (
  type: EventType
) => {
  switch (type) {
    case "CHECK_IN":
      return <FiLogIn size={15} />;

    case "BREAK_OUT":
      return <FiPause size={15} />;

    case "BREAK_IN":
      return <FiPlay size={15} />;

    case "CHECK_OUT":
      return <FiLogOut size={15} />;

    default:
      return <FiClock size={15} />;
  }
};

const AttendancePunchPage = () => {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const [data, setData] =
    useState<TodayResponse>({
      attendance: null,
      calculations: undefined,
      status: "NOT_STARTED",
    });

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraAction, setCameraAction] =
    useState<
      "CHECK_IN" | "CHECK_OUT" | null
    >(null);

  const [cameraError, setCameraError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
    setCameraAction(null);
  }, []);

  const loadTodayAttendance =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMyTodayAttendance();

        setData({
          attendance:
            response?.attendance || null,

          calculations:
            response?.calculations,

          status:
            response?.status ||
            response?.attendance?.status ||
            "NOT_STARTED",
        });
      } catch (err: any) {
        console.error(
          "Failed to load attendance:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load today's attendance."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadTodayAttendance();

    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      }
    };
  }, [loadTodayAttendance]);

  const openCamera = async (
    action: "CHECK_IN" | "CHECK_OUT"
  ) => {
    try {
      setCameraError("");
      setError("");
      setMessage("");
      setCameraAction(action);

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        setCameraError(
          "Camera access is not supported by this browser."
        );

        setCameraAction(null);

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: "user",
              width: {
                ideal: 720,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          }
        );

      streamRef.current = stream;

      setCameraOpen(true);

      requestAnimationFrame(() => {
        if (!videoRef.current) {
          return;
        }

        videoRef.current.srcObject =
          stream;

        videoRef.current
          .play()
          .catch(() => {});
      });
    } catch (err) {
      console.error(
        "Camera access error:",
        err
      );

      setCameraError(
        "Camera permission is required for this attendance action."
      );

      setCameraAction(null);
    }
  };

  const captureSelfie =
    async (): Promise<File | null> => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        return null;
      }

      if (
        video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        setCameraError(
          "Camera is not ready yet. Please try again."
        );

        return null;
      }

      const width =
        video.videoWidth || 720;

      const height =
        video.videoHeight || 720;

      canvas.width = width;
      canvas.height = height;

      const context =
        canvas.getContext("2d");

      if (!context) {
        setCameraError(
          "Unable to capture the selfie."
        );

        return null;
      }

      context.drawImage(
        video,
        0,
        0,
        width,
        height
      );

      const blob =
        await new Promise<Blob | null>(
          (resolve) => {
            canvas.toBlob(
              resolve,
              "image/jpeg",
              0.85
            );
          }
        );

      if (!blob) {
        setCameraError(
          "Unable to create selfie file."
        );

        return null;
      }

      return new File(
        [blob],
        `attendance-${Date.now()}.jpg`,
        {
          type: "image/jpeg",
        }
      );
    };

  const handleCameraPunch =
    async () => {
      if (!cameraAction) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");
        setMessage("");
        setCameraError("");

        const selfie =
          await captureSelfie();

        if (!selfie) {
          return;
        }

        if (
          cameraAction ===
          "CHECK_IN"
        ) {
          await punchIn(selfie);

          setMessage(
            "Check-in registered successfully."
          );
        } else {
          await punchOut(selfie);

          setMessage(
            "Check-out registered successfully."
          );
        }

        stopCamera();

        await loadTodayAttendance();
      } catch (err: any) {
        console.error(
          "Attendance punch error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to register attendance."
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleBreakOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      await breakOut();

      setMessage(
        "Break-out registered successfully."
      );

      await loadTodayAttendance();
    } catch (err: any) {
      console.error(
        "Break-out error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to register break-out."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBreakIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      await breakIn();

      setMessage(
        "Break-in registered successfully."
      );

      await loadTodayAttendance();
    } catch (err: any) {
      console.error(
        "Break-in error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to register break-in."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const attendance =
    data.attendance;

  const events =
    attendance?.events || [];

  const calculations =
    data.calculations;

  const status: AttendanceStatus =
    isAttendanceStatus(
      data.status
    )
      ? data.status
      : isAttendanceStatus(
          attendance?.status
        )
      ? attendance!.status as AttendanceStatus
      : "NOT_STARTED";

  const isCompleted =
    status === "CHECK_OUT";

  const hasCheckedIn =
    events.some(
      (event) =>
        event.type === "CHECK_IN"
    );

  const hasCheckedOut =
    events.some(
      (event) =>
        event.type === "CHECK_OUT"
    );

  const isOnBreak =
    status === "BREAK_OUT";

  const isWorking =
    status === "CHECK_IN" ||
    status === "BREAK_IN";

  const breakCount =
    events.filter(
      (event) =>
        event.type === "BREAK_OUT"
    ).length;

  const completedBreakCount =
    events.filter(
      (event) =>
        event.type === "BREAK_IN"
    ).length;

  const handlePrimaryAction = () => {
    if (!hasCheckedIn) {
      openCamera("CHECK_IN");
      return;
    }

    if (isOnBreak) {
      handleBreakIn();
      return;
    }

    if (
      status === "CHECK_IN" ||
      status === "BREAK_IN"
    ) {
      handleBreakOut();
    }
  };

  const getPrimaryLabel = () => {
    if (!hasCheckedIn) {
      return "Check In";
    }

    if (isOnBreak) {
      return "End Break";
    }

    if (isCompleted) {
      return "Attendance Complete";
    }

    return "Start Break";
  };

  const getPrimaryIcon = () => {
    if (!hasCheckedIn) {
      return <FiCamera size={18} />;
    }

    if (isOnBreak) {
      return <FiPlay size={18} />;
    }

    if (isCompleted) {
      return <FiCheck size={18} />;
    }

    return <FiPause size={18} />;
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <FiRefreshCw
            className="animate-spin"
            size={18}
          />

          Loading attendance...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      <div className="mx-auto w-full max-w-5xl space-y-6">

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#172B6B]">
                <FiUser size={15} />

                My Attendance
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Attendance
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {formatDate(
                  new Date().toISOString()
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadTodayAttendance
              }
              disabled={actionLoading}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                px-4
                text-sm
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FiRefreshCw size={15} />

              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Today's status
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {!hasCheckedIn
                    ? "Ready to start"
                    : isCompleted
                    ? "Work completed"
                    : isOnBreak
                    ? "Currently on break"
                    : "Currently working"}
                </h2>
              </div>

              <div
                className={`
                  rounded-2xl
                  px-3
                  py-2
                  text-xs
                  font-bold
                  ${
                    isCompleted
                      ? "bg-emerald-50 text-emerald-700"
                      : isOnBreak
                      ? "bg-amber-50 text-amber-700"
                      : !hasCheckedIn
                      ? "bg-slate-100 text-slate-500"
                      : "bg-blue-50 text-[#172B6B]"
                  }
                `}
              >
                {!hasCheckedIn
                  ? "NOT STARTED"
                  : status.replace(
                      "_",
                      " "
                    )}
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Total elapsed
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {calculations
                    ?.totalElapsed ||
                    formatMinutes(
                      attendance?.totalElapsedMinutes
                    )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Break duration
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {calculations?.break ||
                    formatMinutes(
                      attendance?.breakMinutes
                    )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Actual working
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {calculations
                    ?.actualWorking ||
                    formatMinutes(
                      attendance?.actualWorkingMinutes
                    )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Required
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {calculations
                    ?.requiredWorking ||
                    formatMinutes(
                      attendance?.requiredWorkingMinutes
                    )}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">
                  Difference
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {calculations
                    ?.difference ||
                    formatMinutes(
                      attendance?.differenceMinutes
                    )}
                </span>
              </div>
            </div>

            {!isCompleted && (
              <button
                type="button"
                onClick={
                  handlePrimaryAction
                }
                disabled={actionLoading}
                className="
                  mt-6
                  flex
                  h-14
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  bg-[#172B6B]
                  px-5
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#102257]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {actionLoading ? (
                  <FiRefreshCw
                    className="animate-spin"
                    size={18}
                  />
                ) : (
                  getPrimaryIcon()
                )}

                {getPrimaryLabel()}
              </button>
            )}

            {isWorking &&
              !isCompleted && (
                <button
                  type="button"
                  onClick={() =>
                    openCamera(
                      "CHECK_OUT"
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  className="
                    mt-3
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    text-sm
                    font-bold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <FiCamera
                    size={17}
                  />

                  Check Out
                </button>
              )}

            {isCompleted && (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                <FiCheck size={18} />

                Today's attendance is complete
              </div>
            )}

            {cameraError && (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                {cameraError}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Shift
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {attendance?.shift?.name ||
                  "No shift assigned"}
              </h2>

              {attendance?.shift && (
                <p className="mt-2 text-sm text-slate-500">
                  {attendance.shift.startTime}
                  {" — "}
                  {attendance.shift.endTime}
                </p>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Stage
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {attendance?.stage ||
                    "NEW"}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Score
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {attendance?.score ??
                    0}
                  %
                </span>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Breaks taken
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {breakCount}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Completed breaks
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {completedBreakCount}
                  </span>
                </div>
              </div>

              {(attendance?.lateMinutes ||
                attendance?.earlyLeaveMinutes) ? (
                <div className="mt-4 border-t border-slate-200 pt-4">

                  {Boolean(
                    attendance?.lateMinutes
                  ) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Late arrival
                      </span>

                      <span className="text-sm font-bold text-amber-600">
                        {formatMinutes(
                          attendance?.lateMinutes
                        )}
                      </span>
                    </div>
                  )}

                  {Boolean(
                    attendance?.earlyLeaveMinutes
                  ) && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Early leave
                      </span>

                      <span className="text-sm font-bold text-amber-600">
                        {formatMinutes(
                          attendance?.earlyLeaveMinutes
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-6">

              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Today's events
                </p>

                {events.length > 0 && (
                  <span className="text-xs font-semibold text-slate-400">
                    {events.length} event
                    {events.length === 1
                      ? ""
                      : "s"}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3">

                {events.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                    No attendance events yet.
                  </div>
                ) : (
                  events.map(
                    (event, index) => (
                      <div
                        key={
                          event._id ||
                          `${event.type}-${index}`
                        }
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#172B6B]/10 text-[#172B6B]">
                          {getEventIcon(
                            event.type
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {
                              EVENT_LABELS[
                                event.type
                              ]
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatTime(
                              event.at
                            )}
                          </p>
                        </div>

                        <span className="text-xs font-semibold text-slate-400">
                          #{index + 1}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Attendance flow
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Today's punch sequence
              </h2>
            </div>

            {breakCount > 0 && (
              <p className="text-xs font-medium text-slate-400">
                {breakCount} break
                {breakCount === 1
                  ? ""
                  : "s"} started
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">

            <div
              className={`
                flex
                items-center
                gap-2
                rounded-2xl
                border
                px-4
                py-3
                ${
                  events.some(
                    (event) =>
                      event.type ===
                      "CHECK_IN"
                  )
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }
              `}
            >
              <FiLogIn size={15} />

              <span className="text-sm font-semibold">
                Check In
              </span>
            </div>

            {events
              .filter(
                (event) =>
                  event.type ===
                    "BREAK_OUT" ||
                  event.type ===
                    "BREAK_IN"
              )
              .map(
                (event, index) => (
                  <div
                    key={
                      event._id ||
                      `${event.type}-flow-${index}`
                    }
                    className={`
                      flex
                      items-center
                      gap-2
                      rounded-2xl
                      border
                      px-4
                      py-3
                      ${
                        event.type ===
                        "BREAK_OUT"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-blue-200 bg-blue-50 text-blue-700"
                      }
                    `}
                  >
                    {getEventIcon(
                      event.type
                    )}

                    <span className="text-sm font-semibold">
                      {
                        EVENT_LABELS[
                          event.type
                        ]
                      }
                    </span>
                  </div>
                )
              )}

            {events.some(
              (event) =>
                event.type ===
                "CHECK_OUT"
            ) && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                <FiLogOut size={15} />

                <span className="text-sm font-semibold">
                  Check Out
                </span>
              </div>
            )}
          </div>

          {hasCheckedIn &&
            !hasCheckedOut && (
              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                You can take multiple breaks
                during the day. Each Break Out
                must be followed by a Break In
                before another break or final
                Check Out.
              </div>
            )}
        </section>
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Attendance selfie
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {cameraAction ===
                  "CHECK_IN"
                    ? "Check-in"
                    : "Check-out"}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  stopCamera
                }
                disabled={
                  actionLoading
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-square w-full object-cover"
              />
            </div>

            <div className="p-5">

              <p className="text-center text-xs leading-5 text-slate-400">
                Your selfie is stored as
                attendance proof. The attendance
                time is registered by the server.
              </p>

              <button
                type="button"
                onClick={
                  handleCameraPunch
                }
                disabled={
                  actionLoading
                }
                className="
                  mt-4
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-[#172B6B]
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-[#102257]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {actionLoading ? (
                  <FiRefreshCw
                    className="animate-spin"
                    size={17}
                  />
                ) : (
                  <FiCamera
                    size={17}
                  />
                )}

                {cameraAction ===
                "CHECK_IN"
                  ? "Capture & Check In"
                  : "Capture & Check Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePunchPage;