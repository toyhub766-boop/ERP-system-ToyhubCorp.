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
        rounded-2xl
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
          h-24
          w-24
          translate-x-8
          -translate-y-8
          rounded-full
          bg-blue-50
          blur-2xl
        "
      />

      <div
        className="
          relative
          flex
          items-center
          justify-between
          gap-4
          px-4
          py-3
          sm:px-5
          sm:py-3.5
        "
      >
        {/* LEFT */}

        <div className="min-w-0">

          {/* Breadcrumb */}

          <div
            className="
              flex
              items-center
              gap-1.5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.1em]
              sm:text-[11px]
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

          {/* Heading */}

          <div
            className="
              mt-0.5
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-[#172B6B]/10
                text-[#172B6B]
              "
            >
              <FiUsers
                size={15}
                strokeWidth={2}
              />
            </span>

            <h1
              className="
                truncate
                text-lg
                font-bold
                tracking-tight
                text-slate-900
                sm:text-xl
              "
            >
              Customer Relationship Management
            </h1>
          </div>

          {/* Description */}

          <p
            className="
              mt-0.5
              hidden
              text-xs
              text-slate-500
              sm:block
            "
          >
            Manage customers, leads, conversations and sales activities.
          </p>
        </div>

        {/* RIGHT */}

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onAddCustomer}
            className="
              group
              inline-flex
              h-9
              items-center
              justify-center
              gap-1.5
              rounded-lg
              bg-[#172B6B]
              px-3.5
              text-xs
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
              sm:h-9.5
              sm:px-4
              sm:text-sm
            "
          >
            <span
              className="
                flex
                h-4.5
                w-4.5
                items-center
                justify-center
                rounded-md
                bg-white/10
                transition
                group-hover:bg-white/15
              "
            >
              <FiPlus
                size={13}
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