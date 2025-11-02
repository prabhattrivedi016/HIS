export const ErrorMessage = ({ text = "Something went wrong" }) => (
  <p className="text-red-600 text-sm font-medium mt-1">{text}</p>
);

export const InfoMessage = ({ text = "" }) =>
  text ? <p className="text-gray-600 text-sm mt-1">{text}</p> : null;

export const SuccessBox = ({ text = "Success" }) => (
  <div className="animate-fade-in bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-center font-semibold shadow-sm mt-2">
    {text}
  </div>
);
