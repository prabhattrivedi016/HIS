import backgroundImage from "../../../assets/background.jpg";

const AuthBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Page Content */}
      <div
        className="
          relative z-10
          flex
          w-full
          justify-center
          items-start sm:items-center
          min-h-screen
          overflow-y-auto
          p-4
        "
      >
        {children}
      </div>
    </div>
  );
};

export default AuthBackground;
