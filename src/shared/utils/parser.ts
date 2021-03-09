export const parseBool = (value: any) => {
  return !(
    value === 'false' ||
    value === '0' ||
    value === '' ||
    value === undefined
  );
};
