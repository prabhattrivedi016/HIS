// allow only numbers and text in input fields

export const allowOnlyNumbers = (e: React.FormEvent<HTMLInputElement>) => {
  const target = e.target as HTMLInputElement;
  target.value = target.value.replace(/[^0-9]/g, "");
};

// allow only text in input fields

export const allowOnlyText = (e: React.FormEvent<HTMLInputElement>) => {
  const target = e.target as HTMLInputElement;

  target.value = target.value.replace(/[^a-zA-Z\s.]/g, "");
};
