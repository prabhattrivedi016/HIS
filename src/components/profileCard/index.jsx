import React, { useMemo, useState } from "react";
import { User, MoreVertical } from "lucide-react";

const ProfileCard = (data) => {
  // console.log("profile card data", data?.data);
  const {
    cardTitle,
    cardId,
    cardFooterSection,
    cardLeftTop,
    cardRightTop,
    buttonSection,
    cardAvatar,
  } = data?.data ?? {};

  // card title
  const userName = useMemo(() => {
    return cardTitle?.join(" ");
  }, [cardTitle]);

  //   button action
  const handleButton = (btn) => {
    switch (btn.action) {
      case "toggleActive": {
        console.log("action", btn.action);
        break;
      }
      case "toggleEdit": {
        console.log("toggle Edit", btn.action);
        break;
      }
      default: {
      }
    }
  };

  return (
    <div className="bg-white shadow-md border border-gray-200 relative hover:shadow-lg transition-all duration-300 w-full roundrd-md">
      <div className="m-2 flex flex-row justify-between items-center ">
        {/* profile card left view */}
        <div className="p-2 m-2 flex items-center">
          <span
            className={`font-semibold text-sm px-3 py-1 rounded ${
              cardLeftTop === 1
                ? "text-purple-800 bg-blue-50"
                : "text-orange-500 bg-orange-100"
            }`}
          >
            {cardLeftTop === 1 ? "Active" : "Inactive"}
          </span>
        </div>

        {/* profile card right view */}
        <div className="">
          {cardRightTop ? (
            <button className="p-2 m-2 border  border-gray-300 hover:bg-gray-100 transition-colors relative rounded-sm">
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          ) : null}
        </div>
      </div>

      {/* avatar */}
      <div className="flex flex-col items-center pb-4 m-2">
        <div className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
          {cardAvatar ? (
            <i className={`fa ${cardAvatar} text-3xl text-gray-700`}></i>
          ) : (
            <User size={40} className="text-gray-700" />
          )}
        </div>

        <p className="text-gray-500 text-sm mt-2 mb-1">
          # {cardId ? cardId : "001"}
        </p>
        <h2 className="text-2xl font-bold text-gray-800">{userName}</h2>
      </div>

      {/* info */}
      <div className="border border-t  border-gray-300 pt-1 rounded-lg p-3 mb-2 mx-2 my-2">
        <div className="grid grid-cols-3 gap-4 divide-x divide-gray-300 text-center">
          {cardFooterSection?.map((cardFooter, index) => (
            <div key={index}>
              <p
                className="text-black-500 text-sm font-medium
             mb-1"
              >
                {cardFooter?.label}
              </p>
              <p className="text-gray-500 font-semibold text-sm">
                {cardFooter?.value || "xyz"}{" "}
                {/* TODO: remove hard coded string */}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* button section */}
      <div className="flex gap-3 mt-3 mx-2 my-2">
        {buttonSection.map((btn) => (
          <button
            key={btn.label}
            style={{ backgroundColor: btn.color }}
            className="flex-1 text-white py-2 rounded-lg font-medium hover:opacity-80 transition"
            onClick={() => handleButton(btn)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileCard;
