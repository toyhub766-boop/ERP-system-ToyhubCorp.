import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiChevronRight,
  FiClipboard,
  FiTruck,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiLayers,
  FiPackage,
} from "react-icons/fi";

import { getBOMs } from "../../bom/services/bom.service";
import { getProductions } from "../../production/services/production.services";
import { getDispatches } from "../../dispatch/services/dispatch.service";

const DashboardPage = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [boms, setBoms] = useState<any[]>([]);
  const [productions, setProductions] =
    useState<any[]>([]);
  const [dispatches, setDispatches] =
    useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          bomData,
          productionData,
          dispatchData,
        ] = await Promise.all([
          getBOMs(),
          getProductions(),
          getDispatches(),
        ]);

        setBoms(bomData);
        setProductions(productionData);
        setDispatches(dispatchData);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  const activeOrders = productions.filter(
    (production: any) =>
      production.status === "In Progress"
  ).length;

  const pendingDispatches = dispatches.filter(
    (dispatch: any) =>
      dispatch.status === "Pending"
  ).length;

  const completedOrders = productions.filter(
    (production: any) =>
      production.status === "Completed"
  ).length;

  const draftOrders = productions.filter(
    (production: any) =>
      production.status === "Draft"
  ).length;

  const recentProductions =
    productions.slice(0, 5);

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1500px]
        space-y-7
        px-4
        py-6
        sm:px-6
        sm:py-8
        lg:px-8
        lg:py-10
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >

        <div>

          <div
            className="
              mb-3
              flex
              items-center
              gap-2
              text-xs
              font-medium
              text-slate-400
            "
          >
            <span>Production Staff</span>

            <FiChevronRight size={13} />

            <span className="text-slate-600">
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">

            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#172B6B]
                text-white
                shadow-sm
              "
            >
              <FiActivity size={21} />
            </div>

            <div>

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-3xl
                "
              >
                {greeting},{" "}
                {user.name || "there"}
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Here's what's happening across
                production today.
              </p>

            </div>

          </div>

        </div>

        <div
          className="
            flex
            w-fit
            items-center
            gap-3
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            shadow-sm
          "
        >

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-[#172B6B]
            "
          >
            <FiClipboard size={17} />
          </div>

          <div>

            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Employee ID
            </p>

            <p
              className="
                mt-0.5
                text-sm
                font-semibold
                text-slate-800
              "
            >
              {user.employeeId || "—"}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          OVERVIEW STATS
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        {/* BOM */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-[0_6px_24px_rgba(15,23,42,0.04)]
            transition
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-[#172B6B]
              "
            >
              <FiLayers size={18} />
            </div>

            <span
              className="
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[11px]
                font-medium
                text-slate-500
              "
            >
              Master Data
            </span>

          </div>

          <p
            className="
              mt-5
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            BOMs
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {boms.length}
          </p>

          <button
            onClick={() =>
              navigate(
                "/production-staff/bom"
              )
            }
            className="
              mt-4
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-semibold
              text-[#172B6B]
              hover:underline
            "
          >
            Manage BOMs
            <FiArrowRight size={13} />
          </button>

        </div>

        {/* ACTIVE ORDERS */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-[0_6px_24px_rgba(15,23,42,0.04)]
            transition
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              "
            >
              <FiActivity size={18} />
            </div>

            <span
              className="
                rounded-full
                bg-blue-50
                px-2.5
                py-1
                text-[11px]
                font-medium
                text-blue-600
              "
            >
              Active
            </span>

          </div>

          <p
            className="
              mt-5
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Active Orders
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {activeOrders}
          </p>

          <button
            onClick={() =>
              navigate(
                "/production-staff/production"
              )
            }
            className="
              mt-4
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-semibold
              text-[#172B6B]
              hover:underline
            "
          >
            View production
            <FiArrowRight size={13} />
          </button>

        </div>

        {/* DISPATCH */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-[0_6px_24px_rgba(15,23,42,0.04)]
            transition
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-orange-50
                text-orange-600
              "
            >
              <FiTruck size={18} />
            </div>

            <span
              className="
                rounded-full
                bg-orange-50
                px-2.5
                py-1
                text-[11px]
                font-medium
                text-orange-600
              "
            >
              Pending
            </span>

          </div>

          <p
            className="
              mt-5
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Pending Dispatch
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {pendingDispatches}
          </p>

          <button
            onClick={() =>
              navigate(
                "/production-staff/dispatch"
              )
            }
            className="
              mt-4
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-semibold
              text-[#172B6B]
              hover:underline
            "
          >
            View dispatch
            <FiArrowRight size={13} />
          </button>

        </div>

        {/* TOTAL DISPATCH */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-[0_6px_24px_rgba(15,23,42,0.04)]
            transition
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-slate-100
                text-slate-600
              "
            >
              <FiPackage size={18} />
            </div>

            <span
              className="
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[11px]
                font-medium
                text-slate-500
              "
            >
              Overall
            </span>

          </div>

          <p
            className="
              mt-5
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Total Dispatches
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {dispatches.length}
          </p>

          <button
            onClick={() =>
              navigate(
                "/production-staff/dispatch"
              )
            }
            className="
              mt-4
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-semibold
              text-[#172B6B]
              hover:underline
            "
          >
            Open dispatch
            <FiArrowRight size={13} />
          </button>

        </div>

      </div>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        "
      >

        <div
          className="
            border-b
            border-slate-100
            px-5
            py-5
            sm:px-7
            sm:py-6
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-[#172B6B]
              "
            >
              <FiActivity size={18} />
            </div>

            <div>

              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                Production Workspace
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Jump directly into your
                production modules.
              </p>

            </div>

          </div>

        </div>

        <div
          className="
            grid
            gap-3
            p-5
            sm:grid-cols-3
            sm:p-7
          "
        >

          {/* BOM */}

          <button
            onClick={() =>
              navigate(
                "/production-staff/bom"
              )
            }
            className="
              group
              rounded-2xl
              border
              border-slate-200
              bg-slate-50/50
              p-5
              text-left
              transition-all
              hover:-translate-y-0.5
              hover:border-[#172B6B]/30
              hover:bg-white
              hover:shadow-md
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-[#172B6B]
                "
              >
                <FiLayers size={20} />
              </div>

              <FiArrowRight
                size={17}
                className="
                  text-slate-300
                  transition
                  group-hover:translate-x-1
                  group-hover:text-[#172B6B]
                "
              />

            </div>

            <h3
              className="
                mt-5
                text-base
                font-bold
                text-slate-900
              "
            >
              BOM
            </h3>

            <p
              className="
                mt-1
                text-sm
                leading-5
                text-slate-500
              "
            >
              Manage manufacturing recipes
              and required materials.
            </p>

          </button>

          {/* PRODUCTION */}

          <button
            onClick={() =>
              navigate(
                "/production-staff/production"
              )
            }
            className="
              group
              rounded-2xl
              border
              border-slate-200
              bg-slate-50/50
              p-5
              text-left
              transition-all
              hover:-translate-y-0.5
              hover:border-green-300
              hover:bg-white
              hover:shadow-md
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-50
                  text-green-600
                "
              >
                <FiActivity size={20} />
              </div>

              <FiArrowRight
                size={17}
                className="
                  text-slate-300
                  transition
                  group-hover:translate-x-1
                  group-hover:text-green-600
                "
              />

            </div>

            <h3
              className="
                mt-5
                text-base
                font-bold
                text-slate-900
              "
            >
              Production
            </h3>

            <p
              className="
                mt-1
                text-sm
                leading-5
                text-slate-500
              "
            >
              Track production orders and
              manufacturing progress.
            </p>

          </button>

          {/* DISPATCH */}

          <button
            onClick={() =>
              navigate(
                "/production-staff/dispatch"
              )
            }
            className="
              group
              rounded-2xl
              border
              border-slate-200
              bg-slate-50/50
              p-5
              text-left
              transition-all
              hover:-translate-y-0.5
              hover:border-orange-300
              hover:bg-white
              hover:shadow-md
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-orange-50
                  text-orange-600
                "
              >
                <FiTruck size={20} />
              </div>

              <FiArrowRight
                size={17}
                className="
                  text-slate-300
                  transition
                  group-hover:translate-x-1
                  group-hover:text-orange-600
                "
              />

            </div>

            <h3
              className="
                mt-5
                text-base
                font-bold
                text-slate-900
              "
            >
              Dispatch
            </h3>

            <p
              className="
                mt-1
                text-sm
                leading-5
                text-slate-500
              "
            >
              Monitor and manage outgoing
              production orders.
            </p>

          </button>

        </div>

      </section>

      {/* =====================================================
          RECENT ORDERS + STATUS
      ===================================================== */}

      <div
        className="
          grid
          gap-6
          xl:grid-cols-[minmax(0,1fr)_360px]
        "
      >

        {/* RECENT ORDERS */}

        <section
          className="
            min-w-0
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              px-5
              py-5
              sm:px-7
            "
          >

            <div>

              <h2
                className="
                  text-base
                  font-bold
                  text-slate-900
                "
              >
                Recent Production Orders
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Latest orders in the system.
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  "/production-staff/production"
                )
              }
              className="
                inline-flex
                items-center
                gap-1.5
                text-xs
                font-semibold
                text-[#172B6B]
                hover:underline
              "
            >
              View all
              <FiArrowRight size={13} />
            </button>

          </div>

          <div className="p-4 sm:p-5">

            {recentProductions.length ===
            0 ? (

              <div
                className="
                  flex
                  min-h-[280px]
                  items-center
                  justify-center
                  text-center
                "
              >

                <div>

                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-slate-100
                      text-slate-400
                    "
                  >
                    <FiPackage
                      size={20}
                    />
                  </div>

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    No production orders
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Production orders will
                    appear here.
                  </p>

                </div>

              </div>

            ) : (

              <div className="space-y-2">

                {recentProductions.map(
                  (
                    production: any
                  ) => {

                    const status =
                      production.status;

                    const statusClasses =
                      status ===
                      "Completed"
                        ? "bg-green-50 text-green-700"
                        : status ===
                          "In Progress"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-yellow-50 text-yellow-700";

                    return (
                      <button
                        key={
                          production._id
                        }
                        onClick={() =>
                          navigate(
                            "/production-staff/production"
                          )
                        }
                        className="
                          group
                          flex
                          w-full
                          items-center
                          justify-between
                          gap-4
                          rounded-2xl
                          border
                          border-slate-100
                          bg-slate-50/60
                          p-4
                          text-left
                          transition
                          hover:border-slate-200
                          hover:bg-white
                          hover:shadow-sm
                        "
                      >

                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                          "
                        >

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-white
                              text-[#172B6B]
                              shadow-sm
                            "
                          >
                            <FiPackage
                              size={17}
                            />
                          </div>

                          <div className="min-w-0">

                            <p
                              className="
                                truncate
                                text-sm
                                font-semibold
                                text-slate-900
                              "
                            >
                              {production
                                .finishedProduct
                                ?.name ||
                                production
                                  .items?.[0]
                                  ?.product
                                  ?.name ||
                                "Production Order"}
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-slate-500
                              "
                            >
                              {
                                production.orderNumber
                              }
                            </p>

                          </div>

                        </div>

                        <div
                          className="
                            flex
                            shrink-0
                            items-center
                            gap-3
                          "
                        >

                          <span
                            className={`
                              rounded-full
                              px-3
                              py-1.5
                              text-[11px]
                              font-semibold
                              ${statusClasses}
                            `}
                          >
                            {status}
                          </span>

                          <FiChevronRight
                            size={15}
                            className="
                              text-slate-300
                              transition
                              group-hover:translate-x-0.5
                              group-hover:text-slate-500
                            "
                          />

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </section>

        {/* STATUS SUMMARY */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          "
        >

          <div
            className="
              border-b
              border-slate-100
              px-5
              py-5
            "
          >

            <h2
              className="
                text-base
                font-bold
                text-slate-900
              "
            >
              Production Status
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Current order distribution.
            </p>

          </div>

          <div className="space-y-3 p-5">

            {/* COMPLETED */}

            <div
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-green-100
                bg-green-50/70
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-green-600
                  "
                >
                  <FiCheckCircle
                    size={17}
                  />
                </div>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-green-800
                  "
                >
                  Completed
                </span>

              </div>

              <span
                className="
                  text-xl
                  font-bold
                  text-green-700
                "
              >
                {completedOrders}
              </span>

            </div>

            {/* IN PROGRESS */}

            <div
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-blue-100
                bg-blue-50/70
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-blue-600
                  "
                >
                  <FiActivity
                    size={17}
                  />
                </div>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-blue-800
                  "
                >
                  In Progress
                </span>

              </div>

              <span
                className="
                  text-xl
                  font-bold
                  text-blue-700
                "
              >
                {activeOrders}
              </span>

            </div>

            {/* DRAFT */}

            <div
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-yellow-100
                bg-yellow-50/70
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-yellow-600
                  "
                >
                  <FiClock
                    size={17}
                  />
                </div>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-yellow-800
                  "
                >
                  Draft
                </span>

              </div>

              <span
                className="
                  text-xl
                  font-bold
                  text-yellow-700
                "
              >
                {draftOrders}
              </span>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
};

export default DashboardPage;