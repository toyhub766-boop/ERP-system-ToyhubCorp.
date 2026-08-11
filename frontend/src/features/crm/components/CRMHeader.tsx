import { FiPlus, FiUsers } from "react-icons/fi";

interface Props {
  onAddCustomer: () => void;
  isStaff?: boolean;
}

const CRMHeader = ({
  onAddCustomer,
  isStaff = false,
}: Props) => {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* Subtle decorative layer */}

      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-40
          w-40
          translate-x-16
          -translate-y-16
          rounded-full
          bg-blue-50
          blur-2xl
        "
      />

      <div
        className="
          relative
          flex
          flex-col
          gap-6
          px-6
          py-6
          sm:px-7
          sm:py-7
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* =====================================================
            LEFT
        ===================================================== */}

        <div className="min-w-0">

          {/* Breadcrumb */}

          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              font-semibold
              uppercase
              tracking-[0.1em]
            "
          >
            <span className="text-[#172B6B]">
              {isStaff ? "CRM Staff" : "Admin"}
            </span>

            {!isStaff && (
              <>
                <span className="text-slate-300">
                  /
                </span>

                <span className="text-slate-400">
                  CRM
                </span>
              </>
            )}
          </div>


          {/* Title */}

          <div
            className="
              mt-3
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                mt-1
                hidden
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-[#172B6B]
                sm:flex
              "
            >
              <FiUsers size={19} />
            </div>


            <div>

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                Customer Relationship
                Management
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                  sm:text-[15px]
                "
              >
                Manage customers, sales orders,
                payment records and outstanding
                balances from a single workspace.
              </p>

            </div>

          </div>

        </div>


        {/* =====================================================
            ACTION
        ===================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
          "
        >

          <button
            type="button"
            onClick={onAddCustomer}
            className="
              group
              inline-flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#172B6B]
              px-5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-[#20398F]
              hover:-translate-y-0.5
              hover:shadow-md
              active:translate-y-0
              active:scale-[0.98]
              sm:w-auto
              sm:px-6
            "
          >

            <span
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-md
                bg-white/10
                transition
                group-hover:bg-white/15
              "
            >
              <FiPlus
                size={15}
                strokeWidth={2.5}
              />
            </span>

            Add Customer

          </button>

        </div>

      </div>
    </section>
  );
};

export default CRMHeader;