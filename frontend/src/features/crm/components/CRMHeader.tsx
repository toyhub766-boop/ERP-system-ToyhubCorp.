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
          h-32
          w-32
          translate-x-12
          -translate-y-12
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
          gap-4
          px-5
          py-4
          sm:px-6
          sm:py-5
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
              text-[11px]
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
              mt-1.5
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                hidden
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-[#172B6B]
                sm:flex
              "
            >
              <FiUsers size={17} />
            </div>

            <div className="min-w-0">
              <h1
                className="
                  text-2xl
                  font-bold
                  leading-tight
                  tracking-tight
                  text-slate-900
                  sm:text-3xl
                "
              >
                Customer Relationship
                Management
              </h1>
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
              h-10
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
              hover:-translate-y-0.5
              hover:bg-[#20398F]
              hover:shadow-md
              active:translate-y-0
              active:scale-[0.98]
              sm:w-auto
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