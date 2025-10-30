const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactRegex = /^[0-9]{10}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,15}$)/;

export { emailRegex, contactRegex, passwordRegex };
