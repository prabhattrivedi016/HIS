type PaginationProps = {
  totalItem: number;
  pageData: number;
  activePage: number;
  setPageData: (n: number) => void;
  setActivePage: (n: number) => void;
};
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
const Pagination = ({
  totalItem,
  pageData,
  activePage,
  setPageData,
  setActivePage,
}: PaginationProps) => {
  const [disablePrev, setDisablePrev] = useState(false);
  const [disableNext, setDisableNext] = useState(false);

  const pageDataValue = [10, 20, 50, 100];

  const no_of_pages = Math.ceil(totalItem / pageData);

  //   select handler
  const selectHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    if (!value) return;

    setPageData(value);
    setActivePage(1);

    setDisablePrev(true);
    setDisableNext(Math.ceil(totalItem / value) <= 1);
  };

  //   prevHandler
  const prevHandler = () => {
    if (activePage > 1) {
      const newPage = activePage - 1;
      setActivePage(newPage);

      setDisableNext(false);
      setDisablePrev(newPage === 1);
    }
  };

  //   nextHandler
  const nextHandler = () => {
    if (activePage < no_of_pages) {
      const newPage = activePage + 1;
      setActivePage(newPage);

      setDisablePrev(false);
      setDisableNext(newPage === no_of_pages);
    }
  };

  return (
    <div className="w-full flex justify-end mt-4">
      <div className="flex items-center gap-3 ">
        <select onChange={selectHandler} className="pagination-select px-2 py-1">
          {pageDataValue?.map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-sm font-medium">
          <button
            onClick={prevHandler}
            disabled={disablePrev}
            className={`px-2 py-1  ${disablePrev ? "btn-disable" : "btn-active"}`}
          >
            <ChevronLeft size={18} />
          </button>

          <span className="px-1 text-gray-700">
            {activePage} of {no_of_pages}
          </span>

          <button
            onClick={nextHandler}
            disabled={disableNext}
            className={`px-2 py-1  ${disableNext ? "btn-disable" : "btn-active"}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
