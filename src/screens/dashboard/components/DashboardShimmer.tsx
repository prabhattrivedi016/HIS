const DashboardShimmer = () => {
  return (
    <div className="page-container animate-pulse">
      <div className="form-grid-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg p-4 sm:p-6 bg-white shadow-sm min-h-40 sm:min-h-[165px]"
          >
            <div className="flex justify-between items-start">
              <div className="w-full">
                <div className="h-10 w-16 rounded bg-gray-200" />
                <div className="mt-8 h-4 w-3/4 rounded bg-gray-200" />
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full mt-2">
        <div className="flex-1 h-[350px] rounded-lg bg-white shadow-sm p-4">
          <div className="h-4 w-1/3 rounded bg-gray-200 mb-4" />
          <div className="h-[290px] rounded bg-gray-100" />
        </div>
        <div className="flex-1 h-[350px] rounded-lg bg-white shadow-sm p-4">
          <div className="h-4 w-1/3 rounded bg-gray-200 mb-4" />
          <div className="h-[290px] rounded bg-gray-100" />
        </div>
        <div className="flex-1 h-[350px] rounded-lg bg-white shadow-sm p-4">
          <div className="h-4 w-1/3 rounded bg-gray-200 mb-4" />
          <div className="h-[290px] rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
};

export default DashboardShimmer;
