import React from "react";

type MessageProps = {
  text?: string;
};

const SuccessMessage: React.FC<MessageProps> = ({ text = "" }) => (
  <p className="text-green-500 text-sm text-center bg-green-200 p-2 rounded-lg m-2 border border-green-500 font-medium ">
    {text}
  </p>
);

const InfoMessage: React.FC<MessageProps> = ({ text = "" }) => (
  <p className="text-yellow-200 border border-yellow-400 text-sm font-medium m-2">{text}</p>
);

const ErrorMessage: React.FC<MessageProps> = ({ text = "" }) => {
  return (
    <p className="text-red-500 text-md text-center bg-red-200 p-2 rounded-lg m-2 border border-red-500 font-medium ">
      {text}
    </p>
  );
};

const HintMessage: React.FC<MessageProps> = ({ text = "" }) => {
  //   console.log(text);
  return <p className="text-gray-500 text-sm font-sm  m-2">{text}</p>;
};

const ModalHeader = ({ text = "" }) => {
  return <h2 className=" text-lg font-semibold text-gray-700 mb-3">{text}</h2>;
};

export { ErrorMessage, HintMessage, InfoMessage, ModalHeader, SuccessMessage };
